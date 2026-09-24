/*
 * 여행 일정 · 추천 엔진
 * data.js · seasons.js · travel.js 다음에 로드되는 일반 스크립트. window.Planner 를 정의한다.
 *
 *   Planner.recommend(cityKey, age, withKey, months?) -> { sights, foods, stays, offSeason, months }
 *   Planner.buildItinerary(opts)                       -> { days, leftover }
 *   Planner.tripMonths / nextMonthDate / monthTag / seasonNotes / events / seasonInfo / pickBaseStay
 *   Planner.mapSearchUrl(place)                        -> 구글 지도 검색 링크
 *
 * 이동 시간은 Travel.estimate(출발, 도착, 도시)로 구간마다 계산한다 (travel.js).
 * travel.js 가 없으면 거리 기반 대체 모델을 쓴다. 일괄 고정값은 쓰지 않는다.
 */
(function (root) {
  'use strict';

  var DAY_START = 9;      // 일반 일정 시작
  var DAY_END = 21.5;     // 일반 일정 종료
  var MEAL = 1;           // 식사 한 끼에 잡는 시간
  var MEAL_LEG = 0.25;    // 배치 단계에서 식사 장소까지 이동에 남겨 두는 여유 (실제 시각은 구간별로 계산)
  var CUSTOM_H = 1.5;     // 직접 입력한 장소에 잡는 시간 (위치를 몰라 이동 포함)
  var CHECKOUT = 0.5;    // 출국일 아침 체크아웃·짐 맡기기
  var OVERRUN = 0.25;     // 하루 끝 시각을 이만큼 넘기면 장소를 덜어낸다
  var BASE_STAY_KM = 10;  // 일정 기준 숙소로 쓸 수 있는 도심 반경
  var FAR_MIN = 100;      // 도심에서 편도 이만큼(분) 넘게 걸리면 '먼 근교' — 추천하지 않고, 직접 고르면 1박을 권한다
  var SLOT_RANK = { am: 0, any: 1, pm: 1.5, night: 2 };
  var WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];
  var SEASON_ORDER = ['spring', 'summer', 'autumn', 'winter'];
  var FAR_NOTICE = '먼 거리 일정이 포함되어 있습니다. 1박 일정은 어떠세요?';

  function data(name) {
    /* global CITIES, PLACES, PLACE_SEASONS, CITY_EVENTS, MONTH_TAGS, SEASON_NOTES, MONTH_NOTES, SEASON_OF_MONTH, SEASON_LABEL, Travel, KNOWN_SPOTS, CATEGORY_WORDS, PLACE_TAGS, AIRPORT_ACCESS, RESERVATIONS */
    try {
      switch (name) {
        case 'CITIES': return typeof CITIES !== 'undefined' ? CITIES : root.CITIES;
        case 'PLACES': return typeof PLACES !== 'undefined' ? PLACES : root.PLACES;
        case 'PLACE_SEASONS': return typeof PLACE_SEASONS !== 'undefined' ? PLACE_SEASONS : root.PLACE_SEASONS;
        case 'CITY_EVENTS': return typeof CITY_EVENTS !== 'undefined' ? CITY_EVENTS : root.CITY_EVENTS;
        case 'MONTH_TAGS': return typeof MONTH_TAGS !== 'undefined' ? MONTH_TAGS : root.MONTH_TAGS;
        case 'SEASON_NOTES': return typeof SEASON_NOTES !== 'undefined' ? SEASON_NOTES : root.SEASON_NOTES;
        case 'MONTH_NOTES': return typeof MONTH_NOTES !== 'undefined' ? MONTH_NOTES : root.MONTH_NOTES;
        case 'SEASON_OF_MONTH': return typeof SEASON_OF_MONTH !== 'undefined' ? SEASON_OF_MONTH : root.SEASON_OF_MONTH;
        case 'SEASON_LABEL': return typeof SEASON_LABEL !== 'undefined' ? SEASON_LABEL : root.SEASON_LABEL;
        case 'Travel': return typeof Travel !== 'undefined' ? Travel : root.Travel;
        case 'KNOWN_SPOTS': return typeof KNOWN_SPOTS !== 'undefined' ? KNOWN_SPOTS : root.KNOWN_SPOTS;
        case 'CATEGORY_WORDS': return typeof CATEGORY_WORDS !== 'undefined' ? CATEGORY_WORDS : root.CATEGORY_WORDS;
        case 'PLACE_TAGS': return typeof PLACE_TAGS !== 'undefined' ? PLACE_TAGS : root.PLACE_TAGS;
        case 'AIRPORT_ACCESS': return typeof AIRPORT_ACCESS !== 'undefined' ? AIRPORT_ACCESS : root.AIRPORT_ACCESS;
        case 'RESERVATIONS': return typeof RESERVATIONS !== 'undefined' ? RESERVATIONS : root.RESERVATIONS;
      }
    } catch (e) { /* 없으면 undefined */ }
    return undefined;
  }

  // ---------- 작은 도우미 ----------
  function copy(o, extra) {
    var r = {};
    var k;
    for (k in o) if (Object.prototype.hasOwnProperty.call(o, k)) r[k] = o[k];
    for (k in extra) if (Object.prototype.hasOwnProperty.call(extra, k)) r[k] = extra[k];
    return r;
  }

  function parseTime(s, fallback) {
    var m = /^(\d{1,2}):(\d{2})$/.exec(String(s || '').trim());
    if (!m) return fallback;
    return Number(m[1]) + Number(m[2]) / 60;
  }

  function fmtTime(h) {
    var mins = Math.round((h * 60) / 10) * 10;
    mins = ((mins % 1440) + 1440) % 1440;
    var hh = Math.floor(mins / 60);
    var mm = mins % 60;
    return (hh < 10 ? '0' : '') + hh + ':' + (mm < 10 ? '0' : '') + mm;
  }

  // 분 -> '1시간 25분' / '40분'
  function fmtDur(min) {
    min = Math.max(0, Math.round(min));
    var h = Math.floor(min / 60);
    var m = min % 60;
    if (!h) return m + '분';
    return h + '시간' + (m ? ' ' + m + '분' : '');
  }

  function hasCoord(p) {
    return !!p && typeof p.lat === 'number' && typeof p.lng === 'number' && isFinite(p.lat) && isFinite(p.lng);
  }

  function dist(a, b) {
    // a, b: [lat, lng] (km, haversine)
    var R = 6371;
    var toRad = Math.PI / 180;
    var dLat = (b[0] - a[0]) * toRad;
    var dLng = (b[1] - a[1]) * toRad;
    var s = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(a[0] * toRad) * Math.cos(b[0] * toRad) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    return 2 * R * Math.asin(Math.min(1, Math.sqrt(s)));
  }

  function pt(p) { return [p.lat, p.lng]; }

  function durOf(p) {
    var h = Number(p && p.h);
    return isFinite(h) && h > 0 ? h : 1;
  }

  // 날짜: 'YYYY-MM-DD' 를 직접 파싱해서 UTC로만 계산 (시간대 밀림 방지)
  function parseDate(s) {
    var m = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(String(s || '').trim());
    if (m) return Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
    var now = new Date();
    return Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  }

  function isoOf(ms) {
    var d = new Date(ms);
    var y = d.getUTCFullYear();
    var mo = d.getUTCMonth() + 1;
    var da = d.getUTCDate();
    return y + '-' + (mo < 10 ? '0' : '') + mo + '-' + (da < 10 ? '0' : '') + da;
  }

  function dateInfo(baseMs, offset) {
    var ms = baseMs + offset * 86400000;
    var d = new Date(ms);
    return {
      iso: isoOf(ms),
      month: d.getUTCMonth() + 1,
      label: (d.getUTCMonth() + 1) + '월 ' + d.getUTCDate() + '일 (' + WEEKDAYS[d.getUTCDay()] + ')',
    };
  }

  // 가장 가까운 이웃 순서 (출발점 기준)
  function nnOrder(items, origin) {
    var rest = items.slice();
    var out = [];
    var cur = origin;
    while (rest.length) {
      var best = 0;
      var bestD = Infinity;
      for (var i = 0; i < rest.length; i++) {
        var d = hasCoord(rest[i]) ? dist(cur, pt(rest[i])) : 1e6;
        if (d < bestD) { bestD = d; best = i; }
      }
      var next = rest.splice(best, 1)[0];
      out.push(next);
      if (hasCoord(next)) cur = pt(next);
    }
    return out;
  }

  function slotRank(it) {
    var r = SLOT_RANK[it.slot];
    return r === undefined ? 1 : r;
  }

  function stableSortBySlot(items) {
    return items
      .map(function (it, i) { return { it: it, i: i }; })
      .sort(function (a, b) { return slotRank(a.it) - slotRank(b.it) || a.i - b.i; })
      .map(function (x) { return x.it; });
  }

  // 받침에 따라 '로'/'으로' (ㄹ 받침은 '로')
  function ro(word) {
    var c = String(word || '').charCodeAt(String(word || '').length - 1);
    if (!(c >= 0xac00 && c <= 0xd7a3)) return '(으)로';
    var jong = (c - 0xac00) % 28;
    return jong === 0 || jong === 8 ? '로' : '으로';
  }

  // ---------- 이동 시간 ----------
  // a, b: { lat, lng, id?, name? }. 구간마다 출발·도착으로 계산한다.
  function travelLeg(cityKey, a, b) {
    if (!hasCoord(a) || !hasCoord(b)) return null;
    var T = data('Travel');
    if (T && typeof T.estimate === 'function') {
      try {
        var r = T.estimate(a, b, cityKey);
        if (r && isFinite(r.min)) {
          var mm = Math.max(1, Math.round(r.min));
          return {
            min: mm,
            mode: r.mode || 'transit',
            km: typeof r.km === 'number' ? r.km : Math.round(dist(pt(a), pt(b)) * 10) / 10,
            label: r.label || ('이동 약 ' + fmtDur(mm)),
          };
        }
      } catch (e) { /* 아래 대체 모델 */ }
    }
    // 대체 모델 (travel.js 가 없을 때): 거리로 도보/전철을 나눠 계산
    var km = dist(pt(a), pt(b));
    var k1 = Math.round(km * 10) / 10;
    if (km < 1.1) {
      var w = Math.max(1, Math.round((km * 1.3) / 4.8 * 60));
      return { min: w, mode: 'walk', km: k1, label: '도보 ' + w + '분' };
    }
    var speed = km < 5 ? 22 : km < 20 ? 32 : 50;
    var m = Math.max(10, Math.round((12 + (km * 1.3) / speed * 60) / 5) * 5);
    var rail = km >= 20;
    return { min: m, mode: rail ? 'rail' : 'transit', km: k1, label: (rail ? '열차' : '전철') + ' 약 ' + fmtDur(m) };
  }

  // ---------- 계절 ----------
  function normMonths(months) {
    if (months === null || months === undefined) return [];
    if (!Array.isArray(months)) months = [months];
    var out = [];
    months.forEach(function (m) {
      m = Number(m);
      if (m >= 1 && m <= 12 && out.indexOf(m) === -1) out.push(m);
    });
    return out;
  }

  function tripMonths(startDate, days) {
    var base = parseDate(startDate);
    var n = Math.max(1, Math.floor(Number(days) || 1));
    var out = [];
    for (var i = 0; i < n; i++) {
      var m = dateInfo(base, i).month;
      if (out.indexOf(m) === -1) out.push(m);
    }
    return out;
  }

  // 그 달 15일 중 오늘부터 7일 이상 남은 가장 가까운 날
  function nextMonthDate(month, todayIso) {
    month = Math.min(12, Math.max(1, Math.floor(Number(month) || 1)));
    var today;
    if (todayIso) today = parseDate(todayIso);
    else { var now = new Date(); today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()); }
    var y = new Date(today).getUTCFullYear();
    var cand = Date.UTC(y, month - 1, 15);
    if (cand < today + 7 * 86400000) cand = Date.UTC(y + 1, month - 1, 15);
    return isoOf(cand);
  }

  function monthTag(cityKey, month) {
    var T = data('MONTH_TAGS') || {};
    return (T[cityKey] && T[cityKey][Number(month)]) || '';
  }

  function seasonKeyOf(month) {
    var S = data('SEASON_OF_MONTH');
    if (S && S[month]) return S[month];
    return [null, 'winter', 'winter', 'spring', 'spring', 'spring', 'summer', 'summer', 'summer', 'autumn', 'autumn', 'autumn', 'winter'][month] || null;
  }

  function seasonNotes(cityKey, months) {
    months = normMonths(months);
    var N = (data('SEASON_NOTES') || {})[cityKey] || {};
    var L = data('SEASON_LABEL') || { spring: '봄', summer: '여름', autumn: '가을', winter: '겨울' };
    // 달을 알면 달별 안내 (MONTH_NOTES), 모르면 네 계절 한눈에
    var MN = (data('MONTH_NOTES') || {})[cityKey];
    if (months.length && MN && months.every(function (m) { return MN[m]; })) {
      return months.map(function (m) {
        return { key: 'm' + m, month: m, label: m + '월', text: MN[m].text, wear: MN[m].wear };
      });
    }
    var keys = [];
    if (!months.length) keys = SEASON_ORDER.slice();
    else months.forEach(function (m) { var k = seasonKeyOf(m); if (k && keys.indexOf(k) === -1) keys.push(k); });
    return keys.filter(function (k) { return N[k]; }).map(function (k) {
      return { key: k, label: L[k] || k, text: N[k].text, wear: N[k].wear };
    });
  }

  function events(cityKey, months) {
    months = normMonths(months);
    if (!months.length) return [];
    var E = (data('CITY_EVENTS') || {})[cityKey] || [];
    var list = (data('PLACES') || {})[cityKey] || [];
    return E.filter(function (e) {
      return (e.months || []).some(function (m) { return months.indexOf(m) !== -1; });
    }).map(function (e) {
      var places = (e.places || []).map(function (id) {
        for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
        return null;
      }).filter(function (p) { return p && !farInfo(cityKey, p); }); // 먼 근교는 바로가기로 권하지 않는다
      return copy(e, { places: places });
    });
  }

  // 장소의 계절 점수: 여행 기간의 달 중 가장 좋은 점수를 쓴다.
  function seasonInfo(cityKey, place, months) {
    if (!place) return null;
    months = normMonths(months);
    var S = (data('PLACE_SEASONS') || {})[cityKey] || {};
    var spec = S[place.id];
    if (!spec) return null;
    var only = spec.only || null;
    if (only && !months.some(function (m) { return only.indexOf(m) !== -1; })) {
      return { score: 0, why: only.map(function (m) { return m + '월'; }).join('·') + '에만 추천해요', hidden: true };
    }
    if (!months.length) return null;
    var best = null;
    months.forEach(function (m) {
      (spec.rules || []).forEach(function (r) {
        if ((r.m || []).indexOf(m) === -1) return;
        if (!best || r.s > best.score) best = { score: r.s, why: r.why };
      });
    });
    // 여행 달 중 규칙이 없는 달이 있으면 그 달은 0점 (보통 시기)
    if (best && best.score < 0 && months.some(function (m) {
      return !(spec.rules || []).some(function (r) { return (r.m || []).indexOf(m) !== -1; });
    })) best = null;
    if (!best || best.score === 0) return null;
    return { score: best.score, why: best.why, hidden: false };
  }

  // ---------- 직접 입력한 곳 알아보기 ----------
  // "규카츠 이치니산" 같은 가게 이름 → 그 장소, "5500엔 미만 무한리필 야키니쿠" 같은 조건 → 조건에 맞는 후보들
  var GENERIC_WORDS = ['맛집', '집', '가게', '추천', '근처', '저렴', '싼', '가성비', '괜찮은', '유명한'];
  function norm(t) { return String(t || '').toLowerCase().replace(/[\s·・()\[\]（）,，.\-_'"~!?]/g, ''); }

  // 도시의 모든 후보 (기존 장소 + 한국인이 많이 찾는 가게) — 카테고리·가격을 붙여서
  var poolCache = {};
  function spotPool(cityKey) {
    if (poolCache[cityKey]) return poolCache[cityKey];
    var tags = (data('PLACE_TAGS') || {})[cityKey] || {};
    var base = ((data('PLACES') || {})[cityKey] || []).map(function (p) {
      var t = tags[p.id];
      return t ? copy(p, { tags: t.tags || [], price: t.price || null }) : p;
    });
    var known = ((data('KNOWN_SPOTS') || {})[cityKey] || []).map(function (k) {
      return copy(k, { ages: k.ages || '1234', with: k.with || 'sfa', known: true });
    });
    poolCache[cityKey] = base.concat(known);
    return poolCache[cityKey];
  }

  function aliasesOf(p) {
    var out = [p.name, String(p.name || '').replace(/\(.*?\)/g, ''), p.q].concat(p.aliases || []);
    var inner = /\((.*?)\)/.exec(p.name || '');
    if (inner) out = out.concat(inner[1].split(/[·,]/));
    return out.map(norm).filter(function (a) { return a.length >= 2; });
  }

  // "이치란라멘을 제외한 라멘집", "라멘집 (이치란 빼고)" → 뺄 이름과 나머지 요청으로 나눈다
  var EXCL_RE = /([^\s,()（）]+(?:\s[^\s,()（）]+)?)\s*(?:을|를|은|는|이|가)?\s*(제외한|제외하고|제외|빼고|뺀|말고|없이|아닌)/;
  function splitExclusion(raw) {
    var m = EXCL_RE.exec(raw);
    if (!m) return { rest: raw, excluded: [] };
    var target = m[1].replace(/(을|를|은|는|이|가)$/, '');
    var rest = (raw.slice(0, m.index) + ' ' + raw.slice(m.index + m[0].length)).replace(/[()（）]/g, ' ').replace(/\s+/g, ' ').trim();
    return { rest: rest || raw, excluded: [target] };
  }
  function excludedIds(cityKey, names) {
    var CW = data('CATEGORY_WORDS') || {};
    var catWords = [];
    Object.keys(CW).forEach(function (c) { (CW[c] || []).forEach(function (w) { var n = norm(w); if (n.length >= 2) catWords.push(n); }); });
    var ids = [];
    names.forEach(function (name) {
      var core = norm(name);
      catWords.forEach(function (w) { if (core.length > w.length && core.slice(-w.length) === w) core = core.slice(0, -w.length); });
      if (core.length < 2) return;
      spotPool(cityKey).forEach(function (p) {
        if (ids.indexOf(p.id) !== -1) return;
        if (aliasesOf(p).some(function (a) { return a.indexOf(core) !== -1; })) ids.push(p.id);
      });
    });
    return ids;
  }

  function resolveCustom(cityKey, text) {
    var original = String(text || '').trim();
    if (!original) return null;
    var ex = splitExclusion(original);
    var raw = ex.rest;
    var exclude = excludedIds(cityKey, ex.excluded);
    var nt = norm(raw);
    var pool = spotPool(cityKey).filter(function (p) { return exclude.indexOf(p.id) === -1; });

    // 1) 이름 찾기: 입력 안에 가게 이름(별칭)이 통째로 들어 있으면 강한 일치
    var strong = null, weak = null;
    pool.forEach(function (p) {
      if (p.t === 'stay') return;
      aliasesOf(p).forEach(function (a) {
        if (nt.indexOf(a) !== -1 && a.length >= 3 && (!strong || a.length > strong.len)) strong = { p: p, len: a.length, alias: a };
        else if ((nt.length >= 3 ? a.indexOf(nt) !== -1 : nt.length === 2 && a.indexOf(nt) === 0) && (!weak || a.length < weak.len)) weak = { p: p, len: a.length };
      });
    });

    // 2) 조건 찾기: 카테고리 낱말 + 예산
    var CW = data('CATEGORY_WORDS') || {};
    var cats = Object.keys(CW).filter(function (c) {
      return (CW[c] || []).some(function (w) { var nw = norm(w); return nw.length >= 2 && nt.indexOf(nw) !== -1; });
    });
    var budget = null;
    var bm = /(\d[\d,]*)\s*(엔|円|yen)/i.exec(raw);
    if (bm) {
      var v = Number(bm[1].replace(/,/g, ''));
      var strict = /미만|未満|under|아래/.test(raw);
      budget = { max: v, strict: strict };
    }
    var generic = GENERIC_WORDS.some(function (w) { return raw.indexOf(w) !== -1; });
    var isRequest = cats.length > 0 && (budget || generic || !strong);

    // 별칭이 카테고리 낱말뿐이면(예: '무한리필 야키니쿠') 가게 이름으로 보지 않는다. 예산이 붙으면 늘 조건 요청.
    if (strong) {
      var left = strong.alias;
      Object.keys(CW).forEach(function (c) { (CW[c] || []).forEach(function (w) { var nw = norm(w); if (nw.length >= 2) left = left.split(nw).join(''); }); });
      if (left.length < 2) strong = null;
    }
    if (strong && !budget && !(isRequest && generic && strong.len < 4)) {
      return { kind: 'place', text: original, place: strong.p, exclude: exclude, excludedNames: ex.excluded };
    }
    // 다른 도시에 있는 가게 이름이면 알려 주고, 이 도시에서 비슷한 곳을 찾는다
    var elsewhere = null;
    var CS = data('CITIES') || {};
    Object.keys(CS).forEach(function (other) {
      if (other === cityKey || elsewhere) return;
      spotPool(other).forEach(function (p) {
        if (elsewhere || p.t === 'stay') return;
        aliasesOf(p).forEach(function (a) {
          if (!elsewhere && a.length >= 3 && nt.indexOf(a) !== -1 && (!p.tags || !p.tags.some(function (c) { return (CW[c] || []).some(function (w) { return norm(w) === a; }); }))) {
            elsewhere = { city: other, cityName: CS[other].name, name: p.name, tags: p.tags || [] };
          }
        });
      });
    });
    if (elsewhere && !cats.length) cats = elsewhere.tags.slice(0, 1);
    if (cats.length) {
      var cands = requestCandidates(pool, cats, budget);
      return {
        kind: 'request', text: original, cats: cats, budget: budget, exclude: exclude, excludedNames: ex.excluded,
        candidates: cands,
        label: requestLabel(cats, budget),
        elsewhere: elsewhere,
      };
    }
    if (weak) return { kind: 'place', text: original, place: weak.p, exclude: exclude, excludedNames: ex.excluded };
    return { kind: 'unknown', text: original, exclude: exclude, excludedNames: ex.excluded };
  }

  function priceOk(p, budget) {
    if (!budget) return true;
    if (!p.price) return false;
    return budget.strict ? p.price[0] < budget.max : p.price[0] <= budget.max;
  }
  function requestCandidates(pool, cats, budget) {
    function match(need) {
      return pool.filter(function (p) {
        if (p.t === 'stay' || !p.tags) return false;
        return need.every(function (c) { return p.tags.indexOf(c) !== -1; }) && priceOk(p, budget);
      });
    }
    var r = match(cats);
    // 모두 맞는 곳이 없으면 가장 구체적인 카테고리 하나로 (예: '무한리필' 빼고 '야키니쿠')
    if (!r.length && cats.length > 1) {
      for (var i = 0; i < cats.length && !r.length; i++) if (cats[i] !== 'ayce') r = match([cats[i]]);
    }
    return r;
  }
  var CAT_LABEL = { yakiniku: '야키니쿠', ayce: '무한리필', sushi: '스시', kaitenzushi: '회전초밥', ramen: '라멘', gyukatsu: '규카츠', tonkatsu: '돈카츠', izakaya: '이자카야', cafe: '카페', dessert: '디저트', seafood: '해산물', udon: '우동', okonomiyaki: '오코노미야키', takoyaki: '타코야키', crab: '게 요리', wagyu: '와규', curry: '카레', shopping: '쇼핑', donki: '돈키호테', drugstore: '드럭스토어', sento_onsen: '온천·목욕탕', character: '캐릭터숍', view: '전망대' };
  function requestLabel(cats, budget) {
    var t = cats.map(function (c) { return CAT_LABEL[c] || c; }).join(' ');
    if (budget) t = budget.max.toLocaleString('ko-KR') + '엔 ' + (budget.strict ? '미만 ' : '이하 ') + t;
    return t;
  }

  // 한 칸에 여러 곳을 적어도 나눈다: 쉼표·줄바꿈·슬래시 등
  function splitCustom(text) {
    return String(text || '').split(/[,，、\n\/;]+|\s+그리고\s+/).map(function (x) { return x.trim(); }).filter(Boolean);
  }

  // ---------- 먼 근교 ----------
  var farCache = {};
  function farInfo(cityKey, place) {
    if (!hasCoord(place)) return null;
    var key = cityKey + ':' + (place.id || place.lat + ',' + place.lng);
    if (key in farCache) return farCache[key];
    var C = data('CITIES') || {};
    var c = C[cityKey] && C[cityKey].center;
    var r = null;
    if (c) {
      var l = travelLeg(cityKey, { id: '__center', lat: c[0], lng: c[1] }, place);
      if (l && l.min >= FAR_MIN) r = { min: l.min, label: l.label };
    }
    farCache[key] = r;
    return r;
  }

  // ---------- 추천 ----------
  function recommend(cityKey, age, withKey, months) {
    var PL = data('PLACES') || {};
    var list = PL[cityKey] || [];
    age = String(age || '');
    withKey = String(withKey || '');
    months = normMonths(months);
    var seasonal = months.length > 0;
    // 10대 혼자는 사례가 적어 '친구와' 장소도 맞춤으로 보되, 원래 '혼자' 태그가 있는 곳을 앞에 둔다.
    var teenSolo = age === '1' && withKey === 's';
    // [혼자 태그 맞춤, 친구 태그로 대신한 맞춤, 부분 맞춤]
    var groups = { sight: [[], [], []], food: [[], [], []], stay: [[], [], []] };
    var offSeason = [];

    list.forEach(function (p) {
      var ageOk = String(p.ages || '').indexOf(age) !== -1 && age !== '';
      var w = String(p.with || '');
      var withDirect = withKey !== '' && w.indexOf(withKey) !== -1;
      var withSub = !withDirect && teenSolo && w.indexOf('f') !== -1;
      var withOk = withDirect || withSub;
      if (!ageOk && !withOk) return;
      var g = groups[p.t];
      if (!g) return;
      var fit = ageOk && withOk ? 'exact' : 'partial';
      var tier = fit === 'partial' ? 2 : (withDirect ? 0 : 1);
      if (farInfo(cityKey, p)) return; // 먼 근교는 추천하지 않는다 (직접 고르면 일정에 넣고 1박을 권함)
      var info = seasonInfo(cityKey, p, months);
      if (info && info.hidden) return; // 시즌이 아닌 기간 한정 장소
      var extra = { fit: fit };
      if (info) extra.season = { score: info.score, why: info.why };
      var item = copy(p, extra);
      if (info && info.score <= -2) { offSeason.push(item); return; }
      g[tier].push(item);
    });

    var TIER_BASE = [4, 3.5, 1];
    function order(g) {
      if (!seasonal) return g[0].concat(g[1], g[2]);
      var all = [];
      g.forEach(function (arr, tier) {
        arr.forEach(function (p) { all.push({ p: p, k: TIER_BASE[tier] + (p.season ? p.season.score : 0), i: all.length }); });
      });
      all.sort(function (a, b) { return b.k - a.k || a.i - b.i; });
      return all.map(function (x) { return x.p; });
    }
    return {
      sights: order(groups.sight),
      foods: order(groups.food),
      stays: order(groups.stay),
      offSeason: offSeason,
      months: months,
    };
  }

  // 일정의 기준 숙소: 도심 반경 안의 첫 숙소 (멀리 있는 온천 료칸은 기준으로 쓰지 않는다)
  function pickBaseStay(stays, cityKey) {
    var C = data('CITIES') || {};
    var c = C[cityKey] && C[cityKey].center;
    var list = (stays || []).filter(hasCoord);
    if (!c) return list[0] || null;
    for (var i = 0; i < list.length; i++) {
      if (dist(c, pt(list[i])) <= BASE_STAY_KM) return list[i];
    }
    return null;
  }

  // ---------- 공항 → 숙소 교통편 ----------
  // 교통편마다 (공항→내리는 역 시간 + 그 역→숙소 이동)이 가장 짧은 역을 고르고, 전체가 짧은 순으로 정렬한다.
  // 5분 안쪽 차이면 싼 쪽을 앞에 둔다.
  var LUGGAGE_TRANSFER = 10;
  function airportAdvice(cityKey, code, stay) {
    var A = data('AIRPORT_ACCESS') || {};
    var opts = A[code];
    if (!opts || !opts.length) return null;
    var C = data('CITIES') || {};
    var c = C[cityKey] && C[cityKey].center;
    var dest = hasCoord(stay) ? stay : (c ? { id: '__center', name: '시내', lat: c[0], lng: c[1] } : null);
    if (!dest) return null;
    var list = opts.map(function (o) {
      var best = null;
      (o.hubs || []).forEach(function (h) {
        var l = travelLeg(cityKey, h, dest);
        var last = l ? l.min : 0;
        var total = h.min + last;
        // 짐을 들고 한 번 더 갈아타야 하면 (역에서 걸어서 못 가면) 10분만큼 불리하게 본다
        // 걸어서 10분이 넘으면 넘는 만큼 더 불리하게 본다 (캐리어를 끌고 걷는 시간)
        var rank = total + (l && l.mode !== 'walk' ? LUGGAGE_TRANSFER : Math.max(0, last - 10));
        if (!best || rank < best.rank) best = { hub: h, last: last, lastLabel: l ? l.label : '', lastMode: l ? l.mode : 'walk', total: total, rank: rank };
      });
      if (!best) return null;
      return {
        id: o.id, name: o.name, kind: o.kind, price: o.price, reserve: o.reserve,
        url: o.url || null, urlLabel: o.urlLabel || null, note: o.note || '',
        hub: best.hub.name, rideMin: best.hub.min, lastMin: best.last, lastLabel: best.lastLabel,
        lastWalk: best.lastMode === 'walk', total: best.total, rank: best.rank,
      };
    }).filter(Boolean);
    list.sort(function (a, b) {
      if (Math.abs(a.rank - b.rank) <= 5) return (a.price || 0) - (b.price || 0) || a.rank - b.rank;
      return a.rank - b.rank;
    });
    if (!list.length) return null;
    var cheapest = list.slice().sort(function (a, b) { return (a.price || 0) - (b.price || 0); })[0];
    return {
      code: code, stayName: hasCoord(stay) ? stay.name : '',
      best: list[0],
      cheapest: cheapest.id !== list[0].id ? cheapest : null,
      options: list,
    };
  }

  // ---------- 예약 정보 ----------
  function reservationOf(cityKey, id) {
    var R = data('RESERVATIONS') || {};
    var r = R[cityKey] && id ? R[cityKey][id] : null;
    return r || null;
  }

  // ---------- 한 동네 여행 ----------
  // 고른 동네(역 주변) 가까이에 있는 관광지·맛집만 모은다. 날 수에 비해 너무 적으면 반경을 조금씩 넓힌다.
  var AREA_RADII = [1.2, 1.6, 2];
  function areaPicks(cityKey, area, opts) {
    opts = opts || {};
    if (!hasCoord(area)) return { sights: [], foods: [], radius: 0 };
    var n = Math.max(1, Number(opts.days) || 1);
    var months = opts.months ? normMonths(opts.months) : null;
    var c = pt(area);
    var pool = spotPool(cityKey).filter(function (p) {
      if (!hasCoord(p) || p.t === 'stay' || p.full || farInfo(cityKey, p)) return false;
      var si = months ? seasonInfo(cityKey, p, months) : null;
      return !(si && (si.hidden || si.score <= -2));
    });
    var score = function (p) { var si = months ? seasonInfo(cityKey, p, months) : null; return si ? si.score : 0; };
    var radius = AREA_RADII[0];
    var sights = [];
    for (var i = 0; i < AREA_RADII.length; i++) {
      radius = AREA_RADII[i];
      sights = pool.filter(function (p) { return p.t !== 'food' && dist(c, pt(p)) <= radius; });
      if (sights.length >= n * 2) break;
    }
    sights.sort(function (a, b) { return score(b) - score(a) || dist(c, pt(a)) - dist(c, pt(b)); });
    var foods = pool.filter(function (p) {
      if (p.t !== 'food' || dist(c, pt(p)) > radius + 0.5) return false;
      var rv = reservationOf(cityKey, p.id);
      return !(rv && rv.level === 'required');
    }).sort(function (a, b) { return dist(c, pt(a)) - dist(c, pt(b)); });
    return { sights: sights, foods: foods, radius: radius };
  }

  function mapSearchUrl(place) {
    var q = (place && (place.q || place.name)) || '';
    return 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(q);
  }

  function mapDirUrl(origin, places) {
    var pts = places.filter(hasCoord);
    if (pts.length < 1) return null;
    var ll = function (a) { return a[0] + ',' + a[1]; };
    var dest = pts[pts.length - 1];
    var way = pts.slice(0, -1).slice(0, 9);
    var url = 'https://www.google.com/maps/dir/?api=1&origin=' + ll(origin) +
      '&destination=' + ll(pt(dest));
    if (way.length) url += '&waypoints=' + way.map(function (p) { return ll(pt(p)); }).join('|');
    return url;
  }

  // 전체 동선을 구글 지도 링크로 (한 링크에 최대 10곳, 넘으면 이어지는 링크로 나눈다)
  var MAP_STOPS = 10;
  function tripMapLinks(result, stay, cityKey) {
    var C = data('CITIES') || {};
    var c = C[cityKey] && C[cityKey].center;
    var base = hasCoord(stay) ? stay : (c ? { name: '시내', lat: c[0], lng: c[1] } : null);
    var stops = [];
    function add(p, day) {
      if (!hasCoord(p)) return;
      var last = stops[stops.length - 1];
      if (last && Math.abs(last.lat - p.lat) < 1e-6 && Math.abs(last.lng - p.lng) < 1e-6) return;
      stops.push({ lat: p.lat, lng: p.lng, name: p.name, day: day });
    }
    ((result && result.days) || []).forEach(function (d) {
      var places = d.events.filter(function (e) { return (e.type === 'sight' || e.type === 'meal') && hasCoord(e.place); });
      if (!places.length) return;
      if (base) add(base, d.index);
      places.forEach(function (e) { add(e.place, d.index); });
    });
    if (base && stops.length) add(base, stops[stops.length - 1].day);
    var links = [];
    for (var i = 0; i < stops.length - 1; i += MAP_STOPS - 1) {
      var chunk = stops.slice(i, i + MAP_STOPS);
      if (chunk.length < 2) break;
      var url = 'https://www.google.com/maps/dir/' + chunk.map(function (p) { return p.lat + ',' + p.lng; }).join('/');
      links.push({ url: url, count: chunk.length, fromDay: chunk[0].day, toDay: chunk[chunk.length - 1].day, names: chunk.map(function (p) { return p.name; }) });
    }
    return links;
  }

  // ---------- 일정 ----------
  function buildItinerary(opts) {
    opts = opts || {};
    var C = data('CITIES') || {};
    var cityKey = opts.city;
    var city = C[cityKey] || {};
    var n = Math.max(1, Math.floor(Number(opts.days) || 1));
    var strict = opts.fillMode !== 'recommend';
    var airport = opts.airport || { code: '', name: '공항', transfer: 60 };
    var transfer = airport.code ? airportAdvice(cityKey, airport.code, opts.stay) : null;
    // 교통편 정보가 있으면 숙소까지 실제로 걸리는 시간 (5분 단위), 없으면 공항 기본값
    var transferMin = transfer ? Math.round(transfer.best.total / 5) * 5 : (Number(airport.transfer) || 0);
    var tr = transferMin / 60;
    var FREE = opts.freeLabel || '자유 시간 · 쇼핑';
    var arrive = parseTime(opts.arriveTime, 10);
    var depart = parseTime(opts.departTime, 18);
    var stay = opts.stay || null;
    var center = city.center ? city.center.slice() : [0, 0];
    var origin = hasCoord(stay) ? pt(stay) : center;
    // 이동 계산용 출발점 (숙소, 없으면 도심)
    var originPlace = hasCoord(stay) ? stay : { id: '__center', name: (city.name || '') + ' 시내', lat: center[0], lng: center[1] };
    var baseDate = parseDate(opts.startDate);
    var months = opts.months ? normMonths(opts.months) : tripMonths(opts.startDate, n);
    var legCache = {};
    function leg(a, b) {
      if (!hasCoord(a) || !hasCoord(b)) return null;
      var key = (a.id || a.lat + ',' + a.lng) + '>' + (b.id || b.lat + ',' + b.lng);
      if (!(key in legCache)) legCache[key] = travelLeg(cityKey, a, b);
      return legCache[key];
    }
    function legH(a, b) { var l = leg(a, b); return l ? l.min / 60 : 0; }

    // 우선순위 (넘칠 때 뒤에서부터 덜어낸다)
    var prio = {};
    (opts.sights || []).forEach(function (p, i) { if (p && p.id && !(p.id in prio)) prio[p.id] = i; });

    // 1) 날짜별 가용 시간창
    var days = [];
    for (var i = 0; i < n; i++) {
      var s, e, kind;
      if (n === 1) { s = arrive + tr + 0.5; e = depart - tr - 2; kind = 'single'; }
      else if (i === 0) { s = arrive + tr + 1; e = DAY_END; kind = 'arrival'; }
      else if (i === n - 1) { s = DAY_START; e = depart - tr - 2; kind = 'departure'; }
      else { s = DAY_START; e = DAY_END; kind = 'normal'; }
      s = Math.max(s, 7);
      e = Math.min(e, 23.5);
      var len = Math.max(0, e - s);
      // 식사 1시간이 들어갈 여유가 있으면 넣는다 (예: 12:20에 일정 시작해도 점심은 먹는다)
      var lunch = len > 0 && s <= 13.5 && e >= Math.max(s, 12) + 1;
      var dinner = len > 0 && s <= 20 && e >= Math.max(s, 18) + 1;
      days.push({
        i: i, start: s, end: e, len: len, kind: kind,
        full: null,
        items: [],        // {kind:'sight'|'custom'|'snack', place?, title?, h, slot}
        lunch: lunch, dinner: dinner,
        meals: { lunch: null, dinner: null },
        used: 0,
      });
    }
    function mealCount(d) { return (d.lunch ? 1 : 0) + (d.dinner ? 1 : 0); }
    function capacity(d) { return d.len - mealCount(d) * (MEAL + MEAL_LEG); }

    var leftover = [];
    var leftoverDay = {};
    var sights = (opts.sights || []).filter(Boolean);
    // 직접 적은 곳: 알려진 가게면 장소로, 조건이면 후보 중 동선에 맞는 곳으로, 모르는 곳은 이름 그대로
    var resolved = [];
    var customTexts = [];
    var customFoods = [];
    var requests = [];
    (opts.custom || []).forEach(function (txt) {
      var r = resolveCustom(cityKey, txt);
      if (!r) return;
      resolved.push(r);
      if (r.kind === 'place') {
        if (r.place.t === 'food') customFoods.push(r.place);
        else if (!sights.some(function (p) { return p.id === r.place.id; })) {
          sights.push(r.place);
          if (!(r.place.id in prio)) prio[r.place.id] = Object.keys(prio).length;
        }
      } else if (r.kind === 'request') requests.push(r);
      else customTexts.push(r.text);
    });
    // "○○ 제외"로 적은 곳은 일정 전체(자동 식사·빈 시간 추천·요청 후보)에서 뺀다
    var excluded = {};
    resolved.forEach(function (r) { (r.exclude || []).forEach(function (id) { excluded[id] = true; }); });
    requests.forEach(function (r) { r.candidates = (r.candidates || []).filter(function (f) { return !excluded[f.id]; }); });
    // 날짜별로 직접 적은 일정 (dayPlan): 적은 날에만 넣고 다른 날로 옮기지 않는다
    var pinned = Array.isArray(opts.dayPlan) || Array.isArray(opts.dayAreas);
    var dayAreas = Array.isArray(opts.dayAreas) ? opts.dayAreas : [];
    days.forEach(function (d) { d.area = hasCoord(dayAreas[d.i]) ? dayAreas[d.i] : null; });
    var pinDay = {};      // 장소 id → 날짜
    var pinSights = [];   // 날짜마다 관광지 목록
    var pinCustom = [];   // 날짜마다 위치 모르는 곳
    if (pinned) {
      sights = [];
      days.forEach(function (d) { pinSights[d.i] = []; pinCustom[d.i] = []; });
      (opts.dayPlan || []).forEach(function (list, di) {
        if (di >= n) return;
        (list || []).forEach(function (entry) {
          var place = null;
          if (entry && typeof entry === 'object') place = entry;
          else {
            var r = resolveCustom(cityKey, entry);
            if (!r) return;
            r.day = di;
            r.pinDay = di;
            resolved.push(r);
            (r.exclude || []).forEach(function (id) { excluded[id] = true; });
            if (r.kind === 'place') place = r.place;
            else if (r.kind === 'request') { requests.push(r); return; }
            else { pinCustom[di].push(r.text); return; }
          }
          if (!place || pinDay[place.id] !== undefined) return;
          pinDay[place.id] = di;
          if (!(place.id in prio)) prio[place.id] = Object.keys(prio).length;
          if (place.t === 'food') customFoods.push(place);
          else pinSights[di].push(place);
        });
      });
      requests.forEach(function (r) { r.candidates = (r.candidates || []).filter(function (f) { return !excluded[f.id]; }); });
    }
    var fullItems = sights.filter(function (p) { return p.full; });
    var normal = sights.filter(function (p) { return !p.full; });

    // 2) 하루 통째 일정 (테마파크·근교)
    // 도착·출국일은 짐·이동 때문에 제외하고, 시간창이 9시간 이상인 중간 날만
    var fullDays = days.filter(function (d) { return d.kind === 'normal' && d.len >= 9; });
    var fullLimit = strict ? fullDays.length : (fullDays.length ? Math.max(1, Math.floor(fullDays.length / 2)) : 0);
    // 추천 모드에서는 중간 날의 절반까지만 (최소 1일) 하루 통째 일정으로 쓴다
    var fi = 0;
    fullItems.forEach(function (p) {
      if (fi < fullLimit && fi < fullDays.length) {
        var d = fullDays[fi++];
        d.full = p;
        d.kind = 'full';
        d.lunch = false; // 점심은 현장에서
      } else if (strict) {
        leftover.push(p);
      }
    });
    // 하루 통째 일정: 가는 길 + 현지 + 돌아오는 길. 저녁은 19시(또는 돌아온 뒤)에 가능할 때만
    function fullPlan(d) {
      var go = legH(originPlace, d.full);
      var back = legH(d.full, originPlace);
      var onsite = Math.max(3, durOf(d.full) - go - back);
      return { go: go, back: back, onsite: onsite, end: d.start + go + onsite + back };
    }
    days.forEach(function (d) {
      if (!d.full) return;
      d.dinner = Math.max(18, fullPlan(d).end) + MEAL <= d.end + 0.01;
    });

    // 3) 일반 관광지 배치 — 필요한 시간 = 머무는 시간 + 직전 위치에서 오는 이동 시간
    var normDays = days.filter(function (d) { return !d.full && d.len > 0; });
    var slack = strict ? 0 : 1; // 추천 모드는 하루에 1시간 여유를 남긴다
    function newState() {
      var st = { used: {}, last: {}, assign: {} };
      days.forEach(function (d) { st.used[d.i] = 0; st.last[d.i] = originPlace; st.assign[d.i] = []; });
      return st;
    }
    function need(d, p, st) { return durOf(p) + legH(st.last[d.i], p); }
    function fits(d, p, st) {
      if (capacity(d) - slack - st.used[d.i] < need(d, p, st)) return false;
      if (p.slot === 'night' && d.end < 20) return false;
      return true;
    }
    function put(d, p, st) {
      st.used[d.i] += need(d, p, st);
      st.assign[d.i].push(p);
      st.last[d.i] = p;
    }

    // 3-1) 우선순위 순으로 first-fit → 어떤 장소를 넣을지 결정
    var st1 = newState();
    var chosen = [];
    normal.forEach(function (p) {
      for (var k = 0; k < normDays.length; k++) {
        if (fits(normDays[k], p, st1)) { put(normDays[k], p, st1); chosen.push(p); return; }
      }
      if (strict) leftover.push(p);
    });

    // 3-2) 선택된 장소를 동선(가까운 순) 기준으로 다시 배치
    var order = nnOrder(chosen, origin);
    var st2 = newState();
    var ptr = 0;
    var ok2 = true;
    // spread: 날마다 비슷한 수로 나눈다 (한 동네 여행에서 하루에 몰리지 않게)
    var perDay = opts.spread ? Math.max(1, Math.ceil(chosen.length / Math.max(1, normDays.length))) : Infinity;
    order.forEach(function (p) {
      if (!ok2) return;
      for (var pass = 0; pass < 2; pass++) {
      for (var k = 0; k < normDays.length; k++) {
        var idx = (ptr + k) % normDays.length;
        var d = normDays[idx];
        if (pass === 0 && st2.assign[d.i].length >= perDay) continue;
        // 야경·밤 장소는 하루 한 곳씩 (밤에 몰리면 시간창을 넘친다)
        if (pass === 0 && perDay !== Infinity && p.slot === 'night' && st2.assign[d.i].some(function (x) { return x.slot === 'night'; })) continue;
        if (fits(d, p, st2)) {
          put(d, p, st2);
          if (capacity(d) - slack - st2.used[d.i] < 1 || st2.assign[d.i].length >= perDay) ptr = (idx + 1) % normDays.length;
          else ptr = idx;
          return;
        }
      }
      if (perDay === Infinity) break;
      }
      ok2 = false;
    });
    var stFinal = ok2 ? st2 : st1;

    days.forEach(function (d) {
      var list = nnOrder(stFinal.assign[d.i], origin);
      d.items = stableSortBySlot(list.map(function (p) {
        return { kind: 'sight', place: p, h: durOf(p), slot: p.slot || 'any' };
      }));
      d.used = stFinal.used[d.i];
    });

    if (pinned) {
      days.forEach(function (d) {
        var list = pinSights[d.i] || [];
        // 하루 코스(테마파크·근교)는 그날 시간이 충분하면 하루 통째로, 아니면 일반 장소처럼 넣는다
        var full = list.filter(function (p) { return p.full; })[0];
        if (full && d.len >= 8) {
          d.full = full;
          d.kind = 'full';
          d.lunch = false;
          d.dinner = Math.max(18, fullPlan(d).end) + MEAL <= d.end + 0.01;
          list.filter(function (p) { return p !== full; }).forEach(function (p) { leftover.push(p); });
          return;
        }
        var ordered = nnOrder(list, origin);
        d.items = stableSortBySlot(ordered.map(function (p) {
          return { kind: 'sight', place: p, h: durOf(p), slot: p.slot || 'any' };
        }));
        var last = originPlace;
        d.used = 0;
        ordered.forEach(function (p) { d.used += durOf(p) + legH(last, p); last = p; });
        (pinCustom[d.i] || []).forEach(function (txt) {
          d.used += CUSTOM_H;
          d.items.push({ kind: 'custom', title: txt, h: CUSTOM_H, slot: 'any' });
        });
        d.items = stableSortBySlot(d.items);
      });
    }

    // 5) 직접 입력한 장소
    customTexts.forEach(function (txt) {
      txt = String(txt || '').trim();
      if (!txt) return;
      var cand = days.filter(function (d) { return !d.full && d.len > 0; });
      if (!cand.length) cand = days.filter(function (d) { return !d.full; });
      if (!cand.length) cand = days;
      var best = cand[0];
      cand.forEach(function (d) {
        if (capacity(d) - d.used > capacity(best) - best.used) best = d;
      });
      best.used += CUSTOM_H;
      best.items.push({ kind: 'custom', title: txt, h: CUSTOM_H, slot: 'any' });
      best.items = stableSortBySlot(best.items);
    });

    // 5-1) 비는 시간 채우기
    //   - 하루 한 동네(dayAreas): 그 동네 반경 안의 관광지로
    //   - 그 밖(fillSights): 바로 앞 장소에서 이동 maxHop(기본 30분) 안의 곳으로, 제철 점수가 높은 곳 먼저
    //   자유 시간이 2시간을 넘지 않도록 하루 여유는 1시간만 남긴다.
    var FILL_KEEP = 1;
    var HOP = typeof opts.maxHop === 'number' ? opts.maxHop : 0.5;
    var MAX_FREE = typeof opts.maxFree === 'number' ? opts.maxFree : 2;
    var AREA_R = [1.5, 2];
    var taken = {};
    function markTaken() {
      days.forEach(function (d) {
        if (d.full) taken[d.full.id] = true;
        d.items.forEach(function (it) { if (it.place) taken[it.place.id] = true; });
      });
    }
    markTaken();
    function seasonOk(p) {
      var si = seasonInfo(cityKey, p, months);
      return !(si && (si.hidden || si.score <= -2));
    }
    function sScore(p) { var si = seasonInfo(cityKey, p, months); return si ? si.score : 0; }
    function okSight(p) {
      return p && p.t !== 'food' && p.t !== 'stay' && !p.full && hasCoord(p) && !excluded[p.id] && !farInfo(cityKey, p) && seasonOk(p);
    }
    // 동네 하루: 그 동네 반경 안 (적으면 조금 넓힌다)
    var areaPoolCache = {};
    function areaPool(area) {
      var key = area.lat + ',' + area.lng;
      if (areaPoolCache[key]) return areaPoolCache[key];
      var all = spotPool(cityKey).filter(okSight);
      var r = [];
      for (var k = 0; k < AREA_R.length; k++) {
        var rad = AREA_R[k];
        r = all.filter(function (p) { return dist(pt(area), pt(p)) <= rad; });
        if (r.length >= 6) break;
      }
      areaPoolCache[key] = r;
      return r;
    }
    var roamPool = (opts.fillSights || []).filter(okSight);
    function poolOf(d) { return d.area ? areaPool(d.area) : roamPool; }
    // 간식·카페: 빈 시간이 남을 때 쓰는 짧은 일정
    var snackPool = spotPool(cityKey).filter(function (p) {
      return p.t === 'food' && hasCoord(p) && !excluded[p.id] && seasonOk(p) &&
        (p.tags || []).some(function (t) { return t === 'cafe' || t === 'dessert'; });
    });
    function pickNext(d, from, room, pool, hop) {
      var best = null;
      var bestCost = Infinity;
      var hasNight = d.items.some(function (it) { return it.slot === 'night'; });
      pool.forEach(function (p) {
        if (taken[p.id]) return;
        // 야경은 하루 한 곳까지 (저녁 뒤로 몰리면 시간창을 넘친다)
        if (p.slot === 'night' && (d.end < 20 || hasNight)) return;
        var l = legH(from, p);
        if (hop && l > hop) return;
        if (durOf(p) + l > room) return;
        var cost = l - 0.25 * sScore(p);
        if (cost < bestCost) { bestCost = cost; best = p; }
      });
      return best;
    }
    function fillDay(d) {
      var pool = poolOf(d);
      if (!pool.length) return;
      var remaining = capacity(d) - d.used;
      var located = d.items.filter(function (it) { return it.place && hasCoord(it.place); });
      var last = located.length ? located[located.length - 1].place : (d.area || originPlace);
      var guard = 0;
      while (remaining > FILL_KEEP + 0.5 && guard++ < 12) {
        // 동네 하루는 반경 안이면 이동 제한 없음, 그 밖은 한 번 이동이 HOP 이내
        var best = pickNext(d, last, remaining - FILL_KEEP, pool, d.area ? 0 : HOP);
        if (!best) break;
        var needB = durOf(best) + legH(last, best);
        taken[best.id] = true;
        d.items.push({ kind: 'sight', place: best, h: durOf(best), slot: best.slot || 'any', suggested: true });
        d.used += needB;
        remaining -= needB;
        last = best;
      }
      d.items = stableSortBySlot(d.items);
    }
    days.forEach(function (d) {
      if (d.full || d.len <= 0) return;
      if (d.area || (!pinned && roamPool.length)) fillDay(d);
    });

    // 4) 식사
    function centroid(d, forDinnerOnFull) {
      if (d.full) return forDinnerOnFull ? origin : (hasCoord(d.full) ? pt(d.full) : origin);
      var ps = d.items.filter(function (it) { return it.place && hasCoord(it.place); });
      if (!ps.length) return d.area ? pt(d.area) : origin;
      var la = 0, ln = 0;
      ps.forEach(function (it) { la += it.place.lat; ln += it.place.lng; });
      return [la / ps.length, ln / ps.length];
    }
    // 식사 자리의 기준점: 점심은 그날 첫 일정(오전 장소), 저녁은 저녁 전 마지막 일정 근처
    function anchorOf(d, meal) {
      if (d.full) return meal === 'dinner' ? { pt: origin, name: stay ? stay.name : '숙소' } : { pt: pt(d.full), name: d.full.name };
      var ps = d.items.filter(function (it) { return it.place && hasCoord(it.place); });
      if (!ps.length) return d.area ? { pt: pt(d.area), name: d.area.name } : { pt: origin, name: stay ? stay.name : '숙소' };
      var p;
      if (meal === 'lunch') p = ps[0].place;
      else {
        var day = ps.filter(function (it) { return it.slot !== 'night'; });
        p = (day.length ? day[day.length - 1] : ps[ps.length - 1]).place;
      }
      return { pt: pt(p), name: p.name };
    }
    function mealAllowed(food, meal) {
      if (food.slot === 'am') return meal === 'lunch';
      if (food.slot === 'night') return meal === 'dinner';
      return true;
    }
    function fDist(food, c) { return hasCoord(food) ? dist(c, pt(food)) : 1e6; }

    var userFoods = (opts.foods || []).filter(Boolean).concat(customFoods.filter(function (f) {
      return !(opts.foods || []).some(function (x) { return x && x.id === f.id; });
    }));
    var usedFoodIds = {};
    userFoods.forEach(function (f) { if (f.id) usedFoodIds[f.id] = true; });

    userFoods.forEach(function (f) {
      var best = null;
      var bestD = Infinity;
      if (durOf(f) >= 1) {
        days.forEach(function (d) {
          if (pinDay[f.id] !== undefined && pinDay[f.id] !== d.i) return;
          ['lunch', 'dinner'].forEach(function (m) {
            if (!d[m] || d.meals[m] || !mealAllowed(f, m)) return;
            var dd = fDist(f, anchorOf(d, m).pt);
            if (dd < bestD - 1e-9) { bestD = dd; best = { d: d, m: m }; }
          });
        });
      }
      if (best) {
        best.d.meals[best.m] = { place: f, suggested: false };
        return;
      }
      // 간식: 가장 가까운 날 (시간창이 있는 날 우선)
      var cand = days.filter(function (d) { return d.len > 0; });
      if (pinDay[f.id] !== undefined) cand = days.filter(function (d) { return d.i === pinDay[f.id]; });
      if (!cand.length) cand = days;
      var bd = cand[0];
      var bdd = Infinity;
      cand.forEach(function (d) {
        var dd = fDist(f, centroid(d, false));
        if (dd < bdd - 1e-9) { bdd = dd; bd = d; }
      });
      bd.items.push({ kind: 'snack', place: f, h: Math.min(durOf(f), 1), slot: f.slot || 'any' });
      bd.items = stableSortBySlot(bd.items);
    });

    // 조건 요청: 후보 중 빈 식사 자리와 가장 가까운 곳 (예: 무한리필 야키니쿠 → 그날 동선 근처 지점)
    requests.forEach(function (r) {
      var best = null;
      var bestD = Infinity;
      (r.candidates || []).forEach(function (f) {
        if (usedFoodIds[f.id] || !hasCoord(f)) return;
        var isMeal = f.t === 'food' && durOf(f) >= 1;
        days.forEach(function (d) {
          if (typeof r.pinDay === 'number' && r.pinDay !== d.i) return;
          if (isMeal) {
            ['dinner', 'lunch'].forEach(function (m) {
              if (!d[m] || d.meals[m] || !mealAllowed(f, m)) return;
              var an = anchorOf(d, m);
              var dd = fDist(f, an.pt);
              if (dd < bestD - 1e-9) { bestD = dd; best = { f: f, d: d, m: m, near: an.name, km: dd }; }
            });
          } else if (d.len > 0 && !d.full) {
            var dd2 = fDist(f, centroid(d, false)) + 0.5; // 식사 자리가 아니면 살짝 불리하게
            if (dd2 < bestD - 1e-9) { bestD = dd2; best = { f: f, d: d, m: null }; }
          }
        });
      });
      if (!best) { r.placed = null; return; }
      usedFoodIds[best.f.id] = true;
      r.placed = best.f;
      r.near = best.near || null;
      r.day = best.d.i;
      r.meal = best.m;
      if (best.m) best.d.meals[best.m] = { place: best.f, suggested: true, request: r.text };
      else {
        best.d.items.push({ kind: best.f.t === 'food' ? 'snack' : 'sight', place: best.f, h: durOf(best.f), slot: best.f.slot || 'any', request: r.text });
        best.d.items = stableSortBySlot(best.d.items);
      }
    });

    // 빈 식사 자리에는 예약 필수인 곳(오마카세 등)을 넣지 않는다 (예약 없이 가면 못 들어가서)
    var extra = (opts.extraFoods || []).filter(function (f) {
      if (!f || usedFoodIds[f.id] || excluded[f.id]) return false;
      var rv = reservationOf(cityKey, f.id);
      return !(rv && rv.level === 'required');
    });
    days.forEach(function (d) {
      ['lunch', 'dinner'].forEach(function (m) {
        if (!d[m] || d.meals[m]) return;
        var c = anchorOf(d, m).pt;
        var pick = null;
        var pickD = Infinity;
        [true, false].forEach(function (mealSized) {
          if (pick) return;
          extra.forEach(function (f) {
            if (usedFoodIds[f.id] || !mealAllowed(f, m)) return;
            if (mealSized && durOf(f) < 1) return;
            var dd = fDist(f, c);
            if (dd < pickD - 1e-9) { pickD = dd; pick = f; }
          });
        });
        if (pick) {
          usedFoodIds[pick.id] = true;
          d.meals[m] = { place: pick, suggested: true };
        } else {
          d.meals[m] = { place: null, suggested: false };
        }
      });
    });

    // 6) 타임라인 — 구간마다 이동 시간을 계산해서 시각을 쌓는다
    function withSeason(ev) {
      if (ev.place) {
        var si = seasonInfo(cityKey, ev.place, months);
        if (si && !si.hidden) ev.season = { score: si.score, why: si.why };
      }
      return ev;
    }

    function buildDay(d, info) {
      var ev = [];
      var cur = originPlace;
      var t = d.start;

      function arriveAt(place) {
        // 현재 위치에서 place 까지 이동하고, 이동 구간을 돌려준다
        var l = leg(cur, place);
        if (l) t += l.min / 60;
        if (hasCoord(place)) cur = place;
        return l;
      }

      // 다음 일정까지 1시간 30분 이상 비면 자유 시간으로 보여 주고 시각을 옮긴다
      function waitUntil(target) {
        var last = ev[ev.length - 1];
        var alreadyFree = last && last.type === 'free' && !last.meal;
        if (target - t >= 1.5 && !alreadyFree) ev.push({ time: fmtTime(t), type: 'free', title: FREE });
        t = Math.max(t, target);
      }

      function mealEvent(m) {
        var ml = d.meals[m];
        var label = m === 'lunch' ? '점심' : '저녁';
        if (!ml || !ml.place) {
          ev.push({ time: fmtTime(t), type: 'free', title: '근처에서 자유 식사', meal: m, note: label });
          t += MEAL;
          return;
        }
        var l = arriveAt(ml.place);
        var e = withSeason({ time: fmtTime(t), type: 'meal', title: ml.place.name, place: ml.place, meal: m });
        if (l) e.move = l;
        if (ml.suggested) e.suggested = true;
        if (ml.request) { e.request = ml.request; e.note = '요청: ' + ml.request; }
        ev.push(e);
        t += Math.max(MEAL, Math.min(durOf(ml.place), 1.5));
      }

      if (d.i === 0) {
        ev.push({
          time: fmtTime(arrive), type: 'airport',
          title: airport.name + '(' + airport.code + ') 도착',
          note: transfer
            ? transfer.best.name + ' 추천 · ' + (transfer.stayName ? '숙소' : '시내') + '까지 약 ' + transferMin + '분'
            : '시내까지 약 ' + transferMin + '분',
        });
        if (n > 1) {
          ev.push({
            time: fmtTime(arrive + tr), type: 'hotel',
            title: stay ? stay.name + ' 짐 맡기기' : '숙소 체크인 · 짐 맡기기',
            move: transfer
              ? { min: transferMin, mode: transfer.best.kind === 'bus' ? 'bus' : 'rail', km: null,
                  label: transfer.best.name + ' → ' + transfer.best.hub + ' → ' + (transfer.stayName ? '숙소' : '시내') + ', 약 ' + fmtDur(transferMin) }
              : { min: transferMin, mode: 'rail', km: null, label: '공항에서 시내까지 약 ' + fmtDur(transferMin) },
          });
        }
      }

      // 출국일 아침: 체크아웃하고 짐 맡기기 (공항 가기 전에 찾는다)
      if (d.i === n - 1 && n > 1 && d.len > 0) {
        ev.push({ time: fmtTime(t), type: 'hotel', title: stay ? stay.name + ' 체크아웃 · 짐 맡기기' : '체크아웃 · 짐 맡기기', note: '공항 가기 전에 짐 찾기' });
        t += CHECKOUT;
      }

      var lunchPending = d.lunch;
      var dinnerPending = d.dinner;

      if (d.full) {
        var fp = fullPlan(d);
        var go = arriveAt(d.full);
        var fe = withSeason({
          time: fmtTime(t), type: 'sight', title: d.full.name, place: d.full,
          note: '하루 종일 · 현지에서 약 ' + fmtDur(fp.onsite * 60),
        });
        if (go) fe.move = go;
        ev.push(fe);
        t += fp.onsite;
        var backLeg = leg(d.full, originPlace);
        if (backLeg) {
          ev.push({
            time: fmtTime(t), type: 'move',
            title: stay ? stay.name + ' 쪽으로 돌아오기' : '시내로 돌아오기',
            move: backLeg,
          });
          t += backLeg.min / 60;
          cur = originPlace;
        }
        if (dinnerPending) { waitUntil(18); mealEvent('dinner'); dinnerPending = false; }
      } else {
        var anyActivity = d.items.some(function (it) { return it.kind !== 'snack'; });
        if (!anyActivity && d.len >= 1) {
          ev.push({ time: fmtTime(t), type: 'free', title: FREE });
        }
        d.items.forEach(function (it) {
          var h = it.h;
          // 다음 장소에 도착하는 시각 기준으로 식사를 먼저 할지 정한다
          var tn = t + (it.place ? legH(cur, it.place) : 0);
          if (lunchPending && it.after && it.after >= 11.5) {
            if (t < 11.5) waitUntil(11.5);
            mealEvent('lunch');
            lunchPending = false;
            tn = t + (it.place ? legH(cur, it.place) : 0);
          }
          if (lunchPending && (tn >= 11.5 || (tn >= 10.5 && tn + h > 13.5))) {
            mealEvent('lunch');
            lunchPending = false;
            tn = t + (it.place ? legH(cur, it.place) : 0);
          }
          if (dinnerPending && (it.slot === 'night' || tn >= 17.5 || (tn >= 16.5 && tn + h > 19.5))) {
            // 저녁으로 건너뛰기 전에 아직 점심 전이면 점심부터
            if (lunchPending) { waitUntil(12); mealEvent('lunch'); lunchPending = false; }
            waitUntil(it.slot === 'night' ? 18 : 17.5);
            mealEvent('dinner');
            dinnerPending = false;
          }
          if (it.kind === 'custom') {
            ev.push({
              time: fmtTime(t), type: 'custom', title: it.title, note: '위치 확인 필요 · 이동 포함 약 1시간 30분', fromItem: true,
              mapUrl: mapSearchUrl({ q: it.title + ' ' + (city.jp || city.name || '') }),
            });
            t += h;
            return;
          }
          var l = leg(cur, it.place);
          var arriveT = t + (l ? l.min / 60 : 0);
          if (it.slot === 'night' && it.kind === 'sight' && arriveT < 18.5) {
            // 야경은 해가 진 뒤에: 이동을 마친 뒤 기다리는 시간은 자유 시간으로
            t = arriveT - (l ? l.min / 60 : 0);
            waitUntil(18.5 - (l ? l.min / 60 : 0));
            arriveT = t + (l ? l.min / 60 : 0);
          }
          t = arriveT;
          if (hasCoord(it.place)) cur = it.place;
          var e = it.kind === 'sight'
            ? { time: fmtTime(t), type: 'sight', title: it.place.name, place: it.place }
            : { time: fmtTime(t), type: 'meal', title: '간식 · ' + it.place.name, place: it.place };
          if (l) e.move = l;
          e.fromItem = true;
          if (it.suggested) { e.suggested = true; e.note = d.area ? d.area.name + ' 추천' : '빈 시간 추천 · 동선 근처'; }
          if (it.request) { e.suggested = true; e.request = it.request; e.note = '요청: ' + it.request; }
          ev.push(withSeason(e));
          t += h;
        });
        if (lunchPending) { waitUntil(12); mealEvent('lunch'); }
        if (dinnerPending) { waitUntil(18); mealEvent('dinner'); }
      }

      if (d.i === n - 1) {
        ev.push({
          time: fmtTime(depart - tr - 2), type: 'depart',
          title: airport.name + ro(airport.name) + ' 이동',
          note: '공항까지 약 ' + transferMin + '분' + (transfer ? ' (' + transfer.best.name + ')' : '') + ' · 출발 2시간 전 도착',
        });
        ev.push({ time: fmtTime(depart), type: 'depart', title: '출국' });
      }

      if (!ev.length) ev.push({ time: fmtTime(d.start), type: 'free', title: FREE });
      return { ev: ev, end: t };
    }

    // 날짜 안 순서 다시 정리: 관광지는 가까운 순, 그 밖은 원래 순서, 마지막에 시간대 순
    function arrangeDay(d) {
      var sightsIn = d.items.filter(function (it) { return it.kind === 'sight'; });
      var others = d.items.filter(function (it) { return it.kind !== 'sight'; });
      var ordered = nnOrder(sightsIn.map(function (it) { return it.place; }), origin).map(function (p) {
        for (var k = 0; k < sightsIn.length; k++) if (sightsIn[k].place === p) return sightsIn[k];
        return null;
      }).filter(Boolean);
      d.items = stableSortBySlot(ordered.concat(others));
    }
    function prioOf(it) { return it.place && it.place.id in prio ? prio[it.place.id] : 1e9; }

    var infos = days.map(function (d) { return dateInfo(baseDate, d.i); });
    var built = days.map(function (d) { return buildDay(d, infos[d.i]); });
    function over(d) { return !d.full && built[d.i].end > d.end + OVERRUN; }

    // 실제 이동 시간으로 계산한 끝 시각이 시간창을 넘으면, 우선순위가 낮은 장소를 여유 있는 다른 날로 옮기고
    // 옮길 곳이 없을 때만 덜어낸다.
    var guard = 0;
    days.forEach(function (d) {
      while (over(d) && guard++ < 200) {
        var cands = d.items.filter(function (it) { return it.kind === 'sight'; });
        if (!cands.length) break;
        cands.sort(function (a, b) { return prioOf(b) - prioOf(a); });
        var it = cands[0];
        d.items.splice(d.items.indexOf(it), 1);
        built[d.i] = buildDay(d, infos[d.i]);
        var moved = false;
        var targets = pinned ? [] : normDays.filter(function (o) { return o !== d && !o.full; })
          .sort(function (a, b) { return (b.end - built[b.i].end) - (a.end - built[a.i].end); });
        for (var k = 0; k < targets.length && !moved; k++) {
          var o = targets[k];
          if (it.slot === 'night' && o.end < 20) continue;
          var before = o.items.slice();
          o.items.push(it);
          arrangeDay(o);
          var trial = buildDay(o, infos[o.i]);
          if (trial.end <= o.end + OVERRUN) { built[o.i] = trial; moved = true; }
          else o.items = before;
        }
        if (!moved && (strict || pinned) && !it.suggested) { leftover.push(it.place); if (pinned) leftoverDay[it.place.id] = d.i; }
      }
    });

    // 자유 시간이 MAX_FREE(2시간)를 넘는 날: 그 자리 근처 장소(없으면 카페·디저트)를 하나씩 더 넣어 본다
    function hOf(tm) { var a = String(tm || '').split(':'); return Number(a[0]) + Number(a[1] || 0) / 60; }
    function worstGap(ev, d) {
      var worst = null;
      for (var k = 0; k < ev.length; k++) {
        var e = ev[k];
        if (e.type !== 'free' || e.meal) continue;
        var t0 = hOf(e.time);
        var nx = ev[k + 1];
        var t1 = nx ? hOf(nx.time) - (nx.move ? nx.move.min / 60 : 0) : Math.min(d.end, DAY_END);
        var len = t1 - t0;
        if (len > MAX_FREE + 1e-9 && (!worst || len > worst.len)) {
          var prev = null;
          for (var j = k - 1; j >= 0; j--) if (ev[j].place && hasCoord(ev[j].place)) { prev = ev[j].place; break; }
          worst = { k: k, t0: t0, len: len, from: prev || d.area || originPlace };
        }
      }
      return worst;
    }
    // 2시간을 넘는 자유 시간의 합 (줄어들면 나아진 것)
    function excess(ev, d) {
      var sum = 0;
      for (var k = 0; k < ev.length; k++) {
        var e = ev[k];
        if (e.type !== 'free' || e.meal) continue;
        var nx = ev[k + 1];
        var t1 = nx ? hOf(nx.time) - (nx.move ? nx.move.min / 60 : 0) : Math.min(d.end, DAY_END);
        sum += Math.max(0, t1 - hOf(e.time) - MAX_FREE);
      }
      return sum;
    }
    var canGapFill = roamPool.length || days.some(function (d) { return d.area; });
    if (canGapFill && MAX_FREE > 0) {
      days.forEach(function (d) {
        if (d.full || d.len <= 0) return;
        if (pinned && !d.area) return;
        var tried = {};
        var guardG = 0;
        var g = worstGap(built[d.i].ev, d);
        while (g && guardG++ < 16) {
          var room = Math.min(g.len, 3);
          var hop = d.area ? 0 : Math.max(HOP, 0.5);
          var poolS = poolOf(d).filter(function (p) { return !tried[p.id]; });
          var cand = pickNext(d, g.from, room, poolS, hop);
          var asSnack = false;
          if (!cand && d.area) {
            // 동네 안 명소를 다 썼으면 바로 옆 동네(3km 안)까지
            var wide = spotPool(cityKey).filter(function (p) { return !tried[p.id] && okSight(p) && dist(pt(d.area), pt(p)) <= 3; });
            cand = pickNext(d, g.from, room, wide, 0.5);
          }
          if (!cand) {
            var near = snackPool.filter(function (p) {
              return !tried[p.id] && !usedFoodIds[p.id] && (!d.area || dist(pt(d.area), pt(p)) <= 3);
            });
            cand = pickNext(d, g.from, room, near, d.area ? 0 : Math.max(HOP, 0.5));
            asSnack = !!cand;
          }
          if (!cand) {
            // 그래도 없으면 동네 상관없이 30분 안쪽의 명소
            var any = spotPool(cityKey).filter(function (p) { return !tried[p.id] && okSight(p); });
            cand = pickNext(d, g.from, room, any, 0.5);
          }
          if (!cand) {
            // 마지막으로 30분 안쪽의 가벼운 먹거리 (간식)
            var bites = spotPool(cityKey).filter(function (p) {
              return p.t === 'food' && hasCoord(p) && !tried[p.id] && !usedFoodIds[p.id] && !excluded[p.id] && seasonOk(p) && durOf(p) <= 1 &&
                !(reservationOf(cityKey, p.id) && reservationOf(cityKey, p.id).level === 'required');
            });
            cand = pickNext(d, g.from, room, bites, 0.5);
            asSnack = !!cand;
          }
          if (!cand) break;
          tried[cand.id] = true;
          var before = d.items.slice();
          var item = asSnack
            ? { kind: 'snack', place: cand, h: Math.min(Math.max(durOf(cand), 0.75), 1), slot: cand.slot || 'any', suggested: true }
            : { kind: 'sight', place: cand, h: durOf(cand), slot: cand.slot || 'any', suggested: true };
          item.after = g.t0; // 이 빈 시간 자리 (점심 뒤 빈 시간이면 점심 다음에)
          // 빈 시간 자리에 끼워 넣는다: 그 시각 전에 나온 일정 수만큼 뒤
          var at = 0;
          for (var q = 0; q < g.k; q++) if (built[d.i].ev[q].fromItem) at++;
          d.items.splice(at, 0, item);
          var trial = buildDay(d, infos[d.i]);
          var g2 = worstGap(trial.ev, d);
          var better = excess(trial.ev, d) < excess(built[d.i].ev, d) - 0.05;
          if (trial.end <= d.end + OVERRUN && better) {
            built[d.i] = trial;
            taken[cand.id] = true;
            if (asSnack) usedFoodIds[cand.id] = true;
            g = g2;
          } else {
            d.items = before;
          }
        }
      });
    }

    var out = days.map(function (d) {
      var info = infos[d.i];
      var ev = built[d.i].ev;

      var mapPlaces = ev
        .filter(function (e) { return (e.type === 'sight' || e.type === 'meal') && e.place; })
        .map(function (e) { return e.place; });
      var travelMin = ev.reduce(function (sum, e) { return sum + (e.move ? e.move.min : 0); }, 0);

      return {
        index: d.i,
        date: info.iso,
        label: (d.i + 1) + '일차 · ' + info.label,
        kind: d.kind,
        events: ev,
        travelMin: travelMin,
        mapUrl: mapDirUrl(origin, mapPlaces),
      };
    });

    // 일정에 들어간 먼 근교 (화면에서 1박을 권한다)
    var farPlaces = [];
    out.forEach(function (d) {
      d.events.forEach(function (e) {
        if (e.type !== 'sight' || !e.place) return;
        var f = farInfo(cityKey, e.place);
        if (f && !farPlaces.some(function (x) { return x.place.id === e.place.id; })) {
          e.far = f;
          farPlaces.push({ place: e.place, min: f.min, label: f.label, day: d.index });
        }
      });
    });

    // 예약이 필요하거나 하면 좋은 곳 (일정에 나온 순서대로, 한 번씩)
    var reservations = [];
    out.forEach(function (d) {
      d.events.forEach(function (e) {
        var r = e.place && reservationOf(cityKey, e.place.id);
        if (!r) return;
        e.reserve = r;
        if (r.level === 'queue') return;
        if (!reservations.some(function (x) { return x.place.id === e.place.id; })) {
          reservations.push({ place: e.place, level: r.level, why: r.why, url: r.url || null, urlLabel: r.urlLabel || null, day: d.index });
        }
      });
    });
    reservations.sort(function (a, b) { return (a.level === 'required' ? 0 : 1) - (b.level === 'required' ? 0 : 1) || a.day - b.day; });

    return {
      days: out,
      transfer: transfer,
      reservations: reservations,
      leftover: strict || pinned ? leftover : [],
      leftoverDays: leftoverDay,
      farPlaces: farPlaces,
      resolved: resolved.map(function (r) {
        return {
          text: r.text, kind: r.kind, label: r.label || '',
          place: r.kind === 'place' ? r.place : (r.placed || null),
          candidates: (r.candidates || []).length,
          elsewhere: r.elsewhere || null,
          near: r.near || null, day: typeof r.day === 'number' ? r.day : null, meal: r.meal || null,
          pinned: typeof r.pinDay === 'number',
          excludedNames: r.excludedNames || [],
        };
      }),
      farNotice: farPlaces.length ? FAR_NOTICE : '',
    };
  }

  var Planner = {
    recommend: recommend,
    buildItinerary: buildItinerary,
    mapSearchUrl: mapSearchUrl,
    tripMonths: tripMonths,
    nextMonthDate: nextMonthDate,
    monthTag: monthTag,
    seasonNotes: seasonNotes,
    events: events,
    seasonInfo: seasonInfo,
    pickBaseStay: pickBaseStay,
    farInfo: farInfo,
    tripMapLinks: tripMapLinks,
    resolveCustom: resolveCustom,
    splitCustom: splitCustom,
    airportAdvice: airportAdvice,
    reservationOf: reservationOf,
    areaPicks: areaPicks,
    spots: spotPool,
    FAR_NOTICE: FAR_NOTICE,
    // 테스트·UI 보조용
    _fmtTime: fmtTime,
    _fmtDur: fmtDur,
    _dist: dist,
    _ro: ro,
    _travelLeg: travelLeg,
  };

  root.Planner = Planner;
  if (typeof module !== 'undefined' && module.exports) module.exports = Planner;
})(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : this));
