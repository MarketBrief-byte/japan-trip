/*
 * 공항 교통편 · 예약 정보
 *   AIRPORT_ACCESS : 공항 코드별 시내 교통편 (hubs = 내리는 주요 역과 공항에서 걸리는 분)
 *   RESERVATIONS   : 도시별로 예약이 필요하거나 하면 좋은 곳 (PLACES / KNOWN_SPOTS id)
 * 요금·시간 근거: 2025~2026 각 운영사 공식 사이트 검색 결과 (편도 성인, 대략). 요금 개정이 잦으니 참고용.
 */

// 공항 → 시내 교통편. 숙소 위치에 따라 엔진이 가장 빠른 것을 고른다 (공항→도착역 시간 + 도착역→숙소 이동).
const AIRPORT_ACCESS = {
  NRT: [
    { id: 'skyliner', name: '스카이라이너', kind: 'rail',
      hubs: [
        { name: '닛포리', lat: 35.7281, lng: 139.7707, min: 36 },
        { name: '게이세이우에노', lat: 35.7113, lng: 139.7745, min: 41 },
      ],
      price: 2580, reserve: 'recommended',
      url: 'https://www.keisei.co.jp/keisei/tetudou/skyliner/e-ticket/ko/',
      urlLabel: '스카이라이너 e-티켓 (한국어)',
      note: '우에노·아사쿠사·닛포리 쪽 숙소에 가장 빨라요. 온라인 할인 티켓이 있어요' },
    { id: 'nex', name: '나리타 익스프레스 (N\'EX)', kind: 'rail',
      hubs: [
        { name: '도쿄역', lat: 35.6812, lng: 139.7671, min: 55 },
        { name: '시나가와', lat: 35.6285, lng: 139.7388, min: 68 },
        { name: '시부야', lat: 35.6580, lng: 139.7016, min: 78 },
        { name: '신주쿠', lat: 35.6896, lng: 139.7006, min: 83 },
      ],
      price: 3070, reserve: 'recommended',
      url: 'https://www.jreast.co.jp/kr/pass/nex_round.html',
      urlLabel: 'N\'EX 도쿄 왕복 티켓 (한국어)',
      note: '전석 지정석. 외국인 전용 왕복권(5,200엔)이 편도 두 번보다 훨씬 싸요. 신주쿠·시부야·도쿄역 숙소에 환승 없이' },
    { id: 'keisei_access', name: '게이세이 액세스 특급 (아사쿠사선 직통)', kind: 'rail',
      hubs: [
        { name: '아사쿠사', lat: 35.7108, lng: 139.7967, min: 65 },
        { name: '니혼바시', lat: 35.6822, lng: 139.7745, min: 72 },
        { name: '히가시긴자', lat: 35.6693, lng: 139.7671, min: 76 },
      ],
      price: 1300, reserve: 'none',
      url: null, urlLabel: null,
      note: '지정석 없는 일반 열차라 싸요. 아사쿠사·긴자 쪽 숙소에 환승 없이' },
    { id: 'keisei_ltd', name: '게이세이 본선 특급 (가장 저렴)', kind: 'rail',
      hubs: [
        { name: '닛포리', lat: 35.7281, lng: 139.7707, min: 75 },
        { name: '게이세이우에노', lat: 35.7113, lng: 139.7745, min: 80 },
      ],
      price: 1050, reserve: 'none',
      url: null, urlLabel: null,
      note: '시간은 걸리지만 가장 싼 방법. 짐이 적을 때 추천' },
    { id: 'limo_nrt_shinjuku', name: '리무진 버스 (신주쿠행)', kind: 'bus',
      hubs: [ { name: '바스타 신주쿠', lat: 35.6883, lng: 139.7003, min: 105 } ],
      price: 3600, reserve: 'none',
      url: 'https://www.limousinebus.co.jp/ko/line/detail/Narita-Shinjuku/',
      urlLabel: '리무진 버스 나리타↔신주쿠 (한국어)',
      note: '짐이 많을 때 편해요. 신주쿠 주요 호텔 앞에도 서요. 퇴근 시간엔 정체 주의' },
    { id: 'tyo_nrt', name: '에어포트 버스 TYO-NRT (도쿄역행)', kind: 'bus',
      hubs: [ { name: '도쿄역 야에스구치', lat: 35.6804, lng: 139.7700, min: 65 } ],
      price: 1500, reserve: 'none',
      url: 'https://tyo-nrt.com/en', urlLabel: 'TYO-NRT 공식 (영어)',
      note: '도쿄역까지 가장 싼 직행. 밤 11시 이후는 3,000엔' },
  ],

  HND: [
    { id: 'keikyu', name: '게이큐선 (시나가와 · 아사쿠사선 직통)', kind: 'rail',
      hubs: [
        { name: '시나가와', lat: 35.6285, lng: 139.7388, min: 15 },
        { name: '히가시긴자', lat: 35.6693, lng: 139.7671, min: 30 },
        { name: '니혼바시', lat: 35.6822, lng: 139.7745, min: 33 },
        { name: '아사쿠사', lat: 35.7108, lng: 139.7967, min: 42 },
      ],
      price: 330, reserve: 'none',
      url: 'https://www.haneda-tokyo-access.com/kr/ride/fares.html',
      urlLabel: '게이큐 운임·소요시간 (한국어)',
      note: '시나가와에서 JR 야마노테선 환승. 아사쿠사행 직통 열차면 긴자·아사쿠사까지 환승 없이 (아사쿠사까지 약 600엔)' },
    { id: 'monorail', name: '도쿄 모노레일', kind: 'monorail',
      hubs: [ { name: '하마마쓰초', lat: 35.6555, lng: 139.7571, min: 15 } ],
      price: 520, reserve: 'none',
      url: 'https://www.tokyo-monorail.co.jp/english/haneda-tokyo-access/',
      urlLabel: '도쿄 모노레일 공식 (영어)',
      note: '하마마쓰초에서 JR 야마노테선 환승. 도쿄타워·시바 쪽 숙소에 가까워요' },
    { id: 'limo_hnd_shinjuku', name: '리무진 버스 (신주쿠행)', kind: 'bus',
      hubs: [ { name: '바스타 신주쿠', lat: 35.6883, lng: 139.7003, min: 50 } ],
      price: 1400, reserve: 'none',
      url: 'https://www.limousinebus.co.jp/ko/timetable/',
      urlLabel: '리무진 버스 시간표·예약 (한국어)',
      note: '환승 없이 신주쿠까지. 짐 많은 가족·부모님 동반에 편해요' },
  ],

  KIX: [
    { id: 'haruka', name: 'JR 특급 하루카', kind: 'rail',
      hubs: [
        { name: '덴노지', lat: 34.6465, lng: 135.5133, min: 33 },
        { name: '신오사카', lat: 34.7334, lng: 135.5001, min: 50 },
        { name: '교토', lat: 34.9858, lng: 135.7588, min: 75 },
      ],
      price: 1800, reserve: 'recommended',
      url: 'https://www.westjr.co.jp/travel-information/kr/tickets-passes/oneway/haruka/',
      urlLabel: 'HARUKA 편도 티켓 (JR서일본 한국어)',
      note: '외국인 전용 할인 편도권을 미리 사면 싸요 (덴노지는 더 저렴, 교토는 조금 비쌈). ICOCA 교통카드와 함께 사두면 편해요' },
    { id: 'rapit', name: '난카이 특급 라피트', kind: 'rail',
      hubs: [
        { name: '덴가차야', lat: 34.6368, lng: 135.4957, min: 31 },
        { name: '난바', lat: 34.6626, lng: 135.5016, min: 38 },
      ],
      price: 1670, reserve: 'recommended',
      url: 'https://www.nankai.co.jp/kr_railway/ticket/rapit',
      urlLabel: '라피트 디지털 티켓 (난카이 한국어)',
      note: '전석 지정석. 난바·도톤보리·신사이바시 숙소에 가장 빨라요' },
    { id: 'nankai_express', name: '난카이 공항급행', kind: 'rail',
      hubs: [
        { name: '덴가차야', lat: 34.6368, lng: 135.4957, min: 40 },
        { name: '난바', lat: 34.6626, lng: 135.5016, min: 45 },
      ],
      price: 970, reserve: 'none',
      url: 'https://www.nankai.co.jp/kr_railway/access-timetable',
      urlLabel: '난카이 시간표 (한국어)',
      note: '라피트보다 7분 정도 느리지만 훨씬 싸요. 교통카드로 바로 탑승' },
    { id: 'limo_kix', name: '공항 리무진 버스 (우메다 · 난바행)', kind: 'bus',
      hubs: [
        { name: '난바 (OCAT)', lat: 34.6680, lng: 135.4955, min: 50 },
        { name: '오사카역 (우메다)', lat: 34.7066, lng: 135.4972, min: 60 },
      ],
      price: 1800, reserve: 'none',
      url: 'https://www.kate.co.jp/kr/timetable/',
      urlLabel: '간사이공항 리무진 버스 시간표·운임 (한국어)',
      note: '짐이 많거나 우메다 쪽 숙소일 때 환승 없이. 선착순 탑승' },
  ],

  ITM: [
    { id: 'itm_monorail', name: '오사카 모노레일 + 한큐선', kind: 'monorail',
      hubs: [ { name: '오사카우메다 (한큐)', lat: 34.7053, lng: 135.4989, min: 29 } ],
      price: 440, reserve: 'none',
      url: 'https://www.osaka-monorail.co.jp/language/en/route/hotarugaike-route/',
      urlLabel: '오사카 모노레일 공식 (영어)',
      note: '모노레일로 호타루가이케(1정거장)까지 가서 한큐 다카라즈카선 환승' },
    { id: 'limo_itm', name: '공항 리무진 버스 (우메다 · 난바행)', kind: 'bus',
      hubs: [
        { name: '오사카역 (우메다)', lat: 34.7025, lng: 135.4959, min: 25 },
        { name: '난바 (OCAT)', lat: 34.6680, lng: 135.4955, min: 30 },
      ],
      price: 650, reserve: 'none',
      url: 'https://www.osaka-airport.co.jp/en/access/bus',
      urlLabel: '이타미공항 버스 안내 (영어)',
      note: '환승 없이 우메다·난바까지. 난바행은 730엔' },
  ],

  CTS: [
    { id: 'jr_airport', name: 'JR 쾌속 에어포트', kind: 'rail',
      hubs: [
        { name: '삿포로역', lat: 43.0686, lng: 141.3508, min: 37 },
        { name: '오타루', lat: 43.1976, lng: 140.9939, min: 75 },
      ],
      price: 1150, reserve: 'none',
      url: 'https://www.jrhokkaido.co.jp/global/korean/index.html',
      urlLabel: 'JR홋카이도 공식 (한국어)',
      note: '약 10분 간격. 특별쾌속은 삿포로까지 33분. 오타루까지는 1,910엔' },
    { id: 'jr_useat', name: 'JR 쾌속 에어포트 u시트 (지정석)', kind: 'rail',
      hubs: [
        { name: '삿포로역', lat: 43.0686, lng: 141.3508, min: 37 },
        { name: '오타루', lat: 43.1976, lng: 140.9939, min: 75 },
      ],
      price: 2150, reserve: 'recommended',
      url: 'https://www.jrhokkaido.co.jp/global/korean/ticket/reservation/index.html',
      urlLabel: 'JR홋카이도 열차 예약 (한국어)',
      note: '4호차 지정석(+1,000엔). 스키 시즌·저녁 도착편은 자유석이 붐벼서 예약하면 앉아 갈 수 있어요' },
    { id: 'cts_bus', name: '공항 연락 버스 (삿포로 시내행)', kind: 'bus',
      hubs: [
        { name: '삿포로역', lat: 43.0673, lng: 141.3510, min: 65 },
        { name: '오도리', lat: 43.0598, lng: 141.3544, min: 73 },
        { name: '스스키노', lat: 43.0556, lng: 141.3530, min: 77 },
      ],
      price: 1500, reserve: 'none',
      url: 'https://www.hokto.co.jp/en/sapporo-chitose/',
      urlLabel: '호쿠토교통 공항버스 (영어)',
      note: '오도리·스스키노 호텔 근처에 바로 내려요. 겨울 눈길엔 지연 가능' },
  ],

  FUK: [
    { id: 'fuk_subway', name: '후쿠오카 지하철 공항선', kind: 'subway',
      hubs: [
        // 한국발 항공편은 국제선 도착이라 국내선 터미널까지 셔틀 약 15분을 더한 시간
        { name: '하카타', lat: 33.5902, lng: 130.4207, min: 20 },
        { name: '나카스카와바타', lat: 33.5946, lng: 130.4062, min: 24 },
        { name: '텐진', lat: 33.5911, lng: 130.3990, min: 26 },
      ],
      price: 260, reserve: 'none',
      url: 'https://subway.city.fukuoka.lg.jp/kor/',
      urlLabel: '후쿠오카시 지하철 (한국어)',
      note: '국내선 터미널 역에서 출발해요. 국제선 도착이면 무료 셔틀버스로 국내선까지 가야 해요 (시간에 포함)' },
    { id: 'fuk_intl_bus', name: '국제선 → 하카타·텐진 직행 버스 (니시테츠)', kind: 'bus',
      hubs: [
        { name: '하카타 버스터미널', lat: 33.5895, lng: 130.4196, min: 20 },
        { name: '니시테츠 텐진 고속버스터미널', lat: 33.5881, lng: 130.3993, min: 35 },
      ],
      price: 310, reserve: 'none',
      url: 'https://www.nishitetsu.jp/en/access/',
      urlLabel: '니시테츠 공항 액세스 (영어)',
      note: '국제선 터미널 앞에서 바로 타요. 텐진행 직행은 500엔' },
  ],
};

// 예약이 필요하거나 하면 좋은 곳 (도시별, PLACES id 또는 KNOWN_SPOTS id)
//   level: 'required' 예약 필수 · 'recommended' 예약하면 좋음 · 'queue' 예약 불가, 줄 서기
const RESERVATIONS = {
  tokyo: {
    shibuyasky: { level: 'required', why: '날짜·시간 지정 티켓. 일몰 시간대는 2주 전 판매 시작 직후 매진돼요',
      url: 'https://www.shibuya-scramble-square.com/sky/ticket/', urlLabel: '시부야 스카이 공식 티켓' },
    teamlab: { level: 'required', why: '30분 단위 입장 시간 예약제. 주말·연휴는 미리 매진',
      url: 'https://www.teamlab.art/e/planets/', urlLabel: '팀랩 플래닛 공식 (한국어 지원)' },
    disneyland: { level: 'required', why: '날짜 지정 티켓을 온라인으로 미리 사야 해요 (매진·변동 가격)',
      url: 'https://www.tokyodisneyresort.jp/kr/ticket/index.html', urlLabel: '도쿄 디즈니 리조트 파크 티켓 (한국어)' },
    disneysea: { level: 'required', why: '날짜 지정 티켓을 온라인으로 미리 사야 해요 (매진·변동 가격)',
      url: 'https://www.tokyodisneyresort.jp/kr/ticket/index.html', urlLabel: '도쿄 디즈니 리조트 파크 티켓 (한국어)' },
    skytree: { level: 'recommended', why: '온라인 날짜·시간 지정권이 당일권보다 싸고 대기 없이 입장 (30일 전부터)',
      url: 'https://www.tokyo-skytree.jp/kr/ticket/', urlLabel: '도쿄 스카이트리 티켓 (한국어)' },
    ginzasushi: { level: 'required', why: '카운터 좌석이 적어 오마카세는 대부분 예약제예요', url: null, urlLabel: null },
    motomura: { level: 'queue', why: '예약 불가, 줄 서기 · 오픈 직후 추천', url: null, urlLabel: null },
    ichiran_t: { level: 'queue', why: '예약 불가, 줄 서기 · 오픈 직후 추천', url: null, urlLabel: null },
    maisen: { level: 'queue', why: '점심 피크엔 대기가 길어요 · 오픈 직후 추천', url: null, urlLabel: null },
    k_ichinisan: { level: 'queue', why: '예약 불가, 줄 서기 · 오픈 직후 추천', url: null, urlLabel: null },
    k_tsujihan: { level: 'queue', why: '예약 불가, 줄 서기 · 오픈 직후 추천', url: null, urlLabel: null },
    k_fuunji: { level: 'queue', why: '예약 불가, 줄 서기 · 오픈 직후 추천', url: null, urlLabel: null },
    k_kagari: { level: 'queue', why: '예약 불가, 줄 서기 · 오픈 직후 추천', url: null, urlLabel: null },
    k_gyukaku_kabukicho: { level: 'recommended', why: '저녁 무한리필은 금·토에 만석이 많아요. 온라인 예약 가능', url: null, urlLabel: null },
    k_king_shinjuku: { level: 'recommended', why: '저녁 무한리필은 대기가 길어요. 예약하면 바로 입장', url: null, urlLabel: null },
    k_anan_dogenzaka: { level: 'recommended', why: '저녁 시간대 예약 추천', url: null, urlLabel: null },
  },
  osaka: {
    usj: { level: 'required', why: '날짜 지정 입장권 + 익스프레스 패스(인기 어트랙션·닌텐도 월드 입장 보장)는 미리 매진돼요',
      url: 'https://usj.co.jp/kr/index.html', urlLabel: '유니버설 스튜디오 재팬 공식 (한국어)' },
    kaiyukan: { level: 'recommended', why: '날짜 지정 e-티켓을 사면 매표소 줄 없이 입장 (30일 전부터)',
      url: 'https://pop.kaiyukan.com/language/korean/ticket.html', urlLabel: '가이유칸 티켓 (한국어)' },
    zouheikyoku: { level: 'required', why: '인터넷 사전 신청제 (2026년 기준, 선착순). 신청 없이는 입장 불가 (4월 중순 1주일)',
      url: 'https://www.mint.go.jp/', urlLabel: '조폐국 공식 (신청 안내)' },
    k_pokemon_osaka: { level: 'recommended', why: '포켓몬 센터는 자유 입장, 포켓몬 카페는 31일 전 18시 예약 오픈 후 금방 매진',
      url: 'https://www.pokemon-cafe.jp/ko/cafe/reservation.html', urlLabel: '포켓몬 카페 예약 (한국어)' },
    kani: { level: 'recommended', why: '저녁 코스는 예약하는 게 안전해요. 온라인 예약 가능',
      url: 'https://www.hotpepper.jp/strJ000018294/yoyaku/', urlLabel: '카니도라쿠 도톤보리 본점 예약 (핫페퍼)' },
    tsuruhashi: { level: 'recommended', why: '인기 야키니쿠집은 저녁에 예약 추천', url: null, urlLabel: null },
    kushikatsu: { level: 'queue', why: '예약 불가, 줄 서기 · 오픈 직후 추천', url: null, urlLabel: null },
    ichiran_o: { level: 'queue', why: '예약 불가, 줄 서기 · 오픈 직후 추천', url: null, urlLabel: null },
    mizuno: { level: 'queue', why: '예약 불가, 줄 서기 · 오픈 직후 추천', url: null, urlLabel: null },
    k_motomura_namba: { level: 'queue', why: '예약 불가, 줄 서기 · 오픈 직후 추천', url: null, urlLabel: null },
    k_harukoma: { level: 'queue', why: '예약 불가, 줄 서기 · 오픈 직후 추천', url: null, urlLabel: null },
    k_rikuro: { level: 'queue', why: '구워 나오는 시간마다 줄이 생겨요 · 오전 추천', url: null, urlLabel: null },
    k_ebisu_umeda: { level: 'recommended', why: '저녁 무한리필은 예약 추천', url: null, urlLabel: null },
    k_gyukaku_dotonbori: { level: 'recommended', why: '저녁 무한리필은 주말 만석이 많아요. 온라인 예약 가능', url: null, urlLabel: null },
    k_king_namba: { level: 'recommended', why: '저녁 무한리필은 대기가 길어요. 예약하면 바로 입장', url: null, urlLabel: null },
  },
  sapporo: {
    kanihonke: { level: 'recommended', why: '개별실 게 코스는 저녁에 예약하는 게 안전해요',
      url: 'https://www.kani-honke.co.jp/en/', urlLabel: '삿포로 카니혼케 공식' },
    k_kaniza: { level: 'recommended', why: '게 무한리필은 시간제라 예약 추천', url: null, urlLabel: null },
    k_beergarden: { level: 'recommended', why: '징기스칸 무한리필은 저녁·주말 예약 추천', url: null, urlLabel: null },
    beer: { level: 'recommended', why: '박물관은 무료 자유 관람, 시음 포함 프리미엄 투어는 사전 예약제',
      url: 'https://www.sapporobeer.jp/brewery/s_museum/', urlLabel: '삿포로 맥주 박물관 공식' },
    shiroikoibito: { level: 'recommended', why: '과자 만들기 체험은 사전 예약', url: 'https://www.shiroikoibitopark.jp/', urlLabel: '시로이 코이비토 파크 공식' },
    biei: { level: 'recommended', why: '차 없이 가면 삿포로 출발 버스 투어를 미리 예약해야 해요 (라벤더 시즌 매진)', url: null, urlLabel: null },
    jingisukan: { level: 'queue', why: '예약 불가, 줄 서기 · 오픈 직후 추천', url: null, urlLabel: null },
    garaku: { level: 'queue', why: '예약 불가, 번호표 · 오픈 직후 추천', url: null, urlLabel: null },
    suage: { level: 'queue', why: '예약 불가, 줄 서기 · 오픈 직후 추천', url: null, urlLabel: null },
    sumire: { level: 'queue', why: '예약 불가, 줄 서기 · 오픈 직후 추천', url: null, urlLabel: null },
    toriton: { level: 'queue', why: '예약 불가, 번호표 발권 · 오픈 직후 추천', url: null, urlLabel: null },
    hanamaru: { level: 'queue', why: '예약 불가, 줄 서기 · 오픈 직후 추천', url: null, urlLabel: null },
    k_ichigen: { level: 'queue', why: '예약 불가, 줄 서기 · 오픈 직후 추천', url: null, urlLabel: null },
    k_shingen: { level: 'queue', why: '예약 불가, 줄 서기 · 오픈 직후 추천', url: null, urlLabel: null },
    k_gyukaku_susukino: { level: 'recommended', why: '저녁 무한리필은 예약 추천. 온라인 예약 가능', url: null, urlLabel: null },
  },
  fukuoka: {
    motsunabe: { level: 'recommended', why: '저녁엔 예약 없이 가면 한참 기다려요', url: null, urlLabel: null },
    k_rakutenchi: { level: 'recommended', why: '저녁 예약 추천', url: null, urlLabel: null },
    k_hachibei: { level: 'recommended', why: '작은 가게라 저녁 예약 추천', url: null, urlLabel: null },
    k_gyukaku_nakasu: { level: 'recommended', why: '저녁 무한리필은 예약 추천. 온라인 예약 가능', url: null, urlLabel: null },
    k_gyukaku_tenjin: { level: 'recommended', why: '저녁 무한리필은 예약 추천. 온라인 예약 가능', url: null, urlLabel: null },
    ichiran_f: { level: 'queue', why: '예약 불가, 줄 서기 · 오픈 직후 추천', url: null, urlLabel: null },
    shinshin: { level: 'queue', why: '예약 불가, 줄 서기 · 오픈 직후 추천', url: null, urlLabel: null },
    hyotan: { level: 'queue', why: '예약 불가, 줄 서기 · 오픈 직후 추천', url: null, urlLabel: null },
    mentaiju: { level: 'queue', why: '예약 불가, 줄 서기 · 오픈 직후 추천', url: null, urlLabel: null },
    unagi: { level: 'queue', why: '예약 불가, 줄 서기 · 오픈 직후 추천', url: null, urlLabel: null },
    k_daruma: { level: 'queue', why: '예약 불가, 줄 서기 · 오픈 직후 추천', url: null, urlLabel: null },
    k_udontaira: { level: 'queue', why: '예약 불가, 줄 서기 · 오픈 직후 추천', url: null, urlLabel: null },
    k_kiwamiya: { level: 'queue', why: '예약 불가, 번호표 · 오픈 직후 추천', url: null, urlLabel: null },
  },
};

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

/*
 * 하루 한 동네 일정용 데이터
 *   DAY_AREAS[city] : 하루를 보내기 좋은 동네 (중심 좌표 반경 약 1.5km 안에서 하루가 채워지도록)
 *   KNOWN_SPOTS 추가 : 동네마다 볼거리 7곳+ · 먹을 곳 5곳+ 이 되도록 보강 (catalog.js KSPOT 형식)
 *   RESERVATIONS 추가 : 새로 넣은 곳 중 예약·줄서기가 필요한 곳
 *
 * 불러오는 순서: data.js → seasons.js → catalog.js → travel.js → access.js → areas.js → planner.js
 * 좌표 근거: 공식 사이트·지도 검색 주소 → 대략 좌표 (오차 ~150m 이내 목표). 가격은 참고용 1인 엔.
 */

const DAY_AREAS = {
  tokyo: [
    { id: 'shinjuku', name: '신주쿠', note: '도청 무료 전망대 · 가부키초 타워 · 오모이데요코초 · 신주쿠교엔 · 이세탄', lat: 35.6920, lng: 139.7010 },
    { id: 'shibuya_harajuku', name: '시부야 · 하라주쿠', note: '스크램블 교차로 · 시부야 스카이 · 메이지 신궁 · 다케시타 거리 · 캣 스트리트', lat: 35.6645, lng: 139.7020 },
    { id: 'ginza_tokyo', name: '긴자 · 도쿄역', note: '긴자 쇼핑 · 도쿄역 마루노우치 역사 · 고쿄 · 캐릭터 스트리트 · 츠키지 장외시장', lat: 35.6760, lng: 139.7660 },
    { id: 'ueno_akiba', name: '우에노 · 아키하바라', note: '우에노 공원 · 박물관 · 아메요코 시장 · 아키하바라 애니·게임 거리', lat: 35.7070, lng: 139.7730 },
    { id: 'asakusa_skytree', name: '아사쿠사 · 스카이트리', note: '센소지 · 나카미세 · 갓파바시 · 스미다강 · 스카이트리 · 소라마치', lat: 35.7120, lng: 139.8030 },
    { id: 'ikebukuro', name: '이케부쿠로', note: '선샤인시티 · 포켓몬센터 메가도쿄 · 수족관 · 남자타운 · 오토메 로드', lat: 35.7295, lng: 139.7150 },
    { id: 'odaiba_toyosu', name: '오다이바 · 도요스', note: '팀랩 플래닛 · 도요스 시장 · 건담 · 오다이바 해변 야경 · 아리아케 가든', lat: 35.6378, lng: 139.7818 },
    { id: 'roppongi_tower', name: '롯폰기 · 도쿄타워', note: '롯폰기힐스 · 미드타운 · 국립신미술관 · 아자부다이 힐스(팀랩 보더리스) · 도쿄타워', lat: 35.6600, lng: 139.7370 },
    { id: 'nakameguro_ebisu', name: '나카메구로 · 다이칸야마 · 에비스', note: '메구로강 산책 · 스타벅스 리저브 로스터리 · 츠타야 T-SITE · 에비스 가든 플레이스', lat: 35.6465, lng: 139.7040 },
  ],
  osaka: [
    { id: 'namba', name: '난바 · 도톤보리 · 신사이바시', note: '글리코 간판 · 신사이바시스지 · 아메리카무라 · 호젠지 요코초 · 구로몬 시장', lat: 34.6690, lng: 135.5010 },
    { id: 'umeda', name: '우메다', note: '우메다 공중정원 · 헵파이브 관람차 · 닌텐도 오사카 · 그랜드 프런트 · 우메키타 공원', lat: 34.7030, lng: 135.4980 },
    { id: 'nakazakicho_tenma', name: '나카자키초 · 텐마 · 텐진바시스지', note: '나카자키초 카페 골목 · 일본 최장 상점가 텐진바시스지 · 오사카 텐만구', lat: 34.7050, lng: 135.5090 },
    { id: 'osakajo', name: '오사카성 · 텐마바시', note: '오사카성 천수각 · 니시노마루 정원 · 고자부네 · 역사박물관 · JO-TERRACE', lat: 34.6930, lng: 135.5195 },
    { id: 'nakanoshima', name: '나카노시마 · 기타하마', note: '강변 미술관·과학관 · 장미정원 · 중앙공회당 · 기타하마 강변 카페', lat: 34.6920, lng: 135.5000 },
    { id: 'shinsekai_tennoji', name: '신세카이 · 덴노지', note: '츠텐카쿠 · 쿠시카츠 골목 · 아베노 하루카스 · 덴노지 공원·동물원 · 시텐노지', lat: 34.6495, lng: 135.5100 },
    { id: 'bay', name: '베이 에어리어 (가이유칸 · 덴포잔)', note: '가이유칸 · 덴포잔 대관람차 · 레고랜드 · 산타마리아 유람선 · 유니버설 시티워크', lat: 34.6580, lng: 135.4320 },
  ],
  sapporo: [
    { id: 'station', name: '삿포로역 · 홋카이도대학', note: 'JR타워 T38 · 포켓몬센터 · 붉은 벽돌 청사 · 홋카이도대학 캠퍼스 · 시계탑', lat: 43.0685, lng: 141.3480 },
    { id: 'odori', name: '오도리 · 다누키코지', note: '오도리 공원 · TV타워 · 시계탑 · 다누키코지 상점가 · 니조 시장', lat: 43.0595, lng: 141.3535 },
    { id: 'susukino', name: '스스키노 · 나카지마 공원', note: '스스키노 밤거리 · 라멘 요코초 · 노르베사 관람차 · 나카지마 공원 · 호헤이칸', lat: 43.0500, lng: 141.3540 },
    { id: 'maruyama_moiwa', name: '마루야마 · 모이와산', note: '홋카이도 신궁 · 마루야마 동물원 · 우라산도 카페 · 오쿠라야마 · 모이와산 야경', lat: 43.0490, lng: 141.3120 },
    { id: 'factory', name: '삿포로 팩토리 · 맥주박물관', note: '삿포로 맥주박물관 · 맥주원 징기스칸 · 삿포로 팩토리 · 니조 시장', lat: 43.0680, lng: 141.3640 },
  ],
  fukuoka: [
    { id: 'hakata', name: '하카타역', note: '아뮤플라자 · 포켓몬센터 · 옥상 정원 · 스미요시 신사 · 라쿠스이엔 · 모츠나베', lat: 33.5900, lng: 130.4200 },
    { id: 'nakasu_canal', name: '나카스 · 캐널시티 · 기온', note: '캐널시티 · 구시다 신사 · 도초지 · 가와바타 상점가 · 나카스 야타이', lat: 33.5925, lng: 130.4085 },
    { id: 'tenjin_daimyo', name: '텐진 · 다이묘', note: '텐진 지하상가 · 다이묘 골목 · 파르코 · 아카렌가 문화관 · 게고 신사', lat: 33.5898, lng: 130.3965 },
    { id: 'ohori', name: '오호리 공원 · 롯폰마쓰', note: '오호리 공원 호수 산책 · 일본정원 · 후쿠오카성터 · 미술관 · 롯폰마쓰 421', lat: 33.5850, lng: 130.3830 },
    { id: 'momochi', name: '모모치 · 후쿠오카 타워', note: '후쿠오카 타워 · 모모치 해변 · 마리존 · 보스 이조 · 마크이즈 · 니시진 상점가', lat: 33.5915, lng: 130.3585 },
    { id: 'dazaifu', name: '다자이후', note: '다자이후 텐만구 · 오모테산도 · 규슈국립박물관 · 고묘젠지 · 매화떡', lat: 33.5195, lng: 130.5300 },
  ],
};

