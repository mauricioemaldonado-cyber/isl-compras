// Convierte a mayúsculas, en tiempo real, todo lo que se escribe en campos de texto
// y áreas de texto de la app (a pedido de Compras — José). No afecta:
// - campos de email (las direcciones de mail no se escriben en mayúsculas)
// - números, teléfonos, contraseñas, fechas, archivos, checkboxes (no tiene sentido ahí)
//
// Usa "delegación de eventos" sobre document: así funciona también en campos que se
// crean dinámicamente después (como las filas de ítems que se agregan con JS), sin
// tener que enganchar el listener a cada input a mano.
//
// Mantiene la posición del cursor al convertir, para no repetir el problema viejo de
// "hay que salir y volver a entrar al campo para seguir escribiendo".

document.addEventListener('input', function (e) {
  const el = e.target;
  if (!el || !el.matches) return;

  const esCandidato = el.matches('input[type="text"], input:not([type]), textarea');
  if (!esCandidato) return;

  const inicio = el.selectionStart;
  const fin = el.selectionEnd;
  el.value = el.value.toUpperCase();
  try {
    el.setSelectionRange(inicio, fin);
  } catch (err) {
    // Algunos navegadores no permiten setSelectionRange en ciertos inputs; no pasa nada.
  }
});
