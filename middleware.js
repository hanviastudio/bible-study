// Server-side password gate (Vercel Edge Middleware).
// The real password lives in the SITE_PASSWORD environment variable and is
// only ever compared on the server — it is never sent to the browser.
// If SITE_PASSWORD is unset, the site stays open (prevents accidental lockout).

export const config = {
  matcher: '/((?!favicon.ico).*)',
};

export default function middleware(request) {
  const PASS = process.env.SITE_PASSWORD;
  if (!PASS) return; // no password configured -> allow through

  const cookie = request.headers.get('cookie') || '';
  const m = cookie.match(/(?:^|;\s*)bs_auth=([^;]+)/);
  const supplied = m ? decodeURIComponent(m[1]) : '';

  if (supplied === PASS) return; // correct -> serve the site

  const wrong = supplied.length > 0; // had a cookie, but it was wrong
  return new Response(loginPage(wrong), {
    status: 401,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'no-store',
    },
  });
}

function loginPage(wrong) {
  return `<!doctype html>
<html lang="ko"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Who Is Jesus? — 비밀번호</title>
<style>
  *{box-sizing:border-box}
  html,body{height:100%}
  body{margin:0;background:#14161C;color:#F1E9DA;
    font-family:"Figtree","Noto Sans KR",system-ui,sans-serif;font-weight:300;
    display:flex;align-items:center;justify-content:center;min-height:100vh;padding:1.5rem}
  .card{width:min(400px,100%);text-align:center}
  .lock{width:46px;height:46px;margin:0 auto 1.6rem;color:#E9C46A}
  .greek{font-family:Georgia,serif;font-style:italic;opacity:.5;font-size:1.05rem;margin-bottom:.7rem}
  h1{font-family:Georgia,"Noto Serif KR",serif;font-weight:400;font-size:1.9rem;margin:0 0 .5rem;letter-spacing:-.01em}
  p.sub{opacity:.7;font-size:.95rem;margin:0 0 2rem;line-height:1.6}
  form{display:flex;flex-direction:column;gap:.7rem}
  input{width:100%;padding:.85rem 1rem;font-size:1rem;color:#F1E9DA;
    background:rgba(255,255,255,.06);border:1px solid rgba(241,233,218,.25);border-radius:8px;outline:none}
  input:focus{border-color:#E9C46A}
  button{padding:.85rem 1rem;font-size:1rem;font-weight:600;cursor:pointer;color:#17161A;
    background:#E9C46A;border:0;border-radius:8px;transition:.18s}
  button:hover{background:#f0d488}
  .err{color:#E88A6B;font-size:.85rem;min-height:1.2em;margin:.2rem 0 0}
</style></head>
<body>
  <div class="card">
    <svg class="lock" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="10.5" width="16" height="10" rx="2"/><path d="M8 10.5V7a4 4 0 0 1 8 0v3.5"/><circle cx="12" cy="15.5" r="1.4"/></svg>
    <div class="greek">ἐν ἀρχῇ ἦν ὁ λόγος</div>
    <h1>Who Is Jesus?</h1>
    <p class="sub">이 자료는 비밀번호로 보호되어 있습니다.<br>비밀번호를 입력해 주세요.</p>
    <form id="f">
      <input id="pw" type="password" placeholder="비밀번호" autocomplete="current-password" autofocus>
      <button type="submit">들어가기</button>
      <p class="err">${wrong ? '비밀번호가 올바르지 않습니다.' : ''}</p>
    </form>
  </div>
  <script>
    document.getElementById('f').addEventListener('submit', function(e){
      e.preventDefault();
      var v = document.getElementById('pw').value;
      document.cookie = 'bs_auth=' + encodeURIComponent(v) + ';path=/;max-age=2592000;samesite=lax;secure';
      location.reload();
    });
  </script>
</body></html>`;
}