KNOWN_SPOTS.tokyo.push(
  // ── 신주쿠
  KSPOT('k_kabukicho_tower', 'sight', '도큐 가부키초 타워', ['가부키초 타워', '가부키쵸 타워', '東急歌舞伎町タワー', 'kabukicho tower'],
    '東急歌舞伎町タワー', '신주쿠', 35.6958, 139.7005, 1, 'night', ['shopping'], null, '2023년 개장. 푸드홀·남코 오락실·영화관이 한 건물에'),
  KSPOT('k_godzilla_head', 'sight', '고질라 헤드 (신주쿠 도호 빌딩)', ['고질라', '고질라 헤드', '고지라', 'ゴジラヘッド', 'godzilla head'],
    '新宿東宝ビル ゴジラヘッド', '신주쿠', 35.6948, 139.7019, 0.5, 'any', ['character'], null, '가부키초 빌딩 위 실물 크기 고질라 머리. 호텔 그레이스리 8층 테라스'),
  KSPOT('k_hanazono', 'sight', '하나조노 신사', ['하나조노', '하나조노신사', '花園神社', 'hanazono shrine'],
    '花園神社', '신주쿠', 35.6937, 139.7047, 0.5, 'am', [], null, '골든가이 옆 신주쿠 수호 신사. 일요일 골동품 시장'),
  KSPOT('k_shinjuku_3dcat', 'sight', '신주쿠 3D 고양이 전광판 (크로스 신주쿠 비전)', ['3D 고양이', '신주쿠 고양이', '고양이 전광판', 'クロス新宿ビジョン', '新宿東口の猫', '3d cat shinjuku'],
    'クロス新宿ビジョン', '신주쿠', 35.6912, 139.7027, 0.5, 'any', [], null, '동쪽 출구 앞 대형 3D 고양이 영상. 사진 명소'),
  KSPOT('k_isetan', 'sight', '이세탄 신주쿠 본점', ['이세탄', '이세탄 신주쿠', '伊勢丹新宿店', 'isetan shinjuku'],
    '伊勢丹 新宿店', '신주쿠', 35.6918, 139.7047, 1.5, 'pm', ['shopping'], null, '도쿄 대표 백화점. 지하 식품관·화장품'),
  KSPOT('k_sompo_museum', 'sight', 'SOMPO 미술관 (고흐 해바라기)', ['솜포 미술관', '고흐 해바라기', 'SOMPO美術館', 'sompo museum of art'],
    'SOMPO美術館', '신주쿠', 35.6920, 139.6955, 1, 'any', [], null, '고흐 「해바라기」 상설 전시. 니시신주쿠 도보'),
  KSPOT('k_tsunahachi', 'food', '텐푸라 츠나하치 신주쿠 본점', ['츠나하치', '쓰나하치', '텐푸라 츠나하치', 'つな八', 'tsunahachi'],
    'つな八 総本店', '신주쿠', 35.6917, 139.7039, 1, 'any', [], [1600, 3500], '1924년 창업 튀김 정식. 카운터에서 바로 튀겨 줌'),
  KSPOT('k_menya_musashi', 'food', '멘야 무사시 신주쿠 본점', ['멘야 무사시', '무사시 라멘', '麺屋武蔵', 'menya musashi'],
    '麺屋武蔵 新宿総本店', '신주쿠', 35.6938, 139.6980, 1, 'any', ['ramen'], [1100, 1700], '진한 츠케멘·라멘. 니시신주쿠 7초메'),
  KSPOT('k_nagi_goldengai', 'food', '라멘 나기 골든가이 본점 (니보시 라멘)', ['나기', '라멘 나기', '나기 골든가이', '凪', 'すごい煮干ラーメン凪', 'ramen nagi'],
    'すごい煮干ラーメン凪 新宿ゴールデン街店本館', '신주쿠', 35.6940, 139.7040, 1, 'night', ['ramen'], [1000, 1500], '골든가이 2층 작은 가게. 멸치 육수 라멘, 밤늦게까지'),
  KSPOT('k_bluebottle_shinjuku', 'food', '블루보틀 신주쿠 카페 (뉴우먼)', ['블루보틀 신주쿠', '블루보틀', 'ブルーボトルコーヒー 新宿', 'blue bottle shinjuku'],
    'ブルーボトルコーヒー 新宿カフェ', '신주쿠', 35.6882, 139.7008, 0.5, 'am', ['cafe'], [600, 1200], '신주쿠역 남쪽 뉴우먼 안 카페'),
  KSPOT('k_takano_fruit', 'food', '신주쿠 다카노 후르츠 파라 (과일 파르페)', ['다카노', '타카노 후르츠', '다카노 파르페', 'タカノフルーツパーラー', 'takano fruit parlour'],
    'タカノフルーツパーラー 新宿本店', '신주쿠', 35.6915, 139.7010, 1, 'pm', ['dessert', 'cafe'], [1800, 3500], '제철 과일 파르페·뷔페. 동쪽 출구 앞 5층'),

  // ── 시부야 · 하라주쿠
  KSPOT('k_scramble', 'sight', '시부야 스크램블 교차로 · 하치코 동상', ['스크램블 교차로', '시부야 교차로', '하치코', '하치코 동상', 'スクランブル交差点', 'shibuya crossing'],
    '渋谷スクランブル交差点', '시부야', 35.6595, 139.7005, 0.5, 'any', [], null, '세계에서 가장 붐비는 횡단보도. 위에서 보려면 시부야 스카이·마그넷'),
  KSPOT('k_meiji_jingu', 'sight', '메이지 신궁', ['메이지진구', '메이지 진구', '메이지신궁', '明治神宮', 'meiji jingu'],
    '明治神宮', '하라주쿠', 35.6764, 139.6993, 1, 'am', [], null, '하라주쿠역 옆 숲속 신사. 아침 산책 추천'),
  KSPOT('k_yoyogi_park', 'sight', '요요기 공원', ['요요기', '요요기공원', '代々木公園', 'yoyogi park'],
    '代々木公園', '하라주쿠', 35.6717, 139.6949, 1, 'am', [], null, '넓은 잔디 공원. 주말 버스킹·피크닉'),
  KSPOT('k_miyashita_park', 'sight', '미야시타 파크', ['미야시타', '미야시타파크', 'MIYASHITA PARK', 'ミヤシタパーク'],
    'MIYASHITA PARK', '시부야', 35.6620, 139.7025, 1, 'any', ['shopping'], null, '옥상 공원 + 명품·편집숍 + 시부야 요코초'),
  KSPOT('k_shibuya109', 'sight', '시부야 109', ['109', '시부야109', '이치마루큐', 'SHIBUYA109'],
    'SHIBUYA109 渋谷店', '시부야', 35.6596, 139.6986, 1, 'pm', ['shopping'], null, '10~20대 여성 패션 빌딩'),
  KSPOT('k_cat_street', 'sight', '캣 스트리트', ['캣스트리트', '캣 스트릿', 'キャットストリート', 'cat street'],
    'キャットストリート', '하라주쿠', 35.6675, 139.7065, 1, 'pm', ['shopping'], null, '하라주쿠~시부야를 잇는 편집숍·스니커즈 골목'),
  KSPOT('k_omotesando_hills', 'sight', '오모테산도 힐즈', ['오모테산도힐즈', '表参道ヒルズ', 'omotesando hills'],
    '表参道ヒルズ', '오모테산도', 35.6671, 139.7087, 1, 'pm', ['shopping'], null, '안도 다다오 설계 쇼핑몰. 느티나무 가로수길'),
  KSPOT('k_midori_shibuya', 'food', '우메가오카 스시노 미도리 시부야점', ['스시노 미도리', '미도리 스시', '미도리 시부야', '美登利', '梅丘寿司の美登利', 'midori sushi'],
    '梅丘寿司の美登利 渋谷店', '시부야', 35.6583, 139.6983, 1, 'any', ['sushi'], [2000, 4500], '마크시티 4층. 가성비 스시 세트로 한국인 대기 긴 집'),
  KSPOT('k_gyozaro', 'food', '하라주쿠 교자로', ['교자로', '하라주쿠 교자', '교자루', '原宿餃子樓', 'gyoza ro'],
    '原宿餃子樓', '하라주쿠', 35.6681, 139.7066, 0.7, 'any', [], [600, 1500], '군만두·물만두 두 가지뿐인 가성비 만두집'),
  KSPOT('k_bills_omotesando', 'food', '빌즈 오모테산도 (리코타 팬케이크)', ['빌즈', '빌스', '빌즈 팬케이크', 'bills 表参道', 'bills omotesando'],
    'bills 表参道', '오모테산도', 35.6687, 139.7055, 1, 'am', ['cafe', 'dessert'], [1800, 3000], '도큐플라자 오모테산도 7층 테라스. 리코타 팬케이크'),
  KSPOT('k_shibuya_yokocho', 'food', '시부야 요코초 (미야시타 파크)', ['시부야 요코초', '시부야요코초', '渋谷横丁', 'shibuya yokocho'],
    '渋谷横丁', '시부야', 35.6630, 139.7015, 1.5, 'night', ['izakaya'], [2000, 4000], '전국 향토 음식 포장마차 골목. 늦게까지 북적'),
  KSPOT('k_fuglen', 'food', '푸글렌 도쿄 (카페)', ['푸글렌', '후글렌', 'FUGLEN', 'フグレン', 'fuglen tokyo'],
    'FUGLEN TOKYO', '도미가야', 35.6664, 139.6923, 0.5, 'am', ['cafe'], [500, 1200], '노르웨이 빈티지 카페. 요요기 공원 산책과 묶기'),

  // ── 긴자 · 도쿄역
  KSPOT('k_kokyo_gaien', 'sight', '고쿄 가이엔 · 니주바시', ['고쿄', '황거', '니주바시', '일본 왕궁', '皇居外苑', '二重橋', 'imperial palace'],
    '皇居外苑 二重橋', '도쿄역', 35.6799, 139.7545, 1, 'am', [], null, '왕궁 앞 넓은 광장과 돌다리. 도쿄역에서 도보 10분'),
  KSPOT('k_tokyo_station', 'sight', '도쿄역 마루노우치 역사 · KITTE 옥상정원', ['도쿄역', '도쿄역 마루노우치', 'KITTE', '키테 옥상', '東京駅丸の内駅舎', 'tokyo station'],
    '東京駅 丸の内駅舎', '도쿄역', 35.6812, 139.7654, 0.5, 'any', ['view'], null, '붉은 벽돌 역사. KITTE 6층 옥상정원에서 내려다보는 뷰 (무료)'),
  KSPOT('k_character_street', 'sight', '도쿄 캐릭터 스트리트 (도쿄역 1번가)', ['캐릭터 스트리트', '캐릭터스트리트', '도쿄역 캐릭터', '東京キャラクターストリート', 'tokyo character street'],
    '東京キャラクターストリート', '도쿄역', 35.6801, 139.7688, 1, 'any', ['character', 'shopping'], null, '도쿄역 지하에 캐릭터 숍 30여 곳 (지브리·산리오·짱구 등)'),
  KSPOT('k_ginza_six', 'sight', '긴자 식스', ['긴자식스', 'GINZA SIX', 'ギンザシックス'],
    'GINZA SIX', '긴자', 35.6697, 139.7640, 1.5, 'pm', ['shopping'], null, '긴자 최대 쇼핑몰. 옥상 정원 무료'),
  KSPOT('k_itoya', 'sight', '긴자 이토야 (문구점)', ['이토야', '긴자 이토야', '伊東屋', 'G.Itoya', 'itoya'],
    '銀座 伊東屋 本店', '긴자', 35.6728, 139.7671, 1, 'any', ['shopping'], null, '12층 문구 전문점. 기념품 편지지·펜'),
  KSPOT('k_kabukiza', 'sight', '가부키자', ['가부키좌', '가부키 극장', '歌舞伎座', 'kabukiza'],
    '歌舞伎座', '긴자', 35.6695, 139.7678, 1, 'any', [], null, '가부키 전용 극장. 한 막만 보는 막견석, 5층 옥상정원 무료'),
  KSPOT('k_midtown_hibiya', 'sight', '도쿄 미드타운 히비야', ['미드타운 히비야', '히비야 미드타운', '東京ミッドタウン日比谷', 'midtown hibiya'],
    '東京ミッドタウン日比谷', '히비야', 35.6739, 139.7593, 1, 'any', ['shopping'], null, '6층 파크뷰 가든에서 히비야 공원 전망'),
  KSPOT('k_pokemon_dx', 'sight', '포켓몬센터 도쿄 DX · 포켓몬 카페 (니혼바시)', ['포켓몬센터 도쿄', '포켓몬센터 도쿄DX', '포켓몬 카페 도쿄', 'ポケモンセンタートウキョーDX', 'pokemon center tokyo dx'],
    'ポケモンセンタートウキョーDX＆ポケモンカフェ', '니혼바시', 35.6808, 139.7743, 1, 'any', ['character', 'shopping'], null, '니혼바시 다카시마야 S.C. 동관 5층. 카페는 예약제'),
  KSPOT('k_ramen_street', 'food', '도쿄 라멘 스트리트 (도쿄역)', ['라멘 스트리트', '도쿄역 라멘', '로쿠린샤', '東京ラーメンストリート', 'tokyo ramen street'],
    '東京ラーメンストリート', '도쿄역', 35.6797, 139.7684, 1, 'any', ['ramen'], [1000, 1700], '도쿄역 야에스 지하 유명 라멘 8곳 (로쿠린샤 츠케멘 등)'),
  KSPOT('k_kimuraya', 'food', '긴자 기무라야 (앙팡 본점)', ['기무라야', '키무라야', '긴자 기무라야', '木村屋', '銀座木村家', 'kimuraya'],
    '銀座木村家', '긴자', 35.6717, 139.7652, 0.5, 'any', ['dessert'], [200, 1000], '1869년 창업 단팥빵 원조. 긴자 4초메'),
  KSPOT('k_shiseido_parlour', 'food', '시세이도 팔러 긴자 본점', ['시세이도 팔러', '시세이도팔러', '資生堂パーラー', 'shiseido parlour'],
    '資生堂パーラー 銀座本店', '긴자', 35.6688, 139.7610, 1, 'pm', ['dessert', 'cafe'], [2000, 4500], '클래식 파르페·오므라이스. 긴자 8초메'),

  // ── 우에노 · 아키하바라
  KSPOT('k_ameyoko', 'sight', '아메요코 시장', ['아메요코', '아메요코초', '우에노 시장', 'アメ横', 'ameyoko'],
    'アメ横商店街', '우에노', 35.7101, 139.7747, 1, 'any', ['shopping'], null, '우에노~오카치마치 철길 옆 재래시장. 과일꼬치·드럭스토어'),
  KSPOT('k_tnm', 'sight', '도쿄국립박물관', ['국립박물관', '도쿄 국립박물관', '東京国立博物館', 'tokyo national museum'],
    '東京国立博物館', '우에노', 35.7188, 139.7765, 1.5, 'am', [], null, '일본 최대 박물관. 국보·사무라이 갑옷'),
  KSPOT('k_shinobazu', 'sight', '시노바즈노이케 · 벤텐도', ['시노바즈', '시노바즈 연못', '不忍池', 'shinobazu pond'],
    '不忍池', '우에노', 35.7120, 139.7708, 0.5, 'any', [], null, '연꽃 연못과 오리배. 여름 연꽃이 예뻐요'),
  KSPOT('k_ueno_toshogu', 'sight', '우에노 도쇼구', ['도쇼구', '우에노 도쇼구', '上野東照宮', 'ueno toshogu'],
    '上野東照宮', '우에노', 35.7145, 139.7708, 0.5, 'am', [], null, '금박 사당과 석등 길'),
  KSPOT('k_radio_kaikan', 'sight', '아키하바라 라디오회관', ['라디오회관', '라디오 회관', '秋葉原ラジオ会館', 'radio kaikan'],
    '秋葉原ラジオ会館', '아키하바라', 35.6982, 139.7716, 1, 'any', ['character', 'shopping'], null, '피규어·가챠·트레카 전문점이 층마다'),
  KSPOT('k_gigo_akiba', 'sight', 'GiGO 아키하바라 (오락실)', ['기고', 'GiGO', '세가 오락실', '아키하바라 오락실', 'GiGO秋葉原', 'gigo akihabara'],
    'GiGO秋葉原1号館', '아키하바라', 35.6996, 139.7712, 1, 'any', ['character'], null, '인형뽑기·리듬게임 대형 오락실'),
  KSPOT('k_mandarake', 'sight', '만다라케 콤플렉스', ['만다라케', '만다라께', 'まんだらけ', 'mandarake'],
    'まんだらけ コンプレックス', '아키하바라', 35.7009, 139.7705, 1, 'any', ['character', 'shopping'], null, '중고 피규어·만화 8층 건물'),
  KSPOT('k_yodobashi_akiba', 'sight', '요도바시 아키바', ['요도바시', '요도바시 카메라', 'ヨドバシAkiba', 'yodobashi akiba'],
    'ヨドバシAkiba', '아키하바라', 35.6989, 139.7747, 1, 'any', ['shopping'], null, '초대형 가전·장난감 매장. 면세'),
  KSPOT('k_kanda_myojin', 'sight', '간다묘진', ['간다 묘진', '칸다묘진', '神田明神', 'kanda myojin'],
    '神田明神', '아키하바라', 35.7020, 139.7679, 0.5, 'am', [], null, '아키하바라 수호 신사. 애니 콜라보 에마'),
  KSPOT('k_jangara_akiba', 'food', '규슈 장가라 아키하바라점', ['장가라', '규슈 장가라', '九州じゃんがら', 'kyushu jangara'],
    '九州じゃんがら 秋葉原本店', '아키하바라', 35.6993, 139.7713, 1, 'any', ['ramen'], [900, 1600], '돈코츠 라멘. 아키하바라 중앙거리'),
  KSPOT('k_maidreamin', 'food', '메이드리민 아키하바라 본점 (메이드 카페)', ['메이드카페', '메이드 카페', '메이드리민', 'めいどりーみん', 'maidreamin'],
    'めいどりーみん 秋葉原本店', '아키하바라', 35.7005, 139.7712, 1, 'pm', ['cafe'], [2000, 4000], '아키하바라 체험 1순위 메이드 카페'),
  KSPOT('k_usagiya', 'food', '우사기야 (도라야키)', ['우사기야', '도라야키', 'うさぎや', 'usagiya dorayaki'],
    'うさぎや 上野', '우에노', 35.7075, 139.7712, 0.5, 'any', ['dessert'], [250, 800], '도쿄 3대 도라야키. 우에노히로코지'),
  KSPOT('k_innshotei', 'food', '인쇼테이 (우에노 공원 가이세키 점심)', ['인쇼테이', '韻松亭', 'innshotei'],
    '韻松亭', '우에노', 35.7140, 139.7727, 1.5, 'pm', [], [2500, 6000], '우에노 공원 안 전통 가옥에서 두부·꽃바구니 도시락'),
  KSPOT('k_ueno_yabusoba', 'food', '우에노 야부소바', ['야부소바', '우에노 소바', '上野藪そば', 'ueno yabu soba'],
    '上野藪そば', '우에노', 35.7093, 139.7745, 0.7, 'any', ['udon'], [900, 2000], '아메요코 옆 노포 소바집'),

  // ── 아사쿠사 · 스카이트리
  KSPOT('k_kappabashi', 'sight', '갓파바시 도구 거리', ['갓파바시', '캇파바시', '주방용품 거리', 'かっぱ橋道具街', 'kappabashi'],
    'かっぱ橋道具街', '아사쿠사', 35.7130, 139.7887, 1, 'any', ['shopping'], null, '식기·칼·음식 모형 도매 거리'),
  KSPOT('k_asahi_riverside', 'sight', '스미다강 테라스 · 아사히 본사 황금 불꽃', ['아사히 맥주 빌딩', '황금 똥', '황금 불꽃', '스미다강', 'アサヒビール本社', 'sumida river'],
    'アサヒビールタワー', '아사쿠사', 35.7103, 139.7988, 0.5, 'any', ['view'], null, '스카이트리와 아사히 빌딩이 함께 나오는 강변 사진 명소'),
  KSPOT('k_sumida_park', 'sight', '스미다 공원', ['스미다공원', '隅田公園', 'sumida park'],
    '隅田公園', '아사쿠사', 35.7140, 139.8015, 0.5, 'any', [], null, '강변 벚꽃길. 스카이트리 뷰'),
  KSPOT('k_asakusa_tic', 'sight', '아사쿠사 문화관광센터 (무료 전망대)', ['아사쿠사 관광센터', '문화관광센터', '아사쿠사 전망대', '浅草文化観光センター'],
    '浅草文化観光センター', '아사쿠사', 35.7108, 139.7964, 0.5, 'any', ['view'], null, '가미나리몬 맞은편 8층 무료 전망 테라스'),
  KSPOT('k_hanayashiki', 'sight', '아사쿠사 하나야시키 (놀이공원)', ['하나야시키', '花やしき', 'hanayashiki'],
    '浅草花やしき', '아사쿠사', 35.7155, 139.7948, 1.5, 'any', [], null, '1853년 개장한 일본 최고(最古) 놀이공원'),
  KSPOT('k_solamachi', 'sight', '도쿄 소라마치', ['소라마치', '스카이트리 쇼핑몰', '東京ソラマチ', 'solamachi'],
    '東京ソラマチ', '오시아게', 35.7100, 139.8108, 1.5, 'any', ['shopping', 'character'], null, '스카이트리 아래 300여 가게. 지브리·짱구·포켓몬 숍'),
  KSPOT('k_sumida_aquarium', 'sight', '스미다 수족관', ['스미다 수족관', '스카이트리 수족관', 'すみだ水族館', 'sumida aquarium'],
    'すみだ水族館', '오시아게', 35.7098, 139.8098, 1.5, 'any', [], null, '소라마치 5·6층 펭귄·해파리 수족관'),
  KSPOT('k_asakusa_menchi', 'food', '아사쿠사 멘치', ['아사쿠사 멘치', '멘치카츠', '浅草メンチ', 'asakusa menchi'],
    '浅草メンチ', '아사쿠사', 35.7137, 139.7955, 0.3, 'any', [], [300, 600], '육즙 가득 멘치카츠. 걸으며 먹는 간식'),
  KSPOT('k_kagetsudo', 'food', '아사쿠사 카게츠도 (점보 메론빵)', ['카게츠도', '메론빵', '아사쿠사 메론빵', '浅草花月堂', 'kagetsudo'],
    '浅草花月堂 本店', '아사쿠사', 35.7150, 139.7955, 0.3, 'any', ['dessert'], [300, 800], '겉바속촉 점보 메론빵'),
  KSPOT('k_imahan', 'food', '아사쿠사 이마한 본점 (스키야키)', ['이마한', '아사쿠사 이마한', '스키야키 이마한', '浅草今半', 'imahan'],
    '浅草今半 国際通り本店', '아사쿠사', 35.7128, 139.7912, 1.5, 'any', ['shabu', 'wagyu'], [4000, 20000], '1895년 창업 와규 스키야키. 점심 세트가 저렴'),
  KSPOT('k_daikokuya', 'food', '다이코쿠야 텐푸라 (텐동)', ['다이코쿠야', '대흑가', '아사쿠사 텐동', '大黒家天麩羅', 'daikokuya'],
    '大黒家天麩羅', '아사쿠사', 35.7122, 139.7947, 1, 'any', [], [1600, 3000], '진한 소스 새우 텐동 노포'),
  KSPOT('k_hoppy_street', 'food', '아사쿠사 호피 거리 (니코미 골목)', ['호피 거리', '호피도리', '아사쿠사 이자카야', 'ホッピー通り', 'hoppy street'],
    'ホッピー通り', '아사쿠사', 35.7137, 139.7930, 1.5, 'night', ['izakaya'], [1500, 3500], '낮부터 여는 야외 선술집 골목. 소 힘줄 조림'),
  KSPOT('k_kirby_cafe', 'food', '커비 카페 도쿄 (소라마치)', ['커비 카페', '커비카페', '별의 커비 카페', 'カービィカフェ', 'kirby cafe'],
    'Kirby Café TOKYO', '오시아게', 35.7100, 139.8108, 1, 'any', ['cafe', 'character'], [2000, 4000], '커비 모양 요리·디저트. 예약제'),

  // ── 이케부쿠로
  KSPOT('k_sunshine60', 'sight', '선샤인60 전망대 텐보파크', ['선샤인60', '선샤인 전망대', '텐보파크', 'サンシャイン60展望台', 'sunshine 60 observatory'],
    'サンシャイン60展望台 てんぼうパーク', '이케부쿠로', 35.7292, 139.7178, 1, 'night', ['view'], null, '잔디에 앉아 보는 60층 전망대'),
  KSPOT('k_sunshine_aquarium', 'sight', '선샤인 수족관', ['선샤인 수족관', '하늘 펭귄', 'サンシャイン水族館', 'sunshine aquarium'],
    'サンシャイン水族館', '이케부쿠로', 35.7293, 139.7205, 1.5, 'any', [], null, '옥상 머리 위로 나는 펭귄 수조'),
  KSPOT('k_namja', 'sight', '남코 남자타운', ['남자타운', '난자타운', 'ナンジャタウン', 'namja town'],
    'ナンジャタウン', '이케부쿠로', 35.7283, 139.7197, 2, 'any', ['character'], null, '실내 테마파크. 애니 콜라보 이벤트·교자 스타디움'),
  KSPOT('k_otome_road', 'sight', '오토메 로드', ['오토메로드', '乙女ロード', 'otome road'],
    '乙女ロード', '이케부쿠로', 35.7310, 139.7185, 1, 'pm', ['character', 'shopping'], null, '여성향 애니 굿즈 숍 거리'),
  KSPOT('k_animate_ikebukuro', 'sight', '애니메이트 이케부쿠로 본점', ['애니메이트', '아니메이트', 'アニメイト池袋本店', 'animate ikebukuro'],
    'アニメイト池袋本店', '이케부쿠로', 35.7303, 139.7172, 1, 'any', ['character', 'shopping'], null, '세계 최대 애니 굿즈 매장'),
  KSPOT('k_hareza', 'sight', '하레자 이케부쿠로 · 나카이케부쿠로 공원', ['하레자', 'Hareza', 'ハレザ池袋', '나카이케부쿠로 공원'],
    'Hareza池袋', '이케부쿠로', 35.7318, 139.7160, 0.5, 'any', [], null, '애니 이벤트 광장. 빨간 전기버스 IKEBUS'),
  KSPOT('k_myonichikan', 'sight', '지유가쿠엔 묘니치칸 (라이트 설계)', ['묘니치칸', '자유학원 명일관', '自由学園明日館', 'myonichikan'],
    '自由学園明日館', '이케부쿠로', 35.7258, 139.7075, 1, 'am', [], null, '프랭크 로이드 라이트 설계 건물. 카페 견학'),
  KSPOT('k_mutekiya', 'food', '무테키야 (이케부쿠로 라멘)', ['무테키야', '무적가', '無敵家', 'mutekiya'],
    '麺創房 無敵家', '이케부쿠로', 35.7272, 139.7125, 1, 'any', ['ramen'], [1000, 1600], '이케부쿠로 대표 줄서는 돈코츠 라멘. 새벽 4시까지'),
  KSPOT('k_kura_ikebukuro', 'food', '구라스시 이케부쿠로 선샤인60거리점 (글로벌 플래그십)', ['구라스시 이케부쿠로', '쿠라스시', '구라스시', 'くら寿司 池袋', 'kura sushi ikebukuro'],
    'くら寿司 池袋サンシャイン60通り店', '이케부쿠로', 35.7300, 139.7163, 1, 'any', ['sushi', 'kaitenzushi'], [1000, 2500], '에도 풍 인테리어 대형 회전초밥 + 게임'),
  KSPOT('k_aoba_sunshine', 'food', '중화소바 아오바 선샤인점', ['아오바', '아오바 라멘', '中華そば 青葉', 'aoba ramen'],
    '中華そば 青葉 池袋サンシャイン店', '이케부쿠로', 35.7290, 139.7185, 1, 'any', ['ramen'], [900, 1400], '어패류+돈코츠 더블 수프. 알파 지하 1층'),
  KSPOT('k_iseroku', 'food', '이세로쿠 (지도리 오야코동)', ['이세로쿠', '오야코동', '伊勢ろく', 'iseroku'],
    '伊勢ろく サンシャイン店', '이케부쿠로', 35.7290, 139.7188, 1, 'any', [], [1200, 2500], '아침에 잡은 토종닭 오야코동. 알파 3층'),
  KSPOT('k_ichiran_ikebukuro', 'food', '이치란 이케부쿠로 동쪽출구점', ['이치란 이케부쿠로', '一蘭 池袋', 'ichiran ikebukuro'],
    '一蘭 池袋東口店', '이케부쿠로', 35.7315, 139.7138, 1, 'night', ['ramen'], [1000, 1600], '1인석 돈코츠 라멘. 늦게까지 영업'),

  // ── 오다이바 · 도요스
  KSPOT('k_gundam', 'sight', '실물 크기 유니콘 건담 (다이버시티)', ['건담', '유니콘 건담', '오다이바 건담', 'ユニコーンガンダム', 'unicorn gundam'],
    '実物大ユニコーンガンダム立像', '오다이바', 35.6250, 139.7757, 0.5, 'any', ['character'], null, '밤에는 변신 연출·조명 쇼'),
  KSPOT('k_divercity', 'sight', '다이버시티 도쿄 플라자', ['다이버시티', 'DiverCity', 'ダイバーシティ東京', 'divercity tokyo'],
    'ダイバーシティ東京 プラザ', '오다이바', 35.6252, 139.7753, 1.5, 'any', ['shopping', 'character'], null, '건담 베이스·쇼핑몰·푸드코트'),
  KSPOT('k_aquacity', 'sight', '아쿠아시티 오다이바', ['아쿠아시티', 'アクアシティお台場', 'aquacity odaiba'],
    'アクアシティお台場', '오다이바', 35.6278, 139.7738, 1, 'any', ['shopping'], null, '레인보우 브리지가 보이는 쇼핑몰'),
  KSPOT('k_odaiba_beach', 'sight', '오다이바 해변공원 · 자유의 여신상', ['오다이바 해변', '자유의 여신상', '오다이바 야경', 'お台場海浜公園', 'odaiba seaside park'],
    'お台場海浜公園', '오다이바', 35.6297, 139.7728, 1, 'night', ['view'], null, '레인보우 브리지 야경 명당'),
  KSPOT('k_fujitv', 'sight', '후지TV 본사 구체 전망실', ['후지TV', '후지 테레비', '후지티비 전망대', 'フジテレビ 球体展望室', 'fuji tv'],
    'フジテレビ 球体展望室 はちたま', '오다이바', 35.6270, 139.7750, 1, 'any', ['view'], null, '둥근 공 모양 전망실과 방송 세트 전시'),
  KSPOT('k_joypolis', 'sight', '도쿄 조이폴리스', ['조이폴리스', 'JOYPOLIS', '東京ジョイポリス'],
    '東京ジョイポリス', '오다이바', 35.6288, 139.7757, 2, 'any', [], null, '세가 실내 놀이공원 (덱스 도쿄 비치)'),
  KSPOT('k_toyosu_market', 'sight', '도요스 시장 (견학 데크)', ['도요스 시장', '도요스시장', '참치 경매', '豊洲市場', 'toyosu market'],
    '豊洲市場', '도요스', 35.6453, 139.7848, 1, 'am', ['seafood'], null, '새벽 참치 경매 견학 (이른 아침). 시장 식당가'),
  KSPOT('k_senkyakubanrai', 'sight', '도요스 센캬쿠반라이 (온천·에도 거리)', ['센캬쿠반라이', '도요스 온천', '豊洲千客万来', 'senkyaku banrai'],
    '豊洲 千客万来', '도요스', 35.6446, 139.7822, 1.5, 'any', ['sento_onsen', 'shopping'], null, '2024년 개장. 에도 거리 식당가 + 옥상 족탕 온천'),
  KSPOT('k_ariake_garden', 'sight', '아리아케 가든', ['아리아케가든', '有明ガーデン', 'ariake garden'],
    '有明ガーデン', '아리아케', 35.6365, 139.7925, 1.5, 'any', ['shopping', 'sento_onsen'], null, '대형 쇼핑몰 + 온천 이즈미텐쿠노유'),
  KSPOT('k_small_worlds', 'sight', '스몰 월즈 도쿄 (미니어처 테마파크)', ['스몰월즈', '스몰 월즈', 'SMALL WORLDS', 'スモールワールズ'],
    'SMALL WORLDS TOKYO', '아리아케', 35.6388, 139.7872, 1.5, 'any', ['character'], null, '에반게리온·세일러문 미니어처 실내 테마파크'),
  KSPOT('k_takoyaki_museum_odaiba', 'food', '오다이바 타코야키 뮤지엄 (덱스)', ['타코야키 뮤지엄', '오다이바 타코야키', 'お台場たこ焼きミュージアム', 'takoyaki museum'],
    'お台場たこ焼きミュージアム', '오다이바', 35.6292, 139.7755, 0.5, 'any', ['takoyaki'], [600, 1200], '오사카 유명 타코야키 가게 모음'),
  KSPOT('k_bills_odaiba', 'food', '빌즈 오다이바 (팬케이크)', ['빌즈 오다이바', '빌즈', 'bills お台場', 'bills odaiba'],
    'bills お台場', '오다이바', 35.6293, 139.7753, 1, 'any', ['cafe', 'dessert'], [1800, 3000], '바다 전망 테라스 팬케이크 (덱스 3층)'),
  KSPOT('k_sushidai', 'food', '스시다이 (도요스 시장)', ['스시다이', '스시 다이', '寿司大', 'sushi dai'],
    '寿司大 豊洲市場', '도요스', 35.6455, 139.7858, 1, 'am', ['sushi', 'seafood'], [5500, 7000], '시장 오마카세 스시. 새벽부터 긴 줄'),
  KSPOT('k_daiwa_sushi', 'food', '다이와 스시 (도요스 시장)', ['다이와스시', '다이와 스시', '大和寿司', 'daiwa sushi'],
    '大和寿司 豊洲市場', '도요스', 35.6452, 139.7855, 1, 'am', ['sushi', 'seafood'], [4500, 6000], '스시다이와 쌍벽인 시장 스시'),
  KSPOT('k_senkyaku_foodhall', 'food', '센캬쿠반라이 식당가 (도요스 에도마에 거리)', ['센캬쿠반라이 식당', '도요스 카이센동', '千客万来 食楽棟', 'toyosu food hall'],
    '豊洲 千客万来 豊洲場外江戸前市場', '도요스', 35.6448, 139.7826, 1, 'any', ['seafood'], [1500, 5000], '카이센동·스시·먹거리 노점이 모인 에도 풍 거리'),

  // ── 롯폰기 · 도쿄타워
  KSPOT('k_midtown', 'sight', '도쿄 미드타운 (롯폰기)', ['미드타운', '도쿄 미드타운', '東京ミッドタウン', 'tokyo midtown'],
    '東京ミッドタウン', '롯폰기', 35.6655, 139.7310, 1.5, 'any', ['shopping'], null, '쇼핑몰 + 뒤쪽 히노키초 공원'),
  KSPOT('k_nact', 'sight', '국립신미술관', ['신미술관', '국립 신미술관', '国立新美術館', 'national art center tokyo'],
    '国立新美術館', '롯폰기', 35.6653, 139.7264, 1.5, 'any', [], null, '물결 유리 외관. 역피라미드 카페'),
  KSPOT('k_zojoji', 'sight', '조조지 · 시바 공원', ['조조지', '시바공원', '増上寺', 'zojoji'],
    '増上寺', '시바', 35.6574, 139.7484, 0.5, 'am', [], null, '도쿄타워를 배경으로 한 대형 사찰'),
  KSPOT('k_azabudai_hills', 'sight', '아자부다이 힐스', ['아자부다이', '아자부다이힐스', '麻布台ヒルズ', 'azabudai hills'],
    '麻布台ヒルズ', '아자부다이', 35.6605, 139.7400, 1, 'any', ['shopping'], null, '2023년 개장 초고층 복합단지. 정원·마켓'),
  KSPOT('k_teamlab_borderless', 'sight', '팀랩 보더리스 (아자부다이 힐스)', ['팀랩 보더리스', '팀랩보더리스', 'チームラボボーダレス', 'teamlab borderless'],
    'teamLab Borderless', '아자부다이', 35.6602, 139.7397, 2, 'any', [], null, '경계 없는 몰입형 디지털 아트. 날짜·시간 예약제'),
  KSPOT('k_keyakizaka', 'sight', '롯폰기힐스 케야키자카 · 모리 정원', ['케야키자카', '모리정원', '롯폰기힐스 일루미네이션', 'けやき坂', 'keyakizaka'],
    '六本木けやき坂通り', '롯폰기', 35.6597, 139.7302, 0.5, 'night', ['view'], null, '도쿄타워가 보이는 가로수길. 겨울 일루미네이션'),
  KSPOT('k_donki_roppongi', 'sight', '돈키호테 롯폰기점', ['돈키 롯폰기', '돈키호테 롯폰기', 'ドン・キホーテ 六本木店', 'don quijote roppongi'],
    'ドン・キホーテ 六本木店', '롯폰기', 35.6627, 139.7322, 1, 'night', ['donki', 'shopping', 'drugstore'], null, '롯폰기 교차로 옆 24시간 돈키'),
  KSPOT('k_gonpachi', 'food', '곤파치 니시아자부 (킬빌 식당)', ['곤파치', '권팔', '킬빌 식당', '権八', 'gonpachi'],
    '権八 西麻布', '니시아자부', 35.6587, 139.7243, 1.5, 'night', ['izakaya', 'udon'], [3000, 7000], '영화 킬빌 모티브 이자카야. 소바·꼬치'),
  KSPOT('k_tsurutontan_roppongi', 'food', '츠루통탄 롯폰기점 (우동)', ['츠루통탄', '쓰루통탄', '츠루톤탄', 'つるとんたん', 'tsurutontan'],
    'つるとんたん 六本木店', '롯폰기', 35.6632, 139.7330, 1, 'any', ['udon'], [1500, 3000], '세숫대야 크기 그릇 우동. 명란크림 우동 인기'),
  KSPOT('k_ukai_tofuya', 'food', '도쿄 시바 토후야 우카이', ['토후야 우카이', '우카이', '두부 요리', 'とうふ屋うかい', 'tofuya ukai'],
    '東京 芝 とうふ屋うかい', '시바', 35.6570, 139.7462, 2, 'any', [], [6000, 16000], '도쿄타워 아래 일본 정원 속 두부 코스. 예약 필수급'),
  KSPOT('k_ippudo_roppongi', 'food', '잇푸도 롯폰기점', ['잇푸도 롯폰기', '잇푸도', '一風堂 六本木', 'ippudo roppongi'],
    '一風堂 六本木店', '롯폰기', 35.6632, 139.7318, 1, 'night', ['ramen'], [1000, 1600], '하카타 돈코츠. 늦게까지 영업'),
  KSPOT('k_azabudai_market', 'food', '아자부다이 힐스 마켓 (식품관·카페)', ['아자부다이 마켓', '아자부다이 힐스 마켓', '麻布台ヒルズマーケット', 'azabudai hills market'],
    '麻布台ヒルズ マーケット', '아자부다이', 35.6607, 139.7402, 1, 'any', ['cafe', 'dessert'], [1000, 3000], '지하 고급 식품관. 스시·디저트·카페'),

  // ── 나카메구로 · 다이칸야마 · 에비스
  KSPOT('k_tsutaya_daikanyama', 'sight', '다이칸야마 츠타야 T-SITE', ['츠타야', '다이칸야마 츠타야', '티사이트', '代官山 蔦屋書店', 'daikanyama t-site'],
    '代官山 蔦屋書店', '다이칸야마', 35.6490, 139.6998, 1, 'any', ['shopping'], null, '세계에서 가장 아름다운 서점 중 하나'),
  KSPOT('k_log_road', 'sight', '로그 로드 다이칸야마', ['로그로드', 'LOG ROAD', 'ログロード代官山', 'log road'],
    'ログロード代官山', '다이칸야마', 35.6505, 139.7025, 0.5, 'any', ['shopping'], null, '옛 철길 위 산책로 숍·카페'),
  KSPOT('k_hillside_terrace', 'sight', '다이칸야마 힐사이드 테라스', ['힐사이드 테라스', 'ヒルサイドテラス', 'hillside terrace'],
    'ヒルサイドテラス', '다이칸야마', 35.6497, 139.6988, 0.5, 'pm', ['shopping'], null, '편집숍·갤러리 저층 건물 거리'),
  KSPOT('k_nakameguro_koukashita', 'sight', '나카메구로 고가시타', ['고가시타', '나카메구로 고가 밑', '中目黒高架下', 'nakameguro koukashita'],
    '中目黒高架下', '나카메구로', 35.6440, 139.6992, 0.5, 'any', ['shopping'], null, '철길 아래 700m 숍·식당 거리'),
  KSPOT('k_ebisu_garden_place', 'sight', '에비스 가든 플레이스', ['에비스 가든', '에비스가든플레이스', '恵比寿ガーデンプレイス', 'yebisu garden place'],
    '恵比寿ガーデンプレイス', '에비스', 35.6423, 139.7135, 1, 'any', ['shopping'], null, '유럽풍 광장. 겨울 샹들리에 일루미네이션'),
  KSPOT('k_yebisu_brewery', 'sight', '에비스 브루어리 도쿄 (맥주 박물관)', ['에비스 맥주', '에비스 맥주 박물관', 'YEBISU BREWERY TOKYO', 'ヱビスビール'],
    'YEBISU BREWERY TOKYO', '에비스', 35.6425, 139.7140, 1, 'pm', [], null, '에비스 맥주 전시 + 시음·투어 (유료)'),
  KSPOT('k_topmuseum', 'sight', '도쿄도 사진미술관', ['사진미술관', 'TOP 미술관', '東京都写真美術館', 'topmuseum'],
    '東京都写真美術館', '에비스', 35.6417, 139.7132, 1, 'any', [], null, '가든 플레이스 안 사진 전문 미술관'),
  KSPOT('k_starbucks_roastery', 'food', '스타벅스 리저브 로스터리 도쿄', ['스타벅스 로스터리', '나카메구로 스타벅스', '스벅 리저브', 'スターバックス リザーブ ロースタリー 東京', 'starbucks reserve roastery'],
    'スターバックス リザーブ ロースタリー 東京', '나카메구로', 35.6493, 139.6929, 1, 'any', ['cafe'], [800, 2500], '구마 겐고 설계 4층 로스터리. 메구로강 벚꽃 뷰'),
  KSPOT('k_ivy_place', 'food', '아이비 플레이스 (다이칸야마 브런치)', ['아이비 플레이스', 'IVY PLACE', 'アイビープレイス', 'ivy place'],
    'IVY PLACE', '다이칸야마', 35.6487, 139.6996, 1, 'am', ['cafe', 'dessert'], [1500, 3000], 'T-SITE 옆 테라스 팬케이크 브런치'),
  KSPOT('k_onibus', 'food', '오니버스 커피 나카메구로', ['오니버스', '오니버스 커피', 'ONIBUS COFFEE', 'オニバスコーヒー'],
    'ONIBUS COFFEE 中目黒', '나카메구로', 35.6423, 139.6982, 0.5, 'any', ['cafe'], [500, 1000], '철길 옆 작은 스페셜티 커피'),
  KSPOT('k_ebisu_yokocho', 'food', '에비스 요코초', ['에비스요코초', '에비스 이자카야', '恵比寿横丁', 'ebisu yokocho'],
    '恵比寿横丁', '에비스', 35.6468, 139.7117, 1.5, 'night', ['izakaya'], [2500, 4500], '작은 선술집 20여 곳 실내 골목'),
);

