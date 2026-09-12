// Control de acceso simple para la app mobile de ISL Compras.
// No es un sistema de login real (no hay usuarios ni backend de autenticación) —
// es una clave única, compartida de palabra con las personas autorizadas a pedir,
// para evitar que cualquiera con el link cargue pedidos.
//
// Para cambiar la clave: editar el valor de ISL_ACCESS_CODE acá abajo.
const ISL_ACCESS_CODE = '4270';

function islAccesoAutorizado() {
  return localStorage.getItem('islComprasAuth') === 'ok';
}

function islOtorgarAcceso() {
  localStorage.setItem('islComprasAuth', 'ok');
}

// Llamar esto al principio de cualquier pantalla que requiera la clave.
// Si no está autorizado, redirige a app.html (que es la que pide el código).
function islExigirAcceso() {
  if (!islAccesoAutorizado()) {
    window.location.href = 'app.html';
  }
}
