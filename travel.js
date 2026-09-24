/*
 * 이동 시간 추정 (travel.js) — 구글 지도 대중교통 길찾기와 비슷한 "문 앞에서 문 앞까지" 시간
 *
 * Travel.estimate(from, to, cityKey) -> { min, mode, km, label, source } | null
 *   from/to : { lat, lng, id?, name? }   (id 는 data.js PLACES 의 id)
 *   min     : 정수(분). 도보는 1분 단위, 그 외는 5분 단위 반올림. 최소 1
 *   mode    : 'walk' | 'transit' | 'rail' | 'bus' | 'ferry'
 *   km      : 직선거리(하버사인), 소수 1자리
 *   label   : 화면용 한국어 ('도보 12분', '전철 약 25분', 'JR 쾌속 약 45분' …)
 *   source  : 'route' (큐레이션 노선 사용) | 'model' (거리 모델)
 * Travel.route(placeId) -> 근교·원거리 장소의 큐레이션 노선 기록 | null
 * Travel.params         -> 도시별 모델 파라미터
 *
 * 모델
 *  1) 짧은 거리는 도보: 직선거리 × 우회계수 ÷ 80m/분 (+1분)
 *  2) 도시 대중교통: 출발지→역 도보 + 도착역→목적지 도보(장소별 ACCESS, 없으면 도시 기본값)
 *     + 평균 대기 + 탑승(거리에 따라 빨라지는 유효속도) + 환승 가산(거리가 길수록)
 *     도보가 더 빠르면 도보를 고른다(구글 지도처럼).
 *  3) 근교(하코네·교토·오타루·유후인 …)는 실제 출발 거점역과 소요시간을 담은 ROUTES 사용:
 *     출발지→거점(도시 모델) + 거점→목적지(큐레이션). 거점이 여러 개면 가장 빠른 쪽.
 *     같은 근교 지역 안의 두 곳(야나가와↔장어집 등)은 거점을 거치지 않고 현지 도보/버스·택시.
 *  보정 근거와 오차표: test/travel.test.js
 */