KNOWN_SPOTS.osaka.push(
  // ── 난바 · 도톤보리 · 신사이바시
  KSPOT('k_hozenji', 'sight', '호젠지 요코초 (이끼 부동명왕)', ['호젠지', '호젠지 요코초', '法善寺横丁', 'hozenji'],
    '法善寺', '난바', 34.6682, 135.5023, 0.5, 'any', [], null, '돌길 골목과 이끼 덮인 부동명왕. 물을 끼얹고 소원'),
  KSPOT('k_namba_parks', 'sight', '난바 파크스 (옥상 정원)', ['난바파크스', '난바 파크스', 'なんばパークス', 'namba parks'],
    'なんばパークス', '난바', 34.6617, 135.5020, 1, 'any', ['shopping'], null, '계단식 옥상 정원이 있는 쇼핑몰'),
  KSPOT('k_dendentown', 'sight', '덴덴타운 (오타로드)', ['덴덴타운', '오타로드', '닛폰바시 덴덴타운', '日本橋でんでんタウン', 'den den town'],
    'でんでんタウン', '닛폰바시', 34.6590, 135.5065, 1, 'any', ['character', 'shopping'], null, '오사카의 아키하바라. 피규어·게임 숍'),
  KSPOT('k_orange_street', 'sight', '호리에 오렌지 스트리트', ['오렌지 스트리트', '호리에', '미나미호리에', 'オレンジストリート', 'orange street'],
    '立花通り オレンジストリート', '호리에', 34.6720, 135.4935, 1, 'pm', ['shopping'], null, '편집숍·카페 거리. 아메무라 서쪽'),
  KSPOT('k_meoto_zenzai', 'food', '메오토 젠자이 (단팥죽)', ['메오토젠자이', '부부 단팥죽', '夫婦善哉', 'meoto zenzai'],
    '夫婦善哉', '난바', 34.6681, 135.5025, 0.5, 'any', ['dessert'], [800, 1000], '호젠지 옆 두 그릇 단팥죽'),
  KSPOT('k_hokkyokusei', 'food', '홋쿄쿠세이 신사이바시 본점 (오므라이스 원조)', ['홋쿄쿠세이', '북극성', '오므라이스', '北極星', 'hokkyokusei'],
    '北極星 心斎橋本店', '신사이바시', 34.6716, 135.4983, 1, 'any', [], [1000, 2000], '오므라이스를 처음 만든 집. 다다미 방'),

  // ── 우메다
  KSPOT('k_hep_five', 'sight', '헵파이브 빨간 관람차', ['헵파이브', 'HEP FIVE', '우메다 관람차', 'HEP FIVE 観覧車'],
    'HEP FIVE 観覧車', '우메다', 34.7039, 135.5005, 0.5, 'night', ['view', 'shopping'], null, '쇼핑몰 옥상 빨간 관람차'),
  KSPOT('k_grand_front', 'sight', '그랜드 프런트 오사카', ['그랜드 프런트', '그랜드프론트', 'グランフロント大阪', 'grand front osaka'],
    'グランフロント大阪', '우메다', 34.7050, 135.4948, 1.5, 'any', ['shopping'], null, '오사카역 북쪽 대형 쇼핑몰'),
  KSPOT('k_osaka_station_city', 'sight', '오사카 스테이션 시티 (루쿠아·다이마루)', ['오사카역', '루쿠아', '다이마루 우메다', 'LUCUA', 'ルクア', 'osaka station city'],
    '大阪ステーションシティ', '우메다', 34.7025, 135.4960, 1, 'any', ['shopping'], null, '역 위 시계탑 광장·백화점'),
  KSPOT('k_nintendo_osaka', 'sight', '닌텐도 오사카 · 포켓몬센터 오사카 (다이마루 우메다)', ['닌텐도 오사카', '닌텐도오사카', '포켓몬센터 우메다', 'Nintendo OSAKA', 'ポケモンセンターオーサカ'],
    'Nintendo OSAKA', '우메다', 34.7016, 135.4961, 1, 'any', ['character', 'shopping'], null, '다이마루 우메다 13층. 닌텐도·포켓몬·캡콤 숍 한 층'),
  KSPOT('k_ohatsu_tenjin', 'sight', '오하츠텐진 (츠유노텐 신사)', ['오하츠텐진', '츠유텐 신사', 'お初天神', 'ohatsu tenjin'],
    '露天神社 お初天神', '우메다', 34.7005, 135.5013, 0.5, 'any', [], null, '연애 성취 신사. 하트 에마'),
  KSPOT('k_umekita_park', 'sight', '우메키타 공원 (그랑그린 오사카)', ['우메키타', '우메키타 공원', '그랑그린', 'うめきた公園', 'grand green osaka'],
    'うめきた公園', '우메다', 34.7065, 135.4930, 1, 'any', [], null, '2024년 개장 역 앞 대형 잔디 공원'),
  KSPOT('k_hankyu_umeda', 'sight', '한큐 우메다 본점', ['한큐 백화점', '한큐 우메다', '阪急うめだ本店', 'hankyu umeda'],
    '阪急うめだ本店', '우메다', 34.7035, 135.4988, 1, 'any', ['shopping'], null, '오사카 대표 백화점. 지하 디저트 식품관'),
  KSPOT('k_kiji', 'food', '키지 (스카이빌딩 오코노미야키)', ['키지', '기지', 'きじ', 'kiji okonomiyaki'],
    'お好み焼き きじ 本店', '우메다', 34.7050, 135.4903, 1, 'any', ['okonomiyaki'], [1000, 2000], '우메다 스카이빌딩 지하 타키미코지. 공중정원과 묶기'),
  KSPOT('k_hanshin_ikayaki', 'food', '한신 백화점 이카야키', ['이카야키', '한신 이카야키', '오징어구이', 'いか焼き 阪神', 'ikayaki'],
    '阪神名物いか焼き', '우메다', 34.7005, 135.4983, 0.3, 'any', [], [200, 500], '오징어 반죽 철판구이. 오사카 명물 간식'),
  KSPOT('k_hagakure', 'food', '우메다 하가쿠레 (붓카케 우동)', ['하가쿠레', '하가쿠레 우동', '葉隠', 'hagakure udon'],
    '梅田 はがくれ', '우메다', 34.6995, 135.4973, 0.7, 'am', ['udon'], [900, 1500], '오사카역 앞 제3빌딩 지하 쫄깃한 우동'),
  KSPOT('k_shinumeda_shokudogai', 'food', '신우메다 식당가 (가드 밑 이자카야)', ['신우메다 식당가', '우메다 이자카야', '新梅田食道街', 'shin-umeda shokudogai'],
    '新梅田食道街', '우메다', 34.7022, 135.4985, 1.5, 'night', ['izakaya', 'kushikatsu'], [1500, 3500], '철길 아래 쿠시카츠·꼬치·다치노미 골목'),

  // ── 나카자키초 · 텐마
  KSPOT('k_tenjinbashisuji', 'sight', '텐진바시스지 상점가', ['텐진바시스지', '텐진바시 상점가', '天神橋筋商店街', 'tenjinbashisuji'],
    '天神橋筋商店街', '텐마', 34.6995, 135.5120, 1, 'any', ['shopping'], null, '일본에서 가장 긴 2.6km 상점가'),
  KSPOT('k_tenmangu', 'sight', '오사카 텐만구', ['텐만구', '오사카텐만구', '大阪天満宮', 'osaka tenmangu'],
    '大阪天満宮', '텐마', 34.6960, 135.5125, 0.5, 'am', [], null, '학문의 신 신사. 7월 텐진 마쓰리 본거지'),
  KSPOT('k_housing_museum', 'sight', '오사카 주거 박물관 (에도 거리 재현)', ['주거박물관', '주택박물관', '기모노 체험', '大阪くらしの今昔館', 'osaka museum of housing and living'],
    '大阪くらしの今昔館', '텐진바시', 34.7105, 135.5115, 1.5, 'any', [], null, '실내에 재현한 에도 시대 오사카 거리. 기모노 체험'),
  KSPOT('k_kema_park', 'sight', '게마 사쿠라노미야 공원', ['사쿠라노미야', '게마 공원', '毛馬桜之宮公園', 'kema sakuranomiya park'],
    '毛馬桜之宮公園', '사쿠라노미야', 34.6990, 135.5222, 1, 'am', [], null, '오카와 강변 4km 벚꽃길'),
  KSPOT('k_nakamuraya', 'food', '나카무라야 (고로케)', ['나카무라야', '고로케', '中村屋 コロッケ', 'nakamuraya croquette'],
    '中村屋 天神橋', '텐마', 34.6978, 135.5122, 0.3, 'any', [], [100, 500], '텐진바시스지 줄서는 고로케 집'),
  KSPOT('k_amanto', 'food', '살롱 드 아만토 텐진 (나카자키초 카페)', ['아만토', '살롱 드 아만토', 'サロン・ド・あまんと', 'amanto'],
    'Salon de AManTO 天人', '나카자키초', 34.7080, 135.5048, 1, 'pm', ['cafe'], [600, 1200], '100년 된 민가를 고친 나카자키초 대표 카페'),

  // ── 오사카성
  KSPOT('k_nishinomaru', 'sight', '오사카성 니시노마루 정원', ['니시노마루', '니시노마루 정원', '西の丸庭園', 'nishinomaru garden'],
    '大阪城 西の丸庭園', '오사카성', 34.6858, 135.5238, 1, 'am', [], null, '천수각이 가장 잘 보이는 잔디 정원 (유료)'),
  KSPOT('k_hokoku_shrine', 'sight', '호코쿠 신사', ['호코쿠', '도요쿠니 신사', '豊國神社', 'hokoku shrine'],
    '豊國神社 大阪城', '오사카성', 34.6832, 135.5245, 0.5, 'am', [], null, '도요토미 히데요시를 모신 신사'),
  KSPOT('k_osaka_history_museum', 'sight', '오사카 역사박물관', ['역사박물관', '오사카역사박물관', '大阪歴史博物館', 'osaka museum of history'],
    '大阪歴史博物館', '다니마치', 34.6823, 135.5195, 1.5, 'any', ['view'], null, '나니와궁 복원 전시. 창밖 오사카성 뷰'),
  KSPOT('k_gozabune', 'sight', '오사카성 고자부네 (해자 뱃놀이)', ['고자부네', '오사카성 배', '御座船', 'gozabune'],
    '大阪城御座船', '오사카성', 34.6878, 135.5270, 0.5, 'any', [], null, '황금 장식 배로 해자를 20분 도는 뱃놀이'),
  KSPOT('k_jo_terrace', 'food', 'JO-TERRACE OSAKA (오사카성공원 식당가)', ['조테라스', 'JO-TERRACE', '조 테라스', 'ジョーテラス', 'jo terrace osaka'],
    'JO-TERRACE OSAKA', '오사카성', 34.6862, 135.5327, 1, 'any', ['cafe'], [800, 2500], '오사카성공원역 앞 카페·식당 모음'),
  KSPOT('k_miraiza', 'food', '미라이자 오사카성 (레스토랑·카페)', ['미라이자', 'MIRAIZA', 'ミライザ大阪城', 'miraiza osaka-jo'],
    'MIRAIZA OSAKA-JO', '오사카성', 34.6873, 135.5255, 1, 'any', ['cafe'], [1200, 3500], '천수각 앞 옛 사령부 건물 식당·기념품'),

  // ── 나카노시마 · 기타하마
  KSPOT('k_nakanoshima_museum', 'sight', '나카노시마 미술관', ['나카노시마 미술관', '中之島美術館', 'nakanoshima museum of art'],
    '大阪中之島美術館', '나카노시마', 34.6918, 135.4903, 1.5, 'any', [], null, '검은 큐브 건물 근현대 미술관'),
  KSPOT('k_nmao', 'sight', '국립국제미술관', ['국립국제미술관', '国立国際美術館', 'national museum of art osaka'],
    '国立国際美術館', '나카노시마', 34.6912, 135.4917, 1, 'any', [], null, '대나무 모양 철골 입구의 지하 미술관'),
  KSPOT('k_science_museum', 'sight', '오사카시립과학관 (플라네타리움)', ['과학관', '오사카 과학관', '大阪市立科学館', 'osaka science museum'],
    '大阪市立科学館', '나카노시마', 34.6913, 135.4929, 1.5, 'any', [], null, '체험 전시 + 대형 플라네타리움. 아이 동반'),
  KSPOT('k_rose_garden', 'sight', '나카노시마 공원 장미정원', ['장미정원', '나카노시마 공원', '中之島公園 バラ園', 'nakanoshima park'],
    '中之島公園 バラ園', '나카노시마', 34.6925, 135.5065, 0.5, 'am', [], null, '강 사이 공원. 5월·10월 장미'),
  KSPOT('k_central_hall', 'sight', '오사카시 중앙공회당', ['중앙공회당', '공회당', '大阪市中央公会堂', 'osaka central public hall'],
    '大阪市中央公会堂', '나카노시마', 34.6931, 135.5043, 0.5, 'any', [], null, '1918년 붉은 벽돌 공회당. 밤 조명'),
  KSPOT('k_nakanoshima_library', 'sight', '오사카 부립 나카노시마 도서관', ['나카노시마 도서관', '中之島図書館', 'nakanoshima library'],
    '大阪府立中之島図書館', '나카노시마', 34.6937, 135.5023, 0.5, 'any', [], null, '1904년 돔 건축. 안 카페도 인기'),
  KSPOT('k_kitahama_retro', 'food', '기타하마 레트로 (영국식 티룸)', ['기타하마 레트로', '키타하마 레트로', '北浜レトロ', 'kitahama retro'],
    '北浜レトロ', '기타하마', 34.6915, 135.5070, 1, 'pm', ['cafe', 'dessert'], [1500, 3000], '1912년 건물 애프터눈 티. 줄서는 곳'),
  KSPOT('k_moto_coffee', 'food', '모토 커피 (강변 카페)', ['모토커피', '모토 커피', 'MOTO COFFEE', 'モトコーヒー'],
    'MOTO COFFEE', '기타하마', 34.6915, 135.5064, 0.7, 'any', ['cafe'], [600, 1500], '도사보리강 테라스 카페'),
  KSPOT('k_brooklyn_kitahama', 'food', '브루클린 로스팅 컴퍼니 기타하마', ['브루클린 로스팅', '브루클린 커피', 'Brooklyn Roasting Company', 'ブルックリンロースティングカンパニー'],
    'Brooklyn Roasting Company 北浜', '기타하마', 34.6913, 135.5060, 0.5, 'am', ['cafe'], [500, 1200], '강변 테라스 커피·도넛'),

  // ── 신세카이 · 덴노지
  KSPOT('k_tennoji_park', 'sight', '덴노지 공원 (텐시바)', ['덴노지 공원', '텐시바', '天王寺公園 てんしば', 'tennoji park'],
    '天王寺公園 てんしば', '덴노지', 34.6480, 135.5125, 0.5, 'any', [], null, '하루카스 앞 잔디 광장·카페'),
  KSPOT('k_tennoji_zoo', 'sight', '덴노지 동물원', ['덴노지 동물원', '天王寺動物園', 'tennoji zoo'],
    '天王寺動物園', '덴노지', 34.6512, 135.5082, 2, 'am', [], null, '츠텐카쿠 옆 100년 된 동물원'),
  KSPOT('k_shitennoji', 'sight', '시텐노지', ['시텐노지', '사천왕사', '四天王寺', 'shitennoji'],
    '四天王寺', '덴노지', 34.6537, 135.5164, 1, 'am', [], null, '593년 창건 일본 최초의 관사 사찰. 오층탑'),
  KSPOT('k_isshinji', 'sight', '잇신지', ['잇신지', '一心寺', 'isshinji'],
    '一心寺', '덴노지', 34.6497, 135.5147, 0.5, 'any', [], null, '유골로 만든 불상과 현대적 산문'),
  KSPOT('k_qs_mall', 'sight', '앤드 큐즈몰 (아베노)', ['큐즈몰', 'Q\'s MALL', '아베노 큐즈몰', 'あべのキューズモール', 'abeno qs mall'],
    'あべのキューズモール', '아베노', 34.6445, 135.5125, 1.5, 'any', ['shopping'], null, '덴노지역 앞 대형 쇼핑몰'),
  KSPOT('k_city_museum_osaka', 'sight', '오사카 시립미술관', ['시립미술관', '오사카 시립미술관', '大阪市立美術館', 'osaka city museum of fine arts'],
    '大阪市立美術館', '덴노지', 34.6505, 135.5108, 1, 'any', [], null, '2025년 리뉴얼 재개관. 덴노지 공원 안'),
  KSPOT('k_janjan', 'sight', '잔잔 요코초', ['잔잔요코초', '잔잔 골목', 'ジャンジャン横丁', 'janjan yokocho'],
    'ジャンジャン横丁', '신세카이', 34.6500, 135.5055, 0.5, 'any', [], null, '쿠시카츠·장기 기원이 늘어선 레트로 아케이드'),
  KSPOT('k_yaekatsu', 'food', '야에카츠 (쿠시카츠)', ['야에카츠', '八重勝', 'yaekatsu'],
    '八重勝', '신세카이', 34.6498, 135.5053, 1, 'any', ['kushikatsu'], [1500, 3000], '잔잔요코초 대표 쿠시카츠. 줄 길어요'),
  KSPOT('k_tengu', 'food', '텐구 (쿠시카츠·도테야키)', ['텐구', '쿠시카츠 텐구', 'てんぐ', 'tengu kushikatsu'],
    '串かつ てんぐ', '신세카이', 34.6496, 135.5055, 1, 'any', ['kushikatsu'], [1500, 3000], '소 힘줄 된장조림 도테야키가 명물'),
  KSPOT('k_yamachan', 'food', '아베노 타코야키 야마짱 본점', ['야마짱', '야마찬', '타코야키 야마짱', 'やまちゃん', 'takoyaki yamachan'],
    'あべのたこやき やまちゃん 本店', '아베노', 34.6468, 135.5145, 0.5, 'any', ['takoyaki'], [500, 1000], '미쉐린 빕구르망 타코야키. 소스 없이도 맛있는 반죽'),
  KSPOT('k_shinsekai_kanki', 'food', '신세카이 간키 (쿠시카츠)', ['간키', '신세카이 간키', '新世界かんき', 'kanki kushikatsu'],
    '新世界 串かつ かんき', '신세카이', 34.6523, 135.5065, 1, 'any', ['kushikatsu'], [1500, 3000], '츠텐카쿠 아래 쿠시카츠 노포'),

  // ── 베이 에어리어
  KSPOT('k_tempozan_ferris', 'sight', '덴포잔 대관람차', ['덴포잔 관람차', '텐포잔 관람차', '天保山大観覧車', 'tempozan ferris wheel'],
    '天保山大観覧車', '덴포잔', 34.6566, 135.4318, 0.5, 'night', ['view'], null, '높이 112m. 해 질 녘 오사카만 야경'),
  KSPOT('k_tempozan_market', 'sight', '덴포잔 마켓플레이스', ['덴포잔 마켓', '텐포잔 마켓플레이스', '天保山マーケットプレース', 'tempozan marketplace'],
    '天保山マーケットプレース', '덴포잔', 34.6552, 135.4307, 1, 'any', ['shopping'], null, '가이유칸 옆 쇼핑몰. 2층 먹거리 골목'),
  KSPOT('k_legoland_osaka', 'sight', '레고랜드 디스커버리 센터 오사카', ['레고랜드 오사카', '레고랜드', 'LEGOLAND', 'レゴランド・ディスカバリー・センター大阪'],
    'レゴランド・ディスカバリー・センター大阪', '덴포잔', 34.6553, 135.4306, 2, 'any', ['character'], null, '실내 레고 놀이터. 아이 동반 (어른만은 입장 불가)'),
  KSPOT('k_santamaria', 'sight', '산타마리아 유람선', ['산타마리아', '산타 마리아호', 'サンタマリア', 'santa maria cruise'],
    '帆船型観光船 サンタマリア', '덴포잔', 34.6537, 135.4288, 1, 'any', ['view'], null, '콜럼버스 배 모양 오사카항 45분 유람선'),
  KSPOT('k_tempozan_park', 'sight', '덴포잔 공원 (일본에서 가장 낮은 산)', ['덴포잔 공원', '덴포잔', '天保山公園', 'tempozan park'],
    '天保山公園', '덴포잔', 34.6573, 135.4290, 0.5, 'any', [], null, '해발 4.53m 산 정상 인증 + 항구 산책'),
  KSPOT('k_citywalk', 'sight', '유니버설 시티워크 오사카', ['시티워크', '유니버설 시티워크', 'CityWalk', 'ユニバーサル・シティウォーク大阪'],
    'ユニバーサル・シティウォーク大阪', '유니버설시티', 34.6663, 135.4368, 1, 'any', ['shopping', 'character'], null, 'USJ 입구 앞 쇼핑·식당 거리 (입장권 불필요)'),
  KSPOT('k_kuishinbo', 'food', '나니와 쿠이신보 요코초 (덴포잔)', ['쿠이신보 요코초', '나니와 먹보 골목', 'なにわ食いしんぼ横丁', 'kuishinbo yokocho'],
    'なにわ食いしんぼ横丁', '덴포잔', 34.6552, 135.4308, 1, 'any', ['takoyaki', 'okonomiyaki'], [800, 2000], '1970년대 오사카 거리 재현 푸드코트. 타코야키·카레'),
  KSPOT('k_yukari_tempozan', 'food', '유카리 쿠이신보 요코초점 (오코노미야키)', ['유카리', '오코노미야키 유카리', 'ゆかり', 'yukari okonomiyaki'],
    'ゆかり なにわ食いしんぼ横丁店', '덴포잔', 34.6553, 135.4309, 1, 'any', ['okonomiyaki'], [1200, 2200], '오사카 유명 오코노미야키 체인'),
  KSPOT('k_takopa', 'food', '다코파 (시티워크 타코야키 파크)', ['타코파', 'TAKOPA', '타코야키 파크', '大阪たこ焼ミュージアム'],
    'TAKOPA ユニバーサル・シティウォーク大阪', '유니버설시티', 34.6663, 135.4368, 0.7, 'any', ['takoyaki'], [600, 1200], '오사카 유명 타코야키 6곳 모음'),
  KSPOT('k_ganko_ucw', 'food', '간코 스시 유니버설 시티워크점', ['간코', '간코 스시', 'がんこ', 'ganko sushi'],
    '和食 がんこ ユニバーサル・シティウォーク大阪店', '유니버설시티', 34.6662, 135.4365, 1, 'any', ['sushi'], [1500, 4000], '가족 식사 좋은 일식·스시'),
  KSPOT('k_bubbagump', 'food', '버바 검프 쉬림프 오사카', ['버바검프', '포레스트 검프 식당', 'Bubba Gump', 'ババ・ガンプ・シュリンプ'],
    'ババ・ガンプ・シュリンプ 大阪', '유니버설시티', 34.6662, 135.4370, 1, 'any', ['seafood'], [2000, 4000], '영화 포레스트 검프 테마 새우 요리'),
);

