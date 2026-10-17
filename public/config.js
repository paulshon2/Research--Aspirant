/* Research Aspirant 랜딩 설정 — 앱과 같은 도메인에서 서비스된다.
   APP_URL "/" = 같은 출처(로그인·가입 버튼이 /login, /rdos-signup 으로 이동).
   대기 등록은 서버 API(/api/waitlist)가 처리하므로 여기에 DB 키를 두지 않는다. */
window.RA_CONFIG = {
  APP_URL: "/",
  WAITLIST_API: "/api/waitlist"
};
