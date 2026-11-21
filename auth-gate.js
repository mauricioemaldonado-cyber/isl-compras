// Login con Google para ISL Compras (mismo esquema que Herramientas).
//
// Cómo funciona:
//  1. Al abrir una pantalla aparece "Ingresar con Google".
//  2. Con el email de Google se consulta la hoja "Accesos" del Sheet de Compras
//     (Apps Script de Compras, acción verificarAcceso).
//  3. Si el email tiene ✓ en la columna de esta app, entra; la sesión dura 8 horas en este dispositivo.
//
// Cada pantalla lo incluye como primera línea del <body>:
//   <script src="auth-gate.js" data-app="Pedidos" data-name="Gestor de Compras"></script>
// data-app = nombre de la columna en la hoja Accesos ("Pedidos" para quienes piden y reciben,
//            "Compras" para las pantallas de gestión: bandeja, OC, PM, proveedores, obras).
//
// Para dar o quitar acceso NO se toca código: se edita la hoja "Accesos".
(function () {
  const script = document.currentScript;
  const APP_KEY = (script && script.getAttribute('data-app')) || 'Compras';
  const APP_NAME = (script && script.getAttribute('data-name')) || 'Gestor de Compras';

  const CLIENT_ID = '446028196729-7896hqapre75bcu4t63ru8pb9jdci140.apps.googleusercontent.com';
  // Apps Script de Compras (acción verificarAcceso, lee la hoja "Accesos" del Sheet de Compras).
  const ACCESOS_URL = 'https://script.google.com/macros/s/AKfycbwHn09xBtZccaF1ziO5omhrCd1QvcLq093wE-sAQSG7TuYcNfWEJG_c64_81N_qUamXHw/exec';
  const LS_KEY = 'isl_compras_auth';
  const DURACION_MS = 8 * 60 * 60 * 1000;

  function leerSesiones() {
    try { return JSON.parse(localStorage.getItem(LS_KEY) || '{}') || {}; } catch (e) { return {}; }
  }
  function guardarSesion(email) {
    try {
      const s = leerSesiones();
      s[APP_KEY] = { email: email, ts: Date.now() };
      localStorage.setItem(LS_KEY, JSON.stringify(s));
    } catch (e) {}
  }
  function sesionVigente() {
    const s = leerSesiones()[APP_KEY];
    return (s && s.email && (Date.now() - s.ts) < DURACION_MS) ? s : null;
  }

  window.islCerrarSesion = function () {
    try { localStorage.removeItem(LS_KEY); } catch (e) {}
    location.reload();
  };

  function montar(fn) {
    if (document.body) fn(); else document.addEventListener('DOMContentLoaded', fn);
  }

  function estilos() {
    const st = document.createElement('style');
    st.textContent =
      '#isl-auth-overlay{position:fixed;inset:0;background:#eef2f8;z-index:99999;display:flex;align-items:center;justify-content:center;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;}' +
      '.isl-auth-box{background:#fff;border-radius:16px;box-shadow:0 4px 32px rgba(0,0,0,.12);padding:36px 32px;text-align:center;max-width:360px;width:90%;}' +
      '.isl-auth-logo{width:52px;height:52px;background:#1a3a6b;border-radius:12px;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:18px;margin:0 auto 18px;}' +
      '.isl-auth-title{font-size:19px;font-weight:700;color:#0f172a;margin-bottom:6px;}' +
      '.isl-auth-sub{font-size:13px;color:#64748b;margin-bottom:24px;line-height:1.5;}' +
      '.isl-auth-btn{display:flex;align-items:center;gap:10px;background:#fff;border:1.5px solid #e2e8f0;border-radius:10px;padding:11px 20px;font-size:14px;font-weight:500;color:#1e293b;cursor:pointer;width:100%;justify-content:center;}' +
      '.isl-auth-btn:hover{border-color:#1a3a6b;}' +
      '.isl-auth-err{margin-top:16px;padding:10px 14px;background:#fee2e2;border-radius:8px;font-size:12px;color:#dc2626;display:none;}' +
      '.isl-auth-loading{margin-top:16px;font-size:12px;color:#64748b;display:none;}' +
      '#isl-auth-chip{position:fixed;left:8px;bottom:8px;z-index:9000;background:rgba(15,23,42,.72);color:#fff;font:11px system-ui,sans-serif;padding:4px 9px;border-radius:12px;display:flex;gap:8px;align-items:center;}' +
      '#isl-auth-chip a{color:#fca5a5;cursor:pointer;text-decoration:underline;}' +
      '@media print{#isl-auth-chip,#isl-auth-overlay{display:none!important;}}';
    document.head.appendChild(st);
  }

  function chipUsuario(email) {
    montar(function () {
      estilos();
      const c = document.createElement('div');
      c.id = 'isl-auth-chip';
      const t = document.createElement('span');
      t.textContent = email;
      const a = document.createElement('a');
      a.textContent = 'Salir';
      a.addEventListener('click', window.islCerrarSesion);
      c.appendChild(t); c.appendChild(a);
      document.body.appendChild(c);
    });
  }

  const vigente = sesionVigente();
  if (vigente) { chipUsuario(vigente.email); return; }

  // Sin sesión: se tapa la pantalla con el login (la app queda detrás hasta que se autorice).
  montar(function () {
    estilos();
    const ov = document.createElement('div');
    ov.id = 'isl-auth-overlay';
    ov.innerHTML =
      '<div class="isl-auth-box">' +
      '<div class="isl-auth-logo">ISL</div>' +
      '<div class="isl-auth-title"></div>' +
      '<div class="isl-auth-sub">Iniciá sesión con tu cuenta Google autorizada para acceder</div>' +
      '<button class="isl-auth-btn" id="isl-btn-login">Ingresar con Google</button>' +
      '<div class="isl-auth-loading" id="isl-auth-loading"></div>' +
      '<div class="isl-auth-err" id="isl-auth-err"></div>' +
      '</div>';
    document.body.appendChild(ov);
    ov.querySelector('.isl-auth-title').textContent = APP_NAME;

    const btn = ov.querySelector('#isl-btn-login');
    const errEl = ov.querySelector('#isl-auth-err');
    const loadEl = ov.querySelector('#isl-auth-loading');
    function showErr(m) { errEl.textContent = m; errEl.style.display = 'block'; loadEl.style.display = 'none'; btn.style.display = 'flex'; }
    function showLoad(m) { loadEl.textContent = m; loadEl.style.display = 'block'; errEl.style.display = 'none'; }

    // Librería de Google (se carga una sola vez)
    const g = document.createElement('script');
    g.src = 'https://accounts.google.com/gsi/client';
    g.async = true;
    document.head.appendChild(g);

    btn.addEventListener('click', function () {
      if (!window.google || !google.accounts || !google.accounts.oauth2) {
        showErr('Todavía se está cargando Google. Probá de nuevo en unos segundos.');
        return;
      }
      btn.style.display = 'none';
      showLoad('Abriendo Google…');
      google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: 'email profile',
        callback: async function (resp) {
          if (resp.error) { showErr('Error de Google: ' + resp.error); return; }
          try {
            showLoad('Obteniendo perfil…');
            const info = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
              headers: { Authorization: 'Bearer ' + resp.access_token }
            }).then(function (r) { return r.json(); });
            const email = (info.email || '').toLowerCase().trim();
            if (!email) { showErr('No se pudo obtener el email.'); return; }
            showLoad('Verificando acceso para ' + email + '…');
            const url = ACCESOS_URL + '?payload=' + encodeURIComponent(JSON.stringify(
              { action: 'verificarAcceso', email: email, app: APP_KEY })) + '&_t=' + Date.now();
            const res = await fetch(url, { redirect: 'follow', mode: 'cors' }).then(function (r) { return r.json(); });
            if (res.ok && res.autorizado) {
              guardarSesion(email);
              ov.remove();
              chipUsuario(email);
            } else {
              // Se muestra el motivo que devuelve el servidor (hoja Accesos inexistente, columna faltante, etc.)
              // para distinguir "no está autorizado" de "el servidor no está configurado".
              const motivo = res && res.error ? ' (' + res.error + ')' : (res && res.ok ? '' : ' (respuesta inesperada del servidor)');
              showErr('⛔ ' + email + ' no tiene acceso a "' + APP_KEY + '".' + motivo + ' Pedile acceso a Mauricio.');
            }
          } catch (e) {
            showErr('Error de conexión: ' + e.message);
          }
        }
      }).requestAccessToken({ prompt: 'select_account' });
    });
  });
})();