KNOWN_SPOTS.sapporo.push(
  // ── 삿포로역 · 오도리
  KSPOT('k_clock_tower', 'sight', '삿포로 시계탑', ['시계탑', '삿포로시계탑', '札幌市時計台', 'sapporo clock tower'],
    '札幌市時計台', '오도리', 43.0626, 141.3536, 0.5, 'any', [], null, '1878년 목조 시계탑. 사진은 길 건너 2층 테라스에서'),
  KSPOT('k_akarenga', 'sight', '홋카이도청 구 본청사 (붉은 벽돌 청사)', ['붉은 벽돌 청사', '아카렌가', '구 도청', '赤れんが庁舎', 'akarenga'],
    '北海道庁旧本庁舎', '삿포로역', 43.0637, 141.3480, 1, 'any', [], null, '2025년 리뉴얼 재개관한 1888년 붉은 벽돌 건물'),
  KSPOT('k_stellar_place', 'sight', '삿포로 스텔라 플레이스 · 다이마루', ['스텔라 플레이스', '스텔라플레이스', 'ステラプレイス', 'stellar place'],
    '札幌ステラプレイス', '삿포로역', 43.0680, 141.3505, 1.5, 'any', ['shopping'], null, '삿포로역 직결 쇼핑몰·백화점'),
  KSPOT('k_dosanko_plaza', 'sight', '홋카이도 도산코 플라자 (삿포로역)', ['도산코 플라자', '홋카이도 기념품', '北海道どさんこプラザ', 'dosanko plaza'],
    '北海道どさんこプラザ 札幌店', '삿포로역', 43.0685, 141.3508, 0.5, 'any', ['shopping'], null, '홋카이도 전 지역 특산품 기념품점'),
  KSPOT('k_hokudai_museum', 'sight', '홋카이도대학 종합박물관', ['홋카이도대학 박물관', '홋다이 박물관', '北海道大学総合博物館', 'hokkaido university museum'],
    '北海道大学総合博物館', '기타쿠', 43.0718, 141.3443, 1, 'any', [], null, '무료 입장 대학 박물관. 공룡 화석'),
  KSPOT('k_poplar_avenue', 'sight', '홋카이도대학 포플러 가로수길', ['포플러 가로수', '포플러 가로수길', 'ポプラ並木', 'poplar avenue'],
    '北海道大学 ポプラ並木', '기타쿠', 43.0755, 141.3395, 0.5, 'any', [], null, '캠퍼스 안 높은 포플러 길'),
  KSPOT('k_botanic_garden', 'sight', '홋카이도대학 식물원', ['식물원', '홋카이도대학 식물원', '北大植物園', 'hokkaido university botanic garden'],
    '北海道大学植物園', '삿포로역', 43.0632, 141.3450, 1, 'am', [], null, '도심 속 원시림 식물원 (겨울 온실만)'),
  KSPOT('k_kinotoya_odori', 'food', '기노토야 오도리 빗세점 (치즈 타르트·파르페)', ['기노토야', '키노토야', '기노토야 빗세', 'きのとや', 'kinotoya'],
    'きのとや 大通公園店 KINOTOYA cafe', '오도리', 43.0607, 141.3547, 0.7, 'any', ['dessert', 'cafe'], [500, 1800], '구운 치즈 타르트·우유 소프트크림'),
  KSPOT('k_milk_mura', 'food', '밀크무라 (리큐르 아이스크림)', ['밀크무라', '밀크 무라', 'ミルク村', 'milk mura'],
    'ミルク村', '스스키노', 43.0551, 141.3528, 0.7, 'night', ['dessert'], [1300, 2000], '아이스크림에 리큐르 뿌려 먹는 스스키노 명물'),

  // ── 스스키노 · 나카지마 공원
  KSPOT('k_nakajima_park', 'sight', '나카지마 공원', ['나카지마공원', '中島公園', 'nakajima park'],
    '中島公園', '나카지마', 43.0450, 141.3545, 1, 'am', [], null, '연못 보트와 산책. 가을 단풍'),
  KSPOT('k_hoheikan', 'sight', '호헤이칸 (메이지 시대 호텔)', ['호헤이칸', '豊平館', 'hoheikan'],
    '豊平館', '나카지마', 43.0462, 141.3535, 0.5, 'any', [], null, '흰 벽 파란 테두리 1880년 서양식 건물'),
  KSPOT('k_norbesa', 'sight', '노르베사 관람차 노리아', ['노르베사', '노리아', '스스키노 관람차', 'ノルベサ nORIA', 'norbesa'],
    'ノルベサ 観覧車 nORIA', '스스키노', 43.0560, 141.3518, 0.5, 'night', ['view'], null, '빌딩 옥상 관람차. 스스키노 네온 야경'),
  KSPOT('k_cocono', 'sight', '코코노 스스키노', ['코코노', 'COCONO', 'ココノススキノ', 'cocono susukino'],
    'COCONO SUSUKINO', '스스키노', 43.0555, 141.3530, 1, 'any', ['shopping'], null, '2023년 개장 스스키노 교차로 복합 쇼핑몰'),

  // ── 마루야마 · 모이와
  KSPOT('k_maruyama_zoo', 'sight', '삿포로시 마루야마 동물원', ['마루야마 동물원', '円山動物園', 'maruyama zoo'],
    '札幌市円山動物園', '마루야마', 43.0510, 141.3040, 2, 'am', [], null, '북극곰·레서판다. 아이 동반'),
  KSPOT('k_maruyama_class', 'sight', '마루야마 클래스', ['마루야마 클래스', '円山クラス', 'maruyama class'],
    '円山クラス', '마루야마', 43.0555, 141.3180, 1, 'any', ['shopping'], null, '마루야마공원역 직결 쇼핑몰'),
  KSPOT('k_urasando', 'sight', '마루야마 우라산도 (카페 거리)', ['우라산도', '마루야마 우라산도', '裏参道', 'urasando'],
    '円山 裏参道', '마루야마', 43.0565, 141.3150, 1, 'pm', ['shopping'], null, '신궁으로 가는 뒷길 카페·잡화점'),
  KSPOT('k_fushimi_inari_sapporo', 'sight', '삿포로 후시미 이나리 신사', ['후시미 이나리 삿포로', '삿포로 후시미이나리', '札幌伏見稲荷神社', 'sapporo fushimi inari'],
    '札幌伏見稲荷神社', '후시미', 43.0410, 141.3200, 0.5, 'any', [], null, '붉은 도리이 계단. 모이와산 로프웨이 가는 길'),
  KSPOT('k_okurayama', 'sight', '오쿠라야마 전망대 (스키점프대)', ['오쿠라야마', '오쿠라산 전망대', '스키점프대', '大倉山展望台', 'okurayama'],
    '大倉山展望台', '미야노모리', 43.0450, 141.2955, 1, 'any', ['view'], null, '리프트로 올라 점프대 위에서 시내 전망'),
  KSPOT('k_streetcar', 'sight', '삿포로 노면전차 루프선', ['노면전차', '시덴', '삿포로 전차', '札幌市電', 'sapporo streetcar'],
    '札幌市電 ロープウェイ入口', '모이와', 43.0445, 141.3265, 1, 'any', [], null, '스스키노~로프웨이 입구~니시15초메를 도는 전차 (한 바퀴 약 1시간)'),
  KSPOT('k_rokkatei_jingu', 'food', '롯카테이 신궁 찻집 (한간사마)', ['롯카테이 신궁', '한간사마', '判官さま', '六花亭 神宮茶屋店', 'rokkatei jingu'],
    '六花亭 神宮茶屋店', '마루야마', 43.0543, 141.3072, 0.3, 'am', ['dessert'], [150, 500], '신궁 경내에서만 파는 구운 떡 + 무료 호지차'),
  KSPOT('k_matale', 'food', '스프카레 마타레 (마루야마)', ['마타레', '스프카레 마타레', 'MATALE', 'マタレー'],
    'スープカレー MATALE', '마루야마', 43.0567, 141.3135, 1, 'any', ['curry'], [1300, 2200], '우라산도 카페풍 스프카레'),
  KSPOT('k_picante_maruyama', 'food', '마루야마 피칸티 (스프카레)', ['피칸티', '피칸테', '円山ピカンティ', 'picante'],
    '円山ピカンティ', '마루야마', 43.0550, 141.3165, 1, 'any', ['curry'], [1300, 2200], '삿포로 대표 스프카레 체인의 마루야마점'),
  KSPOT('k_tsubura', 'food', '츠부라 (마루야마 홋카이도 식재료)', ['츠부라', '円 TSUBURA', 'tsubura'],
    '円 TSUBURA', '마루야마', 43.0553, 141.3190, 1, 'any', ['wagyu', 'seafood'], [2000, 8000], '마루야마공원역 1분. 도산 와규·회 점심이 가성비'),

  // ── 삿포로 팩토리
  KSPOT('k_sapporo_factory', 'sight', '삿포로 팩토리', ['삿포로팩토리', 'サッポロファクトリー', 'sapporo factory'],
    'サッポロファクトリー', '소세이', 43.0655, 141.3625, 1.5, 'any', ['shopping'], null, '옛 맥주 공장 붉은 벽돌 쇼핑몰. 겨울 대형 트리'),
  KSPOT('k_ario_sapporo', 'sight', '아리오 삿포로', ['아리오', 'Ario', 'アリオ札幌', 'ario sapporo'],
    'アリオ札幌', '히가시쿠', 43.0722, 141.3705, 1, 'any', ['shopping'], null, '맥주박물관 옆 쇼핑몰'),
);

KNOWN_SPOTS.fukuoka.push(
  // ── 하카타역
  KSPOT('k_amu_plaza', 'sight', '아뮤플라자 하카타 · 한큐 백화점', ['아뮤플라자', '하카타 한큐', 'JR하카타시티', 'アミュプラザ博多', 'amu plaza hakata'],
    'アミュプラザ博多', '하카타', 33.5898, 130.4205, 1.5, 'any', ['shopping'], null, '하카타역 빌딩 쇼핑몰·식당가'),
  KSPOT('k_tsubame_rooftop', 'sight', '하카타역 옥상 츠바메노모리 광장', ['옥상정원', '하카타역 옥상', 'つばめの杜ひろば', 'hakata rooftop'],
    'JR博多シティ屋上 つばめの杜ひろば', '하카타', 33.5901, 130.4202, 0.5, 'any', ['view'], null, '역 옥상 무료 전망 광장·미니 기차'),
  KSPOT('k_tochoji', 'sight', '도초지 (후쿠오카 대불)', ['도초지', '후쿠오카 대불', '東長寺', 'tochoji'],
    '東長寺', '기온', 33.5955, 130.4145, 0.5, 'am', [], null, '목조 좌불 중 일본 최대급 대불'),
  KSPOT('k_shofukuji', 'sight', '쇼후쿠지', ['쇼후쿠지', '聖福寺', 'shofukuji'],
    '聖福寺', '기온', 33.5963, 130.4130, 0.5, 'am', [], null, '일본 최초의 선종 사찰. 조용한 경내'),
  KSPOT('k_hakata_machiya', 'sight', '하카타 마치야 후루사토칸', ['하카타 마치야', '마치야 후루사토칸', '博多町家ふるさと館', 'hakata machiya'],
    '博多町家ふるさと館', '기온', 33.5935, 130.4110, 0.5, 'any', [], null, '옛 하카타 상가 재현. 전통 공예 체험'),
  KSPOT('k_sumiyoshi', 'sight', '스미요시 신사', ['스미요시', '스미요시신사', '住吉神社 福岡', 'sumiyoshi shrine'],
    '住吉神社 博多', '하카타', 33.5860, 130.4140, 0.5, 'am', [], null, '규슈 스미요시 신사 총본궁. 하카타역 도보'),
  KSPOT('k_rakusuien', 'sight', '라쿠스이엔 (일본 정원)', ['라쿠스이엔', '楽水園', 'rakusuien'],
    '楽水園', '하카타', 33.5853, 130.4135, 0.5, 'any', [], null, '작은 연못 정원과 말차 (유료)'),
  KSPOT('k_ringo_hakata', 'food', '링고 하카타역점 (커스터드 애플파이)', ['링고', '링고 애플파이', 'RINGO', 'りんご'],
    'RINGO 博多駅', '하카타', 33.5897, 130.4203, 0.3, 'any', ['dessert'], [500, 1000], '갓 구운 커스터드 애플파이'),

  // ── 나카스 · 캐널시티
  KSPOT('k_kawabata', 'sight', '가와바타 상점가', ['가와바타', '카와바타 상점가', '川端通商店街', 'kawabata shopping street'],
    '上川端商店街', '나카스', 33.5943, 130.4070, 1, 'any', ['shopping'], null, '지붕 덮인 노포 상점가. 장식 야마카사 전시'),
  KSPOT('k_riverain', 'sight', '하카타 리버레인 · 후쿠오카 아시아 미술관', ['리버레인', '아시아 미술관', '博多リバレイン', 'fukuoka asian art museum'],
    '福岡アジア美術館', '나카스', 33.5950, 130.4055, 1, 'any', [], null, '아시아 현대미술 + 쇼핑몰 (호빵맨 박물관 있음)'),

  // ── 텐진 · 다이묘
  KSPOT('k_fukuoka_parco', 'sight', '후쿠오카 파르코', ['파르코', '후쿠오카 파르코', '福岡パルコ', 'fukuoka parco'],
    '福岡パルコ', '텐진', 33.5908, 130.3990, 1, 'any', ['shopping', 'character'], null, '캐릭터·애니 숍이 많은 텐진 쇼핑몰'),
  KSPOT('k_daimyo_garden', 'sight', '다이묘 가든 시티', ['다이묘 가든', '다이묘가든시티', '大名ガーデンシティ', 'daimyo garden city'],
    '大名ガーデンシティ', '다이묘', 33.5883, 130.3935, 1, 'any', [], null, '2023년 개장 잔디 광장·식당가'),
  KSPOT('k_suikyo', 'sight', '스이쿄 텐만구', ['스이쿄 텐만구', '水鏡天満宮', 'suikyo tenmangu'],
    '水鏡天満宮', '텐진', 33.5913, 130.4005, 0.5, 'any', [], null, '텐진 지명의 유래가 된 작은 신사'),
  KSPOT('k_akarenga_fukuoka', 'sight', '후쿠오카시 아카렌가 문화관', ['아카렌가 문화관', '붉은 벽돌 문화관', '福岡市赤煉瓦文化館', 'akarenga cultural center'],
    '福岡市赤煉瓦文化館', '텐진', 33.5935, 130.4000, 0.5, 'any', [], null, '1909년 붉은 벽돌 건물 (무료)'),
  KSPOT('k_kego_shrine', 'sight', '게고 신사', ['게고신사', '케고 신사', '警固神社', 'kego shrine'],
    '警固神社', '텐진', 33.5880, 130.3985, 0.5, 'am', [], null, '텐진 한복판 신사. 옆 게고 공원'),
  KSPOT('k_ivorish', 'food', '아이보리쉬 후쿠오카 본점 (프렌치토스트)', ['아이보리쉬', '아이보리시', 'Ivorish', 'アイボリッシュ'],
    'Ivorish 福岡本店', '다이묘', 33.5870, 130.3935, 1, 'am', ['cafe', 'dessert'], [1300, 2000], '두툼한 프렌치토스트 전문점'),
  KSPOT('k_manu_coffee', 'food', '마누 커피 다이묘점', ['마누커피', '마누 커피', 'manu coffee', 'マヌコーヒー'],
    'manu coffee 大名店', '다이묘', 33.5885, 130.3925, 0.5, 'any', ['cafe'], [400, 900], '후쿠오카 대표 로컬 스페셜티 커피'),

  // ── 오호리 공원 · 롯폰마쓰
  KSPOT('k_fukuoka_art_museum', 'sight', '후쿠오카시 미술관', ['후쿠오카 미술관', '福岡市美術館', 'fukuoka art museum'],
    '福岡市美術館', '오호리', 33.5822, 130.3770, 1.5, 'any', [], null, '쿠사마 야요이 호박 등 소장. 호수 뷰 카페'),
  KSPOT('k_ohori_garden', 'sight', '오호리 공원 일본정원', ['일본정원', '오호리 일본정원', '大濠公園日本庭園', 'ohori japanese garden'],
    '大濠公園 日本庭園', '오호리', 33.5826, 130.3782, 0.5, 'am', [], null, '연못·폭포·다실이 있는 정원 (유료)'),
  KSPOT('k_gokoku_fukuoka', 'sight', '후쿠오카현 고코쿠 신사', ['고코쿠 신사', '護国神社 福岡', 'fukuoka gokoku shrine'],
    '福岡縣護國神社', '롯폰마쓰', 33.5810, 130.3830, 0.5, 'am', [], null, '넓은 참배길과 큰 도리이'),
  KSPOT('k_korokan', 'sight', '고로칸 유적 전시관', ['고로칸', '鴻臚館跡展示館', 'korokan'],
    '鴻臚館跡展示館', '오호리', 33.5862, 130.3848, 0.5, 'any', [], null, '고대 외교 영빈관 터. 마이즈루 공원 안'),
  KSPOT('k_ropponmatsu421', 'sight', '롯폰마쓰 421 (츠타야 서점)', ['롯폰마쓰 421', '롯폰마츠 츠타야', '六本松421', 'ropponmatsu 421'],
    '六本松 蔦屋書店', '롯폰마쓰', 33.5780, 130.3745, 1, 'any', ['shopping'], null, '츠타야 서점·카페 복합 빌딩'),
  KSPOT('k_fukuoka_science', 'sight', '후쿠오카시 과학관', ['과학관', '후쿠오카 과학관', '福岡市科学館', 'fukuoka science museum'],
    '福岡市科学館', '롯폰마쓰', 33.5779, 130.3746, 1.5, 'any', [], null, '돔 플라네타리움. 롯폰마쓰 421 안'),
  KSPOT('k_starbucks_ohori', 'food', '스타벅스 후쿠오카 오호리공원점', ['오호리 스타벅스', '오호리공원 스타벅스', 'スターバックス 福岡大濠公園店', 'starbucks ohori'],
    'スターバックスコーヒー 福岡大濠公園店', '오호리', 33.5870, 130.3785, 0.5, 'any', ['cafe'], [500, 1000], '호수가 보이는 테라스 스타벅스'),
  KSPOT('k_andlocals', 'food', '앤드 로컬즈 오호리공원 (야메차 카페)', ['앤드로컬즈', '&LOCALS', 'アンドローカルズ', 'and locals'],
    '&LOCALS 大濠公園', '오호리', 33.5827, 130.3777, 0.7, 'pm', ['cafe', 'dessert'], [600, 1500], '일본정원 옆 야메 녹차·오니기리 카페'),
  KSPOT('k_boathouse', 'food', '보트하우스 오호리 파크', ['보트하우스', '오호리 보트하우스', 'ボートハウス大濠パーク', 'boathouse ohori'],
    'ボートハウス大濠パーク', '오호리', 33.5850, 130.3790, 1, 'any', ['cafe'], [1000, 2500], '호숫가 레스토랑·카페 + 보트 대여'),

  // ── 모모치 · 후쿠오카 타워
  KSPOT('k_momochi_beach', 'sight', '시사이드 모모치 해변공원', ['모모치 해변', '모모치 비치', 'シーサイドももち海浜公園', 'momochi beach'],
    'シーサイドももち海浜公園', '모모치', 33.5955, 130.3525, 1, 'pm', [], null, '인공 해변 산책. 노을 명소'),
  KSPOT('k_marizon', 'sight', '마리존', ['마리존', 'MARIZON', 'マリゾン'],
    'マリゾン', '모모치', 33.5960, 130.3535, 0.5, 'any', [], null, '바다 위 결혼식장 겸 상가. 사진 명소'),
  KSPOT('k_paypay_dome', 'sight', '미즈호 페이페이 돔 후쿠오카', ['페이페이 돔', '후쿠오카 돔', '야구장', 'みずほPayPayドーム福岡', 'paypay dome'],
    'みずほPayPayドーム福岡', '모모치', 33.5954, 130.3622, 1, 'any', [], null, '소프트뱅크 호크스 홈. 경기 없는 날 투어'),
  KSPOT('k_boss_ezo', 'sight', '보스 이조 후쿠오카 (절경 어트랙션)', ['보스 이조', 'E·ZO', '이조 후쿠오카', 'BOSS E・ZO FUKUOKA'],
    'BOSS E・ZO FUKUOKA', '모모치', 33.5943, 130.3628, 1.5, 'any', ['view'], null, '돔 옆 건물 벽을 도는 레일 어트랙션·팀랩·푸드홀'),
  KSPOT('k_markis_momochi', 'sight', '마크이즈 후쿠오카 모모치', ['마크이즈', 'MARK IS', 'マークイズ福岡ももち', 'mark is fukuoka'],
    'MARK IS 福岡ももち', '모모치', 33.5930, 130.3625, 1.5, 'any', ['shopping'], null, '돔 앞 대형 쇼핑몰'),
  KSPOT('k_fukuoka_city_museum', 'sight', '후쿠오카시 박물관 (금인)', ['후쿠오카 박물관', '금인', '福岡市博物館', 'fukuoka city museum'],
    '福岡市博物館', '모모치', 33.5890, 130.3525, 1, 'any', [], null, '국보 금인(金印) 전시'),
  KSPOT('k_nishijin', 'sight', '니시진 상점가', ['니시진', '니시진 상점가', '西新商店街', 'nishijin shopping street'],
    '西新商店街', '니시진', 33.5835, 130.3595, 1, 'any', ['shopping'], null, '리어카 노점이 서는 현지 상점가'),
  KSPOT('k_seala', 'food', '힐튼 시호크 시아라 (뷔페)', ['시아라', '힐튼 뷔페', '시호크 뷔페', 'Brasserie & Lounge seala', 'シアラ'],
    'ブラッセリー&ラウンジ シアラ ヒルトン福岡シーホーク', '모모치', 33.5946, 130.3601, 1.5, 'any', ['ayce'], [4500, 8000], '바다 전망 호텔 점심·저녁 뷔페'),
  KSPOT('k_ezo_foodhall', 'food', '보스 이조 더 푸드홀', ['이조 푸드홀', '더 푸드홀', 'The FOODHALL', 'E・ZO フードホール'],
    'BOSS E・ZO FUKUOKA The FOODHALL', '모모치', 33.5943, 130.3628, 1, 'any', [], [1000, 2500], '돔 옆 3층 푸드홀 (일본·규슈 첫 출점 가게)'),
  KSPOT('k_markis_foodcourt', 'food', '마크이즈 모모치 푸드코트 (모모키치)', ['마크이즈 푸드코트', '모모키치', 'ももキチ', 'mark is food court'],
    'MARK IS 福岡ももち ももキチ', '모모치', 33.5930, 130.3625, 1, 'any', ['ramen'], [800, 1500], '잇소우샤 라멘·도리텐 등 19곳 푸드코트'),
  KSPOT('k_ichiran_nishijin', 'food', '이치란 니시진 상점가점', ['이치란 니시진', '一蘭 西新', 'ichiran nishijin'],
    '一蘭 西新商店街店', '니시진', 33.5838, 130.3590, 1, 'any', ['ramen'], [1000, 1600], '니시진 상점가 1인석 라멘'),
  KSPOT('k_danbo_nishijin', 'food', '단보 니시진점 (돈코츠 라멘)', ['단보', '暖暮', 'danbo ramen'],
    'ラーメン暖暮 西新店', '니시진', 33.5840, 130.3580, 1, 'night', ['ramen'], [800, 1300], '맵고 진한 규슈 돈코츠'),

  // ── 다자이후
  KSPOT('k_dazaifu_sando', 'sight', '다자이후 텐만구 오모테산도', ['다자이후 참배길', '오모테산도', '太宰府天満宮 参道', 'dazaifu omotesando'],
    '太宰府天満宮 表参道', '다자이후', 33.5205, 130.5325, 0.5, 'any', ['shopping'], null, '역에서 신사까지 매화떡·기념품 거리'),
  KSPOT('k_kyuhaku', 'sight', '규슈국립박물관', ['규슈 국립박물관', '규하쿠', '九州国立博物館', 'kyushu national museum'],
    '九州国立博物館', '다자이후', 33.5185, 130.5380, 1.5, 'any', [], null, '무지개 에스컬레이터 터널로 이어진 박물관'),
  KSPOT('k_komyozenji', 'sight', '고묘젠지 (이끼 정원)', ['고묘젠지', '광명선사', '光明禅寺', 'komyozenji'],
    '光明禅寺', '다자이후', 33.5190, 130.5362, 0.5, 'any', [], null, '돌·이끼 가레산스이 정원. 가을 단풍'),
  KSPOT('k_dazaifu_yuenchi', 'sight', '다자이후 유원지', ['다자이후 놀이공원', '太宰府遊園地', 'dazaifu amusement park'],
    '太宰府遊園地', '다자이후', 33.5225, 130.5378, 2, 'any', [], null, '텐만구 옆 작은 놀이공원. 아이 동반'),
  KSPOT('k_tenkai_inari', 'sight', '덴카이 이나리 신사', ['덴카이 이나리', '天開稲荷社', 'tenkai inari'],
    '天開稲荷社', '다자이후', 33.5235, 130.5370, 0.5, 'any', [], null, '텐만구 뒤 산길 붉은 도리이 신사'),
  KSPOT('k_kanzeonji', 'sight', '간제온지 · 가이단인', ['간제온지', '관세음사', '観世音寺', 'kanzeonji'],
    '観世音寺', '다자이후', 33.5157, 130.5175, 0.5, 'any', [], null, '일본 최고(最古) 범종이 있는 조용한 사찰'),
  KSPOT('k_kasanoya', 'food', '카사노야 (우메가에모치)', ['카사노야', '매화떡', '우메가에모치', 'かさの家', 'kasanoya'],
    'かさの家', '다자이후', 33.5208, 130.5333, 0.5, 'any', ['dessert', 'cafe'], [150, 1000], '참배길 대표 매화떡 노포 + 찻집'),
  KSPOT('k_yasutake', 'food', '야스타케 본점 (우메가에모치)', ['야스타케', 'やす武', 'yasutake'],
    'やす武 本店', '다자이후', 33.5206, 130.5328, 0.3, 'any', ['dessert'], [150, 500], '홋카이도산 팥 매화떡'),
  KSPOT('k_tenzan', 'food', '텐잔 (매화 과자·찻집)', ['텐잔', '天山', 'tenzan dazaifu'],
    '天山 太宰府', '다자이후', 33.5210, 130.5338, 0.3, 'any', ['dessert', 'cafe'], [150, 800], '매화떡과 매실 절임, 안쪽 차 공간'),
  KSPOT('k_yamaya_base', 'food', '야마야 베이스 다자이후 (명란 프렌치토스트)', ['야마야 베이스', '명란 프렌치토스트', 'YAMAYA BASE DAZAIFU'],
    'YAMAYA BASE DAZAIFU', '다자이후', 33.5202, 130.5318, 0.5, 'any', ['cafe', 'seafood'], [500, 1500], '명란 가게의 먹거리 매장'),
  KSPOT('k_ichiran_dazaifu', 'food', '이치란 다자이후 참배길점 (합격 라멘)', ['이치란 다자이후', '합격 라멘', '一蘭 太宰府参道店', 'ichiran dazaifu'],
    '一蘭 太宰府参道店', '다자이후', 33.5203, 130.5315, 1, 'any', ['ramen'], [1000, 1600], '오각형 그릇·면의 합격 기원 한정 메뉴'),
);