(function () {
  'use strict';

  // ---------- 기본 도구 ----------
  function isNum(v) { return typeof v === 'number' && isFinite(v); }
  function hasCoord(p) { return !!p && isNum(p.lat) && isNum(p.lng); }
  function km(a, b) {
    var R = 6371, r = Math.PI / 180;
    var dLat = (b.lat - a.lat) * r, dLng = (b.lng - a.lng) * r;
    var s = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    return 2 * R * Math.asin(Math.min(1, Math.sqrt(s)));
  }
  function fmt(min) {
    if (min < 60) return min + '분';
    var h = Math.floor(min / 60), m = min % 60;
    return h + '시간' + (m ? ' ' + m + '분' : '');
  }
  function pt(lat, lng, extra) {
    var o = { lat: lat, lng: lng };
    if (extra) for (var k in extra) o[k] = extra[k];
    return o;
  }

  // ---------- 도시별 파라미터 (test/travel.test.js 의 기준값으로 보정) ----------
  // walkMax     : 이 직선거리(km) 이하는 무조건 도보
  // walkDetour  : 도보 경로 우회계수 (직선 대비)
  // stationWalk : ACCESS 표에 없는 장소의 역까지 평균 도보(분)
  // wait        : 평균 대기(분)
  // vNear/vFar/vScale : 탑승 유효속도(직선거리 기준 km/h). v(d)=vNear+(vFar-vNear)(1-e^(-d/vScale))
  // xferFrom/xferRamp/xferMin/xferMax : d>xferFrom 부터 환승 가산이 xferRamp km 에 걸쳐 1회분(xferMin 분)까지 증가, 최대 xferMax 회
  var PARAMS = {
    tokyo: { walkMax: 1.2, walkSpeed: 80, walkDetour: 1.3, stationWalk: 6, wait: 2, vNear: 14, vFar: 28, vScale: 5, xferFrom: 4, xferRamp: 6, xferMin: 5, xferMax: 1.5, label: '전철' },
    osaka: { walkMax: 1.2, walkSpeed: 80, walkDetour: 1.3, stationWalk: 6, wait: 2, vNear: 12, vFar: 36, vScale: 5, xferFrom: 4, xferRamp: 6, xferMin: 5, xferMax: 1.5, label: '전철' },
    sapporo: { walkMax: 1.1, walkSpeed: 80, walkDetour: 1.25, stationWalk: 7, wait: 3, vNear: 12, vFar: 32, vScale: 3, xferFrom: 3, xferRamp: 6, xferMin: 3, xferMax: 1.5, label: '지하철·버스' },
    fukuoka: { walkMax: 1.1, walkSpeed: 80, walkDetour: 1.3, stationWalk: 7, wait: 2, vNear: 12, vFar: 32, vScale: 3, xferFrom: 4, xferRamp: 6, xferMin: 3, xferMax: 1.5, label: '지하철·버스' },
  };
  // 거점역(큰 역) 안에서 갈아타러 걷는 시간
  var HUB_WALK = 3;
  // 같은 근교 지역 안의 이동 (시골 버스·택시)
  var LOCAL = { walkMax: 1.5, walkSpeed: 75, walkDetour: 1.3, wait: 8, access: 3, speed: 28, detour: 1.35 };
  // 큐레이션 노선이 없는 먼 거리(>20km) — 근교 전철·버스
  var REGIONAL = { from: 20, wait: 10, access: 8, speed: 45, detour: 1.25, xferEvery: 30, xferMin: 8 };

  // ---------- 장소별 역 접근 도보(분): 가장 가까운 역·정류장 ↔ 장소 ----------
  // 공식 안내 기준(예: 선샤인시티 8분, 센소지 5분, 오사카성 천수각 15~20분, 홋카이도신궁 15분).
  var ACCESS = {
    // tokyo
    shibuyasky: 3, sensoji: 5, teamlab: 6, harajuku: 2, shimokita: 2, goldengai: 5, akiba: 3,
    ikebukuro: 9, nakameguro: 3, skytree: 3, tokyotower: 6, ueno: 8, ginza: 2, mori: 4,
    shinjukugyoen: 6, ichou: 5, marunouchi: 3, motomura: 4, tsukiji: 3, afuri: 4, maisen: 5,
    monja: 3, sushiro: 4, ichiran_t: 3, yurakucho: 2, ginzasushi: 4, crepe: 4, gracery: 5,
    dormy_t: 4, ninehours: 3, hoshinoya: 3, hilton_odaiba: 3,
    // osaka
    dotonbori: 5, osakajo: 18, umedasky: 9, kaiyukan: 5, shinsekai: 5, amemura: 4, nakazakicho: 3,
    zouheikyoku: 12, hikari: 2, kuromon: 3, kushikatsu: 5, '551': 2, takoyaki: 5, mizuno: 5,
    genroku: 5, kani: 5, ichiran_o: 5, tsuruhashi: 3, crosshotel: 4, dormy_o: 4, swissotel: 1,
    guesthouse_o: 4,
    // sapporo (모이와산은 느린 노면전차 20분 + 도보 8분이라 접근을 길게)
    odori: 3, moiwa: 20, beer: 8, shiroikoibito: 7, susukino: 2, maruyama: 15, hokudai: 8,
    jingisukan: 3, garaku: 3, suage: 4, sumire: 3, nijo: 6, toriton: 10, hanamaru: 2,
    kanihonke: 3, rokkatei: 4, jrtower: 2, dormy_s: 3, yuen_s: 5,
    // fukuoka (모모치 쪽은 버스라 접근을 길게)
    yatai: 4, canal: 6, tenjin: 6, ohori: 5, tower: 9, lalaport: 9, maizuru: 8, kushida: 4,
    ichiran_f: 4, shinshin: 4, ikkousha: 5, motsunabe: 3, mentaiju: 5, hyotan: 3, makino: 2,
    horumon: 2, seahawk: 9, dormy_f: 3, mitsui: 5, nikko_f: 3,
  };

  // ---------- 거점(출발역·선착장) ----------
  var HUBS = {
    shinjuku: pt(35.6896, 139.7006, { name: '신주쿠역' }),
    tokyo: pt(35.6812, 139.7671, { name: '도쿄역' }),
    shinagawa: pt(35.6285, 139.7387, { name: '시나가와역' }),
    shibuya: pt(35.6580, 139.7016, { name: '시부야역' }),
    shinkiba: pt(35.6459, 139.8267, { name: '신키바역' }),
    namba: pt(34.6660, 135.5000, { name: '난바역' }),
    osaka: pt(34.7025, 135.4959, { name: '오사카역' }),
    umeda: pt(34.7052, 135.4985, { name: '오사카우메다역(한큐)' }),
    yodoyabashi: pt(34.6923, 135.5011, { name: '요도야바시역' }),
    tempozan: pt(34.6546, 135.4304, { name: '가이유칸 서쪽 선착장' }),
    sapporo: pt(43.0687, 141.3508, { name: '삿포로역' }),
    hakata: pt(33.5897, 130.4207, { name: '하카타역' }),
    tenjin: pt(33.5895, 130.3990, { name: '니시테츠 후쿠오카(텐진)역' }),
    bayside: pt(33.6040, 130.4020, { name: '베이사이드 플레이스 하카타' }),
    momochi: pt(33.5928, 130.3515, { name: '모모치 마리존' }),
  };

  // ---------- 큐레이션 노선 ----------
  // o(hub, 분, mode, 노선명): 거점역에서 목적지 문 앞까지(거점 대기 + 탑승 + 환승 + 도착 후 도보/버스).
  function o(hub, min, mode, via) { return { hub: hub, min: min, mode: mode, via: via }; }
  function R(city, area, lat, lng, name, opts) {
    return { city: city, area: area, lat: lat, lng: lng, name: name, options: opts };
  }
  var ROUTES = {
    // tokyo
    hakone: R('tokyo', 'hakone', 35.2324, 139.1069, '하코네유모토', [
      o('shinjuku', 90, 'rail', '오다큐 로맨스카'), o('tokyo', 68, 'rail', '신칸센·하코네 등산열차'),
      o('shinagawa', 63, 'rail', '신칸센·하코네 등산열차')]),
    kamakura: R('tokyo', 'kamakura', 35.3192, 139.5467, '가마쿠라', [
      o('tokyo', 64, 'rail', 'JR 요코스카선'), o('shinagawa', 55, 'rail', 'JR 요코스카선'),
      o('shinjuku', 67, 'rail', 'JR 쇼난신주쿠 라인'), o('shibuya', 62, 'rail', 'JR 쇼난신주쿠 라인')]),
    disneyland: R('tokyo', 'disney', 35.6329, 139.8804, '마이하마', [
      o('tokyo', 33, 'rail', 'JR 게이요선'), o('shinkiba', 17, 'rail', 'JR 게이요선')]),
    disneysea: R('tokyo', 'disney', 35.6267, 139.8851, '마이하마', [
      o('tokyo', 42, 'rail', 'JR 게이요선·디즈니 리조트 라인'), o('shinkiba', 26, 'rail', 'JR 게이요선·디즈니 리조트 라인')]),
    disneyhotel: R('tokyo', 'disney', 35.6345, 139.8845, '마이하마', [
      o('tokyo', 38, 'rail', 'JR 게이요선·디즈니 리조트 라인'), o('shinkiba', 22, 'rail', 'JR 게이요선·디즈니 리조트 라인')]),
    // osaka
    usj: R('osaka', 'universal', 34.6654, 135.4323, '유니버설시티', [
      o('osaka', 22, 'rail', 'JR 유메사키선'), o('namba', 30, 'rail', '한신 난바선·JR 유메사키선'),
      o('tempozan', 25, 'ferry', '캡틴 라인 페리')]),
    univport: R('osaka', 'universal', 34.6640, 135.4345, '유니버설시티', [
      o('osaka', 20, 'rail', 'JR 유메사키선'), o('namba', 28, 'rail', '한신 난바선·JR 유메사키선'),
      o('tempozan', 25, 'ferry', '캡틴 라인 페리')]),
    kyoto: R('osaka', 'kyoto', 34.9671, 135.7727, '후시미이나리', [
      o('osaka', 47, 'rail', 'JR 교토선·나라선'), o('yodoyabashi', 55, 'rail', '게이한 전철')]),
    arashiyama: R('osaka', 'arashiyama', 35.0094, 135.6668, '아라시야마', [
      o('osaka', 65, 'rail', 'JR 교토선·사가노선'), o('umeda', 70, 'rail', '한큐 전철')]),
    nara: R('osaka', 'nara', 34.6851, 135.8430, '나라 공원', [o('namba', 58, 'rail', '긴테쓰 쾌속급행')]),
    arima: R('osaka', 'arima', 34.7968, 135.2479, '아리마 온센', [o('osaka', 65, 'bus', '고속버스')]),
    arima_ryokan: R('osaka', 'arima', 34.7968, 135.2479, '아리마 온센', [o('osaka', 65, 'bus', '고속버스')]),
    // sapporo
    otaru: R('sapporo', 'otaru', 43.1976, 140.9940, '오타루', [o('sapporo', 45, 'rail', 'JR 쾌속')]),
    letao: R('sapporo', 'otaru', 43.1908, 141.0049, '오타루', [o('sapporo', 45, 'rail', 'JR 쾌속')]),
    jozankei: R('sapporo', 'jozankei', 42.9677, 141.1672, '조잔케이', [o('sapporo', 70, 'bus', '조테쓰 버스')]),
    morinouta: R('sapporo', 'jozankei', 42.9688, 141.1647, '조잔케이', [o('sapporo', 70, 'bus', '조테쓰 버스')]),
    noboribetsu: R('sapporo', 'noboribetsu', 42.4967, 141.1486, '노보리베츠 온천', [o('sapporo', 110, 'rail', 'JR 특급·버스')]),
    takimotokan: R('sapporo', 'noboribetsu', 42.4958, 141.1466, '노보리베츠 온천', [o('sapporo', 105, 'rail', 'JR 특급·버스')]),
    biei: R('sapporo', 'biei', 43.4935, 142.6143, '비에이 청의 호수', [o('sapporo', 180, 'rail', 'JR 특급·버스')]),
    asahiyama: R('sapporo', 'asahiyama', 43.7684, 142.4798, '아사히야마 동물원', [o('sapporo', 140, 'rail', 'JR 특급·버스')]),
    niseko: R('sapporo', 'niseko', 42.8605, 140.6989, '니세코 히라후', [o('sapporo', 165, 'rail', 'JR·버스')]),
    kiroro: R('sapporo', 'kiroro', 43.0784, 140.9884, '키로로', [o('sapporo', 110, 'bus', '스키 버스')]),
    // fukuoka
    dazaifu: R('fukuoka', 'dazaifu', 33.5215, 130.5349, '다자이후', [
      o('tenjin', 40, 'rail', '니시테츠 전철'), o('hakata', 50, 'bus', '다자이후 라이너 버스')]),
    yanagawa: R('fukuoka', 'yanagawa', 33.1631, 130.4059, '야나가와', [o('tenjin', 65, 'rail', '니시테츠 특급')]),
    unagi: R('fukuoka', 'yanagawa', 33.1620, 130.4050, '야나가와', [o('tenjin', 65, 'rail', '니시테츠 특급')]),
    yufuin: R('fukuoka', 'yufuin', 33.2663, 131.3688, '유후인', [o('hakata', 160, 'rail', '유후인노모리·고속버스')]),
    yufuin_ryokan: R('fukuoka', 'yufuin', 33.2660, 131.3650, '유후인', [o('hakata', 150, 'rail', '유후인노모리·고속버스')]),
    beppu: R('fukuoka', 'beppu', 33.3160, 131.4760, '벳푸 간나와', [o('hakata', 155, 'rail', 'JR 특급 소닉·버스')]),
    suginoi: R('fukuoka', 'beppu', 33.2940, 131.4810, '벳푸', [o('hakata', 150, 'rail', 'JR 특급 소닉·셔틀버스')]),
    itoshima: R('fukuoka', 'itoshima', 33.6429, 130.1994, '이토시마 후타미가우라', [
      o('tenjin', 80, 'bus', '지하철·JR 지쿠히선·버스'), o('hakata', 85, 'bus', '지하철·JR 지쿠히선·버스')]),
    kakigoya: R('fukuoka', 'itoshima', 33.6040, 130.2030, '이토시마 기시 항', [
      o('tenjin', 70, 'bus', '지하철·JR 지쿠히선·버스'), o('hakata', 75, 'bus', '지하철·JR 지쿠히선·버스')]),
    marineworld: R('fukuoka', 'marineworld', 33.6609, 130.3617, '우미노나카미치', [
      o('hakata', 45, 'rail', 'JR 가시이선'), o('bayside', 28, 'ferry', '우미나카 페리'), o('momochi', 28, 'ferry', '우미나카 페리')]),
    nokonoshima: R('fukuoka', 'nokonoshima', 33.6365, 130.2995, '노코노시마', [o('tenjin', 75, 'ferry', '버스·페리')]),
  };
  var AREA_RADIUS = 3; // id 없는 좌표가 이 거리(km) 안이면 그 근교 지역으로 본다

  // 근교 지역끼리 직접 잇는 노선 (거점 도시로 되돌아가지 않음)
  var LINKS = [
    { a: 'kyoto', b: 'arashiyama', min: 45, mode: 'rail', via: 'JR 나라선·사가노선' },
    { a: 'kyoto', b: 'nara', min: 75, mode: 'rail', via: 'JR 나라선' },
    { a: 'hakone', b: 'kamakura', min: 100, mode: 'rail', via: 'JR 도카이도선·에노덴' },
    { a: 'yufuin', b: 'beppu', min: 50, mode: 'bus', via: '가메노이 버스' },
    { a: 'dazaifu', b: 'yanagawa', min: 50, mode: 'rail', via: '니시테츠 전철' },
    { a: 'biei', b: 'asahiyama', min: 90, mode: 'bus', via: 'JR·버스' },
    { a: 'otaru', b: 'kiroro', min: 70, mode: 'bus', via: '주오 버스' },
    { a: 'otaru', b: 'niseko', min: 110, mode: 'rail', via: 'JR 하코다테선·버스' },
  ];

  // ---------- 모델 ----------
  function walkMin(d, P) { return 1 + (d * P.walkDetour * 1000) / P.walkSpeed; }
  function speed(d, P) { return P.vNear + (P.vFar - P.vNear) * (1 - Math.exp(-d / P.vScale)); }
  function xfer(d, P) {
    var n = (d - P.xferFrom) / P.xferRamp;
    return P.xferMin * Math.max(0, Math.min(P.xferMax, n));
  }
  function accessOf(p, P) {
    if (p && p.hub) return HUB_WALK;
    if (p && p.id != null && Object.prototype.hasOwnProperty.call(ACCESS, p.id)) return ACCESS[p.id];
    return P.stationWalk;
  }
  // 도시 모델 (반올림 전 분)
  function cityLeg(a, b, P) {
    var d = km(a, b);
    var walk = walkMin(d, P);
    if (d <= P.walkMax) return { t: walk, mode: 'walk', d: d };
    if (d > REGIONAL.from) {
      var t = 2 * REGIONAL.access + REGIONAL.wait + (d * REGIONAL.detour / REGIONAL.speed) * 60 +
        REGIONAL.xferMin * Math.floor(d / REGIONAL.xferEvery);
      return { t: t, mode: d > 40 ? 'rail' : 'bus', d: d };
    }
    var transit = accessOf(a, P) + accessOf(b, P) + P.wait + (d / speed(d, P)) * 60 + xfer(d, P);
    if (walk <= transit) return { t: walk, mode: 'walk', d: d };
    return { t: transit, mode: 'transit', d: d };
  }
  // 같은 근교 지역 안 (시골 도보 / 버스·택시)
  function localLeg(a, b) {
    var d = km(a, b);
    var walk = walkMin(d, LOCAL);
    if (d <= LOCAL.walkMax) return { t: walk, mode: 'walk', d: d };
    var t = LOCAL.wait + LOCAL.access + (d * LOCAL.detour / LOCAL.speed) * 60;
    return walk < t ? { t: walk, mode: 'walk', d: d } : { t: t, mode: 'bus', d: d };
  }

  function citiesData() {
    try { return typeof CITIES !== 'undefined' ? CITIES : root.CITIES; } catch (e) { return root.CITIES; }
  }
  function paramsFor(cityKey, a) {
    if (cityKey && PARAMS[cityKey]) return PARAMS[cityKey];
    var C = citiesData(), best = 'tokyo', bestD = Infinity;
    if (C) {
      for (var k in C) {
        if (!PARAMS[k] || !C[k] || !C[k].center) continue;
        var dd = km(a, { lat: C[k].center[0], lng: C[k].center[1] });
        if (dd < bestD) { bestD = dd; best = k; }
      }
    }
    return PARAMS[best];
  }

  // 근교 지역 소속: id 로, 없으면 좌표 근접으로
  function areaOf(p) {
    if (p.id != null && Object.prototype.hasOwnProperty.call(ROUTES, p.id)) {
      return { key: p.id, r: ROUTES[p.id], adj: 0 };
    }
    if (p.id != null && Object.prototype.hasOwnProperty.call(ACCESS, p.id)) return null; // 알려진 도시 장소
    var best = null, bestD = AREA_RADIUS;
    for (var k in ROUTES) {
      var d = km(p, ROUTES[k]);
      if (d <= bestD) { bestD = d; best = k; }
    }
    if (!best) return null;
    return { key: best, r: ROUTES[best], adj: localLeg(ROUTES[best], p).t };
  }
  function findLink(a, b) {
    for (var i = 0; i < LINKS.length; i++) {
      var L = LINKS[i];
      if ((L.a === a && L.b === b) || (L.a === b && L.b === a)) return L;
    }
    return null;
  }
  function hubPt(key) { var h = HUBS[key]; return pt(h.lat, h.lng, { hub: key, name: h.name }); }

  function roundMin(t, mode) {
    if (mode === 'walk') return Math.max(1, Math.round(t));
    return Math.max(5, Math.round(t / 5) * 5);
  }
  function labelFor(mode, min, P, via, extra) {
    if (mode === 'walk') return '도보 ' + min + '분';
    if (via) return via + (extra ? ' 등' : '') + ' 약 ' + fmt(min);
    if (mode === 'transit') return P.label + ' 약 ' + fmt(min);
    if (mode === 'rail') return '전철·JR 약 ' + fmt(min);
    if (mode === 'ferry') return '페리 약 ' + fmt(min);
    return '버스·택시 약 ' + fmt(min);
  }
  function result(t, mode, d, P, source, via, extra) {
    var min = roundMin(t, mode);
    return { min: min, mode: mode, km: Math.round(d * 10) / 10, label: labelFor(mode, min, P, via, extra), source: source };
  }

  // 한쪽이 근교(A)일 때: 반대편 점 p 에서 A 까지 가장 빠른 거점 경유 시간
  function viaHubs(p, A, P) {
    var best = null;
    var opts = A.r.options;
    for (var i = 0; i < opts.length; i++) {
      var leg = cityLeg(p, hubPt(opts[i].hub), P);
      var t = leg.t + opts[i].min + A.adj;
      if (!best || t < best.t) best = { t: t, opt: opts[i], access: leg.t };
    }
    return best;
  }

  function estimate(from, to, cityKey) {
    if (!hasCoord(from) || !hasCoord(to)) return null;
    var P = paramsFor(cityKey, from);
    var d = km(from, to);
    var A = areaOf(from), B = areaOf(to);

    if (A && B && A.r.area === B.r.area) {
      var lo = localLeg(from, to);
      return result(lo.t, lo.mode, d, P, 'route');
    }
    if (A && B) {
      var link = findLink(A.r.area, B.r.area);
      if (link) {
        // 지역 대표 장소 기준 시간 + 각 지역 안에서의 이동
        var tl = link.min + A.adj + B.adj;
        return result(tl, link.mode, d, P, 'route', link.via, A.adj + B.adj >= 10);
      }
      var best = null;
      for (var i = 0; i < A.r.options.length; i++) {
        for (var j = 0; j < B.r.options.length; j++) {
          var oa = A.r.options[i], ob = B.r.options[j];
          var t = oa.min + ob.min + A.adj + B.adj + cityLeg(hubPt(oa.hub), hubPt(ob.hub), P).t;
          if (!best || t < best.t) best = { t: t, opt: oa.min >= ob.min ? oa : ob };
        }
      }
      return result(best.t, best.opt.mode, d, P, 'route', best.opt.via, true);
    }
    if (A || B) {
      var far = A || B, near = A ? to : from;
      var v = viaHubs(near, far, P);
      return result(v.t, v.opt.mode, d, P, 'route', v.opt.via, v.access >= 10 || far.adj >= 10);
    }
    var leg = cityLeg(from, to, P);
    return result(leg.t, leg.mode, d, P, 'model');
  }

  function route(placeId) {
    if (placeId == null || !Object.prototype.hasOwnProperty.call(ROUTES, placeId)) return null;
    var r = ROUTES[placeId];
    return {
      id: placeId, city: r.city, area: r.area, name: r.name, lat: r.lat, lng: r.lng,
      options: r.options.map(function (x) {
        var h = HUBS[x.hub];
        return { hub: x.hub, hubName: h.name, lat: h.lat, lng: h.lng, min: x.min, mode: x.mode, via: x.via };
      }),
    };
  }

  var root = typeof window !== 'undefined' ? window : globalThis;
  var Travel = {
    estimate: estimate,
    route: route,
    params: PARAMS,
    // 테스트·디버깅용
    hubs: HUBS,
    access: ACCESS,
    routeIds: Object.keys(ROUTES),
    km: function (a, b) { return hasCoord(a) && hasCoord(b) ? km(a, b) : null; },
    fmt: fmt,
  };
  root.Travel = Travel;
  if (typeof module !== 'undefined' && module.exports) module.exports = Travel;
})();
