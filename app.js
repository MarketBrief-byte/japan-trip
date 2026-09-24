/*
 * 여행 노선도 — 화면 흐름 (UI)
 * 데이터: data.js (AIRPORTS, CITIES, PLACES, AGE_LABEL, WITH_LABEL, TIPS), seasons.js (계절·시즌)
 * 엔진:   planner.js (Planner.recommend / buildItinerary / mapSearchUrl
 *         + 계절: tripMonths / nextMonthDate / monthTag / seasonNotes / events / seasonInfo / pickBaseStay)
 *         이동 시간은 엔진이 구간마다 계산해 event.move 로 넘겨준다 (travel.js).
 */
(function () {
  'use strict';

  /* ---------- 공통 도우미 ---------- */
  const CITY_KEYS = ['tokyo', 'osaka', 'sapporo', 'fukuoka'];
  const NIGHTS = [1, 2, 3, 4, 5];
  const MAX_DAYS = 10;
  const MIN_GAP_H = 6; // 도착~출국 최소 간격(시간): 공항 이동 왕복 + 출국 2시간 전 도착
  const DOW = ['일', '월', '화', '수', '목', '금', '토'];
  const KANJI_NUM = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];
  const STORE_KEY = 'yeohaeng-noseondo:v1';

  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const pad = (n) => String(n).padStart(2, '0');
  const ymd = (d) => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  const parseYmd = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
  const addDays = (s, n) => { const d = parseYmd(s); d.setDate(d.getDate() + n); return ymd(d); };
  const todayPlus = (n) => { const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() + n); return ymd(d); };
  const dayDiff = (a, b) => Math.round((parseYmd(b) - parseYmd(a)) / 86400000);
  const fmtDate = (s) => { const d = parseYmd(s); return (d.getMonth() + 1) + '월 ' + d.getDate() + '일 (' + DOW[d.getDay()] + ')'; };
  const fmtGap = (h) => { const m = Math.max(0, Math.round(h * 60)), H = Math.floor(m / 60), M = m % 60; return (H ? H + '시간' : '') + (H && M ? ' ' : '') + (M || !H ? M + '분' : ''); };
  const periodLabel = (days) => (days <= 1 ? '당일치기' : (days - 1) + '박 ' + days + '일');
  const fmtMin = (min) => { const m = Math.max(0, Math.round(min)), H = Math.floor(m / 60), M = m % 60; return H ? H + '시간' + (M ? ' ' + M + '분' : '') : M + '분'; };
  const fmtKm = (km) => (typeof km === 'number' && isFinite(km) && km > 0 ? (km >= 10 ? Math.round(km) : Math.round(km * 10) / 10) + 'km' : '');
  const plannerReady = () => typeof window.Planner !== 'undefined' && window.Planner && typeof window.Planner.buildItinerary === 'function';
  const mapUrl = (p) => {
    try { if (plannerReady() && Planner.mapSearchUrl) return Planner.mapSearchUrl(p); } catch (e) { /* 아래 기본값 */ }
    return 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(p.q || p.name);
  };
  // 엔진 보조 함수 호출: 없거나 실패하면 기본값 (계절 정보가 없어도 화면은 그려지게)
  function engine(fn, args, fallback) {
    if (!plannerReady() || typeof Planner[fn] !== 'function') return fallback;
    try { const r = Planner[fn].apply(Planner, args); return r == null ? fallback : r; } catch (e) { console.error(e); return fallback; }
  }

  /* ---------- 계절 ---------- */
  const SEASONS = [
    { key: 'spring', label: '봄', kanji: '春', months: [3, 4, 5] },
    { key: 'summer', label: '여름', kanji: '夏', months: [6, 7, 8] },
    { key: 'autumn', label: '가을', kanji: '秋', months: [9, 10, 11] },
    { key: 'winter', label: '겨울', kanji: '冬', months: [12, 1, 2] },
  ];
  const seasonOf = (m) => SEASONS.find((s) => s.months.includes(m)) || null;
  const seasonByKey = (k) => SEASONS.find((s) => s.key === k) || null;
  const monthsLabel = (ms) => (!ms || !ms.length ? '' : ms.length === 1 ? ms[0] + '월' : ms[0] + '~' + ms[ms.length - 1] + '월');
  // 받침에 따라 '은'/'는'
  const eunNeun = (w) => { const c = String(w).charCodeAt(String(w).length - 1); return c >= 0xac00 && c <= 0xd7a3 && (c - 0xac00) % 28 ? '은' : '는'; };
  const seasonsOfMonths = (ms) => (ms || []).map(seasonOf).filter((s, i, a) => s && a.indexOf(s) === i);
  // 이벤트 종류 표시 (그림 문자 없이 글자 + CSS 도형)
  const EVENT_KIND = { nature: '꽃·단풍', festival: '축제', event: '이벤트', food: '제철 음식', onsen: '온천', activity: '액티비티', culture: '문화' };
  const EVENTS_SHOWN = 4; // 이보다 많으면 나머지는 접어 둔다
  // 이 시기 볼거리: 그 달에만 있는 것(눈축제 등)이 몇 달씩 이어지는 것(스키 시즌 등)보다 먼저
  function seasonEvents(city, months) {
    return engine('events', [city, months], []).map((e, i) => ({ e, i, n: (e.months || []).length || 12 }))
      .sort((a, b) => a.n - b.n || a.i - b.i).map((x) => x.e);
  }

  /* ---------- 저장 (선택 사항: 지난 선택 기억) ----------
   * 고른 값만 덮어쓴다 (아직 안 고른 단계가 지난번 선택을 지우지 않도록).
   * month: 1~12, 0 = '아직 몰라요' */
  function loadMemory() {
    try { const m = JSON.parse(localStorage.getItem(STORE_KEY) || '{}'); return m && typeof m === 'object' ? m : {}; } catch (e) { return {}; }
  }
  function saveMemory() {
    const m = {
      city: state.city, age: state.age, with: state.with, nights: state.nights,
      month: state.monthPicked ? (state.month || 0) : null,
      formCity: state.form.city, formAirport: state.form.airport,
    };
    Object.keys(m).forEach((k) => { if (m[k] != null) memory[k] = m[k]; });
    try { localStorage.setItem(STORE_KEY, JSON.stringify(memory)); } catch (e) { /* 저장 불가 환경은 무시 */ }
  }
  const memory = loadMemory();

  /* ---------- 상태 ---------- */
  function freshForm() {
    const city = CITY_KEYS.includes(memory.formCity) ? memory.formCity : 'osaka';
    const arrDate = todayPlus(30);
    return {
      city,
      airport: memory.formAirport && AIRPORTS[city].some((a) => a.code === memory.formAirport) ? memory.formAirport : AIRPORTS[city][0].code,
      arrDate, arrTime: '10:30', depDate: addDays(arrDate, 3), depTime: '17:00',
      depTouched: false, // 출국 날짜를 직접 고쳤는지 (안 고쳤으면 도착 날짜를 따라 옮김)
      stay: '',          // 'area:<id>' 지역 · 'place:<id>' 목록의 숙소 · '' 아직 안 정함
      hotelName: '',     // 예약한 호텔 이름 (선택, 표시용)
    };
  }
  // concept: 'area' 한 동네에서 · 'days' 날짜별로 가고 싶은 곳. byDay[i] = i일차에 적은 곳들
  // concept: 'area' 하루에 한 동네씩 · 'roam' 많이 돌아다니기. dayAreas[i] = i일차 동네 id, byDay[i] = i일차에 적은 곳, must = 돌아다니기에서 꼭 갈 곳
  function freshPicks(city) { return { city, concept: null, dayAreas: [], byDay: [], must: [], focusDay: 0 }; }
  function freshState() {
    return {
      path: null,      // 'A' 미정 | 'B' 정함
      plan: null,      // B 경로: 'yes' 가고 싶은 곳 있음 | 'no' 추천
      city: null, age: null, with: null, nights: null,
      month: null,        // A 경로 여행 달 (1~12) | null = 아직 몰라요
      monthPicked: false, // 시기 화면에서 한 번이라도 골랐는지 ('아직 몰라요' 포함)
      form: freshForm(),
      picks: freshPicks(null),
    };
  }
  let state = freshState();
  let stack = [];
  let current = 'start';
  let firstRender = true;

  /* ---------- 경로(단계) 정의 ---------- */
  function steps() {
    if (state.path === 'A') return [['city', '도시'], ['month', '시기'], ['age', '연령대'], ['with', '동반'], ['nights', '기간'], ['result', '추천']];
    if (state.path === 'B') {
      if (state.plan === 'yes') {
        const c = state.picks.concept;
        return [['arrival', '도착 정보'], ['detail', '세부 계획'], ['concept', '여행 스타일'],
          c === 'area' ? ['days', '날짜별 동네'] : c === 'roam' ? ['roam', '꼭 갈 곳'] : ['_', '장소'], ['route', '동선']];
      }
      if (state.plan === 'no') return [['arrival', '도착 정보'], ['detail', '세부 계획'], ['age', '연령대'], ['with', '동반'], ['result', '추천']];
      return [['arrival', '도착 정보'], ['detail', '세부 계획'], ['_', '고르기'], ['_', '결과']];
    }
    return [];
  }
  function nextOf(screen) {
    switch (screen) {
      case 'city': return 'month';
      case 'month': return 'age';
      case 'age': return 'with';
      case 'with': return state.path === 'A' ? 'nights' : 'result';
      case 'nights': return 'result';
      case 'arrival': return 'detail';
      case 'detail': return state.plan === 'yes' ? 'concept' : 'age';
      case 'concept': return state.picks.concept === 'area' ? 'days' : 'roam';
      case 'roam': return 'route';
      case 'days': return 'route';
      default: return 'start';
    }
  }

  /* ---------- 탐색 ----------
   * stack: 지나온 화면들. 브라우저(휴대폰) 뒤로 가기도 같은 스택을 따르도록
   * history.state.noseon 에 깊이를 적어 둔다. history API가 막힌 환경이면 내부 스택만 쓴다. */
  let resetting = false;
  function navState(depth, screen) { return { noseon: depth, screen }; }
  function pushNav() { try { history.pushState(navState(stack.length, current), ''); } catch (e) { /* 무시 */ } }
  function navSynced() { try { return !!history.state && history.state.noseon === stack.length; } catch (e) { return false; } }
  let navSeq = 0; // 화면이 바뀔 때마다 증가 (뒤로 가기 대체 타이머가 그 사이 이동을 되돌리지 않도록)
  function go(screen) { navSeq++; stack.push(current); current = screen; pushNav(); render(); }
  function popTo(depth) {
    if (depth >= stack.length) return;
    navSeq++;
    while (stack.length > depth) current = stack.pop();
    render();
  }
  // popstate 가 오지 않는 환경(일부 임베드 화면)에서도 멈추지 않도록 잠시 뒤 직접 처리한다.
  const NAV_FALLBACK_MS = 350;
  function back() {
    if (!stack.length) return;
    if (navSynced()) {
      const before = stack.length, seq = navSeq;
      history.back(); // popstate 에서 처리
      setTimeout(() => { if (navSeq === seq) popTo(before - 1); }, NAV_FALLBACK_MS);
    } else popTo(stack.length - 1);
  }
  // 지나온 화면으로 여러 단계 한 번에 돌아가기 (예: 결과 → 시기 고르기)
  function jumpTo(screen) {
    const depth = stack.lastIndexOf(screen);
    if (depth < 0) return;
    if (navSynced()) {
      const seq = navSeq;
      history.go(depth - stack.length); // popstate 에서 처리
      setTimeout(() => { if (navSeq === seq) popTo(depth); }, NAV_FALLBACK_MS);
    } else popTo(depth);
  }
  function resetAll() {
    const f = state.form;
    state = freshState();
    state.form = f;
    stack = [];
    current = 'start';
    try { history.replaceState(navState(0, 'start'), ''); } catch (e) { /* 무시 */ }
    render();
  }
  function home() {
    if (stack.length && navSynced()) {
      resetting = true;
      history.go(-stack.length);
      setTimeout(() => { if (resetting) { resetting = false; resetAll(); } }, NAV_FALLBACK_MS);
    } else resetAll();
  }
  window.addEventListener('popstate', (e) => {
    const st = e.state && typeof e.state.noseon === 'number' ? e.state : navState(0, 'start');
    if (resetting) { resetting = false; resetAll(); return; }
    if (st.noseon < stack.length) popTo(st.noseon);
    else if (st.noseon === stack.length + 1 && SCREENS[st.screen]) { navSeq++; stack.push(current); current = st.screen; render(); }
  });

  const app = document.getElementById('app');

  function activeCity() {
    if (state.path === 'B') return state.form.city;
    return state.city;
  }

  function render() {
    const city = activeCity();
    if (city) app.style.setProperty('--city', 'var(--line-' + city + ')');
    else app.style.removeProperty('--city');
    app.dataset.screen = current;

    const wide = current === 'result' || current === 'route';
    document.querySelectorAll('.site-header .wrap, .site-footer .wrap').forEach((el) => el.classList.toggle('wrap--wide', wide));
    let body = '';
    try {
      body = SCREENS[current]();
    } catch (err) {
      console.error(err);
      body = errorBlock('화면을 그리는 중 문제가 생겼어요.', '뒤로 가서 다시 골라 보거나 처음부터 시작해 주세요.');
    }
    app.innerHTML =
      '<div class="wrap ' + (wide ? 'wrap--wide' : '') + ' screen">' +
        (current !== 'start' ? topBar() : '') +
        body +
      '</div>';
    if (!firstRender) {
      window.scrollTo(0, 0);
      const h = app.querySelector('h1');
      if (h) h.focus({ preventScroll: true });
    }
    firstRender = false;
    AFTER[current] && AFTER[current]();
  }

  function topBar() {
    const s = steps();
    const idx = s.findIndex((x) => x[0] === current);
    let line = '';
    if (s.length) {
      line = '<ol class="line" aria-label="진행 단계">' + s.map((x, i) => {
        const st = i < idx ? 'done' : i === idx ? 'now' : 'next';
        return '<li class="line__stop is-' + st + '"' + (st === 'now' ? ' aria-current="step"' : '') + '>' +
          '<span class="line__dot" aria-hidden="true"></span>' +
          '<span class="line__label">' + esc(x[1]) + '</span>' +
          '<span class="sr-only">' + (st === 'done' ? ' (완료)' : st === 'now' ? ' (현재 단계)' : '') + '</span>' +
        '</li>';
      }).join('') + '</ol>';
    }
    return '<div class="topbar">' +
      '<button type="button" class="back" data-action="back"><span aria-hidden="true">←</span> 뒤로</button>' +
      line +
    '</div>';
  }

  function errorBlock(title, fix) {
    return '<div class="notice notice--error" role="alert"><strong>' + esc(title) + '</strong><p>' + esc(fix) + '</p></div>' +
      '<div class="actions"><button type="button" class="btn btn--ghost" data-action="back">다시 고르기</button>' +
      '<button type="button" class="btn" data-action="home">처음으로</button></div>';
  }

  function heading(title, lead, eyebrow) {
    return '<div class="head">' +
      (eyebrow ? '<p class="eyebrow">' + eyebrow + '</p>' : '') +
      '<h1 tabindex="-1">' + esc(title) + '</h1>' +
      (lead ? '<p class="lead">' + lead + '</p>' : '') +
    '</div>';
  }

  function choiceRow(field, value, title, sub, opts) {
    opts = opts || {};
    const last = !opts.action && memory[field] != null && String(memory[field]) === String(value);
    const chosen = 'chosen' in opts ? opts.chosen : state[field] != null && String(state[field]) === String(value);
    return '<button type="button" class="choice' + (chosen ? ' is-chosen' : '') + '" data-action="' + (opts.action || 'choose') + '" data-field="' + field + '" data-value="' + esc(value) + '"' +
      (opts.describedby ? ' aria-describedby="' + opts.describedby + '"' : '') + '>' +
      (opts.badge ? opts.badge : '') +
      '<span class="choice__text"><span class="choice__title">' + esc(title) +
        (opts.jp ? ' <span class="choice__jp" lang="ja">' + esc(opts.jp) + '</span>' : '') + '</span>' +
      (sub ? '<span class="choice__sub">' + esc(sub) + '</span>' : '') +
      (opts.stat ? '<span class="choice__stat">' + esc(opts.stat) + '</span>' : '') + '</span>' +
      (last && !chosen ? '<span class="choice__last">지난번 선택</span>' : '') +
      '<span class="choice__arrow" aria-hidden="true">→</span>' +
    '</button>';
  }

  /* ---------- 화면들 ---------- */
  const SCREENS = {
    start() {
      return '<section class="hero">' +
        '<p class="eyebrow"><span class="mono">ICN → HND · KIX · CTS · FUK</span></p>' +
        '<h1 tabindex="-1">일본 여행,<br>계획 세우셨나요?</h1>' +
        '<p class="lead">도쿄 · 오사카 · 삿포로 · 후쿠오카. 나이와 동행에 맞는 곳을 골라 하루하루 동선으로 이어 드려요.</p>' +
        '</section>' +
        '<div class="big-choices">' +
          '<button type="button" class="big" data-action="path" data-value="A">' +
            '<span class="big__num mono" aria-hidden="true">01</span>' +
            '<span class="big__title">아직 미정이에요</span>' +
            '<span class="big__sub">도시부터 같이 골라요. 연령대·동행·기간만 알려 주세요.</span>' +
          '</button>' +
          '<button type="button" class="big" data-action="path" data-value="B">' +
            '<span class="big__num mono" aria-hidden="true">02</span>' +
            '<span class="big__title">계획을 정했어요</span>' +
            '<span class="big__sub">항공편 시간에 맞춰 가고 싶은 곳을 날짜별 동선으로 짜 드려요.</span>' +
          '</button>' +
        '</div>' +
        '<ul class="city-strip" aria-label="지원 도시">' + CITY_KEYS.map((k) =>
          '<li style="--c: var(--line-' + k + ')"><span class="mono">' + AIRPORTS[k][0].code + '</span> ' + esc(CITIES[k].name) + '</li>').join('') +
        '</ul>';
    },

    city() {
      return heading('어느 도시로 갈까요?', '한국인 여행자 비중과 분위기를 참고해 고르세요.') +
        '<div class="choices">' + CITY_KEYS.map((k) => {
          const c = CITIES[k];
          return choiceRow('city', k, c.name, c.blurb, {
            badge: '<span class="station" style="--c: var(--line-' + k + ')" aria-hidden="true"><span class="mono">' + AIRPORTS[k][0].code + '</span></span>',
            jp: c.jp, stat: c.share,
          });
        }).join('') + '</div>';
    },

    month() {
      const city = state.city;
      const cname = CITIES[city] ? CITIES[city].name : '';
      const last = Number.isInteger(memory.month) ? memory.month : -1; // 0 = 아직 몰라요
      const btn = (m) => {
        const chosen = state.monthPicked && state.month === m;
        const tag = engine('monthTag', [city, m], '');
        return '<button type="button" class="month' + (chosen ? ' is-chosen' : '') + '" data-action="month" data-value="' + m + '">' +
          '<span class="month__num">' + m + '월' + (last === m && !chosen ? '<span class="month__last">지난번</span>' : '') + '</span>' +
          (tag ? '<span class="month__tag">' + esc(tag) + '</span>' : '') +
          (chosen ? '<span class="sr-only"> (지금 선택)</span>' : '') +
        '</button>';
      };
      const unsure = state.monthPicked && state.month == null;
      return heading('언제 가세요?', '달마다 ' + esc(cname) + '에서 인기 있는 걸 함께 보여 드려요.') +
        '<div class="seasons">' + SEASONS.map((s) =>
          '<div class="season-row" role="group" aria-labelledby="season-row-' + s.key + '">' +
            '<p class="season-row__label" id="season-row-' + s.key + '">' +
              '<span class="season-row__kanji" lang="ja" aria-hidden="true">' + s.kanji + '</span>' +
              '<span class="season-row__name">' + s.label + '</span> ' +
              '<span class="season-row__months">' + s.months.join('·') + '월</span>' +
            '</p>' +
            '<div class="months">' + s.months.map(btn).join('') + '</div>' +
          '</div>').join('') +
        '</div>' +
        '<button type="button" class="choice choice--unsure' + (unsure ? ' is-chosen' : '') + '" data-action="month" data-value="0">' +
          '<span class="choice__text"><span class="choice__title">아직 몰라요</span>' +
          '<span class="choice__sub">계절별 특징을 한눈에 보여 드려요. 예시 일정은 한 달 뒤 기준이에요.</span></span>' +
          (last === 0 && !unsure ? '<span class="choice__last">지난번 선택</span>' : '') +
          '<span class="choice__arrow" aria-hidden="true">→</span>' +
        '</button>';
    },

    age() {
      return heading('연령대를 알려 주세요', '비슷한 나이대 여행자들이 만족한 곳을 먼저 보여 드려요.') +
        '<div class="choices choices--grid">' + ['1', '2', '3', '4'].map((a) => choiceRow('age', a, AGE_LABEL[a], null)).join('') + '</div>';
    },

    with() {
      const minor = state.age === '1';
      const subs = { s: '혼밥·1인석, 대욕장 있는 호텔 위주', f: '먹방·야경·사진 명소 위주', a: '테마파크·수족관, 이동 짧은 동선' };
      return heading('누구와 가세요?', null) +
        '<div class="choices">' +
          choiceRow('with', 's', '혼자', subs.s, minor ? { describedby: 'minor-note' } : null) +
          (minor ? '<p class="notice notice--inline" id="minor-note"><strong>미성년자 혼자 여행이라면</strong> 미성년자는 숙소 체크인 때 보호자 동의서가 필요한 경우가 많아요. 예약 전에 숙소에 꼭 확인하세요.</p>' : '') +
          choiceRow('with', 'f', '친구와', subs.f) +
          choiceRow('with', 'a', '가족과', subs.a) +
        '</div>';
    },

    nights() {
      return heading('여행 기간은요?', '날짜가 정해지지 않았다면 대략적인 길이만 골라 주세요.') +
        '<div class="choices choices--grid">' + NIGHTS.map((n) => choiceRow('nights', n, n + '박 ' + (n + 1) + '일', null)).join('') + '</div>';
    },

    arrival() {
      const f = state.form;
      return heading('도착 정보를 알려 주세요', '항공권에 적힌 현지 시각 기준으로 넣어 주세요. 예시 값이 미리 들어 있어요.') +
        '<form class="form" id="arrival-form" novalidate>' +
          '<fieldset class="field">' +
            '<legend class="field__label">도시</legend>' +
            '<div class="segmented">' + CITY_KEYS.map((k) =>
              '<label class="seg" style="--c: var(--line-' + k + ')">' +
                '<input type="radio" name="arr-city" id="arr-city-' + k + '" value="' + k + '"' + (f.city === k ? ' checked' : '') + '>' +
                '<span class="seg__box"><span class="seg__name">' + esc(CITIES[k].name) + '</span><span class="seg__code mono">' + AIRPORTS[k][0].code + '</span></span>' +
              '</label>').join('') +
            '</div>' +
          '</fieldset>' +
          '<div id="airport-slot">' + airportField() + '</div>' +
          '<fieldset class="field field--pair">' +
            '<legend class="field__label">도착 <span class="muted">(일본 현지 시각)</span></legend>' +
            '<div class="pair">' +
              '<div><label for="arr-date" class="sub-label">날짜</label><input class="input mono" type="date" id="arr-date" name="arr-date" value="' + f.arrDate + '" required></div>' +
              '<div><label for="arr-time" class="sub-label">시간</label><input class="input mono" type="time" id="arr-time" name="arr-time" value="' + f.arrTime + '" required></div>' +
            '</div>' +
            '<p class="field__error" id="arr-error" role="alert" hidden></p>' +
          '</fieldset>' +
          '<fieldset class="field field--pair">' +
            '<legend class="field__label">출국 <span class="muted">(비행기 출발 시각)</span></legend>' +
            '<div class="pair">' +
              '<div><label for="dep-date" class="sub-label">날짜</label><input class="input mono" type="date" id="dep-date" name="dep-date" value="' + f.depDate + '" required></div>' +
              '<div><label for="dep-time" class="sub-label">시간</label><input class="input mono" type="time" id="dep-time" name="dep-time" value="' + f.depTime + '" required></div>' +
            '</div>' +
            '<p class="field__error" id="dep-error" role="alert" hidden></p>' +
          '</fieldset>' +
          '<p class="hint" id="trip-length" aria-live="polite">' + tripLengthText() + '</p>' +
          '<div id="stay-slot">' + stayField() + '</div>' +
          '<div class="actions"><button type="submit" class="btn">다음</button></div>' +
        '</form>';
    },

    detail() {
      return heading('세부 계획이 있으세요?', esc(CITIES[state.form.city].name) + ' · ' + esc(periodLabel(tripDays())) + ' · ' + esc(fmtDate(state.form.arrDate)) + ' 도착') +
        '<div class="big-choices">' +
          '<button type="button" class="big" data-action="plan" data-value="yes">' +
            '<span class="big__title">네, 정해 둔 게 있어요</span>' +
            '<span class="big__sub">한 동네에서 지낼지, 날짜별로 갈 곳을 적을지 골라요.</span>' +
          '</button>' +
          '<button type="button" class="big" data-action="plan" data-value="no">' +
            '<span class="big__title">아니요, 추천해 주세요</span>' +
            '<span class="big__sub">연령대와 동행만 알려 주시면 일정까지 짜 드려요.</span>' +
          '</button>' +
        '</div>';
    },

    concept() {
      return heading('어떤 여행을 원하세요?', esc(CITIES[state.form.city].name) + ' · ' + esc(periodLabel(tripDays()))) +
        '<div class="big-choices">' +
          '<button type="button" class="big" data-action="concept" data-value="area">' +
            '<span class="big__title">하루에 한 동네씩</span>' +
            '<span class="big__sub">날마다 머물 동네를 하나씩 골라요. 가고 싶은 곳을 적으면 넣고, 안 적으면 그 동네 명소와 맛집으로 채워 드려요.</span>' +
          '</button>' +
          '<button type="button" class="big" data-action="concept" data-value="roam">' +
            '<span class="big__title">많이 돌아다닐래요</span>' +
            '<span class="big__sub">동네 상관없이 여러 곳을 다녀요. 한 번 이동이 30분을 넘지 않게 이어서 짜 드려요.</span>' +
          '</button>' +
        '</div>' +
        '<p class="hint">어느 쪽이든 자유 시간은 한 번에 2시간을 넘지 않게 채워요.</p>';
    },

    roam() {
      const city = state.form.city;
      const months = formMonths();
      return heading('꼭 가고 싶은 곳이 있나요?', '적은 곳을 먼저 넣고, 나머지는 한 번 이동이 30분 안쪽인 곳으로 이어 드려요. 없으면 비워 두고 바로 만들어도 돼요.') +
        seasonBanner(city, months) +
        '<form class="form" id="roam-form" novalidate>' +
          '<p class="notice notice--inline notice--far" id="far-notice" role="status" hidden></p>' +
          placeNamesList(city, months) +
          '<fieldset class="dayplan is-focus" data-day="must"><legend class="dayplan__title">꼭 갈 곳 <span class="muted">(선택)</span></legend>' +
            '<ul class="chips" id="day-chips-must" aria-live="polite">' + dayChips('must') + '</ul>' +
            '<div class="add-row"><label for="day-input-must" class="sr-only">꼭 갈 곳</label>' +
              '<input class="input" type="text" id="day-input-must" data-day="must" list="place-names" maxlength="80" autocomplete="off" placeholder="예: 팀랩, 이치란 말고 라멘집">' +
              '<button type="button" class="btn btn--ghost" data-action="day-add" data-day="must">추가</button></div>' +
          '</fieldset>' +
          '<p class="hint">가게 이름은 지도 위치로, 조건(예: 5500엔 미만 무한리필 야키니쿠)은 동선 근처에서 찾아 넣어요.</p>' +
          '<p class="stay-note">숙소 기준: <strong>' + (formStay() ? esc(formStay().name) : '시내 중심') + '</strong> <span class="muted">(도착 정보 화면에서 바꿀 수 있어요)</span></p>' +
          '<div class="actions actions--sticky"><button type="submit" class="btn">동선 만들기</button></div>' +
        '</form>';
    },

    days() {
      const city = state.form.city;
      const months = formMonths();
      const n = tripDays();
      const pk = state.picks;
      const dropped = syncDays(n);
      const p = tripParams();
      const tr = p.airport.transfer || 60;
      const windowText = (i) => {
        const a = hm(p.arriveTime) + tr / 60 + 1;
        const b = hm(p.departTime) - tr / 60 - 2;
        if (n === 1) return '당일 · ' + clock(a) + '~' + clock(b);
        if (i === 0) return '도착일 · ' + clock(a) + '쯤부터';
        if (i === n - 1) return '출국일 · ' + clock(b) + '까지';
        return '하루 종일';
      };
      const byArea = {};
      (PLACES[city] || []).filter((x) => x.t === 'sight').forEach((x) => {
        const si = engine('seasonInfo', [city, x, months], null);
        if (si && (si.hidden || si.score <= -2)) return;
        (byArea[x.area] = byArea[x.area] || []).push(x);
      });
      const areas = dayAreaList(city);
      const dayBox = (i) => {
        const date = addDays(state.form.arrDate, i);
        return '<fieldset class="dayplan' + (pk.focusDay === i ? ' is-focus' : '') + '" data-day="' + i + '">' +
          '<legend class="dayplan__title"><span class="dayplan__num mono">' + (i + 1) + '일차</span> <span class="muted">' + esc(fmtDate(date)) + ' · ' + esc(windowText(i)) + '</span></legend>' +
          '<label for="day-area-' + i + '" class="sub-label">머물 동네</label>' +
          '<select class="input" id="day-area-' + i + '" data-day-area="' + i + '">' + areas.map((a) =>
            '<option value="' + esc(a.id) + '"' + (pk.dayAreas[i] === a.id ? ' selected' : '') + '>' + esc(a.name) + (a.note ? ' — ' + esc(a.note) : '') + '</option>').join('') + '</select>' +
          '<label for="day-input-' + i + '" class="sub-label">가고 싶은 곳 <span class="muted">(선택 · 안 적으면 그 동네로 채워요)</span></label>' +
          '<ul class="chips" id="day-chips-' + i + '" aria-live="polite">' + dayChips(i) + '</ul>' +
          '<div class="add-row">' +
            '<input class="input" type="text" id="day-input-' + i + '" data-day="' + i + '" list="place-names" maxlength="80" autocomplete="off" placeholder="' + (i === 0 ? '예: 신주쿠교엔, 라멘집' : '비워 두면 동네 추천으로') + '">' +
            '<button type="button" class="btn btn--ghost" data-action="day-add" data-day="' + i + '">추가</button></div>' +
        '</fieldset>';
      };
      return heading('날마다 머물 동네를 골라 주세요', '그날은 고른 동네 안에서만 다녀요. 적은 곳은 그날에 넣고, 안 적으면 그 동네 명소·맛집으로 채워요. 자유 시간은 2시간을 넘지 않게 해요.') +
        seasonBanner(city, months) +
        (dropped ? '<p class="notice notice--inline" role="status"><strong>여행 날짜가 줄어 뒤쪽 날에 적은 곳을 뺐어요</strong>' + esc(dropped.join(', ')) + '</p>' : '') +
        '<form class="form" id="days-form" novalidate>' +
          '<div class="notice notice--error" id="days-errors" role="alert" hidden></div>' +
          '<p class="notice notice--inline notice--far" id="far-notice" role="status" hidden></p>' +
          placeNamesList(city, months) +
          '<div class="dayplans">' + Array.from({ length: n }, (_, i) => dayBox(i)).join('') + '</div>' +
          '<p class="hint">장소 이름(예: 센소지, 규카츠 이치니산)은 지도 위치로, 조건(예: 5500엔 미만 무한리필 야키니쿠)은 그날 동선 근처에서 찾아 넣어요. 쉼표로 여러 곳을 한 번에 적어도 돼요.</p>' +
          '<details class="suggest"><summary>어디 갈지 모르겠다면 · 동네별 인기 장소</summary>' +
            '<p class="hint" id="suggest-target">누르면 <strong>' + (pk.focusDay + 1) + '일차</strong>에 넣어요. 다른 날에 넣으려면 그날 칸을 먼저 눌러 주세요.</p>' +
            Object.keys(byArea).map((ar) => '<div class="suggest__group"><p class="suggest__area">' + esc(ar) + '</p><div class="suggest__list">' +
              byArea[ar].map((x) => '<button type="button" class="suggest__item" data-action="day-suggest" data-name="' + esc(x.name) + '">' + esc(x.name) + (x.full ? ' <span class="tag tag--full">하루 코스</span>' : '') + '</button>').join('') +
            '</div></div>').join('') +
          '</details>' +
          '<p class="stay-note">숙소 기준: <strong>' + (formStay() ? esc(formStay().name) : '시내 중심') + '</strong> <span class="muted">(도착 정보 화면에서 바꿀 수 있어요)</span></p>' +
          '<div class="actions actions--sticky"><button type="submit" class="btn">동선 만들기</button></div>' +
        '</form>';
    },

    result() { return renderResult(); },
    route() { return renderRoute(); },
  };

  const AFTER = {
    arrival() {
      const f = document.getElementById('arrival-form');
      f.addEventListener('change', onFormInput);
      f.addEventListener('input', onFormInput);
      f.addEventListener('submit', (e) => { e.preventDefault(); submitArrival(); });
    },
    days() { bindDayForm('days-form'); },
    roam() { bindDayForm('roam-form'); },
  };

  /* ---------- 도착 정보 폼 ---------- */
  // 머무는 숙소: 지역(역 주변) 또는 목록의 숙소. 고르면 그곳을 기준으로 동선을 짠다.
  function stayField() {
    const f = state.form;
    const areas = (typeof STAY_AREAS !== 'undefined' && STAY_AREAS[f.city]) || [];
    const stays = (PLACES[f.city] || []).filter((p) => p.t === 'stay');
    const opt = (v, label) => '<option value="' + esc(v) + '"' + (f.stay === v ? ' selected' : '') + '>' + esc(label) + '</option>';
    return '<fieldset class="field">' +
      '<legend class="field__label">머무는 곳 <span class="muted">(선택)</span></legend>' +
      '<label for="arr-stay" class="sub-label">숙소 위치</label>' +
      '<select class="input" id="arr-stay" name="arr-stay">' +
        opt('', '아직 안 정했어요 (시내 중심 기준)') +
        (areas.length ? '<optgroup label="지역으로 고르기">' + areas.map((a) => opt('area:' + a.id, a.name + ' — ' + a.note)).join('') + '</optgroup>' : '') +
        (stays.length ? '<optgroup label="목록의 숙소">' + stays.map((p) => opt('place:' + p.id, p.name + ' (' + p.area + ')')).join('') + '</optgroup>' : '') +
      '</select>' +
      '<label for="arr-hotel" class="sub-label">호텔 이름 <span class="muted">(선택)</span></label>' +
      '<input class="input" type="text" id="arr-hotel" name="arr-hotel" maxlength="60" autocomplete="off" placeholder="예: 도미인 난바" value="' + esc(f.hotelName) + '">' +
      '<p class="hint">고른 곳을 출발점으로 매일 동선과 이동 시간을 계산해요. 호텔 이름만 적고 위치를 안 고르면 시내 중심 기준이에요.</p>' +
    '</fieldset>';
  }
  function formStay() {
    const f = state.form;
    const [kind, id] = String(f.stay || '').split(':');
    let base = null;
    if (kind === 'area') {
      const a = ((typeof STAY_AREAS !== 'undefined' && STAY_AREAS[f.city]) || []).find((x) => x.id === id);
      if (a) base = { id: 'area:' + a.id, t: 'stay', name: a.name + ' 숙소', area: a.name, lat: a.lat, lng: a.lng, q: a.note };
    } else if (kind === 'place') {
      base = (PLACES[f.city] || []).find((x) => x.id === id && x.t === 'stay') || null;
    }
    const hotel = String(f.hotelName || '').trim();
    if (!hotel) return base;
    if (!base) return null; // 위치를 모르면 이름만으로는 동선을 짤 수 없다
    return Object.assign({}, base, { name: hotel, q: hotel });
  }

  function airportField() {
    const list = AIRPORTS[state.form.city];
    if (list.length < 2) {
      return '<p class="airport-fixed"><span class="field__label">도착 공항</span> <span class="code mono">' + list[0].code + '</span> ' + esc(list[0].name) + '</p>';
    }
    return '<div class="field"><label class="field__label" for="arr-airport">도착 공항</label>' +
      '<select class="input" id="arr-airport" name="arr-airport">' + list.map((a) =>
        '<option value="' + a.code + '"' + (a.code === state.form.airport ? ' selected' : '') + '>' + a.code + ' · ' + esc(a.name) + ' (시내까지 약 ' + a.transfer + '분)</option>').join('') +
      '</select></div>';
  }

  function tripDays() { return dayDiff(state.form.arrDate, state.form.depDate) + 1; }
  // B 경로: 도착~출국 날짜가 걸친 달들
  function formMonths() {
    const f = state.form;
    return engine('tripMonths', [f.arrDate, tripDays()], f.arrDate ? [parseYmd(f.arrDate).getMonth() + 1] : []);
  }
  function tripLengthText() {
    const f = state.form;
    if (!f.arrDate || !f.depDate) return '';
    const d = tripDays();
    if (d < 1 || d > MAX_DAYS) return '';
    return '<span class="mono">' + esc(f.arrDate.slice(5).replace('-', '.')) + ' → ' + esc(f.depDate.slice(5).replace('-', '.')) + '</span> · ' + periodLabel(d);
  }

  function onFormInput(e) {
    const t = e.target;
    const f = state.form;
    if (t.name === 'arr-city') {
      f.city = t.value;
      f.airport = AIRPORTS[f.city][0].code;
      document.getElementById('airport-slot').innerHTML = airportField();
      f.stay = '';
      document.getElementById('stay-slot').innerHTML = stayField();
      app.style.setProperty('--city', 'var(--line-' + f.city + ')');
    } else if (t.id === 'arr-airport') f.airport = t.value;
    else if (t.id === 'arr-stay') f.stay = t.value;
    else if (t.id === 'arr-hotel') f.hotelName = t.value;
    else if (t.id === 'arr-date') {
      // change 때만 반영: 이전 도착일 기준 기간을 알아야 출국일을 같이 옮길 수 있음
      if (e.type !== 'change' || !t.value) return;
      const prevLen = f.arrDate && f.depDate ? dayDiff(f.arrDate, f.depDate) : -1;
      f.arrDate = t.value;
      const nowLen = f.depDate ? dayDiff(f.arrDate, f.depDate) : -1;
      const broken = nowLen < 0 || nowLen > MAX_DAYS - 1;
      if (!f.depTouched || broken) {
        const keep = prevLen >= 0 && prevLen <= MAX_DAYS - 1 ? prevLen : 3;
        f.depDate = addDays(f.arrDate, keep);
        document.getElementById('dep-date').value = f.depDate;
      }
    } else if (t.id === 'arr-time') f.arrTime = t.value;
    else if (t.id === 'dep-date') { f.depDate = t.value; f.depTouched = true; }
    else if (t.id === 'dep-time') { f.depTime = t.value; f.depTouched = true; }
    const len = document.getElementById('trip-length');
    if (len) len.innerHTML = tripLengthText();
  }

  function validateForm() {
    const f = state.form;
    const errs = { arr: '', dep: '' };
    if (!f.arrDate || !f.arrTime) errs.arr = '도착 날짜와 시간을 모두 넣어 주세요.';
    if (!f.depDate || !f.depTime) errs.dep = '출국 날짜와 시간을 모두 넣어 주세요.';
    if (!errs.arr && !errs.dep) {
      const a = new Date(f.arrDate + 'T' + f.arrTime), d = new Date(f.depDate + 'T' + f.depTime);
      const gapH = (d - a) / 3600000;
      const days = tripDays();
      if (gapH <= 0) {
        errs.dep = '출국이 도착보다 빨라요. 출국 날짜나 시간을 ' + fmtDate(f.arrDate) + ' ' + f.arrTime + ' 이후로 바꿔 주세요.';
      } else if (gapH < MIN_GAP_H) {
        const min = new Date(a.getTime() + MIN_GAP_H * 3600000);
        errs.dep = '도착하고 ' + fmtGap(gapH) + ' 뒤 출국이면 공항 이동·수속만으로 시간이 끝나요. 출국을 ' + fmtDate(ymd(min)) + ' ' + pad(min.getHours()) + ':' + pad(min.getMinutes()) + ' 이후로 바꿔 주세요 (최소 ' + MIN_GAP_H + '시간).';
      } else if (days > MAX_DAYS) {
        errs.dep = '최대 ' + MAX_DAYS + '일(' + (MAX_DAYS - 1) + '박)까지 계획할 수 있어요. 출국 날짜를 ' + fmtDate(addDays(f.arrDate, MAX_DAYS - 1)) + '까지로 당겨 주세요.';
      }
    }
    return errs;
  }

  function submitArrival() {
    const errs = validateForm();
    const set = (key, ids) => {
      const p = document.getElementById(key + '-error');
      ids.forEach((id) => {
        const el = document.getElementById(id);
        if (errs[key]) { el.setAttribute('aria-invalid', 'true'); el.setAttribute('aria-describedby', key + '-error'); }
        else { el.removeAttribute('aria-invalid'); el.removeAttribute('aria-describedby'); }
      });
      p.textContent = errs[key]; p.hidden = !errs[key];
    };
    set('arr', ['arr-date', 'arr-time']);
    set('dep', ['dep-date', 'dep-time']);
    if (errs.arr || errs.dep) {
      document.getElementById(errs.arr ? 'arr-date' : 'dep-date').focus();
      return;
    }
    state.city = state.form.city;
    if (state.picks.city !== state.city) state.picks = freshPicks(state.city); // 도시가 바뀌면 고른 장소 초기화
    saveMemory();
    go('detail');
  }

  /* ---------- 날짜별 장소 ---------- */
  // 하루 동네 목록 (areas.js 가 있으면 그것, 없으면 숙소 지역)
  function dayAreaList(city) {
    const list = (typeof DAY_AREAS !== 'undefined' && DAY_AREAS[city]) || (typeof STAY_AREAS !== 'undefined' && STAY_AREAS[city]) || [];
    return list;
  }
  // 숙소와 가장 가까운 동네 (날짜별 동네의 기본값)
  function nearestArea(city) {
    const list = dayAreaList(city);
    const st = formStay();
    if (!list.length) return '';
    if (!st) return list[0].id;
    let best = list[0], bd = Infinity;
    list.forEach((a) => { const d = Math.hypot(a.lat - st.lat, (a.lng - st.lng) * Math.cos(st.lat * Math.PI / 180)); if (d < bd) { bd = d; best = a; } });
    return best.id;
  }
  function placeNamesList(city, months) {
    const seen = {};
    const names = [];
    (engine('spots', [city], null) || PLACES[city] || []).forEach((x) => {
      if (x.t === 'stay' || seen[x.name]) return;
      const si = engine('seasonInfo', [city, x, months], null);
      if (si && si.hidden) return;
      seen[x.name] = true; names.push(x.name);
    });
    return '<datalist id="place-names">' + names.map((x) => '<option value="' + esc(x) + '"></option>').join('') + '</datalist>';
  }
  const hm = (t) => { const [h, m] = String(t || '0:0').split(':').map(Number); return (h || 0) + (m || 0) / 60; };
  const clock = (h) => { h = Math.max(0, Math.min(23.99, h)); const q = Math.round(h * 4) / 4; return String(Math.floor(q)).padStart(2, '0') + ':' + String(Math.round((q % 1) * 60)).padStart(2, '0'); };
  // 여행 일수에 맞춰 칸 수를 맞춘다. 줄어든 날에 적었던 곳을 돌려준다.
  function syncDays(n) {
    const pk = state.picks;
    let dropped = null;
    if (pk.byDay.length > n) {
      const cut = pk.byDay.slice(n).flat();
      if (cut.length) dropped = cut;
      pk.byDay = pk.byDay.slice(0, n);
    }
    while (pk.byDay.length < n) pk.byDay.push([]);
    const ids = dayAreaList(state.form.city).map((a) => a.id);
    pk.dayAreas = pk.dayAreas.slice(0, n);
    while (pk.dayAreas.length < n) pk.dayAreas.push('');
    pk.dayAreas = pk.dayAreas.map((id) => (ids.includes(id) ? id : nearestArea(state.form.city)));
    if (pk.focusDay >= n) pk.focusDay = 0;
    return dropped;
  }
  const listOf = (i) => (i === 'must' ? state.picks.must : state.picks.byDay[i]);
  const dayName = (i) => (i === 'must' ? '꼭 갈 곳' : (i + 1) + '일차');
  const dayKey = (v) => (v === 'must' ? 'must' : Number(v));
  function dayChips(i) {
    return (listOf(i) || []).map((c, k) =>
      '<li class="chip"><span>' + esc(c) + '</span><button type="button" class="chip__x" data-action="day-remove" data-day="' + i + '" data-index="' + k + '" aria-label="' + dayName(i) + '에서 ' + esc(c) + ' 삭제">×</button></li>').join('');
  }
  function refreshDay(i) {
    const ul = document.getElementById('day-chips-' + i);
    if (ul) ul.innerHTML = dayChips(i);
    updateFarNotice();
  }
  function pushEntries(i, raw) {
    const list = listOf(i);
    const parts = engine('splitCustom', [raw], [raw]).map((x) => x.replace(/\s+/g, ' ').trim()).filter(Boolean);
    // 같은 곳을 다른 날에 이미 적었으면 옮긴다 (하루에 한 번만)
    parts.forEach((v) => {
      if (i !== 'must') state.picks.byDay.forEach((l, j) => { const k = l.indexOf(v); if (k >= 0 && j !== i) { l.splice(k, 1); refreshDay(j); } });
      if (!list.includes(v)) list.push(v);
    });
  }
  function addDayEntry(i) {
    const input = document.getElementById('day-input-' + i);
    const raw = input.value.trim();
    if (!raw) { input.focus(); return; }
    pushEntries(i, raw);
    input.value = '';
    refreshDay(i);
    input.focus();
  }
  function bindDayForm(id) {
    const f = document.getElementById(id);
    f.addEventListener('keydown', (e) => {
      const t = e.target;
      if (t.matches('input[data-day]') && e.key === 'Enter' && !e.isComposing) { e.preventDefault(); addDayEntry(dayKey(t.dataset.day)); }
    });
    f.addEventListener('focusin', (e) => {
      const box = e.target.closest('.dayplan');
      if (box && box.dataset.day !== 'must') setFocusDay(Number(box.dataset.day));
    });
    f.addEventListener('change', (e) => {
      const t = e.target;
      if (t.dataset.dayArea != null) state.picks.dayAreas[Number(t.dataset.dayArea)] = t.value;
    });
    f.addEventListener('submit', (e) => { e.preventDefault(); submitDays(); });
    updateFarNotice();
  }
  function setFocusDay(i) {
    state.picks.focusDay = i;
    document.querySelectorAll('.dayplan').forEach((el) => el.classList.toggle('is-focus', Number(el.dataset.day) === i));
    const t = document.getElementById('suggest-target');
    if (t) t.innerHTML = '누르면 <strong>' + (i + 1) + '일차</strong>에 넣어요. 다른 날에 넣으려면 그날 칸을 먼저 눌러 주세요.';
  }
  // 먼 근교를 적으면 1박을 권한다
  function farPicked(city) {
    const out = [];
    state.picks.byDay.concat([state.picks.must]).forEach((l) => l.forEach((txt) => {
      const r = engine('resolveCustom', [city, txt], null);
      if (!r || r.kind !== 'place') return;
      const far = engine('farInfo', [city, r.place], null);
      if (far && !out.some((x) => x.place.id === r.place.id)) out.push({ place: r.place, far });
    }));
    return out;
  }
  function farNoticeHtml(list) {
    if (!list.length) return '';
    const msg = (window.Planner && Planner.FAR_NOTICE) || '먼 거리 일정이 포함되어 있습니다. 1박 일정은 어떠세요?';
    return '<strong>' + esc(msg) + '</strong> ' +
      list.map((x) => esc(x.place.name) + ' (편도 ' + esc(x.far.label.replace(/^.*?약 /, '약 ')) + ')').join(', ');
  }
  function updateFarNotice() {
    const b = document.getElementById('far-notice');
    if (!b) return;
    const list = farPicked(state.form.city);
    b.innerHTML = farNoticeHtml(list);
    b.hidden = !list.length;
  }
  function submitDays() {
    // 칸에 적어 두고 추가를 안 누른 것도 담는다
    document.querySelectorAll('#days-form input[data-day], #roam-form input[data-day]').forEach((inp) => {
      const i = dayKey(inp.dataset.day);
      if (inp.value.trim()) { pushEntries(i, inp.value.trim()); inp.value = ''; refreshDay(i); }
    });
    if (false) {
      const b = document.getElementById('days-errors');
      b.innerHTML = '<strong>한 칸 이상 적어 주세요</strong><p>가고 싶은 곳을 그날 칸에 적고 추가를 눌러 주세요. 어디 갈지 모르겠다면 아래 "동네별 인기 장소"를 눌러 보세요.</p>';
      b.hidden = false;
      b.scrollIntoView({ block: 'center' });
      document.getElementById('day-input-0').focus({ preventScroll: true });
      return;
    }
    go('route');
  }

  /* ---------- 결과 공통 ---------- */
  function tripParams() {
    if (state.path === 'A') {
      const city = state.city;
      const days = state.nights + 1;
      // 달을 골랐으면 그 달 15일(7일 이상 남은 가장 가까운 해), 몰라요면 한 달 뒤로 예시 일정을 만든다
      const startDate = state.month ? engine('nextMonthDate', [state.month], todayPlus(30)) : todayPlus(30);
      return {
        city, startDate, days,
        arriveTime: '11:00', departTime: '18:00', airport: AIRPORTS[city][0], assumed: true,
        months: state.month ? engine('tripMonths', [startDate, days], [state.month]) : [],
      };
    }
    const f = state.form;
    return {
      city: f.city, startDate: f.arrDate, days: tripDays(),
      arriveTime: f.arrTime, departTime: f.depTime,
      airport: AIRPORTS[f.city].find((a) => a.code === f.airport) || AIRPORTS[f.city][0], assumed: false,
      months: formMonths(),
    };
  }

  // '10월 · 가을' · '11~12월 · 가을·겨울' · '미정'
  function whenText(months) {
    if (!months || !months.length) return '미정';
    return monthsLabel(months) + ' · ' + seasonsOfMonths(months).map((s) => s.label).join('·');
  }

  function summaryHeader(p, extras) {
    const c = CITIES[p.city];
    const end = addDays(p.startDate, p.days - 1);
    const range = p.days <= 1 ? fmtDate(p.startDate) : fmtDate(p.startDate) + ' – ' + fmtDate(end);
    return '<header class="summary">' +
      '<div class="summary__strip" aria-hidden="true"></div>' +
      '<div class="summary__body">' +
        '<p class="summary__line mono" aria-hidden="true">' + esc(c.en) + ' LINE</p>' +
        '<h1 tabindex="-1"><span class="summary__city">' + esc(c.name) + '</span> <span class="summary__jp" lang="ja">' + esc(c.jp) + '</span></h1>' +
        '<dl class="summary__facts">' +
          extras.map((x) => '<div><dt>' + esc(x[0]) + '</dt><dd>' + x[1] + '</dd></div>').join('') +
          '<div><dt>시기</dt><dd>' + esc(whenText(p.months)) + '</dd></div>' +
          '<div><dt>기간</dt><dd>' + esc(periodLabel(p.days)) + (p.assumed ? '' : ' · ' + esc(range)) + '</dd></div>' +
          '<div><dt>공항</dt><dd><span class="code mono">' + p.airport.code + '</span> ' + esc(p.airport.name) + '</dd></div>' +
        '</dl>' +
        (p.assumed
          ? '<p class="summary__note">예시 기준: ' + esc(fmtDate(p.startDate)) + ' <span class="mono">' + esc(p.arriveTime) + '</span> 도착 · ' +
              (p.days > 1 ? esc(fmtDate(end)) + ' ' : '') + '<span class="mono">' + esc(p.departTime) + '</span> 출발' +
              (p.months && p.months.length ? '' : ' (시기를 몰라 한 달 뒤로 잡았어요)') + '. 항공편이 정해지면 시간이 달라질 수 있어요.</p>'
          : '<p class="summary__note"><span class="mono">' + esc(p.arriveTime) + '</span> 도착 · <span class="mono">' + esc(p.departTime) + '</span> 출국</p>') +
      '</div>' +
    '</header>';
  }

  /* ---------- 계절 표시 ---------- */
  // 장소 한 곳의 시기 배지: +2 제철 · +1 시즌 · 음수 비추천 시기 (이유와 함께)
  function seasonLine(s, el, cls) {
    if (!s || !s.score || s.hidden) return '';
    const pos = s.score > 0;
    const tag = pos
      ? (s.score >= 2 ? '<span class="tag tag--peak">제철</span>' : '<span class="tag tag--season">시즌</span>')
      : '<span class="tag tag--off">비추천 시기</span>';
    return '<' + el + ' class="' + cls + (pos ? '' : ' is-off') + '">' + tag + (s.why ? ' ' + esc(s.why) : '') + '</' + el + '>';
  }

  // 장소 고르기 위의 작은 안내: 달별 한 줄 + 이 시기 볼거리 제목들
  function seasonBanner(city, months) {
    if (!months.length) return '';
    const tags = months.map((m) => [m, engine('monthTag', [city, m], '')]).filter((x) => x[1]);
    const evs = seasonEvents(city, months);
    if (!tags.length && !evs.length) return '';
    return '<aside class="sbanner" aria-label="' + esc(monthsLabel(months) + ' ' + CITIES[city].name) + ' 시즌 정보">' +
      (tags.length ? '<p class="sbanner__tags">' + tags.map((x) => '<span class="sbanner__tag"><b>' + x[0] + '월</b> ' + esc(x[1]) + '</span>').join('') + '</p>' : '') +
      (evs.length ? '<p class="sbanner__events"><span class="sbanner__k">이 시기 볼거리</span> ' + evs.map((e) => esc(e.title)).join(' · ') + '</p>' : '') +
    '</aside>';
  }

  function eventItem(e) {
    const kind = EVENT_KIND[e.kind] || '';
    const places = e.places || [];
    return '<li class="event">' +
      '<p class="event__head">' + (kind ? '<span class="kind kind--' + esc(e.kind) + '">' + esc(kind) + '</span>' : '') +
        '<strong class="event__title">' + esc(e.title) + '</strong></p>' +
      (e.when ? '<p class="event__when">' + esc(e.when) + '</p>' : '') +
      (e.desc ? '<p class="event__desc">' + esc(e.desc) + '</p>' : '') +
      (places.length ? '<ul class="event__places" aria-label="' + esc(e.title) + ' 관련 장소">' + places.map((pl) =>
        '<li><a class="pchip" href="' + esc(mapUrl(pl)) + '" target="_blank" rel="noopener">' + esc(pl.name) +
        ' <span aria-hidden="true">↗</span><span class="sr-only">(구글 지도, 새 창)</span></a></li>').join('') + '</ul>' : '') +
    '</li>';
  }

  // 결과·동선 화면 요약 바로 아래: 이 시기 도시 소식 (시기 미정이면 계절별 한눈에)
  function seasonSection(p) {
    const city = p.city;
    const cname = CITIES[city].name;
    const ms = p.months || [];
    const wear = (n) => n.wear ? '<p class="season__wear"><span class="season__wear-k">옷차림</span> <span>' + esc(n.wear) + '</span></p>' : '';
    if (!ms.length) {
      const notes = engine('seasonNotes', [city, []], []);
      if (!notes.length) return '';
      const canPick = stack.includes('month');
      return '<section class="season season--all" aria-labelledby="season-title">' +
        '<div class="season__head">' +
          '<span class="season__kanji season__kanji--four" lang="ja" aria-hidden="true">四季</span>' +
          '<div class="season__head-text"><h2 class="season__title" id="season-title">계절별 한눈에</h2>' +
          '<p class="season__hint">시기를 고르면 제철 장소를 먼저 추천해요.</p></div>' +
          (canPick ? '<button type="button" class="btn btn--ghost btn--sm season__pick" data-action="jump" data-screen="month">시기 고르기</button>' : '') +
        '</div>' +
        '<ul class="season-grid">' + notes.map((n) => {
          const s = seasonByKey(n.key);
          return '<li class="season-card">' +
            '<p class="season-card__head">' + (s ? '<span class="season-card__kanji" lang="ja" aria-hidden="true">' + s.kanji + '</span>' : '') +
              '<strong>' + esc(n.label) + '</strong>' + (s ? ' <span class="season-card__months">' + s.months.join('·') + '월</span>' : '') + '</p>' +
            '<p class="season-card__text">' + esc(n.text) + '</p>' + wear(n) +
          '</li>';
        }).join('') + '</ul>' +
      '</section>';
    }
    const notes = engine('seasonNotes', [city, ms], []);
    const evs = seasonEvents(city, ms);
    const kanji = seasonsOfMonths(ms).map((s) => s.kanji).join('');
    const shown = evs.slice(0, EVENTS_SHOWN);
    const more = evs.slice(EVENTS_SHOWN);
    return '<section class="season" aria-labelledby="season-title">' +
      '<div class="season__head">' +
        (kanji ? '<span class="season__kanji" lang="ja" aria-hidden="true">' + kanji + '</span>' : '') +
        '<div><p class="season__eyebrow">이 시기 도시 소식</p>' +
        '<h2 class="season__title" id="season-title">' + esc(monthsLabel(ms)) + ' ' + esc(cname) + eunNeun(cname) + '</h2></div>' +
      '</div>' +
      notes.map((n) => '<div class="season__note">' +
        (notes.length > 1 ? '<p class="season__label">' + esc(n.label) + '</p>' : '') +
        '<p class="season__text">' + esc(n.text) + '</p>' + wear(n) +
      '</div>').join('') +
      (evs.length
        ? '<h3 class="season__sub">이 시기 볼거리 <span class="count mono">' + evs.length + '</span></h3>' +
          '<ul class="events">' + shown.map(eventItem).join('') + '</ul>' +
          (more.length ? '<details class="more"><summary><span class="more__title">더 보기</span> <span class="count mono">' + more.length + '</span><span class="sr-only">개</span></summary>' +
            '<ul class="events">' + more.map(eventItem).join('') + '</ul></details>' : '')
        : '') +
    '</section>';
  }

  const EV_LABEL = { airport: '공항', hotel: '숙소', sight: '관광', meal: '식사', custom: '직접 추가', free: '자유', depart: '출국', move: '이동' };
  const KIND_LABEL = { arrival: '도착일', departure: '출국일', full: '하루 코스', single: '당일', normal: '' };
  const isLeg = (ev) => !!ev && (ev.type === 'move' || !!ev.move);

  function timeline(it, p, title, ctx) {
    const days = it.days || [];
    return '<section class="itinerary" aria-labelledby="itin-title">' +
      '<h2 id="itin-title" class="section-title">' + esc(title) + '</h2>' +
      days.map((d, i) => {
        const parts = String(d.label || '').split(' · ');
        const name = parts[0] || (i + 1) + '일차';
        const date = parts.slice(1).join(' · ');
        const prev = i === 0 ? p.airport.code : (i) + '일차';
        const next = i === days.length - 1 ? p.airport.code : (i + 2) + '일차';
        const kind = KIND_LABEL[d.kind] || '';
        const travel = Number(d.travelMin);
        return '<article class="day" aria-labelledby="day-' + i + '">' +
          '<header class="board">' +
            '<div class="board__main">' +
              '<span class="board__kanji" lang="ja" aria-hidden="true">' + (KANJI_NUM[i + 1] || (i + 1)) + '日目</span>' +
              '<h3 class="board__name" id="day-' + i + '">' + esc(name) + '</h3>' +
              '<span class="board__sub">' + esc(date) + (kind ? ' · ' + esc(kind) : '') + '</span>' +
              (travel > 0 ? '<span class="board__travel">이동 합계 <strong>' + esc(fmtMin(travel)) + '</strong></span>' : '') +
            '</div>' +
            '<div class="board__bar" aria-hidden="true"><span class="mono">← ' + esc(prev) + '</span><span class="mono">' + esc(next) + ' →</span></div>' +
          '</header>' +
          '<ol class="tl">' + dayRows(d.events || [], p, ctx) + '</ol>' +
          (d.mapUrl ? '<a class="map-link" href="' + esc(d.mapUrl) + '" target="_blank" rel="noopener">이 날 동선 지도로 보기 <span aria-hidden="true">↗</span><span class="sr-only">(새 창)</span></a>' : '') +
        '</article>';
      }).join('') +
    '</section>';
  }

  // 하루 타임라인: 장소(역) 사이에 이동 구간을 끼워 넣는다. event.move = 이 장소로 오는 구간.
  function dayRows(evs, p, ctx) {
    const rows = [];
    evs.forEach((ev, j) => {
      const first = rows.length === 0;
      const toLeg = isLeg(evs[j + 1]);
      if (ev.type === 'move') {
        rows.push(legRow(ev.move || {}, { time: ev.time, title: ev.title, first, last: j === evs.length - 1 }));
        return;
      }
      if (ev.move) rows.push(legRow(ev.move, { first, fromStay: first && !!(ctx && ctx.stay) }));
      rows.push(eventHtml(ev, p, ctx, { toLeg, nextLeg: evs[j + 1] && evs[j + 1].move }));
    });
    return rows.join('');
  }

  // 이동 구간 한 줄: 도보는 점선, 탈것(전철·열차·버스·배)은 실선 + 차량 표시
  function legRow(mv, o) {
    const mode = mv.mode || 'transit';
    const walk = mode === 'walk';
    const km = fmtKm(mv.km);
    const label = mv.label || (walk ? '도보 ' : '이동 약 ') + fmtMin(mv.min || 0);
    const from = o.first && !o.title ? (o.fromStay ? '숙소에서 ' : '시내에서 ') : '';
    return '<li class="leg leg--' + (walk ? 'walk' : 'ride') + ' leg--' + esc(mode) + (o.title ? ' leg--move' : '') + (o.first ? ' leg--first' : '') + (o.last ? ' leg--last' : '') + '">' +
      '<span class="leg__time mono">' + esc(o.time || '') + '</span>' +
      '<span class="leg__car" aria-hidden="true"></span>' +
      '<div class="leg__body">' +
        (o.title ? '<p class="leg__title"><span class="sr-only">' + EV_LABEL.move + ': </span>' + esc(o.title) + '</p>' : '') +
        '<p class="leg__label">' + (o.title ? '' : '<span class="sr-only">이동: </span>') + esc(from + label) +
          (km ? ' <span class="leg__km mono">' + esc(km) + '</span>' : '') + '</p>' +
      '</div>' +
    '</li>';
  }

  function eventHtml(ev, p, ctx, o) {
    o = o || {};
    const type = ev.type || 'free';
    const code = p.airport.code;
    const mealLabel = ev.meal === 'lunch' ? '점심' : ev.meal === 'dinner' ? '저녁' : '';
    // 숙소 이벤트에 장소 정보가 없으면 고른 숙소로 지도 연결
    const place = ev.place || (type === 'hotel' && ctx && ctx.stay && String(ev.title || '').indexOf(ctx.stay.name) === 0 ? ctx.stay : null);
    const tags = [];
    if (mealLabel) tags.push('<span class="tag">' + mealLabel + '</span>');
    if (ev.suggested) tags.push('<span class="tag tag--rec">추천</span>');
    if (place && place.full) tags.push('<span class="tag tag--full">하루 코스</span>');
    const rv = ev.reserve;
    if (rv) tags.push(rv.level === 'required' ? '<span class="tag tag--must">예약 필수</span>'
      : rv.level === 'recommended' ? '<span class="tag tag--book">예약 추천</span>'
      : '<span class="tag tag--queue">예약 불가 · 줄 서기</span>');
    let title = esc(ev.title);
    if (type === 'airport' || type === 'depart') {
      if (title.indexOf('(' + code + ')') >= 0) title = title.replace('(' + code + ')', ' <span class="code mono">' + code + '</span>');
      else if (title.indexOf(code) < 0) title += ' <span class="code mono">' + code + '</span>';
    }
    const s = ev.season;
    const meta = [];
    if (place && place.area) meta.push(esc(place.area));
    // 공항 → 시내 이동은 바로 아래 이동 구간에 나오므로 공항 안내 문구는 생략
    if (ev.note && ev.note !== mealLabel && !(type === 'airport' && o.nextLeg)) meta.push(esc(ev.note));
    if (rv && rv.level !== 'queue' && rv.url) meta.push('<a class="ev__map" href="' + esc(rv.url) + '" target="_blank" rel="noopener">예약하기<span class="sr-only"> (' + esc(rv.urlLabel || '예약 사이트') + ', 새 창)</span> <span aria-hidden="true">↗</span></a>');
    if (rv && rv.level === 'queue') meta.push(esc(rv.why));
    if (s && s.score > 0) meta.push('<span class="ev__season">' + (s.score >= 2 ? '<span class="tag tag--peak">제철</span>' : '<span class="tag tag--season">시즌</span>') + ' ' + esc(s.why || '') + '</span>');
    if (!place && ev.mapUrl) meta.push('<a class="ev__map" href="' + esc(ev.mapUrl) + '" target="_blank" rel="noopener">지도에서 찾기<span class="sr-only"> (새 창)</span> <span aria-hidden="true">↗</span></a>');
    if (place) meta.push('<a class="ev__map" href="' + esc(mapUrl(place)) + '" target="_blank" rel="noopener">지도<span class="sr-only">에서 ' + esc(place.name) + ' 보기 (새 창)</span> <span aria-hidden="true">↗</span></a>');
    return '<li class="ev ev--' + esc(type) + (o.toLeg ? ' ev--to-leg' : '') + '">' +
      '<span class="ev__time mono">' + esc(ev.time || '') + '</span>' +
      '<span class="ev__dot" aria-hidden="true"></span>' +
      '<div class="ev__body">' +
        '<p class="ev__title"><span class="sr-only">' + esc(EV_LABEL[type] || '') + ': </span>' + title + (tags.length ? ' ' + tags.join(' ') : '') + '</p>' +
        (meta.length ? '<p class="ev__meta">' + meta.join(' · ') + '</p>' : '') +
        (s && s.score < 0 ? '<p class="ev__warn' + (s.score <= -2 ? ' is-strong' : '') + '"><span class="tag tag--warn">이 시기엔 비추천</span> ' + esc(s.why || '') + '</p>' : '') +
      '</div>' +
    '</li>';
  }

  // 추천 목록: 연령·동행이 딱 맞거나 지금이 제철·시즌인 곳은 위에, 나머지 부분 맞춤은 접어 둔다 (순서는 엔진 순서)
  function placeRow(p) {
    return '<li class="place">' +
      '<a class="place__name" href="' + esc(mapUrl(p)) + '" target="_blank" rel="noopener">' + esc(p.name) + ' <span aria-hidden="true">↗</span><span class="sr-only">(구글 지도, 새 창)</span></a>' +
      (p.full ? ' <span class="tag tag--full">하루 코스</span>' : '') +
      seasonLine(p.season, 'p', 'place__season') +
      '<p class="place__meta"><span class="place__area">' + esc(p.area) + '</span> · ' + esc(p.desc) + '</p>' +
    '</li>';
  }
  function placeList(title, list, id) {
    if (!list || !list.length) return '';
    const top = list.filter((p) => p.fit !== 'partial' || (p.season && p.season.score > 0));
    const rest = list.filter((p) => !top.includes(p));
    return '<section class="places" aria-labelledby="' + id + '">' +
      '<h2 class="section-title" id="' + id + '">' + esc(title) + '</h2>' +
      (top.length ? '<ul class="place-list">' + top.map(placeRow).join('') + '</ul>' : '<p class="muted">딱 맞는 곳은 없지만 아래도 괜찮아요.</p>') +
      (rest.length ? '<details class="more"' + (top.length ? '' : ' open') + '><summary><span class="more__title">이것도 괜찮아요</span> <span class="count mono">' + rest.length + '</span><span class="sr-only">곳</span></summary>' +
        '<ul class="place-list place-list--quiet">' + rest.map(placeRow).join('') + '</ul></details>' : '') +
    '</section>';
  }

  // 이 시기엔 추천에서 뺀 곳 (예: 한여름 온천·료칸)
  function offSeasonList(rec, months) {
    const off = (rec && rec.offSeason) || [];
    if (!off.length) return '';
    const TYPE = { sight: '관광', food: '맛집', stay: '숙소' };
    return '<details class="more more--off off-season">' +
      '<summary><span class="more__title">이 시기엔 뺐어요</span> <span class="count mono">' + off.length + '</span><span class="sr-only">곳</span></summary>' +
      '<p class="off-season__lead">' + esc(monthsLabel(months)) + '에는 맞지 않아 추천 목록과 일정에서 뺐어요. 그래도 가고 싶다면 참고하세요.</p>' +
      '<ul class="place-list place-list--quiet">' + off.map((p) =>
        '<li class="place">' +
          '<a class="place__name" href="' + esc(mapUrl(p)) + '" target="_blank" rel="noopener">' + esc(p.name) + ' <span aria-hidden="true">↗</span><span class="sr-only">(구글 지도, 새 창)</span></a>' +
          (TYPE[p.t] ? ' <span class="tag">' + TYPE[p.t] + '</span>' : '') +
          seasonLine(p.season, 'p', 'place__season') +
          '<p class="place__meta"><span class="place__area">' + esc(p.area) + '</span> · ' + esc(p.desc) + '</p>' +
        '</li>').join('') +
      '</ul></details>';
  }

  // 직접 적은 곳을 어떻게 알아봤는지: 가게 이름 → 장소, 조건 → 찾은 곳, 모르는 곳 → 지도 검색
  function resolvedSection(list) {
    if (!list.length) return '';
    const row = (r) => {
      let body;
      if (r.kind === 'place' && r.place) {
        body = '<a href="' + esc(mapUrl(r.place)) + '" target="_blank" rel="noopener">' + esc(r.place.name) + ' <span aria-hidden="true">↗</span></a> <span class="muted">(' + esc(r.place.area || '') + ') ' + (r.pinned && typeof r.day === 'number' ? (r.day + 1) + '일차에 ' : '일정에 ') + '넣었어요</span>';
      } else if (r.kind === 'request') {
        const away = r.elsewhere ? '<span class="muted">' + esc(r.elsewhere.name) + '은(는) ' + esc(r.elsewhere.cityName) + '에 있는 가게예요. 대신 </span>' : '';
        body = away + (r.place
          ? '<span class="muted">' + esc(r.label) + ' 조건으로 ' + r.candidates + '곳을 찾아, ' +
              (typeof r.day === 'number' ? (r.day + 1) + '일차 ' + (r.meal === 'lunch' ? '점심' : r.meal === 'dinner' ? '저녁' : '') + ' ' : '') +
              (r.near ? esc(r.near) + ' 근처 ' : '동선 근처 ') + '</span><a href="' + esc(mapUrl(r.place)) + '" target="_blank" rel="noopener">' + esc(r.place.name) + ' <span aria-hidden="true">↗</span></a><span class="muted">' + (r.place.price ? ' (1인 약 ' + r.place.price[0].toLocaleString('ko-KR') + '~' + r.place.price[1].toLocaleString('ko-KR') + '엔)' : '') + '을 넣었어요</span>'
          : '<span class="muted">' + esc(r.label) + ' 조건에 맞는 곳을 아직 못 찾았어요. 조건을 조금 넓혀 보세요.</span>');
      } else {
        body = '<span class="muted">위치를 몰라 빈 시간에 넣었어요 · </span><a href="' + esc(Planner.mapSearchUrl({ q: r.text })) + '" target="_blank" rel="noopener">지도에서 찾기 <span aria-hidden="true">↗</span></a>';
      }
      const ex = (r.excludedNames || []).length ? ' <span class="tag tag--far">제외: ' + esc(r.excludedNames.join(', ')) + ' — 일정 전체에서 뺐어요</span>' : '';
      return '<li class="resolved__row"><span class="resolved__text">"' + esc(r.text) + '"</span> ' + body + ex + '</li>';
    };
    return '<section class="resolved" aria-labelledby="resolved-title">' +
      '<h2 class="section-title" id="resolved-title">직접 적은 곳</h2>' +
      '<ul class="resolved__list">' + list.map(row).join('') + '</ul></section>';
  }

  // 여행 전체 동선을 구글 지도에서 한 번에 (한 링크 최대 10곳 → 넘으면 이어지는 링크로)
  function tripMapSection(it, stay, city) {
    const links = engine('tripMapLinks', [it, stay, city], []);
    if (!links.length) return '';
    const dayTxt = (l) => l.fromDay === l.toDay ? (l.fromDay + 1) + '일차' : (l.fromDay + 1) + '~' + (l.toDay + 1) + '일차';
    return '<section class="tripmap" aria-labelledby="tripmap-title">' +
      '<h2 class="section-title" id="tripmap-title">전체 동선 한 번에 보기</h2>' +
      '<p class="muted">' + (links.length > 1
        ? '구글 지도는 한 번에 10곳까지 보여 줘서 ' + links.length + '개로 나눴어요. 앞 링크의 마지막 장소에서 다음 링크가 이어져요.'
        : '숙소에서 출발해 모든 장소를 순서대로 거쳐 숙소로 돌아오는 경로예요.') + '</p>' +
      '<ul class="tripmap__list">' + links.map((l, i) =>
        '<li><a class="btn' + (i ? ' btn--ghost' : '') + ' tripmap__link" href="' + esc(l.url) + '" target="_blank" rel="noopener">' +
          (links.length > 1 ? (i + 1) + '/' + links.length + ' · ' : '') + '구글 지도에서 전체 동선 보기 <span class="muted">(' + dayTxt(l) + ' · ' + l.count + '곳)</span> <span aria-hidden="true">↗</span><span class="sr-only">(새 창)</span></a></li>').join('') +
      '</ul>' +
      '<p class="hint">여러 곳을 한 번에 보면 구글 지도가 자동차 경로로 그려요. 대중교통 시간은 구간마다 "이 날 동선 지도로 보기"나 지도의 대중교통 버튼으로 확인하세요.</p>' +
    '</section>';
  }

  const yen = (n) => '약 ' + Number(n).toLocaleString('ko-KR') + '엔';

  // 공항 → 숙소: 숙소 위치 기준 가장 빨리 닿는 교통편을 한 줄로 권한다 (예약 링크는 맨 아래 예약 모음에)
  function transferSection(it, p) {
    const t = it && it.transfer;
    if (!t) return '';
    const b = t.best;
    const to = t.stayName ? (/숙소$/.test(t.stayName) ? t.stayName : t.stayName + ' 숙소') : '시내';
    const how = b.hub + '까지 ' + b.rideMin + '분' + (b.lastMin ? ', 거기서 숙소까지 ' + (b.lastLabel || b.lastMin + '분') : '');
    const alts = t.options.filter((o) => o.id !== b.id).slice(0, 3);
    return '<section class="transfer" aria-labelledby="transfer-title">' +
      '<h2 class="section-title" id="transfer-title">공항에서 숙소까지</h2>' +
      '<p class="transfer__lead">' + esc(p.airport.name) + '에서 ' + esc(to) + '까지는 <strong>' + esc(b.name) + '</strong>' + esc(ro(b.name)) + ' 가는 게 좋아요.</p>' +
      '<p class="transfer__meta"><span class="mono">총 약 ' + b.total + '분 · ' + esc(yen(b.price)) + (b.lastWalk ? '' : ' + 시내 전철') + '</span> <span class="muted">(' + esc(how) + ')</span></p>' +
      (b.note ? '<p class="muted">' + esc(b.note) + '</p>' : '') +
      (b.url ? '<p class="muted">예약 링크는 맨 아래 "예약 모음"에 있어요.</p>' : '') +
      (alts.length ? '<details class="transfer__alt"><summary>다른 방법 ' + alts.length + '가지</summary><ul>' +
        alts.map((o) => '<li><strong>' + esc(o.name) + '</strong> <span class="mono">약 ' + o.total + '분 · ' + esc(yen(o.price)) + '</span> <span class="muted">' + esc(o.hub) + ' 하차' + (o.id === (t.cheapest && t.cheapest.id) ? ' · 가장 저렴' : '') + '</span></li>').join('') +
      '</ul></details>' : '') +
    '</section>';
  }
  function ro(w) {
    const c = String(w).replace(/[^가-힣]+$/, '').slice(-1).charCodeAt(0);
    if (!(c >= 0xac00 && c <= 0xd7a3)) return '로';
    const j = (c - 0xac00) % 28;
    return j === 0 || j === 8 ? '로' : '으로';
  }

  // 맨 아래 예약 모음: 공항 교통편 + 예약이 필요하거나 하면 좋은 곳 (공식 사이트)
  function bookingSection(it) {
    const t = it && it.transfer;
    const res = (it && it.reservations) || [];
    const rows = [];
    if (t && t.best.url) {
      rows.push('<li class="booking__row"><span class="tag tag--book">' + (t.best.reserve && t.best.reserve !== 'none' ? '교통편 예약' : '교통편 안내') + '</span> <strong>' + esc(t.best.name) + '</strong> <span class="muted">' + esc(t.best.hub) + '까지 · ' + esc(yen(t.best.price)) + '</span>' +
        '<a class="btn booking__btn" href="' + esc(t.best.url) + '" target="_blank" rel="noopener">' + esc(t.best.urlLabel || '예약 사이트') + ' <span aria-hidden="true">↗</span><span class="sr-only">(새 창)</span></a></li>');
    }
    res.forEach((r) => {
      rows.push('<li class="booking__row">' + (r.level === 'required' ? '<span class="tag tag--must">예약 필수</span>' : '<span class="tag tag--book">예약 추천</span>') +
        ' <strong>' + esc(r.place.name) + '</strong> <span class="muted">' + (r.day + 1) + '일차 · ' + esc(r.why) + '</span>' +
        (r.url
          ? '<a class="btn btn--ghost booking__btn" href="' + esc(r.url) + '" target="_blank" rel="noopener">' + esc(r.urlLabel || '공식 사이트') + ' <span aria-hidden="true">↗</span><span class="sr-only">(새 창)</span></a>'
          : '<a class="btn btn--ghost booking__btn" href="' + esc(Planner.mapSearchUrl(r.place)) + '" target="_blank" rel="noopener">지도에서 예약 방법 보기 <span aria-hidden="true">↗</span><span class="sr-only">(새 창)</span></a>') +
      '</li>');
    });
    if (!rows.length) return '';
    return '<section class="booking" aria-labelledby="booking-title">' +
      '<h2 class="section-title" id="booking-title">예약 모음</h2>' +
      '<p class="muted">미리 예약하면 편한 교통편과, 이 일정에서 예약이 필요하거나 하면 좋은 곳이에요. 요금·예약 방식은 바뀔 수 있으니 공식 사이트에서 확인하세요.</p>' +
      '<ul class="booking__list">' + rows.join('') + '</ul></section>';
  }

  function resultActions() {
    return '<div class="actions actions--end">' +
      '<button type="button" class="btn btn--ghost" data-action="back">다시 고르기</button>' +
      '<button type="button" class="btn" data-action="home">처음으로</button>' +
    '</div>';
  }

  function missingPlanner() {
    return heading('일정을 만들 수 없어요', null) + errorBlock('추천 엔진을 불러오지 못했어요.', '페이지를 새로고침한 뒤 다시 시도해 주세요.');
  }

  /* ---------- 추천 결과 (A · B-아니요) ---------- */
  function renderResult() {
    if (!plannerReady()) return missingPlanner();
    const p = tripParams();
    const rec = Planner.recommend(p.city, state.age, state.with, p.months) || { sights: [], foods: [], stays: [] };
    // 일정 기준 숙소: 도심 가까운 추천 숙소 (멀리 있는 온천 료칸은 기준으로 쓰지 않음)
    const stay = (state.path === 'B' && formStay()) || engine('pickBaseStay', [rec.stays || [], p.city], null);
    let it;
    try {
      it = Planner.buildItinerary({
        city: p.city, sights: rec.sights || [], foods: [], extraFoods: rec.foods || [], stay,
        startDate: p.startDate, days: p.days, arriveTime: p.arriveTime, departTime: p.departTime,
        airport: p.airport, custom: [], fillMode: 'recommend', months: p.months,
        // 빈 시간은 이동 30분 안쪽의 명소로 채워 자유 시간이 2시간을 넘지 않게
        maxHop: 0.5, maxFree: 2,
        fillSights: (engine('spots', [p.city], PLACES[p.city] || []) || []).filter((x) => {
          if (x.t === 'food' || x.t === 'stay') return false;
          const s = engine('seasonInfo', [p.city, x, p.months], null);
          return !(s && (s.hidden || s.score <= -2));
        }),
      });
    } catch (err) {
      console.error(err);
      return errorBlock('일정을 짜는 중 문제가 생겼어요.', '기간이나 시간을 바꿔서 다시 시도해 주세요.');
    }
    const tips = TIPS[state.with] || [];
    return summaryHeader(p, [['연령', esc(AGE_LABEL[state.age])], ['동반', esc(WITH_LABEL[state.with])]]) +
      seasonSection(p) +
      (state.age === '1' && state.with === 's' ? '<p class="notice notice--inline">미성년자는 숙소 체크인 때 보호자 동의서가 필요한 경우가 많아요. 예약 전에 숙소에 꼭 확인하세요.</p>' : '') +
      (stay && p.days > 1 ? '<p class="stay-note">숙소 기준: <strong>' + esc(stay.name) + '</strong> <span class="muted">(' + esc(stay.area) + ')</span></p>' : '') +
      transferSection(it, p) +
      timeline(it, p, '추천 일정', { stay }) +
      tripMapSection(it, stay, p.city) +
      '<div class="rec-grid">' +
        placeList('추천 관광지', rec.sights, 'rec-sights') +
        placeList('추천 맛집', rec.foods, 'rec-foods') +
        placeList('추천 숙소', rec.stays, 'rec-stays') +
      '</div>' +
      offSeasonList(rec, p.months) +
      (tips.length ? '<aside class="tips" aria-labelledby="tips-title"><h2 class="tips__title" id="tips-title">' + esc(WITH_LABEL[state.with]) + ' 여행 팁</h2><ul>' + tips.map((t) => '<li>' + esc(t) + '</li>').join('') + '</ul></aside>' : '') +
      bookingSection(it) +
      resultActions();
  }

  /* ---------- 동선 결과 (B-네) ---------- */
  function renderRoute() {
    if (!plannerReady()) return missingPlanner();
    const p = tripParams();
    const all = PLACES[p.city] || [];
    const info = (x) => engine('seasonInfo', [p.city, x, p.months], null) || {};
    // 이 기간엔 없는 시기 한정 장소는 빼고 (장소 고르기에서도 숨김), 빈 식사 자리는 제철이 아닌 곳을 빼고 채운다
    const pk = state.picks;
    const isArea = pk.concept === 'area';
    const stay = formStay();
    const spots = engine('spots', [p.city], all) || all;
    const okSeason = (x) => { const s = info(x); return !s.hidden && !(s.score <= -2); };
    // 빈 식사 자리는 제철이 아닌 곳을 빼고, 알려진 가게까지 포함해 동선 근처로 채운다
    const fillFoods = spots.filter((x) => x.t === 'food' && okSeason(x));
    syncDays(p.days);
    const areaById = (id) => dayAreaList(p.city).find((a) => a.id === id) || null;
    const dayAreas = isArea ? pk.dayAreas.map(areaById) : [];
    let it;
    try {
      const common = {
        city: p.city, stay, startDate: p.startDate, days: p.days, arriveTime: p.arriveTime, departTime: p.departTime,
        airport: p.airport, months: p.months, foods: [], extraFoods: fillFoods, fillMode: 'strict', maxFree: 2,
      };
      it = Planner.buildItinerary(isArea
        // 하루에 한 동네: 그날 동네 안에서만. 적은 곳은 그날에, 빈 시간은 그 동네 명소로
        ? Object.assign(common, { sights: [], dayAreas, dayPlan: pk.byDay.map((l) => l.slice()) })
        // 많이 돌아다니기: 꼭 갈 곳 + 이동 30분 안쪽으로 이어지는 명소 (제철 먼저)
        : Object.assign(common, {
          sights: [], custom: pk.must.slice(), maxHop: 0.5,
          fillSights: spots.filter((x) => x.t !== 'food' && x.t !== 'stay' && okSeason(x))
            .map((x, i) => ({ x, k: (info(x).score || 0), i })).sort((a, b) => b.k - a.k || a.i - b.i).map((o) => o.x),
        }));
    } catch (err) {
      console.error(err);
      return errorBlock('동선을 짜는 중 문제가 생겼어요.', '적은 장소 수를 줄이거나 기간을 바꿔 다시 시도해 주세요.');
    }
    const left = it.leftover || [];
    const leftDays = it.leftoverDays || {};
    const picked = isArea ? pk.byDay.reduce((n, l) => n + l.length, 0) : pk.must.length;
    return summaryHeader(p, [
      ['여행 스타일', isArea ? '하루에 한 동네씩' : '많이 돌아다니기 · 이동 30분 이내'],
      isArea ? ['동네', dayAreas.map((a, i) => (i + 1) + '일 ' + esc(a ? a.name.split(' ')[0] : '-')).join(' · ')] : ['꼭 갈 곳', picked ? picked + '곳' : '없음 (전부 추천)'],
      ['숙소', stay ? esc(stay.name) : '미정']]) +
      seasonSection(p) +
      ((it.farPlaces || []).length
        ? '<p class="notice notice--inline notice--far" role="status"><strong>' + esc(it.farNotice) + '</strong> ' +
          it.farPlaces.map((x) => esc(x.place.name) + ' (편도 ' + esc(String(x.label).replace(/^.*?약 /, '약 ')) + ')').join(', ') +
          '. 그 지역에 하룻밤 묵으면 왕복 이동 없이 여유 있게 볼 수 있어요.</p>'
        : '') +
      resolvedSection(it.resolved || []) +
      transferSection(it, p) +
      timeline(it, p, '내 동선', { stay }) +
      tripMapSection(it, stay, p.city) +
      (left.length
        ? '<section class="leftover" aria-labelledby="left-title">' +
            '<h2 class="section-title" id="left-title">일정에 다 못 넣은 곳 <span class="count mono">' + left.length + '</span></h2>' +
            '<p class="muted">적은 날 안에 시간이 모자라 빠진 곳이에요. 여유 있는 다른 날 칸으로 옮기거나, 덜 중요한 곳을 빼고 다시 만들어 보세요.</p>' +
            '<ul class="place-list">' + left.map((x) => typeof x === 'string'
              ? '<li class="place"><span class="place__name">' + esc(x) + '</span><p class="place__meta">직접 추가한 곳</p></li>'
              : '<li class="place"><a class="place__name" href="' + esc(mapUrl(x)) + '" target="_blank" rel="noopener">' + esc(x.name) + ' <span aria-hidden="true">↗</span><span class="sr-only">(구글 지도, 새 창)</span></a>' + (x.full ? ' <span class="tag tag--full">하루 코스</span>' : '') + '<p class="place__meta">' + (x.id in leftDays ? (leftDays[x.id] + 1) + '일차 · ' : '') + esc(x.area || '') + (x.desc ? ' · ' + esc(x.desc) : '') + '</p></li>').join('') +
            '</ul>' +
            '<div class="actions"><button type="button" class="btn btn--ghost" data-action="back">날짜별 장소 고치기</button></div>' +
          '</section>'
        : '') +
      bookingSection(it) +
      resultActions();
  }

  /* ---------- 이벤트 위임 ---------- */
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-action]');
    if (!b) return;
    const a = b.dataset.action;
    if (a === 'back') back();
    else if (a === 'home') home();
    else if (a === 'path') {
      state.path = b.dataset.value; state.plan = null;
      go(state.path === 'A' ? 'city' : 'arrival');
    } else if (a === 'plan') {
      state.plan = b.dataset.value;
      go(nextOf('detail'));
    } else if (a === 'choose') {
      const field = b.dataset.field;
      state[field] = field === 'nights' ? Number(b.dataset.value) : b.dataset.value;
      saveMemory();
      go(nextOf(current));
    } else if (a === 'month') {
      const m = Number(b.dataset.value);
      state.month = m >= 1 && m <= 12 ? m : null; // 0 = 아직 몰라요
      state.monthPicked = true;
      saveMemory();
      go(nextOf(current));
    } else if (a === 'jump') jumpTo(b.dataset.screen);
    else if (a === 'concept') {
      state.picks.concept = b.dataset.value;
      go(nextOf('concept'));
    } else if (a === 'day-add') addDayEntry(dayKey(b.dataset.day));
    else if (a === 'day-remove') {
      const i = dayKey(b.dataset.day);
      listOf(i).splice(Number(b.dataset.index), 1);
      refreshDay(i);
      document.getElementById('day-input-' + i).focus();
    } else if (a === 'day-suggest') {
      const i = state.picks.focusDay || 0;
      pushEntries(i, b.dataset.name);
      refreshDay(i);
    }
  });

  try { history.replaceState(navState(0, 'start'), ''); } catch (e) { /* 무시 */ }
  render();
})();