// 새로 넣은 곳의 예약·줄서기 정보
if (typeof RESERVATIONS !== 'undefined') {
  RESERVATIONS.tokyo.k_teamlab_borderless = { level: 'required', why: '날짜·시간 지정 티켓. 주말·연휴는 미리 매진',
    url: 'https://www.teamlab.art/e/borderless-azabudai/', urlLabel: '팀랩 보더리스 공식' };
  RESERVATIONS.tokyo.k_kirby_cafe = { level: 'required', why: '예약제 (한 달 전 오픈). 빈자리가 있을 때만 당일 입장',
    url: 'https://kirbycafe.jp/', urlLabel: '커비 카페 공식' };
  RESERVATIONS.tokyo.k_pokemon_dx = { level: 'recommended', why: '포켓몬 센터는 자유 입장, 포켓몬 카페는 31일 전 18시 예약 오픈 후 금방 매진',
    url: 'https://www.pokemon-cafe.jp/ko/cafe/reservation.html', urlLabel: '포켓몬 카페 예약 (한국어)' };
  RESERVATIONS.tokyo.k_ukai_tofuya = { level: 'required', why: '코스 요리라 예약 없이는 거의 못 들어가요', url: null, urlLabel: null };
  RESERVATIONS.tokyo.k_imahan = { level: 'recommended', why: '저녁 스키야키 코스는 예약 추천', url: null, urlLabel: null };
  RESERVATIONS.tokyo.k_gonpachi = { level: 'recommended', why: '저녁엔 외국인 손님이 많아 예약 추천', url: null, urlLabel: null };
  RESERVATIONS.tokyo.k_innshotei = { level: 'recommended', why: '점심 도시락 좌석 예약 가능. 주말은 예약 추천', url: null, urlLabel: null };
  RESERVATIONS.tokyo.k_sushidai = { level: 'queue', why: '예약 불가, 새벽부터 몇 시간 줄 서기', url: null, urlLabel: null };
  RESERVATIONS.tokyo.k_daiwa_sushi = { level: 'queue', why: '예약 불가, 아침 일찍 줄 서기', url: null, urlLabel: null };
  RESERVATIONS.tokyo.k_midori_shibuya = { level: 'queue', why: '예약 불가, 번호표 발권 · 오픈 직후 추천', url: null, urlLabel: null };
  RESERVATIONS.tokyo.k_starbucks_roastery = { level: 'queue', why: '주말·벚꽃철엔 입장 대기 (번호표)', url: null, urlLabel: null };
  RESERVATIONS.tokyo.k_bills_omotesando = { level: 'queue', why: '주말 브런치는 대기가 길어요 · 오픈 직후 추천', url: null, urlLabel: null };
  RESERVATIONS.tokyo.k_ramen_street = { level: 'queue', why: '인기 가게(로쿠린샤 등)는 식사 시간 줄 서기', url: null, urlLabel: null };
  RESERVATIONS.tokyo.k_menya_musashi = { level: 'queue', why: '예약 불가, 식사 시간엔 줄 서기', url: null, urlLabel: null };
  RESERVATIONS.tokyo.k_mutekiya = { level: 'queue', why: '예약 불가, 줄 서기 · 오후 늦게가 한산', url: null, urlLabel: null };
  RESERVATIONS.tokyo.k_daikokuya = { level: 'queue', why: '예약 불가, 점심 줄 서기', url: null, urlLabel: null };

  RESERVATIONS.osaka.k_legoland_osaka = { level: 'recommended', why: '온라인 날짜 지정권이 현장보다 싸요. 어른만은 입장 불가',
    url: 'https://www.legolanddiscoverycenter.com/osaka/', urlLabel: '레고랜드 디스커버리 센터 오사카 공식' };
  RESERVATIONS.osaka.k_kitahama_retro = { level: 'queue', why: '예약 불가, 주말은 대기 길어요', url: null, urlLabel: null };
  RESERVATIONS.osaka.k_kiji = { level: 'queue', why: '예약 불가, 좁은 가게라 줄 서기', url: null, urlLabel: null };
  RESERVATIONS.osaka.k_hagakure = { level: 'queue', why: '예약 불가, 점심 줄 서기', url: null, urlLabel: null };
  RESERVATIONS.osaka.k_yaekatsu = { level: 'queue', why: '예약 불가, 줄 서기', url: null, urlLabel: null };
  RESERVATIONS.osaka.k_hokkyokusei = { level: 'queue', why: '저녁·주말 대기 있음', url: null, urlLabel: null };

  RESERVATIONS.sapporo.k_matale = { level: 'queue', why: '예약 불가, 점심 대기', url: null, urlLabel: null };

  RESERVATIONS.fukuoka.k_seala = { level: 'recommended', why: '주말 뷔페는 예약 추천. 온라인 예약 가능',
    url: 'https://fukuokaseahawk.hiltonjapan.co.jp/restaurants/seala', urlLabel: '힐튼 후쿠오카 시호크 시아라' };
  RESERVATIONS.fukuoka.k_ivorish = { level: 'queue', why: '주말 대기 있음 · 오픈 직후 추천', url: null, urlLabel: null };
}

/*
 * 자유 입력 매칭용 카탈로그
 *   CATEGORY_WORDS : 사용자가 적는 말 → 카테고리
 *   KNOWN_SPOTS    : PLACES에 없는, 한국인이 많이 찾는 가게·장소 + 조건 요청용 후보(무한리필 등)
 *   PLACE_TAGS     : 기존 PLACES 음식점의 카테고리·1인 가격대(저녁 기준, 엔)
 *
 * KNOWN_SPOTS 필드: PLACES와 같고 aliases(검색 별칭), tags(카테고리), price([최저, 최고] 1인 엔) 추가.
 * 좌표·가격 근거: 2025~2026 공식 사이트·핫페퍼·타베로그·NAVITIME 등 검색 결과 (주소 → 대략 좌표).
 * 가격은 변동이 잦으니 참고용. 무한리필 가격은 저녁 코스 기준 [가장 싼 코스, 가장 비싼 코스].
 * CATEGORY_WORDS에는 한 글자 단어(게·회 등)를 넣지 않음: '가게'처럼 다른 말 속에 섞여 오탐이 나기 때문.
 */

const CATEGORY_WORDS = {
  yakiniku: ['야키니쿠', '야끼니꾸', '야키니꾸', '焼肉', 'yakiniku', '고기집', '고깃집', '소고기구이', '불고기', '갈비', '카루비', 'カルビ'],
  ayce: ['무한라필', '무한리플', '무한 리플', '무제한리필', '무한 제공', '뷔페식', '무한리필', '무한 리필', '무제한', '타베호다이', '다베호다이', '食べ放題', '뷔페', '부페', '바이킹', 'バイキング', 'ビュッフェ', 'all you can eat', 'buffet'],
  sushi: ['스시', '초밥', '스시집', '寿司', '鮨', 'すし', 'sushi', '오마카세'],
  kaitenzushi: ['회전초밥', '회전 초밥', '회전스시', '回転寿司', 'kaitenzushi', '스시로', '구라스시', '쿠라스시', '하마스시'],
  ramen: ['라멘', '라면', '라멘집', 'ラーメン', 'らーめん', 'ramen', '츠케멘', '쓰케멘', 'つけ麺', '돈코츠', '미소라멘'],
  gyukatsu: ['규카츠', '규카쓰', '규까스', '규카스', '牛かつ', 'gyukatsu', '소고기 카츠'],
  tonkatsu: ['돈카츠', '돈까스', '돈카쓰', 'とんかつ', 'tonkatsu'],
  izakaya: ['이자카야', '선술집', '술집', '居酒屋', 'izakaya', '야키토리', '꼬치', '焼き鳥', '焼鳥', 'yakitori', '혼술', '맥주'],
  cafe: ['카페', '커피', '카훼', 'カフェ', 'cafe', 'coffee', '브런치'],
  dessert: ['디저트', '케이크', '빵', '베이커리', '파르페', '크레페', '아이스크림', '소프트크림', '스위츠', 'スイーツ', 'dessert', '치즈케이크', '과자', '오미야게'],
  seafood: ['해산물', '해물', '카이센동', '해산물덮밥', '海鮮', '海鮮丼', 'seafood', '시장', '생선'],
  udon: ['우동', 'うどん', 'udon', '소바', 'そば', 'soba'],
  okonomiyaki: ['오코노미야키', '오꼬노미야끼', 'お好み焼き', 'okonomiyaki', '몬자', '몬자야키', 'もんじゃ', '철판'],
  takoyaki: ['타코야키', '다코야키', '타코야끼', 'たこ焼き', 'takoyaki'],
  crab: ['대게', '킹크랩', '털게', '게요리', '카니', 'かに', '蟹', 'crab'],
  wagyu: ['와규', '和牛', 'wagyu', '흑모와규', '고베규', '소고기', '스테이크'],
  curry: ['카레', '커리', '스프카레', '수프카레', 'スープカレー', 'カレー', 'curry'],
  shabu: ['샤부샤부', '샤브샤브', '샤브', 'しゃぶしゃぶ', 'shabu', '스키야키', 'すき焼き', '전골', '나베', '모츠나베', 'もつ鍋'],
  jingisukan: ['징기스칸', '칭기즈칸', '양고기', 'ジンギスカン', 'jingisukan', '양갈비'],
  unagi: ['우나기', '장어', '장어덮밥', '히츠마부시', 'うなぎ', '鰻', 'unagi', '우나동'],
  kushikatsu: ['쿠시카츠', '쿠시카쓰', '꼬치튀김', '串カツ', '串かつ', 'kushikatsu'],
  hamburg: ['함박', '함박스테이크', '햄버그', 'ハンバーグ', 'hamburg'],
  shopping: ['쇼핑', '쇼핑몰', '백화점', '아울렛', '상점가', 'shopping', '기념품', '면세'],
  donki: ['돈키호테', '돈키', '돈끼', '돈키 호테', 'ドン・キホーテ', 'ドンキ', 'donki', 'don quijote', '메가돈키'],
  drugstore: ['드럭스토어', '드러그스토어', '약국', '마츠키요', '마쓰모토키요시', 'ドラッグストア', 'drugstore', '화장품', '동전파스', '곤약젤리'],
  sento_onsen: ['온천', '대중목욕탕', '목욕탕', '센토', '사우나', '스파', '료칸 온천', '温泉', '銭湯', 'onsen', 'sento', 'spa', '찜질방'],
  character: ['포켓몬센터', '포켓몬 센터', '포켓몬', '캐릭터샵', '캐릭터', '닌텐도', '산리오', '지브리', '애니', '굿즈', 'ポケモンセンター', 'pokemon center', 'character'],
  view: ['전망대', '야경', '전망', '스카이', '展望台', '夜景', 'view', 'observatory', '타워'],
};

// P()와 같은 모양 + aliases/tags/price
function KSPOT(id, t, name, aliases, q, area, lat, lng, h, slot, tags, price, desc) {
  return { id, t, name, aliases, q, area, lat, lng, h, slot, tags, price, desc };
}

const KNOWN_SPOTS = {
  tokyo: [
    // 인기 맛집
    KSPOT('k_ichinisan', 'food', '규카츠 이치니산 (아키하바라)', ['이치니산', '규카츠 이치니산', '규카츠이치니산', '이치니상', '규카츠 이치니상', '牛かつ壱弐参', '壱弐参', 'ichinisan', 'gyukatsu ichinisan'],
      '牛かつ壱弐参', '아키하바라', 35.7019, 139.7710, 1, 'any', ['gyukatsu'], [1500, 3000], '화로에 구워 먹는 규카츠. 지하 매장, 줄 서는 곳'),
    KSPOT('k_tsujihan', 'food', '츠지한 (카이센동)', ['츠지한', '쓰지한', '츠지항', '츠지한 카이센동', 'つじ半', '日本橋海鮮丼 つじ半', 'tsujihan'],
      'つじ半 日本橋本店', '니혼바시', 35.6816, 139.7727, 1, 'any', ['seafood'], [1500, 3500], '해산물을 쌓은 제이타쿠동 + 도미 육수 오차즈케. 대기 필수'),
    KSPOT('k_unatoto', 'food', '우나토토 우에노 (가성비 장어덮밥)', ['우나토토', '우나 토토', '우나토토 우에노', '宇奈とと', 'unatoto'],
      '名代 宇奈とと 上野店', '우에노', 35.7094, 139.7747, 1, 'any', ['unagi'], [800, 2500], '1,000엔대 장어덮밥. JR 고가 밑'),
    KSPOT('k_kagari', 'food', '긴자 카가리 (토리파이탄 라멘)', ['카가리', '긴자 카가리', '긴자카가리', '篝', '銀座 篝', 'kagari', 'ginza kagari'],
      '銀座 篝 本店', '긴자', 35.6700, 139.7612, 1, 'any', ['ramen'], [1200, 2000], '진한 닭 백탕 소바. 긴자 뒷골목 본점'),
    KSPOT('k_sushizanmai', 'food', '스시잔마이 츠키지 본점', ['스시잔마이', '스시 잔마이', '스시잔마이 본점', 'すしざんまい', 'sushizanmai', 'sushi zanmai'],
      'すしざんまい 本店', '츠키지', 35.6655, 139.7707, 1, 'any', ['sushi'], [2500, 5000], '24시간 영업 초밥 체인 본점. 츠키지 장외시장 옆'),
    KSPOT('k_fuunji', 'food', '후운지 (츠케멘)', ['후운지', '후우운지', '風雲児', 'fuunji', '후운지 츠케멘'],
      '風雲児', '신주쿠', 35.6862, 139.6981, 1, 'any', ['ramen'], [1000, 1600], '진한 닭·어패 츠케멘. 신주쿠역 남쪽 도보권, 늘 줄'),

    // 무한리필 야키니쿠
    KSPOT('k_gyukaku_kabukicho', 'food', '규카쿠 신주쿠 가부키초점 (야키니쿠 무한리필)', ['규카쿠', '규카쿠 신주쿠', '규가쿠', '牛角', '牛角 新宿歌舞伎町店', 'gyukaku', 'gyu-kaku'],
      '牛角 新宿歌舞伎町店', '신주쿠', 35.6951, 139.7010, 1.5, 'night', ['yakiniku', 'ayce'], [3058, 6578], '90분 타베호다이 코스 3,058엔~6,578엔. 세이부신주쿠역 1분, 지하'),
    KSPOT('k_king_shinjuku', 'food', '야키니쿠킹 신주쿠 니시구치 오가드점 (무한리필)', ['야키니쿠킹', '야끼니꾸킹', '야키니쿠 킹', '焼肉きんぐ', 'yakiniku king'],
      '焼肉きんぐ 新宿西口大ガード店', '신주쿠', 35.6935, 139.6992, 1.5, 'night', ['yakiniku', 'ayce'], [3498, 5038], '100분 테이블 오더 뷔페 (58품·킹·프리미엄 코스). 2025년 6월 개점, 11~24시'),
    KSPOT('k_anan_dogenzaka', 'food', '시치린 야키니쿠 안안 시부야 도겐자카점 (무한리필)', ['안안', '안안 야키니쿠', '安安', '七輪焼肉 安安', 'anan'],
      '七輪焼肉 安安 渋谷道玄坂店', '시부야', 35.6580, 139.6973, 1.5, 'night', ['yakiniku', 'ayce'], [2838, 4268], '저가 칠륜 숯불 야키니쿠. 100분 타베호다이 2,838엔~ (음료 포함 4,268엔)'),

    // 무한리필 샤부샤부·스시
    KSPOT('k_shabuyo_shibuya', 'food', '샤부요 시부야 에키마에점 (샤부샤부 무한리필)', ['샤부요', '샤브요', '샤부하', 'しゃぶ葉', 'shabuyo', 'shabu-yo'],
      'しゃぶ葉 渋谷駅前店', '시부야', 35.6586, 139.6989, 1.5, 'any', ['shabu', 'ayce'], [2400, 4000], '스카이락 계열 샤부샤부 뷔페. 채소·소스 바 무제한'),
    KSPOT('k_hinasushi', 'food', '히나즈시 신주쿠 마루이 아넥스 (스시 무한리필)', ['히나즈시', '히나스시', '雛鮨', 'hinasushi', 'hina sushi', '스시 무한리필'],
      '雛鮨 新宿マルイ アネックス', '신주쿠', 35.6910, 139.7045, 2, 'any', ['sushi', 'ayce'], [4500, 8000], '장인이 쥐어 주는 고급 스시 타베호다이 (약 60종). 신주쿠산초메 C4 출구'),

    // 쇼핑·캐릭터
    KSPOT('k_donki_kabukicho', 'sight', '돈키호테 신주쿠 가부키초점', ['돈키호테 신주쿠', '돈키 신주쿠', '돈키호테 가부키초', 'ドン・キホーテ 新宿歌舞伎町店', 'don quijote shinjuku'],
      'ドン・キホーテ 新宿歌舞伎町店', '신주쿠', 35.6942, 139.7027, 1, 'night', ['donki', 'shopping', 'drugstore'], [0, 0], '24시간 면세 쇼핑. 과자·화장품·의약품 한 번에'),
    KSPOT('k_megadonki_shibuya', 'sight', 'MEGA 돈키호테 시부야 본점', ['메가돈키', '메가 돈키호테', '돈키호테 시부야', '돈키 시부야', 'MEGAドン・キホーテ渋谷本店', 'mega don quijote shibuya'],
      'MEGAドン・キホーテ渋谷本店', '시부야', 35.6608, 139.6975, 1, 'night', ['donki', 'shopping', 'drugstore'], [0, 0], '도쿄 최대급 돈키. 24시간'),
    KSPOT('k_pokemon_shibuya', 'sight', '포켓몬센터 시부야 · 닌텐도 도쿄 (시부야 파르코)', ['포켓몬센터 시부야', '포켓몬센터', '닌텐도 도쿄', '닌텐도도쿄', 'ポケモンセンターシブヤ', 'Nintendo TOKYO', 'pokemon center shibuya'],
      'ポケモンセンターシブヤ', '시부야', 35.6621, 139.6988, 1, 'any', ['character', 'shopping'], [0, 0], '시부야 파르코 6층. 같은 층에 닌텐도 도쿄'),
    KSPOT('k_pokemon_megatokyo', 'sight', '포켓몬센터 메가도쿄 (이케부쿠로)', ['포켓몬센터 메가도쿄', '메가도쿄', '포켓몬센터 이케부쿠로', 'ポケモンセンターメガトウキョー', 'pokemon center mega tokyo'],
      'ポケモンセンターメガトウキョー', '이케부쿠로', 35.7295, 139.7196, 1, 'any', ['character', 'shopping'], [0, 0], '선샤인시티 알파 2층. 도쿄 최대 포켓몬센터'),

    // 전망·온천
    KSPOT('k_tocho', 'sight', '도쿄도청 전망실 (무료)', ['도쿄도청', '도청 전망대', '도쿄도청 전망대', '東京都庁 展望室', 'tokyo metropolitan government building'],
      '東京都庁 展望室', '신주쿠', 35.6896, 139.6917, 1, 'night', ['view'], [0, 0], '무료 전망대. 맑은 날엔 후지산, 밤엔 신주쿠 야경'),
    KSPOT('k_thermaeyu', 'sight', '테르마유 신주쿠 (온천 스파)', ['테르마유', '테르마 유', '테루마유', 'テルマー湯', 'thermae-yu'],
      'テルマー湯 新宿', '신주쿠', 35.6953, 139.7031, 2, 'night', ['sento_onsen'], [2600, 4000], '가부키초의 천연온천 스파. 심야까지 영업'),
    KSPOT('k_laqua', 'sight', '스파 라쿠아 (도쿄돔시티)', ['라쿠아', '스파 라쿠아', '스파라쿠아', 'スパ ラクーア', 'laqua'],
      'スパ ラクーア', '스이도바시', 35.7056, 139.7536, 2.5, 'any', ['sento_onsen'], [3200, 4500], '도쿄돔시티 안 천연온천·사우나 시설'),
  ],

  osaka: [
    // 인기 맛집
    KSPOT('k_motomura_namba', 'food', '규카츠 모토무라 난바점', ['모토무라 난바', '규카츠 모토무라 난바', '모토무라 오사카', '牛かつもと村 難波店', 'motomura namba'],
      '牛かつもと村 難波店', '난바', 34.6650, 135.5025, 1, 'any', ['gyukatsu'], [1600, 3000], '돌판에 구워 먹는 규카츠. 난바 지하 매장, 대기 있음'),
    KSPOT('k_harukoma', 'food', '하루코마 스시 본점 (텐진바시스지)', ['하루코마', '하루코마 스시', '하루코마스시', '春駒', 'harukoma'],
      '春駒 本店', '텐진바시스지', 34.7058, 135.5113, 1, 'any', ['sushi'], [2000, 4500], '두툼한 네타의 가성비 스시. 일본 최장 상점가 안, 화요일 휴무'),
    KSPOT('k_acchichi', 'food', '앗치치혼포 도톤보리점 (타코야키)', ['앗치치', '앗치치혼포', '앗치치 혼포', '아치치', 'あっちち本舗', 'acchichi'],
      'あっちち本舗 道頓堀店', '난바', 34.6696, 135.5035, 0.5, 'any', ['takoyaki'], [600, 1200], '겉바속촉 타코야키. 에비스바시 옆 강가'),
    KSPOT('k_kinryu', 'food', '킨류 라멘 도톤보리점', ['킨류', '킨류라멘', '킨류 라멘', '용라멘', '金龍ラーメン', 'kinryu ramen'],
      '金龍ラーメン 道頓堀店', '난바', 34.6686, 135.5040, 0.5, 'night', ['ramen'], [800, 1200], '거대한 용 간판. 김치·마늘 무제한, 24시간'),
    KSPOT('k_ajinoya', 'food', '아지노야 (오코노미야키)', ['아지노야', '아지노 야', '味乃家', 'ajinoya'],
      '味乃家', '난바', 34.6675, 135.5020, 1, 'any', ['okonomiyaki'], [1500, 3000], '미슐랭 빕구르망 단골 오코노미야키. 난바 센니치마에'),
    KSPOT('k_rikuro', 'food', '리쿠로 오지상 치즈케이크 난바 본점', ['리쿠로', '리쿠로오지상', '리쿠로 오지상', '리쿠로 치즈케이크', 'りくろーおじさん', 'rikuro'],
      'りくろーおじさんの店 なんば本店', '난바', 34.6654, 135.5017, 0.5, 'any', ['dessert'], [1000, 1500], '갓 구운 흔들리는 치즈케이크'),
    KSPOT('k_ebisu_umeda', 'food', '에비스 우메다점 (스시·해산물 무한리필)', ['에비스 우메다', '스시 무한리필 우메다', 'ゑびす 梅田店', 'ebisu umeda'],
      'ゑびす 梅田店', '우메다', 34.7030, 135.5000, 2, 'night', ['sushi', 'seafood', 'ayce'], [3000, 5000], '고기스시·해산물 스시 최대 180품 타베호다이'),

    // 무한리필 야키니쿠
    KSPOT('k_gyukaku_dotonbori', 'food', '규카쿠 난바 도톤보리 에비스바시점 (야키니쿠 무한리필)', ['규카쿠 도톤보리', '규카쿠 난바', '규카쿠', '牛角 なんば道頓堀えびす橋店', 'gyukaku dotonbori'],
      '牛角 なんば道頓堀えびす橋店', '난바', 34.6689, 135.5015, 1.5, 'night', ['yakiniku', 'ayce'], [3718, 6578], '지하~6층 전부 규카쿠. 90분 타베호다이 70품 3,718엔~흑모와규 6,578엔'),
    KSPOT('k_king_namba', 'food', '야키니쿠킹 난바 HIPS점 (무한리필)', ['야키니쿠킹', '야키니쿠킹 난바', '야끼니꾸킹', '焼肉きんぐ namBaHIPS店', 'yakiniku king namba'],
      '焼肉きんぐ namBaHIPS店', '난바', 34.6677, 135.5022, 1.5, 'night', ['yakiniku', 'ayce'], [3498, 5038], '2026년 2월 개점. 100분 58품 3,498엔 · 킹 3,938엔 · 프리미엄 5,038엔'),

    // 무한리필 샤부샤부
    KSPOT('k_shabuyo_shinsaibashi', 'food', '샤부요 신사이바시 파르코점 (샤부샤부 무한리필)', ['샤부요', '샤브요', '샤부요 신사이바시', 'しゃぶ葉 心斎橋パルコ店', 'shabuyo'],
      'しゃぶ葉 心斎橋パルコ店', '신사이바시', 34.6740, 135.5010, 1.5, 'any', ['shabu', 'ayce'], [2400, 4000], '신사이바시 파르코 13층 샤부샤부 뷔페'),

    // 쇼핑·캐릭터
    KSPOT('k_donki_dotonbori', 'sight', '돈키호테 도톤보리점 (관람차)', ['돈키호테 도톤보리', '돈키 도톤보리', '돈키호테 오사카', '돈키 관람차', '에비스타워', 'ドン・キホーテ 道頓堀店', 'don quijote dotonbori'],
      'ドン・キホーテ 道頓堀店', '난바', 34.6692, 135.5033, 1, 'night', ['donki', 'shopping', 'drugstore'], [0, 0], '24시간 면세 쇼핑 + 에비스 타워 관람차'),
    KSPOT('k_pokemon_osaka', 'sight', '포켓몬센터 오사카 DX · 포켓몬 카페 (다이마루 신사이바시)', ['포켓몬센터 오사카', '포켓몬센터', '포켓몬카페', '포켓몬 카페', 'ポケモンセンターオーサカDX', 'pokemon center osaka'],
      'ポケモンセンターオーサカDX', '신사이바시', 34.6735, 135.5011, 1, 'any', ['character', 'shopping'], [0, 0], '다이마루 신사이바시 본관 9층. 카페는 예약제'),
    KSPOT('k_shinsaibashisuji', 'sight', '신사이바시스지 상점가 (드럭스토어 거리)', ['신사이바시스지', '신사이바시 상점가', '드럭스토어 오사카', '心斎橋筋商店街', 'shinsaibashi shopping street'],
      '心斎橋筋商店街', '신사이바시', 34.6727, 135.5012, 1.5, 'any', ['shopping', 'drugstore'], [0, 0], '지붕 덮인 쇼핑 거리. 마츠키요·코코카라 등 드럭스토어 밀집'),

    // 전망·온천·명소
    KSPOT('k_harukas', 'sight', '아베노 하루카스 300 전망대', ['하루카스', '아베노하루카스', '하루카스 300', 'あべのハルカス', 'harukas 300'],
      'あべのハルカス展望台 ハルカス300', '텐노지', 34.6459, 135.5135, 1.5, 'night', ['view'], [2000, 2000], '높이 300m 전망대. 신세카이와 묶기 좋음'),
    KSPOT('k_spaworld', 'sight', '스파월드 (신세카이 온천 테마파크)', ['스파월드', '스파 월드', 'スパワールド', 'spa world'],
      'スパワールド 世界の大温泉', '신세카이', 34.6503, 135.5054, 3, 'any', ['sento_onsen'], [1500, 2500], '세계 각국 테마 온천 + 수영장. 츠텐카쿠 바로 옆'),
    KSPOT('k_nambayasaka', 'sight', '난바 야사카 신사 (사자 머리 신전)', ['난바야사카', '난바 야사카', '야사카 신사 오사카', '사자머리 신사', '難波八阪神社', 'namba yasaka'],
      '難波八阪神社', '난바', 34.6618, 135.4973, 0.5, 'am', ['view'], [0, 0], '거대한 사자 머리 무대. 사진 명소'),
  ],

  sapporo: [
    // 인기 맛집
    KSPOT('k_okushiba', 'food', '스프카레 오쿠시바쇼텐 짓카점 (오도리)', ['오쿠시바', '오쿠시바쇼텐', '오쿠시바 쇼텐', '오쿠시바상점', '奥芝商店', 'okushiba'],
      'スープカレー 奥芝商店 実家', '오도리', 43.0590, 141.3497, 1, 'any', ['curry'], [1500, 2500], '새우 육수 스프카레 원조. 오도리 공원 남쪽'),
    KSPOT('k_shingen', 'food', '라멘 신겐 미나미6조점', ['신겐', '라멘 신겐', '라멘신겐', '신겐 라멘', '信玄', 'らーめん信玄', 'shingen'],
      'らーめん信玄 南6条店', '스스키노', 43.0515, 141.3452, 1, 'night', ['ramen'], [900, 1400], '진한 미소라멘. 스스키노 서쪽, 저녁 줄 김'),
    KSPOT('k_ichigen', 'food', '에비소바 이치겐 총본점', ['이치겐', '에비소바', '에비소바 이치겐', '에비 라멘', '새우라멘', 'えびそば一幻', 'ichigen', 'ebisoba'],
      'えびそば一幻 総本店', '스스키노', 43.0505, 141.3440, 1, 'night', ['ramen'], [900, 1400], '새우 머리로 우린 국물 라멘. 새벽까지 영업'),
    KSPOT('k_ramenyokocho', 'food', '원조 삿포로 라멘 요코초', ['라멘요코초', '라멘 요코초', '라멘골목', '라멘 골목', '元祖さっぽろラーメン横丁', 'ramen yokocho'],
      '元祖さっぽろラーメン横丁', '스스키노', 43.0548, 141.3540, 1, 'night', ['ramen'], [900, 1500], '좁은 골목에 라멘집 10여 곳'),
    KSPOT('k_morihiko', 'food', '모리히코 본점 (카페)', ['모리히코', '모리히코 커피', '森彦', 'morihiko'],
      '森彦', '마루야마', 43.0555, 141.3175, 1, 'am', ['cafe'], [800, 1500], '담쟁이 덮인 목조 민가 카페. 마루야마 공원과 묶기'),

    // 무한리필
    KSPOT('k_gyukaku_susukino', 'food', '규카쿠 스스키노점 (야키니쿠 무한리필)', ['규카쿠 스스키노', '규카쿠 삿포로', '규카쿠', '牛角 すすきの店', 'gyukaku susukino'],
      '牛角 すすきの店', '스스키노', 43.0565, 141.3545, 1.5, 'night', ['yakiniku', 'ayce'], [3058, 6578], '타베호다이 코스 (70품+2시간 음료 5,000엔 등). 17시~'),
    KSPOT('k_susukino_jingisukan5', 'food', '스스키노 징기스칸 5조점 (징기스칸 무한리필)', ['징기스칸 무한리필', '스스키노 징기스칸', '징기스칸 5조', 'すすきの ジンギスカン 5条店'],
      'すすきの ジンギスカン 5条店', '스스키노', 43.0540, 141.3475, 1.5, 'night', ['jingisukan', 'yakiniku', 'ayce'], [3900, 6000], '생 양고기 징기스칸 90분 먹고 마시기 무제한 3,900엔~'),
    KSPOT('k_beergarden', 'food', '삿포로 맥주원 (징기스칸 무한리필)', ['삿포로 맥주원', '맥주원', '삿포로 비어가든', '비어가든', 'サッポロビール園', 'sapporo beer garden'],
      'サッポロビール園', '히가시쿠', 43.0716, 141.3690, 1.5, 'night', ['jingisukan', 'yakiniku', 'ayce'], [4000, 6500], '붉은 벽돌 건물에서 징기스칸 + 생맥주 타베·노미호다이. 맥주 박물관 옆'),
    KSPOT('k_kaniza', 'food', '카니 타베호다이 카니자 (게 무한리필)', ['카니자', '게 무한리필', '대게 무한리필', 'かに食べ放題 蟹座', 'kaniza'],
      'かに食べ放題 蟹座 札幌', '스스키노', 43.0570, 141.3565, 2, 'night', ['crab', 'ayce', 'shabu'], [8000, 11000], '게 + 규탕·와규 샤부샤부 타베호다이 (인기 코스 음료 포함 10,800엔)'),

    // 쇼핑·캐릭터·전망
    KSPOT('k_donki_tanukikoji', 'sight', '돈키호테 삿포로 다누키코지점', ['돈키호테 삿포로', '돈키 삿포로', '돈키호테 다누키코지', 'ドン・キホーテ 札幌狸小路本店', 'don quijote sapporo'],
      'ドン・キホーテ 札幌狸小路本店', '다누키코지', 43.0570, 141.3505, 1, 'night', ['donki', 'shopping', 'drugstore'], [0, 0], '다누키코지 상점가 안 24시간 돈키'),
    KSPOT('k_tanukikoji', 'sight', '다누키코지 상점가', ['다누키코지', '타누키코지', '狸小路', 'tanukikoji'],
      '狸小路商店街', '다누키코지', 43.0572, 141.3520, 1.5, 'any', ['shopping', 'drugstore'], [0, 0], '지붕 덮인 1km 상점가. 드럭스토어·기념품·맛집'),
    KSPOT('k_pokemon_sapporo', 'sight', '포켓몬센터 삿포로 (다이마루 8층)', ['포켓몬센터 삿포로', '포켓몬센터', 'ポケモンセンターサッポロ', 'pokemon center sapporo'],
      'ポケモンセンターサッポロ', '삿포로역', 43.0680, 141.3495, 1, 'any', ['character', 'shopping'], [0, 0], '다이마루 삿포로점 8층. 삿포로역 남쪽 출구 2분'),
    KSPOT('k_t38', 'sight', 'JR타워 전망실 T38', ['T38', 'JR타워 전망대', 'JR 타워 전망대', 'JRタワー展望室', 'jr tower observatory'],
      'JRタワー展望室 T38', '삿포로역', 43.0683, 141.3500, 1, 'night', ['view'], [1000, 1000], '삿포로역 위 160m 전망실. 야경 추천'),
  ],

  fukuoka: [
    // 인기 맛집
    KSPOT('k_udontaira', 'food', '우동 타이라 (고보텐 우동)', ['타이라', '우동 타이라', '우동타이라', '다이라 우동', 'うどん平', 'udon taira'],
      'うどん平', '하카타', 33.5870, 130.4150, 0.7, 'am', ['udon'], [500, 1000], '고기+우엉튀김 우동. 점심만, 현지인 줄'),
    KSPOT('k_ippudo', 'food', '잇푸도 다이묘 본점', ['잇푸도', '잇뿌도', '잇푸도 본점', '一風堂', '一風堂 大名本店', 'ippudo'],
      '一風堂 大名本店', '텐진', 33.5895, 130.3935, 1, 'any', ['ramen'], [900, 1500], '잇푸도 1호점. 본점 한정 메뉴'),
    KSPOT('k_daruma', 'food', '하카타 다루마 총본점 (돈코츠 라멘)', ['다루마 라멘', '하카타 다루마', '하카타다루마', '博多だるま', 'hakata daruma'],
      '博多だるま 総本店', '와타나베도리', 33.5850, 130.4020, 1, 'any', ['ramen'], [800, 1300], '진한 돈코츠 원조급. 텐진미나미 도보권'),
    KSPOT('k_hachibei', 'food', '야키토리 하치베 조닌바시도리점', ['하치베', '하치베에', '야키토리 하치베', '八兵衛', '焼とりの八兵衛', 'hachibei'],
      '焼とりの八兵衛 上人橋通り店', '야쿠인', 33.5845, 130.3970, 1.5, 'night', ['izakaya'], [3000, 5000], '후쿠오카 대표 야키토리. 저녁만, 예약 추천'),
    KSPOT('k_rakutenchi', 'food', '모츠나베 라쿠텐치 하카타에키마에점', ['라쿠텐치', '모츠나베 라쿠텐치', '楽天地', 'もつ鍋 楽天地', 'rakutenchi'],
      '元祖もつ鍋 楽天地 博多駅前店', '하카타', 33.5920, 130.4185, 1.5, 'night', ['shabu'], [2000, 3500], '가성비 모츠나베 코스. 하카타역 도보'),
    KSPOT('k_kiwamiya', 'food', '키와미야 함바그 (후쿠오카 파르코)', ['키와미야', '키와미야 함박', '키와미 야', '極味や', 'kiwamiya'],
      '極味や 福岡パルコ店', '텐진', 33.5905, 130.3990, 1, 'any', ['hamburg', 'wagyu'], [1500, 2500], '돌판에 직접 구워 먹는 함바그. 파르코 지하, 대기 김'),

    // 무한리필
    KSPOT('k_gyukaku_nakasu', 'food', '규카쿠 타베호다이 전문점 후쿠오카 나카스점 (야키니쿠 무한리필)', ['규카쿠 나카스', '규카쿠 후쿠오카', '규카쿠', '牛角食べ放題専門店 福岡中洲店', 'gyukaku nakasu'],
      '牛角食べ放題専門店 福岡中洲店', '나카스', 33.5947, 130.4065, 1.5, 'night', ['yakiniku', 'ayce'], [3058, 5400], '나카스카와바타역 직결 게이츠 1층. 타베호다이 3,058엔~ (음료 포함 5,400엔)'),
    KSPOT('k_gyukaku_tenjin', 'food', '규카쿠 텐진 니시도리점 (야키니쿠 무한리필)', ['규카쿠 텐진', '규카쿠', '牛角 天神西通り店', 'gyukaku tenjin'],
      '牛角 天神西通り店', '텐진', 33.5898, 130.3965, 1.5, 'night', ['yakiniku', 'ayce'], [3058, 6578], '텐진 니시도리 3층. 90분 타베호다이 코스'),
    KSPOT('k_shabuyo_tenjin', 'food', '샤부요 텐진 니시도리점 (샤부샤부 무한리필)', ['샤부요', '샤브요', '샤부요 텐진', 'しゃぶ葉 天神西通り店', 'shabuyo'],
      'しゃぶ葉 天神西通り店', '텐진', 33.5912, 130.3968, 1.5, 'any', ['shabu', 'ayce'], [2400, 4000], '텐진 샤부샤부 뷔페 (5층)'),

    // 쇼핑·캐릭터·명소
    KSPOT('k_donki_nakasu', 'sight', '돈키호테 나카스점', ['돈키호테 나카스', '돈키 나카스', '돈키호테 후쿠오카', '돈키 후쿠오카', 'ドン・キホーテ 中洲店', 'don quijote nakasu'],
      'ドン・キホーテ 中洲店', '나카스', 33.5947, 130.4063, 1, 'night', ['donki', 'shopping', 'drugstore'], [0, 0], '게이츠 빌딩 24시간 돈키. 야타이와 묶기 좋음'),
    KSPOT('k_pokemon_fukuoka', 'sight', '포켓몬센터 후쿠오카 (하카타 마루이)', ['포켓몬센터 후쿠오카', '포켓몬센터', 'ポケモンセンターフクオカ', 'pokemon center fukuoka'],
      'ポケモンセンターフクオカ', '하카타', 33.5898, 130.4205, 1, 'any', ['character', 'shopping'], [0, 0], '2025년 6월 하카타 마루이 2층으로 리뉴얼. 하카타역 직결'),
    KSPOT('k_tenjinchikagai', 'sight', '텐진 지하상가', ['텐진 지하상가', '텐진지하상가', '天神地下街', 'tenjin underground'],
      '天神地下街', '텐진', 33.5903, 130.3995, 1.5, 'any', ['shopping'], [0, 0], '유럽풍 지하 쇼핑가. 비 오는 날 추천'),
    KSPOT('k_starbucks_dazaifu', 'sight', '스타벅스 다자이후 오모테산도점', ['다자이후 스타벅스', '스타벅스 다자이후', '스벅 다자이후', 'スターバックス 太宰府天満宮表参道店', 'starbucks dazaifu'],
      'スターバックス 太宰府天満宮表参道店', '다자이후', 33.5199, 130.5337, 0.5, 'any', ['cafe'], [500, 1000], '구마 겐고가 설계한 나무 격자 매장'),
  ],
};

// 기존 PLACES 음식점의 카테고리·1인 가격대(저녁 기준, 엔)
const PLACE_TAGS = {
  tokyo: {
    motomura: { tags: ['gyukatsu'], price: [1600, 3000] },
    tsukiji: { tags: ['seafood', 'sushi'], price: [1500, 4000] },
    afuri: { tags: ['ramen'], price: [1100, 1800] },
    maisen: { tags: ['tonkatsu'], price: [1800, 4000] },
    monja: { tags: ['okonomiyaki'], price: [1500, 3000] },
    sushiro: { tags: ['sushi', 'kaitenzushi'], price: [1000, 3000] },
    ichiran_t: { tags: ['ramen'], price: [1000, 1600] },
    yurakucho: { tags: ['izakaya'], price: [2500, 4500] },
    ginzasushi: { tags: ['sushi'], price: [4000, 15000] },
    crepe: { tags: ['dessert'], price: [500, 1000] },
  },
  osaka: {
    kuromon: { tags: ['seafood', 'crab', 'wagyu'], price: [1500, 5000] },
    kushikatsu: { tags: ['kushikatsu', 'izakaya'], price: [2000, 3500] },
    '551': { tags: ['dessert'], price: [500, 1200] },
    takoyaki: { tags: ['takoyaki'], price: [600, 1200] },
    mizuno: { tags: ['okonomiyaki'], price: [1500, 3000] },
    genroku: { tags: ['sushi', 'kaitenzushi'], price: [1000, 2500] },
    kani: { tags: ['crab', 'seafood'], price: [5000, 12000] },
    ichiran_o: { tags: ['ramen'], price: [1000, 1600] },
    tsuruhashi: { tags: ['yakiniku'], price: [3000, 6000] },
  },
  sapporo: {
    jingisukan: { tags: ['jingisukan', 'yakiniku'], price: [2500, 4500] },
    garaku: { tags: ['curry'], price: [1500, 2500] },
    suage: { tags: ['curry'], price: [1500, 2500] },
    sumire: { tags: ['ramen'], price: [1000, 1600] },
    nijo: { tags: ['seafood', 'crab'], price: [2000, 5000] },
    toriton: { tags: ['sushi', 'kaitenzushi'], price: [2000, 4000] },
    hanamaru: { tags: ['sushi', 'kaitenzushi'], price: [2000, 4000] },
    kanihonke: { tags: ['crab', 'seafood'], price: [6000, 15000] },
    rokkatei: { tags: ['dessert', 'cafe'], price: [500, 1500] },
    letao: { tags: ['dessert', 'cafe'], price: [500, 1500] },
  },
  fukuoka: {
    ichiran_f: { tags: ['ramen'], price: [1000, 1600] },
    shinshin: { tags: ['ramen'], price: [800, 1300] },
    ikkousha: { tags: ['ramen'], price: [800, 1300] },
    motsunabe: { tags: ['shabu'], price: [2500, 4500] },
    mentaiju: { tags: ['seafood'], price: [2000, 3500] },
    hyotan: { tags: ['sushi'], price: [2000, 4000] },
    makino: { tags: ['udon'], price: [500, 1000] },
    horumon: { tags: ['yakiniku'], price: [1200, 2500] },
    unagi: { tags: ['unagi'], price: [4500, 6500] },
    kakigoya: { tags: ['seafood'], price: [2000, 4000] },
  },
};

/*
 * 도시·장소 데이터
 * 근거: research/japan-travel-research.md (리뷰 평점 경향 + 한국 여행 커뮤니티 추천 빈도 종합)
 *
 * 장소 필드
 *   t     : 'sight' 관광 | 'food' 음식 | 'stay' 숙소
 *   q     : 구글 지도 검색어 (현지 표기)
 *   lat/lng: 대략적인 좌표 (동선 계산용)
 *   h     : 머무는 시간(시간)
 *   slot  : 'am' 오전 추천 | 'pm' 오후 | 'night' 저녁·야경 | 'any'
 *   full  : true면 하루를 통째로 쓰는 곳 (테마파크·근교 당일치기)
 *   ages  : 추천 연령대 ('1'=10대 '2'=20대 '3'=30대 '4'=40대)
 *   with  : 추천 동반유형 ('s'=혼자 'f'=친구 'a'=가족)
 */

const AIRPORTS = {
  tokyo: [
    { code: 'HND', name: '하네다 공항', transfer: 40 },
    { code: 'NRT', name: '나리타 공항', transfer: 80 },
  ],
  osaka: [
    { code: 'KIX', name: '간사이 공항', transfer: 60 },
    { code: 'ITM', name: '이타미 공항', transfer: 30 },
  ],
  sapporo: [{ code: 'CTS', name: '신치토세 공항', transfer: 50 }],
  fukuoka: [{ code: 'FUK', name: '후쿠오카 공항', transfer: 20 }],
};

const CITIES = {
  tokyo: {
    name: '도쿄', jp: '東京', en: 'TOKYO', line: 'tokyo',
    center: [35.6812, 139.7671],
    blurb: '쇼핑·트렌드·디즈니. 한국인 관심도 1위',
    share: '한국인 방문 비중 약 21%',
  },
  osaka: {
    name: '오사카', jp: '大阪', en: 'OSAKA', line: 'osaka',
    center: [34.6664, 135.501],
    blurb: '먹거리 + USJ + 교토·나라 당일치기',
    share: '한국인 방문 비중 약 29% · 1위',
  },
  sapporo: {
    name: '삿포로', jp: '札幌', en: 'SAPPORO', line: 'sapporo',
    center: [43.0687, 141.3508],
    blurb: '겨울 눈축제·스키, 여름 라벤더와 온천',
    share: '계절 따라 수요가 크게 달라져요',
  },
  fukuoka: {
    name: '후쿠오카', jp: '福岡', en: 'FUKUOKA', line: 'fukuoka',
    center: [33.5897, 130.4207],
    blurb: '비행 1시간대, 야타이·라멘·온천 근교',
    share: '한국인 방문 비중 약 24% · 2위',
  },
};

// P(id, t, 이름, 검색어, 지역, lat, lng, h, slot, full, ages, with, 설명)
function P(id, t, name, q, area, lat, lng, h, slot, full, ages, withs, desc) {
  return { id, t, name, q, area, lat, lng, h, slot, full, ages, with: withs, desc };
}

const PLACES = {
  tokyo: [
    // 관광
    P('shibuyasky', 'sight', '시부야 스카이', 'SHIBUYA SKY', '시부야', 35.6585, 139.7022, 1.5, 'night', false, '1234', 'sfa', '도쿄 최고 인기 야경 전망대. 일몰 시간대는 미리 예약'),
    P('sensoji', 'sight', '아사쿠사 센소지 · 나카미세 거리', '浅草寺', '아사쿠사', 35.7148, 139.7967, 2, 'am', false, '1234', 'sfa', '첫 도쿄 여행 필수. 기모노 체험도 여기서'),
    P('teamlab', 'sight', '팀랩 플래닛', 'teamLab Planets TOKYO', '도요스', 35.6491, 139.7898, 2, 'any', false, '123', 'sfa', '물 위를 걷는 디지털 아트. 비 오는 날에도 좋아요'),
    P('disneyland', 'sight', '도쿄 디즈니랜드', 'Tokyo Disneyland', '마이하마', 35.6329, 139.8804, 10, 'any', true, '134', 'fa', '가족 여행 만족도 최상위. 하루 통째로'),
    P('disneysea', 'sight', '도쿄 디즈니씨', 'Tokyo DisneySea', '마이하마', 35.6267, 139.8851, 10, 'any', true, '123', 'fa', '어른도 즐기는 디즈니. 친구·커플 인기'),
    P('harajuku', 'sight', '하라주쿠 · 오모테산도', '原宿 竹下通り', '하라주쿠', 35.6702, 139.7027, 2, 'pm', false, '123', 'sf', '다케시타 거리, 편집숍, 카페'),
    P('shimokita', 'sight', '시모키타자와', '下北沢', '시모키타자와', 35.6613, 139.668, 2, 'pm', false, '23', 'sf', '빈티지 옷가게와 작은 카페 골목'),
    P('goldengai', 'sight', '신주쿠 오모이데요코초 · 골든가이', '思い出横丁', '신주쿠', 35.6935, 139.702, 1.5, 'night', false, '234', 'sf', '좁은 골목 선술집. 혼술하기 좋은 곳'),
    P('akiba', 'sight', '아키하바라', '秋葉原', '아키하바라', 35.6984, 139.7731, 2, 'any', false, '12', 'sf', '애니·게임·피규어 성지'),
    P('ikebukuro', 'sight', '이케부쿠로 선샤인시티', 'サンシャインシティ', '이케부쿠로', 35.7289, 139.7193, 3, 'any', false, '13', 'sfa', '포켓몬센터·수족관·전망대가 한 건물에'),
    P('nakameguro', 'sight', '나카메구로 · 다이칸야마', '中目黒', '나카메구로', 35.6441, 139.6988, 2, 'pm', false, '34', 'sf', '강변 산책과 조용한 카페, 츠타야 서점'),
    P('skytree', 'sight', '도쿄 스카이트리', '東京スカイツリー', '오시아게', 35.7101, 139.8107, 1.5, 'any', false, '34', 'a', '아사쿠사와 묶기 좋은 전망대 + 쇼핑몰'),
    P('tokyotower', 'sight', '도쿄타워', '東京タワー', '시바', 35.6586, 139.7454, 1, 'night', false, '24', 'fa', '클래식 야경. 시바공원에서 찍는 사진이 명당'),
    P('ueno', 'sight', '우에노 공원 · 동물원', '上野動物園', '우에노', 35.7156, 139.7714, 3, 'am', false, '13', 'a', '공원 산책 + 동물원·박물관. 아이 동반 추천 (판다는 2026년 1월 중국 반환)'),
    P('ginza', 'sight', '긴자', '銀座', '긴자', 35.6717, 139.765, 2, 'pm', false, '34', 'sf', '백화점·브랜드 쇼핑, 주말엔 보행자 천국'),
    P('mori', 'sight', '모리 미술관 · 롯폰기힐스', '森美術館', '롯폰기', 35.6604, 139.7292, 2, 'any', false, '34', 's', '전시 + 도쿄 시티뷰 전망대'),
    P('hakone', 'sight', '하코네 (근교 온천)', '箱根湯本', '하코네', 35.2324, 139.1069, 10, 'any', true, '234', 'sfa', '로프웨이·아시노코 유람선·온천. 1박도 추천'),
    P('kamakura', 'sight', '가마쿠라 · 에노시마 (근교)', '鎌倉高校前駅', '가마쿠라', 35.3192, 139.5467, 9, 'any', true, '24', 'sf', '슬램덩크 철길, 대불, 바닷가 산책'),
    // 계절 명소 (seasons.js에서 시기를 판단)
    P('shinjukugyoen', 'sight', '신주쿠교엔', '新宿御苑', '신주쿠', 35.6852, 139.7101, 1.5, 'am', false, '234', 'sfa', '넓은 정원. 봄 벚꽃·가을 단풍 명소 (월요일 휴원 · 벚꽃철 3/25~4/24와 국화전 11/1~15는 무휴)'),
    P('ichou', 'sight', '진구가이엔 은행나무길', '神宮外苑 いちょう並木', '아오야마', 35.6752, 139.7176, 1, 'any', false, '1234', 'sfa', '노란 은행나무 터널. 11월 중순~12월 초에만'),
    P('marunouchi', 'sight', '마루노우치 일루미네이션', '丸の内仲通り', '도쿄역', 35.6812, 139.764, 1, 'night', false, '234', 'sfa', '샴페인 골드 가로수 조명 (11월 중순~2월 중순). 겨울 저녁 산책'),
    // 음식
    P('motomura', 'food', '규카츠 모토무라', '牛かつもと村 新宿南口店', '신주쿠', 35.6917, 139.7006, 1, 'any', false, '23', 'sf', '돌판에 구워 먹는 규카츠. 한국인 줄 서는 집'),
    P('tsukiji', 'food', '츠키지 장외시장', '築地場外市場', '츠키지', 35.6654, 139.7707, 1.5, 'am', false, '234', 'fa', '아침 해산물 꼬치·계란말이. 오전에 가야 해요'),
    P('afuri', 'food', '아후리 (유자 시오라멘)', 'AFURI 恵比寿', '에비스', 35.648, 139.7101, 1, 'any', false, '23', 's', '가볍고 깔끔한 라멘. 1인석 편함'),
    P('maisen', 'food', '돈카츠 마이센 아오야마 본점', 'とんかつまい泉 青山本店', '오모테산도', 35.668, 139.712, 1, 'any', false, '14', 'a', '젓가락으로 잘리는 돈카츠. 가족 식사'),
    P('monja', 'food', '츠키시마 몬자 거리', '月島もんじゃストリート', '츠키시마', 35.6636, 139.7823, 1.5, 'night', false, '23', 'f', '도쿄 향토 음식 몬자야키 체험'),
    P('sushiro', 'food', '회전초밥 (스시로 · 우오베이)', '魚べい 渋谷道玄坂店', '시부야', 35.6595, 139.6999, 1, 'any', false, '13', 'fa', '태블릿 주문, 아이 동반도 편한 가성비 초밥'),
    P('ichiran_t', 'food', '이치란 라멘 신주쿠', '一蘭 新宿中央東口店', '신주쿠', 35.6909, 139.7003, 1, 'any', false, '12', 's', '독서실 칸막이 1인석. 혼밥 입문'),
    P('yurakucho', 'food', '유라쿠초 가드 밑 야키토리', '有楽町 ガード下', '유라쿠초', 35.6751, 139.763, 1.5, 'night', false, '34', 'sf', '철길 아래 꼬치구이 + 생맥주'),
    P('ginzasushi', 'food', '긴자 스시 오마카세 런치', '銀座 寿司 ランチ', '긴자', 35.6712, 139.7640, 1.5, 'any', false, '34', 's', '저녁보다 훨씬 저렴한 점심 코스'),
    P('crepe', 'food', '하라주쿠 크레페', 'マリオンクレープ 原宿', '하라주쿠', 35.6716, 139.7048, 0.5, 'any', false, '1', 'fa', '하라주쿠 걷다가 먹는 간식'),
    // 숙소
    P('gracery', 'stay', '호텔 그레이스리 신주쿠', 'ホテルグレイスリー新宿', '신주쿠', 35.6948, 139.7019, 0, 'any', false, '123', 'f', '고질라 호텔. 위치 최고'),
    P('dormy_t', 'stay', '도미인 (아키하바라 · 긴자 등)', 'ドーミーイン 秋葉原', '아키하바라', 35.6995, 139.7745, 0, 'any', false, '123', 'sfa', '대욕장 + 무료 야식 라멘. 가성비 최상위'),
    P('ninehours', 'stay', '나인아워스 (캡슐호텔)', 'ナインアワーズ 浜松町', '하마마츠초', 35.6557, 139.7571, 0, 'any', false, '2', 's', '혼자 여행 초저가. 깔끔한 캡슐'),
    P('disneyhotel', 'stay', '디즈니 공식 · 제휴 호텔', '東京ディズニーリゾート・トイ・ストーリーホテル', '마이하마', 35.6345, 139.8845, 0, 'any', false, '134', 'a', '파크 동선이 편해 아이 동반에 좋아요'),
    P('hoshinoya', 'stay', '호시노야 도쿄', '星のや東京', '오테마치', 35.6868, 139.7651, 0, 'any', false, '34', 'sf', '도심 속 료칸. 특별한 날 고급 숙소'),
    P('hilton_odaiba', 'stay', '힐튼 도쿄 오다이바', 'ヒルトン東京お台場', '오다이바', 35.6275, 139.7713, 0, 'any', false, '4', 'a', '커넥팅룸·넓은 객실, 레인보우 브리지 전망'),
  ],

  osaka: [
    P('dotonbori', 'sight', '도톤보리 · 신사이바시', '道頓堀', '난바', 34.6687, 135.5013, 2, 'night', false, '1234', 'sfa', '글리코 간판과 먹거리 거리. 밤이 제일 예뻐요'),
    P('usj', 'sight', '유니버설 스튜디오 재팬', 'ユニバーサル・スタジオ・ジャパン', '유니버설시티', 34.6654, 135.4323, 10, 'any', true, '1234', 'fa', '닌텐도 월드. 익스프레스 패스 추천'),
    P('osakajo', 'sight', '오사카성 · 니시노마루 정원', '大阪城', '오사카성', 34.6873, 135.5262, 2, 'am', false, '234', 'sfa', '천수각 + 공원 산책'),
    P('umedasky', 'sight', '우메다 공중정원', '梅田スカイビル 空中庭園展望台', '우메다', 34.7053, 135.4906, 1, 'night', false, '23', 'f', '옥상이 뚫린 야경 전망대'),
    P('kaiyukan', 'sight', '가이유칸 수족관', '海遊館', '덴포잔', 34.6545, 135.429, 2.5, 'any', false, '13', 'a', '고래상어가 있는 대형 수족관'),
    P('shinsekai', 'sight', '신세카이 · 츠텐카쿠', '通天閣', '신세카이', 34.6525, 135.5063, 1.5, 'any', false, '24', 'sf', '레트로 거리와 쿠시카츠 골목'),
    P('amemura', 'sight', '아메리카무라', 'アメリカ村', '신사이바시', 34.6724, 135.4983, 1.5, 'pm', false, '12', 'f', '구제·스트리트 패션 골목'),
    P('nakazakicho', 'sight', '나카자키초 카페거리', '中崎町', '우메다', 34.7076, 135.5044, 1.5, 'pm', false, '3', 's', '오래된 주택을 고친 카페·소품숍'),
    P('kyoto', 'sight', '교토 (후시미이나리 · 기요미즈데라)', '伏見稲荷大社', '교토', 34.9671, 135.7727, 9, 'any', true, '234', 'sfa', '천 개의 도리이와 청수사. 필수 당일치기'),
    P('arashiyama', 'sight', '교토 아라시야마', '嵐山 竹林の小径', '교토', 35.0094, 135.6668, 8, 'any', true, '34', 's', '대나무숲과 강변. 조용한 교토'),
    P('nara', 'sight', '나라 공원 · 도다이지', '奈良公園', '나라', 34.6851, 135.843, 7, 'any', true, '134', 'fa', '사슴과 대불. 아이 동반 만족도 최상위'),
    P('arima', 'sight', '아리마 온천 (근교)', '有馬温泉', '아리마', 34.7968, 135.2479, 7, 'any', true, '4', 'sf', '일본 3대 고탕. 당일 온천 가능'),
    // 계절 명소
    P('zouheikyoku', 'sight', '조폐국 벚꽃길', '造幣局 桜の通り抜け', '덴마바시', 34.6966, 135.5205, 1, 'any', false, '1234', 'sfa', '4월 초중순 1주일만 열리는 벚꽃 터널 (사전 신청제)'),
    P('hikari', 'sight', '오사카 빛의 향연 (미도스지)', '御堂筋イルミネーション', '미도스지', 34.681, 135.5, 1, 'night', false, '1234', 'sfa', '미도스지 가로수 일루미네이션 (11월 초~12월 31일). 겨울 저녁 산책'),
    P('kuromon', 'food', '구로몬 시장', '黒門市場', '닛폰바시', 34.6652, 135.5067, 1.5, 'am', false, '23', 'f', '해산물·와규 꼬치 먹방'),
    P('kushikatsu', 'food', '쿠시카츠 다루마 신세카이 본점', '串かつだるま 新世界総本店', '신세카이', 34.6519, 135.5057, 1, 'any', false, '24', 'sf', '오사카 대표 쿠시카츠. 소스는 한 번만!'),
    P('551', 'food', '551 호라이 (부타만)', '551蓬莱 本店', '난바', 34.665, 135.5016, 0.5, 'any', false, '13', 'sfa', '고기만두. 간식 겸 기념품'),
    P('takoyaki', 'food', '타코야키 (와나카 · 앗치치혼포)', 'たこ家道頓堀くくる', '난바', 34.6685, 135.502, 0.5, 'any', false, '12', 'sfa', '도톤보리 길거리 필수 간식'),
    P('mizuno', 'food', '미즈노 (오코노미야키)', '美津の', '난바', 34.6686, 135.5025, 1, 'any', false, '234', 'fa', '미쉐린에 소개된 오코노미야키'),
    P('genroku', 'food', '겐로쿠 스시 (회전초밥 원조)', '元禄寿司 道頓堀店', '난바', 34.6687, 135.503, 1, 'any', false, '123', 'sa', '저렴한 회전초밥'),
    P('kani', 'food', '카니도라쿠 도톤보리 본점', 'かに道楽 道頓堀本店', '난바', 34.6688, 135.5018, 1.5, 'night', false, '34', 'fa', '대게 코스 요리'),
    P('ichiran_o', 'food', '이치란 도톤보리', '一蘭 道頓堀店', '난바', 34.6684, 135.5028, 1, 'any', false, '12', 's', '혼밥 라멘'),
    P('tsuruhashi', 'food', '츠루하시 야키니쿠', '鶴橋 焼肉', '츠루하시', 34.6654, 135.5305, 1.5, 'night', false, '34', 'f', '와규 야키니쿠 골목'),
    P('crosshotel', 'stay', '크로스호텔 오사카', 'クロスホテル大阪', '난바', 34.671, 135.5005, 0, 'any', false, '23', 'f', '도톤보리 도보권, 20~30대 선호'),
    P('dormy_o', 'stay', '도미인 프리미엄 난바', 'ドーミーインPREMIUMなんば', '난바', 34.668, 135.5054, 0, 'any', false, '123', 'sfa', '대욕장 + 야식 라멘'),
    P('univport', 'stay', '호텔 유니버설 포트', 'ホテル ユニバーサル ポート', '유니버설시티', 34.664, 135.4345, 0, 'any', false, '13', 'a', 'USJ 도보, 패밀리룸'),
    P('swissotel', 'stay', '스위소텔 난카이 오사카', 'スイスホテル南海大阪', '난바', 34.6653, 135.501, 0, 'any', false, '4', 'a', '난바역 직결, 부모님 동반 고급 호텔'),
    P('guesthouse_o', 'stay', '난바 게스트하우스 · 캡슐호텔', 'なんば カプセルホテル', '난바', 34.6667, 135.5003, 0, 'any', false, '2', 's', '혼자 여행 저가 숙소'),
    P('arima_ryokan', 'stay', '아리마 온천 료칸', '有馬温泉 旅館', '아리마', 34.7968, 135.2479, 0, 'any', false, '4', 'sf', '온천 + 가이세키 저녁'),
  ],

  sapporo: [
    P('odori', 'sight', '오도리 공원 · TV타워', 'さっぽろテレビ塔', '오도리', 43.0605, 141.3545, 1, 'any', false, '1234', 'sfa', '2월 눈축제 메인 장소'),
    P('moiwa', 'sight', '모이와산 전망대', '藻岩山ロープウェイ', '모이와', 43.0433, 141.3223, 1.5, 'night', false, '234', 'sa', '일본 신 3대 야경 도시 삿포로를 한눈에'),
    P('beer', 'sight', '삿포로 맥주 박물관', 'サッポロビール博物館', '히가시쿠', 43.0716, 141.369, 1.5, 'pm', false, '24', 'f', '시음 + 옆 건물 징기스칸'),
    P('shiroikoibito', 'sight', '시로이 코이비토 파크', '白い恋人パーク', '미야노사와', 43.0889, 141.2717, 2, 'any', false, '13', 'a', '과자 공장 견학, 쿠키 만들기'),
    P('susukino', 'sight', '스스키노 밤거리', 'すすきの', '스스키노', 43.0556, 141.353, 1.5, 'night', false, '23', 'sf', '라멘 요코초와 이자카야'),
    P('otaru', 'sight', '오타루 (운하 · 오르골당)', '小樽運河', '오타루', 43.1976, 140.994, 7, 'any', true, '1234', 'sfa', '기차 40분. 운하와 유리공방'),
    P('biei', 'sight', '비에이 · 후라노 (청의 호수 · 팜 도미타)', '青い池', '비에이', 43.4935, 142.6143, 10, 'any', true, '234', 'sfa', '여름 라벤더(7월) 최고. 버스 투어 추천'),
    P('jozankei', 'sight', '조잔케이 온천', '定山渓温泉', '조잔케이', 42.9677, 141.1672, 7, 'any', true, '34', 's', '시내에서 1시간, 당일 온천'),
    P('noboribetsu', 'sight', '노보리베츠 지옥계곡', '登別地獄谷', '노보리베츠', 42.4967, 141.1486, 8, 'any', true, '14', 'sfa', '유황 온천 계곡 + 온천 료칸'),
    P('asahiyama', 'sight', '아사히야마 동물원', '旭山動物園', '아사히카와', 43.7684, 142.4798, 10, 'any', true, '13', 'a', '펭귄 산책(겨울). 아이 동반 인기'),
    P('niseko', 'sight', '니세코 스키 (겨울)', 'ニセコ グラン・ヒラフ', '니세코', 42.8605, 140.6989, 10, 'any', true, '13', 'f', '세계적인 파우더 스노우'),
    // 계절 명소
    P('maruyama', 'sight', '마루야마 공원 · 홋카이도 신궁', '北海道神宮', '마루야마', 43.0544, 141.308, 1.5, 'am', false, '1234', 'sfa', '4월 말~5월 초 벚꽃, 1월 새해 참배 명소'),
    P('hokudai', 'sight', '홋카이도대학 은행나무길', '北海道大学 イチョウ並木', '기타쿠', 43.077, 141.341, 1, 'any', false, '234', 'sfa', '10월 말~11월 초 노란 은행나무 터널'),
    P('jingisukan', 'food', '징기스칸 다루마 본점', '成吉思汗だるま 本店', '스스키노', 43.0555, 141.3527, 1, 'night', false, '1234', 'fa', '삿포로 대표 양고기 구이. 저녁 줄 길어요'),
    P('garaku', 'food', '스프카레 가라쿠', 'スープカレー GARAKU', '오도리', 43.0576, 141.3558, 1, 'any', false, '123', 'sfa', '삿포로 명물 스프카레'),
    P('suage', 'food', '스프카레 스아게+', 'スープカレー すあげ+', '스스키노', 43.0548, 141.3531, 1, 'any', false, '3', 's', '튀긴 채소가 가득한 스프카레'),
    P('sumire', 'food', '스미레 (미소라멘)', 'すみれ 札幌すすきの店', '스스키노', 43.0567, 141.3540, 1, 'night', false, '12', 's', '진한 삿포로 미소라멘'),
    P('nijo', 'food', '니조 시장 (카이센동)', '二条市場', '오도리', 43.0587, 141.3587, 1, 'am', false, '24', 'sa', '아침 해산물 덮밥'),
    P('toriton', 'food', '회전초밥 토리톤', '回転寿し トリトン 北8条光星店', '히가시쿠', 43.0722, 141.3645, 1, 'any', false, '1', 'a', '홋카이도 해산물 가성비 초밥'),
    P('hanamaru', 'food', '네무로 하나마루 (JR타워)', '根室花まる JRタワーステラプレイス店', '삿포로역', 43.068, 141.3511, 1, 'any', false, '3', 'a', '역 안이라 동선이 편한 인기 초밥'),
    P('kanihonke', 'food', '카니혼케 (게 요리)', 'かに本家 札幌駅前本店', '삿포로역', 43.0671, 141.3518, 1.5, 'night', false, '34', 'sfa', '털게·대게 코스'),
    P('rokkatei', 'food', '롯카테이 삿포로 본점 (디저트)', '六花亭 札幌本店', '삿포로역', 43.0660, 141.3485, 0.5, 'any', false, '1', 'f', '버터샌드와 카페'),
    P('letao', 'food', '르타오 (오타루)', 'ルタオ本店', '오타루', 43.1908, 141.0049, 0.5, 'any', false, '23', 'f', '더블 프로마주 치즈케이크'),
    P('jrtower', 'stay', 'JR타워 호텔 닛코 삿포로', 'JRタワーホテル日航札幌', '삿포로역', 43.0683, 141.3505, 0, 'any', false, '23', 'a', '삿포로역 직결, 고층 전망'),
    P('dormy_s', 'stay', '도미인 프리미엄 삿포로', 'ドーミーインPREMIUM札幌', '다누키코지', 43.0575, 141.3490, 0, 'any', false, '2', 's', '대욕장 + 조식 해산물'),
    P('yuen_s', 'stay', '온센 료칸 유엔 삿포로', 'ONSEN RYOKAN 由縁 札幌', '오도리', 43.0612, 141.3478, 0, 'any', false, '2', 'f', '노보리베츠 온천수를 옮겨 온 노천탕·대욕장. 시내 료칸 감성'),
    P('takimotokan', 'stay', '노보리베츠 다키모토칸', '第一滝本館', '노보리베츠', 42.4958, 141.1466, 0, 'any', false, '14', 'a', '대형 온천 호텔, 가족 단위'),
    P('morinouta', 'stay', '조잔케이 츠루가 리조트 스파 모리노우타', '定山渓鶴雅リゾートスパ 森の謌', '조잔케이', 42.9688, 141.1647, 0, 'any', false, '34', 'sf', '숲속 온천 료칸'),
    P('kiroro', 'stay', '클럽메드 키로로', 'Club Med Kiroro', '키로로', 43.0784, 140.9884, 0, 'any', false, '3', 'a', '겨울 스키 올인클루시브'),
  ],

  fukuoka: [
    P('yatai', 'sight', '나카스 야타이 (포장마차)', '中洲屋台', '나카스', 33.5925, 130.4057, 1.5, 'night', false, '234', 'sf', '강가 포장마차. 후쿠오카 밤 필수'),
    P('canal', 'sight', '캐널시티 하카타', 'キャナルシティ博多', '하카타', 33.5897, 130.411, 2, 'any', false, '12', 'sfa', '분수쇼 + 쇼핑몰'),
    P('tenjin', 'sight', '텐진 · 다이묘 거리', '大名 福岡', '텐진', 33.5886, 130.3947, 2, 'pm', false, '12', 'sf', '편집숍·카페 골목'),
    P('ohori', 'sight', '오호리 공원', '大濠公園', '오호리', 33.586, 130.3765, 1.5, 'am', false, '23', 's', '호수 산책 + 스타벅스'),
    P('tower', 'sight', '후쿠오카 타워 · 모모치 해변', '福岡タワー', '모모치', 33.5933, 130.3515, 1.5, 'night', false, '2', 'a', '바다 노을과 야경'),
    P('lalaport', 'sight', '라라포트 후쿠오카 (실물 크기 건담)', 'ららぽーと福岡', '나카', 33.567, 130.4426, 2, 'any', false, '13', 'fa', '건담 + 대형 쇼핑몰'),
    P('marineworld', 'sight', '마린월드 우미노나카미치', 'マリンワールド海の中道', '우미노나카미치', 33.6609, 130.3617, 2.5, 'any', false, '13', 'a', '돌고래쇼 수족관'),
    P('dazaifu', 'sight', '다자이후 텐만구', '太宰府天満宮', '다자이후', 33.5215, 130.5349, 3, 'am', false, '1234', 'fa', '학업의 신사 + 매화떡'),
    P('yufuin', 'sight', '유후인 (긴린코 호수)', '金鱗湖', '유후인', 33.2663, 131.3688, 9, 'any', true, '234', 'sfa', '버스 2시간. 온천 마을 산책'),
    P('beppu', 'sight', '벳푸 지옥 순례', '別府地獄めぐり', '벳푸', 33.316, 131.476, 9, 'any', true, '34', 'f', '색색의 온천 연못 7곳'),
    P('itoshima', 'sight', '이토시마 (해변 카페 · 부부 바위)', '桜井二見ヶ浦', '이토시마', 33.6429, 130.1994, 7, 'any', true, '23', 'sf', '드라이브·감성 카페'),
    P('yanagawa', 'sight', '야나가와 뱃놀이', '柳川 川下り', '야나가와', 33.1631, 130.4059, 7, 'any', true, '4', 'sa', '수로 뱃놀이 + 장어 덮밥'),
    // 계절 명소
    P('maizuru', 'sight', '마이즈루 공원 · 후쿠오카성터', '舞鶴公園 福岡', '오호리', 33.5845, 130.383, 1.5, 'am', false, '1234', 'sfa', '후쿠오카 대표 벚꽃 명소. 성벽 위 전망'),
    P('nokonoshima', 'sight', '노코노시마 아일랜드 파크', 'のこのしまアイランドパーク', '노코노시마', 33.6365, 130.2995, 4, 'any', false, '1234', 'sfa', '배로 10분, 섬 꽃동산. 봄 유채꽃·가을 코스모스'),
    P('kushida', 'sight', '구시다 신사 (야마카사 장식)', '櫛田神社 博多', '하카타', 33.593, 130.4105, 0.5, 'any', false, '1234', 'sfa', '하카타 수호 신사. 장식 야마카사 전시, 7월 1~15일 축제'),
    P('ichiran_f', 'food', '이치란 본점', '一蘭 本社総本店', '나카스', 33.5935, 130.406, 1, 'any', false, '12', 'sf', '이치란이 시작된 곳'),
    P('shinshin', 'food', '신신 라멘 (텐진)', '博多らーめん ShinShin 天神本店', '텐진', 33.5908, 130.3985, 1, 'night', false, '2', 's', '얇은 면 하카타 돈코츠'),
    P('ikkousha', 'food', '하카타 잇소우', '博多一双 博多駅東本店', '하카타', 33.5913, 130.425, 1, 'any', false, '3', 'f', '거품 돈코츠. 진한 맛'),
    P('motsunabe', 'food', '모츠나베 (야마나카 · 오오야마)', 'もつ鍋 おおやま 博多', '하카타', 33.5896, 130.4194, 1.5, 'night', false, '234', 'fa', '후쿠오카 대표 곱창전골'),
    P('mentaiju', 'food', '원조 하카타 멘타이쥬', '元祖博多めんたい重', '나카스', 33.592, 130.4032, 1, 'am', false, '134', 'sfa', '명란 덮밥. 오전에 줄이 짧아요'),
    P('hyotan', 'food', '효탄 스시 (텐진)', 'ひょうたん寿司', '텐진', 33.5913, 130.399, 1, 'any', false, '13', 'a', '가성비 초밥'),
    P('makino', 'food', '마키노 우동', '牧のうどん 博多バスターミナル店', '하카타', 33.5906, 130.4196, 1, 'any', false, '13', 'a', '부드러운 하카타 우동. 하카타 버스터미널 지하'),
    P('horumon', 'food', '텐진 호르몬 (하카타역)', '鉄板焼 天神ホルモン 博多駅店', '하카타', 33.5898, 130.4207, 1, 'any', false, '2', 's', '철판 호르몬 정식'),
    P('unagi', 'food', '야나가와 우나기 세이로무시', '元祖本吉屋', '야나가와', 33.162, 130.405, 1, 'any', false, '4', 'a', '찐 장어 덮밥'),
    P('kakigoya', 'food', '이토시마 굴 오두막 (가키고야)', '岐志漁港 牡蠣小屋', '이토시마', 33.596, 130.176, 1.5, 'any', false, '234', 'fa', '직접 구워 먹는 굴. 10월~3월경 한정 (가게마다 다름)'),
    P('seahawk', 'stay', '힐튼 후쿠오카 시호크', 'ヒルトン福岡シーホーク', '모모치', 33.5946, 130.3601, 0, 'any', false, '13', 'a', '바다 전망 가족 호텔'),
    P('dormy_f', 'stay', '도미인 하카타 기온', 'ドーミーイン博多祇園', '하카타', 33.5932, 130.4125, 0, 'any', false, '2', 's', '대욕장 + 야식 라멘'),
    P('mitsui', 'stay', '미츠이 가든 호텔 후쿠오카 기온', '三井ガーデンホテル福岡祇園', '하카타', 33.589, 130.419, 0, 'any', false, '2', 'f', '하카타역 도보, 대욕장'),
    P('nikko_f', 'stay', '호텔 닛코 후쿠오카', 'ホテル日航福岡', '하카타', 33.5893, 130.4185, 0, 'any', false, '24', 'a', '하카타역 앞, 부모님 동반'),
    P('yufuin_ryokan', 'stay', '유후인 온천 료칸', '由布院 旅館', '유후인', 33.266, 131.365, 0, 'any', false, '34', 'sf', '객실 노천탕 + 가이세키'),
    P('suginoi', 'stay', '벳푸 스기노이 호텔', '杉乃井ホテル', '벳푸', 33.294, 131.481, 0, 'any', false, '34', 'fa', '계단식 노천탕 가족 리조트'),
  ],
};

const AGE_LABEL = { 1: '10대', 2: '20대', 3: '30대', 4: '40대' };
const WITH_LABEL = { s: '혼자', f: '친구와', a: '가족과' };

const TIPS = {
  s: ['1인석 라멘집(이치란 등)과 카운터석 스시가 혼밥하기 편해요.', '대욕장 있는 비즈니스 호텔(도미인)이 혼자 여행 만족도가 높아요.'],
  f: ['인기 식당은 저녁 6시 전에 줄을 서거나 예약하세요.', '2인 이상이면 트윈룸이 캡슐호텔 두 칸보다 싼 경우도 많아요.'],
  a: ['테마파크는 공식·제휴 호텔에 묵으면 아이 낮잠·짐 보관이 편해요.', '부모님 동반이면 계단 적은 역 근처 호텔과 택시 이동을 섞어 보세요.'],
};

// 숙소 위치를 지역으로 고를 때 쓰는 대표 지점 (역 주변). 호텔 이름을 몰라도 이 기준으로 동선을 짠다.
const STAY_AREAS = {
  tokyo: [
    { id: 'shinjuku', name: '신주쿠', note: '신주쿠역 주변', lat: 35.6909, lng: 139.7003 },
    { id: 'shibuya', name: '시부야', note: '시부야역 주변', lat: 35.658, lng: 139.7016 },
    { id: 'ginza', name: '긴자 · 도쿄역', note: '긴자·유라쿠초·도쿄역', lat: 35.676, lng: 139.765 },
    { id: 'ueno', name: '우에노 · 아사쿠사', note: '우에노·아사쿠사·아키하바라', lat: 35.711, lng: 139.785 },
    { id: 'ikebukuro', name: '이케부쿠로', note: '이케부쿠로역 주변', lat: 35.7295, lng: 139.7109 },
    { id: 'shinagawa', name: '시나가와', note: '하네다 가까운 쪽', lat: 35.6285, lng: 139.7388 },
    { id: 'maihama', name: '마이하마 (디즈니)', note: '디즈니 리조트 주변', lat: 35.636, lng: 139.883 },
  ],
  osaka: [
    { id: 'namba', name: '난바 · 신사이바시', note: '도톤보리 도보권', lat: 34.6664, lng: 135.501 },
    { id: 'umeda', name: '우메다 (오사카역)', note: '오사카역·우메다역 주변', lat: 34.7025, lng: 135.4959 },
    { id: 'honmachi', name: '혼마치 · 요도야바시', note: '난바·우메다 중간', lat: 34.686, lng: 135.501 },
    { id: 'tennoji', name: '덴노지', note: '덴노지역·신세카이 주변', lat: 34.6465, lng: 135.5133 },
    { id: 'shinosaka', name: '신오사카', note: '신칸센역 주변', lat: 34.7334, lng: 135.5002 },
    { id: 'usj', name: '유니버설시티', note: 'USJ 주변', lat: 34.667, lng: 135.435 },
  ],
  sapporo: [
    { id: 'station', name: '삿포로역', note: '삿포로역 주변', lat: 43.0687, lng: 141.3508 },
    { id: 'odori', name: '오도리', note: '오도리 공원 주변', lat: 43.06, lng: 141.354 },
    { id: 'susukino', name: '스스키노', note: '스스키노·다누키코지', lat: 43.0555, lng: 141.353 },
    { id: 'nakajima', name: '나카지마 공원', note: '스스키노 남쪽', lat: 43.045, lng: 141.354 },
  ],
  fukuoka: [
    { id: 'hakata', name: '하카타역', note: '하카타역 주변', lat: 33.5897, lng: 130.4207 },
    { id: 'nakasu', name: '나카스 · 기온', note: '캐널시티·야타이 도보권', lat: 33.593, lng: 130.408 },
    { id: 'tenjin', name: '텐진', note: '텐진·다이묘', lat: 33.591, lng: 130.399 },
    { id: 'momochi', name: '모모치 (바닷가)', note: '후쿠오카 타워 주변', lat: 33.593, lng: 130.353 },
  ],
};

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

/*
 * 계절·시즌 데이터
 *
 * 판단 기준
 *   - 월 단위(1~12월)로 본다. 여행이 두 달에 걸치면 두 달을 모두 본다.
 *   - 장소 점수 s:  +2 제철(꼭 추천) · +1 좋은 시기 · -1 순위를 내림 · -2 추천에서 뺌
 *   - only: 그 달에만 열리거나 의미가 있는 곳. 다른 달에는 추천·선택 목록에서 숨긴다.
 *   - 온천·료칸: 혼슈·규슈는 무더운 7~8월에 -2(추천에서 뺌). 6월은 장마라 빼지 않는다.
 *     홋카이도는 여름이 선선해서 -1(순위만 내림).
 *
 * 형식
 *   MONTH_TAGS[city][m]        : 월 선택 화면에 붙는 한 줄 (index 1~12)
 *   SEASON_NOTES[city][season] : { text, wear } 계절 요약과 옷차림
 *   PLACE_SEASONS[city][id]    : { only?: [월...], rules: [{ m: [월...], s: 점수, why: 이유 }] }
 *   CITY_EVENTS[city]          : [{ id, months, title, when, desc, kind, places: [장소 id] }]
 *     kind: 'nature' 꽃·단풍 | 'festival' 축제 | 'event' 이벤트·조명 | 'food' 제철 음식 | 'onsen' 온천 | 'activity' 스키·바다 | 'culture'
 */

const SEASON_OF_MONTH = [null, 'winter', 'winter', 'spring', 'spring', 'spring', 'summer', 'summer', 'summer', 'autumn', 'autumn', 'autumn', 'winter'];
const SEASON_LABEL = { spring: '봄', summer: '여름', autumn: '가을', winter: '겨울' };
const SEASON_MONTHS = { spring: [3, 4, 5], summer: [6, 7, 8], autumn: [9, 10, 11], winter: [12, 1, 2] };

const MONTH_TAGS = {
  tokyo: [null,
    '새해 참배 · 맑은 겨울', '매화 · 겨울 일루미네이션', '벚꽃 개화 (3월 말)', '벚꽃 절정 (4월 초)',
    '신록 · 산자 마쓰리', '장마 · 수국', '불꽃놀이 · 무더위 시작', '한여름 · 실내 코스',
    '디즈니 할로윈 · 늦더위', '디즈니 할로윈 · 걷기 좋은 가을', '은행나무 · 일루미네이션', '크리스마스 · 일루미네이션'],
  osaka: [null,
    '대게·복어 제철 · 온천', '대게 제철 · 매화', '벚꽃 개화 (3월 말)', '벚꽃 · 조폐국 벚꽃길',
    '신록 · 골든위크 혼잡', '장마 · 실내 코스', '기온·텐진 마쓰리', 'USJ 여름 이벤트 · 무더위',
    'USJ 할로윈 시작', 'USJ 할로윈 · 선선한 가을', '교토 단풍 절정 · 빛의 향연', '교토 단풍 끝물 · 크리스마스'],
  sapporo: [null,
    '스키 · 설경 온천', '눈축제 · 오타루 눈 등불', '봄 스키 · 늦겨울', '눈 녹는 비수기 · 월말 벚꽃',
    '벚꽃 · 라일락', '요사코이 · 성게 제철', '라벤더 절정', '비어가든 · 시원한 여름',
    '오텀 페스트 (먹거리 축제)', '단풍', '첫눈 · 일루미네이션', '스키 개장 · 크리스마스 마켓'],
  fukuoka: [null,
    '딸기 · 합격 기원 참배', '매화 (다자이후)', '벚꽃 개화 · 유채꽃', '벚꽃 · 유채꽃',
    '하카타 돈타쿠 (5/3~4)', '장마 (야타이 휴무 잦음)', '야마카사 (7/1~15) · 바다', '해수욕 · 해바라기',
    '호조야 축제 · 늦더위', '코스모스 · 굴 오두막 개장', '단풍 · 굴 오두막', '모츠나베 · 크리스마스 마켓'],
};

const SEASON_NOTES = {
  tokyo: {
    spring: { text: '3월 말~4월 초 벚꽃이 절정이에요. 메구로강·우에노·신주쿠교엔이 가장 붐벼요. 5월 초 골든위크는 일본 연휴라 숙소가 비싸요.', wear: '낮 15~20도 · 얇은 겉옷' },
    summer: { text: '6월은 장마, 7~8월은 35도 안팎 무더위예요. 낮에는 실내(팀랩·미술관·수족관), 저녁엔 야경·불꽃놀이 위주로 짜요. 온천·료칸은 한여름엔 빼고 추천해요.', wear: '반팔 · 양산 · 휴대용 선풍기' },
    autumn: { text: '10~11월이 걷기 가장 좋은 때예요. 11월 중순~12월 초 은행나무가 노랗게 물들어요. 9월은 늦더위와 태풍을 확인하세요.', wear: '낮 15~22도 · 가디건' },
    winter: { text: '맑고 건조하며 영상 5~10도예요. 일루미네이션과 하코네 온천이 인기예요. 12월 29일~1월 3일은 쉬는 가게가 많아요.', wear: '코트 · 실내는 따뜻해요' },
  },
  osaka: {
    spring: { text: '3월 말~4월 초 오사카성·교토 벚꽃이 절정이에요. 조폐국 벚꽃길은 4월 초중순 1주일만 열려요 (사전 신청). 골든위크는 혼잡해요.', wear: '낮 15~20도 · 얇은 겉옷' },
    summer: { text: '오사카·교토는 매우 덥고 습해요. 7월 기온·텐진 마쓰리, USJ 여름 이벤트가 인기예요. 한낮 교토 도보 관광은 피하고, 온천·료칸은 추천에서 빼요.', wear: '반팔 · 양산 · 물 자주 마시기' },
    autumn: { text: '11월 중순~12월 초 교토 단풍이 절정이에요. 1년 중 교토가 가장 붐비니 숙소를 일찍 잡으세요. 9~10월은 USJ 할로윈 시즌이에요.', wear: '낮 15~22도 · 가디건' },
    winter: { text: '대게·복어가 제철이고 아리마 온천이 인기예요. 연말엔 미도스지 일루미네이션이 켜져요. 교토는 오사카보다 춥게 느껴져요.', wear: '코트 · 목도리' },
  },
  sapporo: {
    spring: { text: '4월은 눈이 녹는 비수기예요. 도쿄보다 한 달쯤 늦은 4월 말~5월 초에 벚꽃이 피고, 5월 하순엔 라일락 축제가 열려요. 아침저녁은 쌀쌀해요.', wear: '5월에도 경량 패딩' },
    summer: { text: '습도가 낮고 25도 안팎이라 피서지로 인기예요. 7월 라벤더, 7~8월 오도리 비어가든이 대표예요. 온천보다 꽃밭·자연 코스를 먼저 추천해요.', wear: '반팔 + 얇은 겉옷 (밤엔 선선)' },
    autumn: { text: '9월 오텀 페스트, 10월 단풍, 10월 말 은행나무가 이어져요. 10월 말~11월 초에 첫눈이 내려요.', wear: '10월부터 두꺼운 겉옷' },
    winter: { text: '2월 초 눈축제, 12~3월 스키, 설경 온천의 계절이에요. 한낮에도 0도 안팎, 아침저녁은 영하 5도 아래로 내려가고 길이 얼어 미끄러워요.', wear: '롱패딩 · 미끄럼 방지 방한화 · 핫팩' },
  },
  fukuoka: {
    spring: { text: '3월 말 벚꽃, 봄 유채꽃(노코노시마)이 예뻐요. 5월 3~4일 하카타 돈타쿠 축제로 시내가 붐벼요.', wear: '낮 15~22도 · 얇은 겉옷' },
    summer: { text: '7월 1~15일 하카타 기온 야마카사가 열리고, 이토시마·모모치 바다가 제철이에요. 비 오는 날과 태풍 때는 야타이가 쉬어요. 유후인·벳푸 온천은 한여름엔 빼고 추천해요.', wear: '반팔 · 양산' },
    autumn: { text: '10월 노코노시마 코스모스, 11월 유후인·다자이후 단풍이 좋아요. 10월부터 이토시마 굴 오두막이 차례로 문을 열어요.', wear: '낮 18~25도 · 가디건' },
    winter: { text: '모츠나베·굴·아마오우 딸기가 제철이고, 유후인·벳푸 온천이 가장 좋은 때예요. 서울보다 따뜻한 영상 5~10도예요.', wear: '코트 정도면 충분' },
  },
};

// 자주 쓰는 달 묶음
const HOT = [7, 8];          // 혼슈·규슈 한여름
const WINTER = [12, 1, 2];

const PLACE_SEASONS = {
  tokyo: {
    shibuyasky: { rules: [{ m: WINTER, s: 1, why: '겨울엔 공기가 맑아 후지산까지 보이는 날이 많아요' }] },
    sensoji: { rules: [
      { m: [1], s: 1, why: '새해 첫 참배 시즌' },
      { m: [5], s: 1, why: '산자 마쓰리 (5월 셋째 주말)' },
      { m: [7], s: 1, why: '스미다강 불꽃놀이 (7월 마지막 토요일)' },
    ] },
    teamlab: { rules: [{ m: [6, 7, 8], s: 1, why: '장마·더위 피하는 실내 코스' }] },
    disneyland: { rules: [
      { m: [9, 10], s: 1, why: '할로윈 시즌' },
      { m: [11, 12], s: 1, why: '크리스마스 시즌' },
    ] },
    disneysea: { rules: [
      { m: [9, 10], s: 1, why: '할로윈 시즌' },
      { m: [11, 12], s: 1, why: '크리스마스 시즌' },
    ] },
    akiba: { rules: [{ m: HOT, s: 1, why: '더위 피하는 실내 코스' }] },
    ikebukuro: { rules: [{ m: [6, 7, 8], s: 1, why: '실내 수족관·쇼핑' }] },
    nakameguro: { rules: [{ m: [3, 4], s: 2, why: '메구로강 벚꽃 (3월 말~4월 초)' }] },
    ueno: { rules: [
      { m: [3, 4], s: 2, why: '벚꽃 명소' },
      { m: HOT, s: -1, why: '한여름 야외 동물원은 더워요' },
    ] },
    ginza: { rules: [{ m: [11, 12], s: 1, why: '크리스마스 장식' }] },
    mori: { rules: [{ m: HOT, s: 1, why: '더위 피하는 실내 코스' }] },
    hakone: { rules: [
      { m: WINTER, s: 2, why: '겨울 온천 제철' },
      { m: [11], s: 1, why: '단풍' },
      { m: [6], s: 1, why: '수국 열차 (6월 중순~7월 중순)' },
      { m: HOT, s: -2, why: '한여름엔 온천 대신 다른 코스를 추천해요' },
    ] },
    kamakura: { rules: [
      { m: [6], s: 2, why: '수국 명소 (메이게츠인)' },
      { m: HOT, s: 1, why: '에노시마 바다' },
    ] },
    shinjukugyoen: { rules: [
      { m: [3, 4], s: 2, why: '벚꽃 명소' },
      { m: [11, 12], s: 1, why: '단풍 (11월 말~12월 초)' },
    ] },
    ichou: { only: [11, 12], rules: [{ m: [11, 12], s: 2, why: '은행나무 절정 (11월 중순~12월 초)' }] },
    marunouchi: { only: [11, 12, 1, 2], rules: [
      { m: [11, 12], s: 2, why: '크리스마스 일루미네이션 (11월 중순부터)' },
      { m: [1, 2], s: 1, why: '겨울 일루미네이션 (2월 중순까지)' },
    ] },
    tsukiji: { rules: [{ m: WINTER, s: 1, why: '겨울 제철 해산물 (방어·굴)' }] },
    yurakucho: { rules: [{ m: HOT, s: 1, why: '여름 생맥주 한 잔' }] },
    hoshinoya: { rules: [
      { m: WINTER, s: 1, why: '도심 온천 료칸, 겨울에 더 좋아요' },
      { m: HOT, s: -2, why: '한여름엔 료칸 대신 일반 호텔을 추천해요' },
    ] },
  },

  osaka: {
    usj: { rules: [
      { m: HOT, s: 1, why: '여름 물놀이 이벤트' },
      { m: [9, 10], s: 1, why: '할로윈 시즌' },
      { m: [11, 12], s: 1, why: '크리스마스 시즌' },
    ] },
    osakajo: { rules: [
      { m: [3, 4], s: 2, why: '벚꽃 명소 (니시노마루 정원)' },
      { m: [2], s: 1, why: '매화 숲 (2월 중순~3월 초 절정)' },
      { m: [11], s: 1, why: '은행나무·단풍' },
    ] },
    umedasky: { rules: [{ m: [11, 12], s: 1, why: '크리스마스 마켓·대형 트리' }] },
    kaiyukan: { rules: [{ m: [6, 7, 8], s: 1, why: '장마·더위 피하는 실내 코스' }] },
    kyoto: { rules: [
      { m: [3, 4], s: 2, why: '교토 벚꽃' },
      { m: [11], s: 2, why: '교토 단풍 절정' },
      { m: [12], s: 1, why: '단풍 끝물 (12월 초)' },
      { m: [7], s: 1, why: '기온 마쓰리' },
      { m: [8], s: -1, why: '분지라 한여름엔 매우 더워요 (이른 아침 추천)' },
    ] },
    arashiyama: { rules: [
      { m: [11], s: 2, why: '단풍 명소' },
      { m: [10], s: 1, why: '대나무숲 야간 라이트업 (쓰키토로, 10월 전후 · 유료)' },
      { m: [3, 4], s: 1, why: '벚꽃' },
      { m: [8], s: -1, why: '한여름엔 매우 더워요' },
    ] },
    nara: { rules: [
      { m: [3, 4], s: 1, why: '벚꽃' },
      { m: [10, 11], s: 1, why: '선선한 가을 산책·단풍' },
      { m: [8], s: -1, why: '그늘이 적어 한여름엔 힘들어요' },
    ] },
    arima: { rules: [
      { m: WINTER, s: 2, why: '겨울 온천 제철' },
      { m: [11], s: 1, why: '단풍' },
      { m: HOT, s: -2, why: '한여름엔 온천 수요가 적어요' },
    ] },
    zouheikyoku: { only: [4], rules: [{ m: [4], s: 2, why: '4월 초중순 1주일만 개방 (사전 신청)' }] },
    hikari: { only: [11, 12], rules: [{ m: [11, 12], s: 2, why: '겨울 일루미네이션' }] },
    kani: { rules: [{ m: [11, 12, 1, 2, 3], s: 2, why: '대게 제철' }] },
    kuromon: { rules: [{ m: WINTER, s: 1, why: '겨울 복어·게 제철' }] },
    arima_ryokan: { rules: [
      { m: WINTER, s: 2, why: '겨울 온천 료칸' },
      { m: [11], s: 1, why: '단풍' },
      { m: HOT, s: -2, why: '한여름엔 료칸 대신 시내 호텔을 추천해요' },
    ] },
  },

  sapporo: {
    odori: { rules: [
      { m: [2], s: 2, why: '눈축제 메인 회장' },
      { m: [5], s: 1, why: '라일락 축제' },
      { m: [6], s: 1, why: '요사코이 소란 마쓰리' },
      { m: HOT, s: 1, why: '오도리 비어가든' },
      { m: [9], s: 1, why: '오텀 페스트 (먹거리 축제)' },
      { m: [11, 12], s: 1, why: '화이트 일루미네이션·크리스마스 시장' },
    ] },
    beer: { rules: [{ m: HOT, s: 1, why: '맥주가 가장 맛있는 계절' }] },
    shiroikoibito: { rules: [{ m: [11, 12, 1, 2, 3], s: 1, why: '겨울 일루미네이션 (11월 중순~3월)' }] },
    susukino: { rules: [{ m: [2], s: 1, why: '스스키노 얼음 조각 (눈축제 기간)' }] },
    otaru: { rules: [
      { m: [2], s: 2, why: '눈 등불 축제 (유키아카리노미치)' },
      { m: [12, 1], s: 1, why: '눈 덮인 운하' },
    ] },
    biei: { rules: [
      { m: [7], s: 2, why: '라벤더 절정' },
      { m: [6, 8], s: 1, why: '꽃밭 시즌' },
      { m: [9, 10], s: 1, why: '단풍·청의 호수' },
      { m: WINTER, s: 1, why: '설원 투어 (크리스마스트리 나무)' },
      { m: [4], s: -1, why: '눈 녹는 시기라 풍경이 덜해요' },
    ] },
    jozankei: { rules: [
      { m: [10], s: 2, why: '단풍 명소 (10월 초중순)' },
      { m: WINTER, s: 2, why: '설경 온천' },
      { m: HOT, s: -1, why: '여름엔 온천보다 꽃밭·자연 코스를 추천해요' },
    ] },
    noboribetsu: { rules: [
      { m: WINTER, s: 2, why: '겨울 온천 제철' },
      { m: [10], s: 1, why: '단풍' },
      { m: HOT, s: -1, why: '여름엔 온천보다 꽃밭·자연 코스를 추천해요' },
    ] },
    asahiyama: { rules: [
      { m: [12, 1, 2, 3], s: 2, why: '펭귄 산책 (눈이 쌓이는 12월 중하순~3월 중순)' },
      { m: [4, 11], s: -1, why: '휴원 기간이 있어요 (4월 8일경~하순, 11월 4~10일경 · 방문 전 확인)' },
    ] },
    niseko: { only: [12, 1, 2, 3], rules: [
      { m: [1, 2], s: 2, why: '파우더 스노 절정' },
      { m: [12, 3], s: 1, why: '스키 시즌' },
    ] },
    maruyama: { rules: [
      { m: [5], s: 2, why: '벚꽃 (4월 말~5월 초)' },
      { m: [4], s: 1, why: '4월 말 벚꽃 개화' },
      { m: [1], s: 1, why: '새해 첫 참배' },
    ] },
    hokudai: { rules: [
      { m: [10, 11], s: 2, why: '은행나무 절정 (10월 말~11월 초)' },
      { m: [12, 1, 2, 3, 4], s: -1, why: '은행나무 시즌이 아니에요 (10월 말~11월 초 추천)' },
    ] },
    garaku: { rules: [{ m: WINTER, s: 1, why: '추운 날 뜨끈한 스프카레' }] },
    suage: { rules: [{ m: WINTER, s: 1, why: '추운 날 뜨끈한 스프카레' }] },
    sumire: { rules: [{ m: WINTER, s: 1, why: '겨울엔 진한 미소라멘' }] },
    nijo: { rules: [
      { m: [6, 7, 8], s: 2, why: '성게(우니) 제철' },
      { m: WINTER, s: 1, why: '게 제철' },
    ] },
    kanihonke: { rules: [{ m: [11, 12, 1, 2, 3], s: 2, why: '겨울 게 요리 제철' }] },
    morinouta: { rules: [
      { m: WINTER, s: 2, why: '설경 노천탕' },
      { m: [10], s: 1, why: '단풍 계곡' },
      { m: HOT, s: -1, why: '여름엔 시내 호텔을 추천해요' },
    ] },
    takimotokan: { rules: [
      { m: WINTER, s: 2, why: '겨울 온천 제철' },
      { m: HOT, s: -1, why: '여름엔 시내 호텔을 추천해요' },
    ] },
    kiroro: { only: [12, 1, 2, 3], rules: [{ m: [12, 1, 2, 3], s: 2, why: '스키 시즌' }] },
    yuen_s: { rules: [{ m: WINTER, s: 1, why: '눈 오는 날 노천탕' }] },
  },

  fukuoka: {
    yatai: { rules: [
      { m: [11, 12, 1, 2], s: 1, why: '쌀쌀한 밤 포장마차가 제맛' },
      { m: [6], s: -1, why: '장마철엔 비로 쉬는 날이 많아요' },
    ] },
    tenjin: { rules: [
      { m: [5], s: 1, why: '하카타 돈타쿠 퍼레이드 (5/3~4)' },
      { m: [11, 12], s: 1, why: '크리스마스 마켓' },
    ] },
    ohori: { rules: [{ m: [3, 4], s: 1, why: '벚꽃 (옆 마이즈루 공원)' }] },
    tower: { rules: [
      { m: HOT, s: 1, why: '모모치 해변 여름 바다' },
      { m: [11, 12], s: 1, why: '타워 크리스마스 일루미네이션' },
    ] },
    lalaport: { rules: [{ m: [6, 7, 8], s: 1, why: '장마·더위 피하는 실내 코스' }] },
    marineworld: { rules: [{ m: HOT, s: 1, why: '여름 가족 나들이 1순위' }] },
    dazaifu: { rules: [
      { m: [2, 3], s: 2, why: '매화 시즌 (1월 말~3월 초)' },
      { m: [1], s: 1, why: '새해 참배·합격 기원' },
      { m: [11], s: 1, why: '단풍 (고묘젠지)' },
    ] },
    yufuin: { rules: [
      { m: [11], s: 2, why: '단풍 + 긴린코 아침 물안개' },
      { m: WINTER, s: 2, why: '겨울 온천·물안개' },
      { m: HOT, s: -2, why: '한여름엔 온천 수요가 적어요' },
    ] },
    beppu: { rules: [
      { m: WINTER, s: 2, why: '겨울 온천 제철' },
      { m: [11], s: 1, why: '선선한 가을 온천' },
      { m: HOT, s: -2, why: '한여름엔 온천 수요가 적어요' },
    ] },
    itoshima: { rules: [
      { m: HOT, s: 2, why: '해변·서핑 시즌' },
      { m: [10, 11, 12, 1, 2, 3], s: 1, why: '굴 오두막 시즌 (10월~3월)' },
    ] },
    yanagawa: { rules: [
      { m: [3, 4], s: 1, why: '봄 뱃놀이' },
      { m: WINTER, s: 1, why: '고타츠 배 (겨울 난방 뱃놀이)' },
      { m: HOT, s: -1, why: '한낮 뱃놀이는 더워요' },
    ] },
    maizuru: { rules: [{ m: [3, 4], s: 2, why: '후쿠오카성 벚꽃 축제' }] },
    nokonoshima: { rules: [
      { m: [3, 4], s: 2, why: '유채꽃 언덕 (2월 말~4월 초)' },
      { m: [10], s: 2, why: '코스모스 언덕 절정' },
      { m: [9, 11], s: 1, why: '코스모스 (9월 말 개화~11월 초)' },
      { m: [7, 8], s: 1, why: '해바라기 (7월 중순~8월 중순)' },
    ] },
    kushida: { rules: [{ m: [7], s: 2, why: '야마카사 축제 (7월 1~15일)' }] },
    motsunabe: { rules: [{ m: [11, 12, 1, 2], s: 2, why: '겨울 대표 전골' }] },
    kakigoya: { only: [10, 11, 12, 1, 2, 3], rules: [
      { m: [11, 12, 1, 2, 3], s: 2, why: '굴 제철 (11~3월)' },
      { m: [10], s: 1, why: '10월부터 가게마다 차례로 개장' },
    ] },
    unagi: { rules: [{ m: [7], s: 1, why: '장어 먹는 날 (도요노우시노히, 7월 하순 전후)' }] },
    yufuin_ryokan: { rules: [
      { m: WINTER, s: 2, why: '겨울 온천 료칸' },
      { m: [11], s: 1, why: '단풍' },
      { m: HOT, s: -2, why: '한여름엔 료칸 대신 시내 호텔을 추천해요' },
    ] },
    suginoi: { rules: [
      { m: WINTER, s: 2, why: '겨울 온천 제철' },
      { m: HOT, s: 1, why: '실내 워터파크 아쿠아 비트 (4월 말~9월 운영)' },
    ] },
    seahawk: { rules: [{ m: HOT, s: 1, why: '바로 앞 모모치 해변' }] },
  },
};

const CITY_EVENTS = {
  tokyo: [
    { id: 't_hatsumode', months: [1], title: '새해 첫 참배 (하쓰모데)', when: '1월 1~3일', desc: '센소지·메이지 신궁에 사흘 동안 수백만 명이 몰려요. 연초 3일은 쉬는 가게가 많아요.', kind: 'culture', places: ['sensoji'] },
    { id: 't_ume', months: [2, 3], title: '매화 시즌', when: '2월 중순~3월 초', desc: '우에노역에서 걸어서 10분인 유시마 텐진 매화 축제(2월 초~3월 초)가 대표적이에요. 벚꽃보다 한 달쯤 먼저 피어요.', kind: 'nature', places: [] },
    { id: 't_sakura', months: [3, 4], title: '벚꽃 시즌', when: '3월 말~4월 초 (해마다 개화일 확인)', desc: '메구로강 벚꽃길, 우에노 공원, 신주쿠교엔이 대표 명소예요. 밤 벚꽃 조명도 인기예요.', kind: 'nature', places: ['nakameguro', 'ueno', 'shinjukugyoen'] },
    { id: 't_sanja', months: [5], title: '산자 마쓰리', when: '5월 셋째 주 금~일', desc: '아사쿠사 신사의 가마(미코시) 행렬. 도쿄에서 가장 열기 넘치는 축제예요.', kind: 'festival', places: ['sensoji'] },
    { id: 't_ajisai', months: [6], title: '수국 시즌', when: '6월 초~7월 중순', desc: '가마쿠라 메이게츠인(6월 초~하순), 하코네 등산열차 수국(6월 중순~7월 중순)이 유명해요.', kind: 'nature', places: ['kamakura', 'hakone'] },
    { id: 't_hanabi', months: [7], title: '스미다강 불꽃놀이', when: '7월 마지막 토요일 저녁', desc: '약 2만 발을 쏘는 도쿄 대표 불꽃놀이. 아사쿠사 일대가 매우 붐벼요.', kind: 'festival', places: ['sensoji', 'skytree'] },
    { id: 't_disney_halloween', months: [9, 10], title: '디즈니 할로윈', when: '9월 중순~10월 31일', desc: '할로윈 퍼레이드와 한정 굿즈, 분장 입장이 가능한 기간이 있어요.', kind: 'event', places: ['disneyland', 'disneysea'] },
    { id: 't_ichou', months: [11, 12], title: '은행나무·단풍', when: '11월 중순~12월 초', desc: '진구가이엔 은행나무길이 노랗게 물들어요. 신주쿠교엔 단풍도 이때예요.', kind: 'nature', places: ['ichou', 'shinjukugyoen'] },
    { id: 't_disney_xmas', months: [11, 12], title: '디즈니 크리스마스', when: '11월 초중순~12월 25일', desc: '크리스마스 퍼레이드와 대형 트리.', kind: 'event', places: ['disneyland', 'disneysea'] },
    { id: 't_illumination', months: [11, 12, 1, 2], title: '겨울 일루미네이션', when: '11월 초~12월 25일 (마루노우치는 2월 중순까지)', desc: '마루노우치·롯폰기·긴자가 불빛으로 장식돼요. 크리스마스 전후가 절정이에요.', kind: 'event', places: ['marunouchi', 'ginza'] },
    { id: 't_onsen', months: [12, 1, 2], title: '하코네 온천', when: '12월~2월', desc: '도쿄에서 1시간 30분. 겨울 당일치기·1박 온천으로 가장 인기예요. 시내에 머문다면 도심 온천 료칸(호시노야 도쿄)도 있어요.', kind: 'onsen', places: ['hakone', 'hoshinoya'] },
  ],

  osaka: [
    { id: 'o_crab', months: [11, 12, 1, 2, 3], title: '대게·복어 제철', when: '11월~3월', desc: '카니도라쿠 게 코스, 구로몬 시장 복어가 제철이에요.', kind: 'food', places: ['kani', 'kuromon'] },
    { id: 'o_onsen', months: [12, 1, 2], title: '아리마 온천', when: '12월~2월', desc: '오사카에서 1시간, 겨울에 가장 인기 있는 당일·1박 온천이에요.', kind: 'onsen', places: ['arima', 'arima_ryokan'] },
    { id: 'o_ume', months: [2, 3], title: '오사카성 매화 숲', when: '2월 중순~3월 초 (1~3월에 걸쳐 차례로 개화)', desc: '오사카성 공원 매화 숲에 약 100종 1,200여 그루가 피어요. 천수각을 배경으로 한 매화 사진이 인기예요.', kind: 'nature', places: ['osakajo'] },
    { id: 'o_sakura', months: [3, 4], title: '벚꽃 시즌', when: '3월 말~4월 초', desc: '오사카성 니시노마루 정원, 교토 철학의 길·마루야마 공원이 명소예요.', kind: 'nature', places: ['osakajo', 'kyoto'] },
    { id: 'o_zouheikyoku', months: [4], title: '조폐국 벚꽃길 개방', when: '4월 초중순 약 1주일 (인터넷·전화 사전 신청)', desc: '평소 닫혀 있는 조폐국 안 약 560m 벚꽃길(140여 품종, 대부분 겹벚꽃)을 1주일만 개방해요.', kind: 'nature', places: ['zouheikyoku'] },
    { id: 'o_gion', months: [7], title: '교토 기온 마쓰리', when: '7월 한 달 (야마보코 순행 7/17 · 7/24)', desc: '일본 3대 마쓰리. 거대한 수레 행렬과 전날 밤 요이야마 노점이 볼거리예요.', kind: 'festival', places: ['kyoto'] },
    { id: 'o_tenjin', months: [7], title: '텐진 마쓰리', when: '7월 24~25일', desc: '25일 밤 강 위 배 행렬과 불꽃놀이. 오사카 최대 여름 축제예요.', kind: 'festival', places: [] },
    { id: 'o_usj_summer', months: [7, 8], title: 'USJ 여름 이벤트', when: '7월~9월 초 (해마다 내용 확인)', desc: '물을 흠뻑 맞는 여름 한정 쇼·퍼레이드.', kind: 'event', places: ['usj'] },
    { id: 'o_usj_halloween', months: [9, 10], title: 'USJ 할로윈', when: '9월 초중순~11월 초', desc: '낮엔 가족용 할로윈, 밤엔 좀비가 나오는 호러 나이트.', kind: 'event', places: ['usj'] },
    { id: 'o_momiji', months: [11, 12], title: '교토 단풍', when: '11월 중순~12월 초', desc: '도후쿠지·에이칸도·기요미즈데라 야간 특별관람. 1년 중 교토가 가장 붐벼요.', kind: 'nature', places: ['kyoto', 'arashiyama'] },
    { id: 'o_hikari', months: [11, 12], title: '오사카 빛의 향연', when: '11월 초~12월 31일 (나카노시마 빛의 르네상스는 12월 중순~25일)', desc: '미도스지 가로수 일루미네이션과 나카노시마 빛의 르네상스(중앙공회당 프로젝션 매핑).', kind: 'event', places: ['hikari'] },
    { id: 'o_xmas_market', months: [11, 12], title: '우메다 스카이빌딩 크리스마스 마켓', when: '11월 중순~12월 25일', desc: '우메다 스카이빌딩 1층 광장의 크리스마스 마켓(글뤼바인·장식품)과 대형 트리. 예전 \'독일 크리스마스 마켓\'은 2022년에 끝나고 지금은 스카이빌딩 자체 행사로 열려요.', kind: 'event', places: ['umedasky'] },
  ],

  sapporo: [
    { id: 's_onsen', months: [12, 1, 2], title: '설경 온천', when: '12월~2월', desc: '눈 쌓인 노천탕. 조잔케이는 시내에서 1시간 거리예요.', kind: 'onsen', places: ['jozankei', 'noboribetsu', 'morinouta', 'takimotokan'] },
    { id: 's_ski', months: [12, 1, 2, 3], title: '스키 시즌', when: '12월~3월 (파우더는 1~2월)', desc: '니세코·키로로가 대표 스키장이에요.', kind: 'activity', places: ['niseko', 'kiroro'] },
    { id: 's_penguin', months: [12, 1, 2, 3], title: '아사히야마 동물원 펭귄 산책', when: '12월 중하순~3월 중순 (눈이 쌓이면)', desc: '펭귄들이 눈길을 줄지어 걷는 겨울 한정 이벤트.', kind: 'event', places: ['asahiyama'] },
    { id: 's_crab', months: [11, 12, 1, 2, 3], title: '게 요리 제철', when: '11월~3월', desc: '게 코스 요리와 니조 시장 게가 제철이에요.', kind: 'food', places: ['kanihonke', 'nijo'] },
    { id: 's_snowfest', months: [2], title: '삿포로 눈축제', when: '2월 초 8일간 (2027년 2월 4~11일)', desc: '오도리 공원 대형 눈 조각과 스스키노 얼음 조각. 숙소가 일찍 차니 서둘러 예약하세요.', kind: 'festival', places: ['odori', 'susukino'] },
    { id: 's_yukiakari', months: [2], title: '오타루 눈 등불 축제', when: '2월 초중순 약 8일 (2026년 2월 7~14일)', desc: '운하와 옛 철길에 촛불을 밝혀요. 눈축제와 기간이 겹쳐 함께 보기 좋아요.', kind: 'festival', places: ['otaru'] },
    { id: 's_sakura', months: [4, 5], title: '벚꽃', when: '4월 말~5월 초', desc: '도쿄보다 한 달 늦은 벚꽃. 마루야마 공원·홋카이도 신궁이 명소예요.', kind: 'nature', places: ['maruyama'] },
    { id: 's_lilac', months: [5], title: '라일락 축제', when: '5월 하순 (약 12일)', desc: '오도리 공원 라일락 꽃길과 와인 가든.', kind: 'festival', places: ['odori'] },
    { id: 's_yosakoi', months: [6], title: 'YOSAKOI 소란 마쓰리', when: '6월 초중순 5일간', desc: '약 2만 7천 명이 춤추는 거리 퍼레이드. 오도리 공원 일대에서 열려요.', kind: 'festival', places: ['odori'] },
    { id: 's_uni', months: [6, 7, 8], title: '성게(우니) 제철', when: '6월~8월', desc: '니조 시장 성게 덮밥이 가장 맛있는 때예요.', kind: 'food', places: ['nijo'] },
    { id: 's_lavender', months: [7], title: '라벤더 절정', when: '7월 초중순 (6월 말~8월 초)', desc: '후라노 팜 도미타와 비에이 꽃밭. 버스 투어는 미리 예약하세요.', kind: 'nature', places: ['biei'] },
    { id: 's_beergarden', months: [7, 8], title: '오도리 비어가든', when: '7월 중하순~8월 중순', desc: '오도리 공원이 맥주 회사별 야외 비어가든으로 바뀌어요.', kind: 'food', places: ['odori', 'beer'] },
    { id: 's_autumnfest', months: [9], title: '삿포로 오텀 페스트', when: '9월 중순~10월 초 (약 3주)', desc: '홋카이도 각지 먹거리가 오도리 공원에 모이는 먹거리 축제예요.', kind: 'food', places: ['odori'] },
    { id: 's_momiji', months: [10, 11], title: '단풍·은행나무', when: '10월 초중순 (조잔케이) · 10월 말~11월 초 (홋카이도대)', desc: '조잔케이 계곡 단풍과 홋카이도대학 은행나무 터널.', kind: 'nature', places: ['jozankei', 'hokudai'] },
    { id: 's_illumination', months: [11, 12], title: '화이트 일루미네이션', when: '11월 하순~12월 25일 (역 앞 일부 구간은 3월 중순까지)', desc: '오도리 공원·역 앞 거리의 겨울 조명. 뮌헨 크리스마스 시장도 함께 열려요.', kind: 'event', places: ['odori'] },
  ],

  fukuoka: [
    { id: 'f_goukaku', months: [1, 2], title: '합격 기원 참배', when: '1월~2월 시험 시즌', desc: '다자이후 텐만구는 학문의 신을 모신 곳. 수험생 부적이 인기예요.', kind: 'culture', places: ['dazaifu'] },
    { id: 'f_ichigo', months: [12, 1, 2, 3, 4], title: '아마오우 딸기', when: '12월~4월', desc: '후쿠오카 명물 딸기. 카페·편의점에 딸기 디저트가 쏟아져요.', kind: 'food', places: [] },
    { id: 'f_onsen', months: [12, 1, 2], title: '유후인·벳푸 온천', when: '12월~2월', desc: '유후인 긴린코 아침 물안개와 노천탕이 가장 좋은 계절이에요.', kind: 'onsen', places: ['yufuin', 'beppu', 'yufuin_ryokan', 'suginoi'] },
    { id: 'f_motsunabe', months: [11, 12, 1, 2], title: '모츠나베 제철', when: '겨울', desc: '추운 날 곱창전골에 짬뽕면으로 마무리.', kind: 'food', places: ['motsunabe'] },
    { id: 'f_kaki', months: [10, 11, 12, 1, 2, 3], title: '굴 오두막 (가키고야)', when: '10월~3월 (가게마다 다르고 일부는 4월까지)', desc: '이토시마 기시·후나코시·가후리 등 어항에서 굴을 직접 구워 먹어요. 주말엔 대기가 길어요.', kind: 'food', places: ['kakigoya', 'itoshima'] },
    { id: 'f_ume', months: [2, 3], title: '다자이후 매화', when: '1월 말~3월 초 (절정 2월)', desc: '다자이후 텐만구 경내 매화 약 200종 6천 그루.', kind: 'nature', places: ['dazaifu'] },
    { id: 'f_sakura', months: [3, 4], title: '벚꽃 시즌', when: '3월 말~4월 초', desc: '마이즈루 공원(후쿠오카성 벚꽃 축제)이 대표 명소예요. 밤 조명도 있어요.', kind: 'nature', places: ['maizuru', 'ohori'] },
    { id: 'f_nanohana', months: [3, 4], title: '노코노시마 유채꽃', when: '3월~4월 초 (2월 말부터 개화)', desc: '바다를 배경으로 한 노란 유채꽃 언덕.', kind: 'nature', places: ['nokonoshima'] },
    { id: 'f_dontaku', months: [5], title: '하카타 돈타쿠', when: '5월 3~4일', desc: '200만 명이 모이는 거리 퍼레이드. 골든위크라 숙소가 비싸요.', kind: 'festival', places: ['tenjin'] },
    { id: 'f_yamakasa', months: [7], title: '하카타 기온 야마카사', when: '7월 1~15일 (15일 새벽 오이야마)', desc: '장식 야마카사가 시내 곳곳에 세워지고, 마지막 날 새벽 가마 달리기가 절정이에요.', kind: 'festival', places: ['kushida'] },
    { id: 'f_umi', months: [7, 8], title: '바다·해수욕', when: '7월~8월', desc: '이토시마 해변 카페와 모모치 해변. 서핑·SUP 체험도 인기예요.', kind: 'activity', places: ['itoshima', 'tower'] },
    { id: 'f_himawari', months: [7, 8], title: '해바라기', when: '7월 중순~8월 중순', desc: '노코노시마 해바라기 밭.', kind: 'nature', places: ['nokonoshima'] },
    { id: 'f_hojoya', months: [9], title: '호조야 축제', when: '9월 12~18일', desc: '하코자키 궁 참배길에 노점 약 500개가 서는 가을 축제예요.', kind: 'festival', places: [] },
    { id: 'f_cosmos', months: [9, 10, 11], title: '코스모스', when: '9월 말~11월 초 (절정 10월)', desc: '노코노시마 코스모스 언덕. 일찍 피는 품종과 늦게 피는 품종이 이어서 피어요.', kind: 'nature', places: ['nokonoshima'] },
    { id: 'f_momiji', months: [11], title: '단풍', when: '11월 중순~말', desc: '유후인, 다자이후 고묘젠지, 아키즈키 성터가 명소예요.', kind: 'nature', places: ['yufuin', 'dazaifu'] },
    { id: 'f_xmas', months: [11, 12], title: '크리스마스 마켓', when: '11월 초~12월 25일 (텐진 회장은 11월 중순부터)', desc: '하카타역 앞 광장·텐진 일대 크리스마스 마켓 (\'크리스마스 어드벤트\'로 이름이 바뀌었어요).', kind: 'event', places: ['tenjin'] },
  ],
};

// 달별 안내 (결과 화면 "○월 ○○는"). 계절 요약보다 이 달에 맞는 내용만 보여 준다.
const MONTH_NOTES = {
  tokyo: {
    1: { text: '맑고 건조하며 영상 5도 안팎이에요. 1~3일은 센소지·메이지 신궁 새해 참배로 붐비고 쉬는 가게가 많아요. 마루노우치 일루미네이션과 하코네 온천이 인기예요.', wear: '코트 · 목도리' },
    2: { text: '가장 추운 달이지만 맑은 날이 많아요. 중순부터 유시마 텐진 매화가 피고, 마루노우치 일루미네이션은 2월 중순까지예요.', wear: '코트 · 목도리' },
    3: { text: '하순에 벚꽃이 피기 시작해요 (메구로강·우에노·신주쿠교엔). 중순까지는 아직 쌀쌀해요.', wear: '얇은 코트 · 니트' },
    4: { text: '초순이 벚꽃 절정이고, 이후엔 신록이 예뻐요. 말부터 골든위크라 숙소가 비싸져요.', wear: '낮 15~20도 · 얇은 겉옷' },
    5: { text: '골든위크(5월 초)는 혼잡하고, 셋째 주말엔 아사쿠사 산자 마쓰리가 열려요. 걷기 좋은 날씨예요.', wear: '반팔 + 얇은 겉옷' },
    6: { text: '장마철이에요. 가마쿠라·하코네 수국이 절정이고, 비 오는 날은 팀랩·미술관 같은 실내 코스를 섞어요.', wear: '우산 · 통풍 잘되는 옷' },
    7: { text: '중순 장마가 끝나면 무더위가 시작돼요. 마지막 토요일 스미다강 불꽃놀이. 낮엔 실내, 저녁엔 야경 위주로 짜고 온천·료칸은 빼고 추천해요.', wear: '반팔 · 양산' },
    8: { text: '35도 안팎으로 가장 더워요. 실내 코스와 저녁 야경 위주로 짜요. 중순 오봉 연휴엔 붐비고, 온천·료칸은 빼고 추천해요.', wear: '반팔 · 양산 · 휴대용 선풍기' },
    9: { text: '늦더위와 태풍을 확인하세요. 중순부터 디즈니 할로윈이 시작돼요.', wear: '반팔 · 저녁엔 얇은 겉옷' },
    10: { text: '1년 중 걷기 가장 좋은 달이에요. 디즈니 할로윈이 31일까지 이어져요.', wear: '낮 18~22도 · 가디건' },
    11: { text: '초순부터 일루미네이션·디즈니 크리스마스, 중순부터 진구가이엔 은행나무가 물들어요.', wear: '가디건 · 얇은 코트' },
    12: { text: '초순 은행나무 끝물, 크리스마스 일루미네이션 절정이에요. 29일부터 새해 3일까지는 쉬는 가게가 많아요. 하코네 온천도 좋은 때예요.', wear: '코트' },
  },
  osaka: {
    1: { text: '대게·복어 제철이고 아리마 온천이 인기예요. 새해 1~3일은 쉬는 가게가 많아요. 교토는 오사카보다 더 춥게 느껴져요.', wear: '코트 · 목도리' },
    2: { text: '가장 추운 달이에요. 중순부터 오사카성 매화숲이 피고, 대게 제철이 이어져요.', wear: '코트 · 목도리' },
    3: { text: '하순에 오사카성·교토 벚꽃이 피기 시작해요. 대게는 이달이 마지막이에요.', wear: '얇은 코트' },
    4: { text: '초순이 벚꽃 절정이고, 초중순 1주일만 조폐국 벚꽃길이 열려요 (사전 신청). 말부터 골든위크로 붐벼요.', wear: '얇은 겉옷' },
    5: { text: '골든위크는 혼잡해요. 신록의 교토·나라를 걷기 좋은 때예요.', wear: '반팔 + 얇은 겉옷' },
    6: { text: '장마철이에요. 가이유칸·USJ처럼 실내 비중을 높이면 좋아요.', wear: '우산' },
    7: { text: '무더위가 시작돼요. 교토 기온 마쓰리(17·24일 행렬), 24~25일 텐진 마쓰리, USJ 여름 이벤트가 열려요. 온천·료칸은 빼고 추천해요.', wear: '반팔 · 양산' },
    8: { text: '가장 더운 달이에요. 교토 한낮 도보 관광은 피하고 이른 아침에 다녀요. 온천·료칸은 빼고 추천해요.', wear: '반팔 · 양산 · 물' },
    9: { text: '늦더위와 태풍을 확인하세요. 중순부터 USJ 할로윈이 시작돼요.', wear: '반팔' },
    10: { text: '선선해져 걷기 좋아요. USJ 할로윈 절정, 아라시야마 대나무숲 야간 라이트업이 열려요.', wear: '가디건' },
    11: { text: '중순부터 교토 단풍 절정이에요. 1년 중 교토가 가장 붐비니 숙소를 일찍 잡으세요. 미도스지 일루미네이션과 대게 제철이 시작돼요.', wear: '가디건 · 얇은 코트' },
    12: { text: '초순은 교토 단풍 끝물, 크리스마스 마켓과 미도스지 빛의 향연이 이어져요. 아리마 온천·대게가 좋은 때예요.', wear: '코트' },
  },
  sapporo: {
    1: { text: '스키와 설경 온천이 절정이에요. 한낮에도 0도 안팎이고, 아사히야마 동물원 펭귄 산책을 볼 수 있어요.', wear: '롱패딩 · 방한화 · 핫팩' },
    2: { text: '초순 눈축제가 8일간 열려요 (2027년 2월 4~11일). 오타루 눈 등불 축제도 비슷한 때예요. 숙소를 일찍 잡으세요.', wear: '롱패딩 · 미끄럼 방지 방한화' },
    3: { text: '늦겨울로 스키는 아직 가능해요. 눈이 녹기 시작해 길이 질척해요.', wear: '패딩 · 방수 신발' },
    4: { text: '눈이 녹는 비수기예요. 말에 벚꽃이 피기 시작해요.', wear: '패딩 · 경량 패딩' },
    5: { text: '초순 벚꽃(마루야마 공원), 하순 라일락 축제가 열려요. 아침저녁은 쌀쌀해요.', wear: '경량 패딩' },
    6: { text: '초중순 요사코이 소란 마쓰리, 성게 제철이에요. 장마가 거의 없어요.', wear: '긴팔 + 얇은 겉옷' },
    7: { text: '중순이 라벤더 절정이고, 하순부터 오도리 비어가든이 열려요. 25도 안팎이라 피서지로 좋아요.', wear: '반팔 + 얇은 겉옷' },
    8: { text: '오도리 비어가든(중순까지)과 성게 제철. 시원한 여름이에요.', wear: '반팔 + 겉옷' },
    9: { text: '중순부터 오텀 페스트(먹거리 축제)가 열려요. 선선해져요.', wear: '긴팔 · 가디건' },
    10: { text: '초중순 조잔케이 단풍, 말에 홋카이도대 은행나무가 물들어요. 말쯤 첫눈이 내려요.', wear: '두꺼운 겉옷' },
    11: { text: '초순 은행나무, 첫눈이 와요. 하순부터 화이트 일루미네이션·크리스마스 시장이 열리고 게 제철이 시작돼요.', wear: '패딩' },
    12: { text: '스키장이 열리고 일루미네이션·크리스마스 시장(25일까지), 설경 온천의 계절이에요.', wear: '롱패딩 · 방한화 · 핫팩' },
  },
  fukuoka: {
    1: { text: '아마오우 딸기·모츠나베·굴 오두막 제철이에요. 다자이후 합격 기원 참배가 많고, 하순부터 매화가 피어요.', wear: '코트' },
    2: { text: '다자이후 매화 절정이에요. 모츠나베·굴·딸기도 제철이에요.', wear: '코트' },
    3: { text: '하순 벚꽃 개화(마이즈루 공원), 노코노시마 유채꽃. 굴 오두막은 이달이 마지막이에요.', wear: '얇은 코트' },
    4: { text: '초순 벚꽃 절정, 유채꽃이 예뻐요. 황사 소식을 확인하세요.', wear: '얇은 겉옷' },
    5: { text: '3~4일 하카타 돈타쿠 축제로 시내가 붐비고, 골든위크라 숙소가 비싸요.', wear: '반팔 + 얇은 겉옷' },
    6: { text: '장마철이라 비 오는 날은 야타이가 쉬는 곳이 많아요. 라라포트 같은 실내 코스를 섞어요.', wear: '우산' },
    7: { text: '1~15일 하카타 기온 야마카사(15일 새벽 오이야마). 중순부터 해바라기, 이토시마 바다가 제철이에요. 온천·료칸은 빼고 추천해요.', wear: '반팔 · 양산' },
    8: { text: '해수욕·해바라기 시즌이에요. 태풍 때는 야타이가 쉬어요. 온천·료칸은 빼고 추천해요.', wear: '반팔 · 양산' },
    9: { text: '12~18일 호조야 축제. 늦더위·태풍을 확인하세요. 하순부터 코스모스가 피어요.', wear: '반팔' },
    10: { text: '노코노시마 코스모스 절정, 이토시마 굴 오두막이 문을 열어요.', wear: '가디건' },
    11: { text: '다자이후 단풍, 크리스마스 마켓이 시작되고 모츠나베 시즌이에요.', wear: '가디건 · 얇은 코트' },
    12: { text: '모츠나베·굴·딸기 제철, 크리스마스 마켓(25일까지). 서울보다 따뜻한 영상 5~10도예요.', wear: '코트' },
  },
};

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
