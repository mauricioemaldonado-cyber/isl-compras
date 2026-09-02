# Gestor de Compras ISL — Fase 1 (Pedido + Bandeja)

## 1. Crear el Google Sheet

Creá un Google Sheet nuevo con estas hojas y encabezados **exactos** (en la fila 1):

**Pedidos**
```
ID_Pedido | Fecha_Pedido | Solicitante | Tipo_CC | Centro_Costo | Item_Certificacion | Categoria_Gasto | Fecha_Necesidad | Urgencia | Estado | Observaciones
```

**Pedidos_Items**
```
ID_Pedido | N_Item | ID_Catalogo | Descripcion | Cantidad | Unidad | Estado_Item | Motivo_Anulacion
```
`Estado_Item` puede ser: Pendiente | Asignado a OC | Asignado a PM | Cubierto por stock | Anulado.
`Motivo_Anulacion` solo se completa cuando el ítem se anula (texto libre).

**Catalogo**
```
ID_Catalogo | Nomenclatura_ISL | Unidad | Rubro | Alias_Solicitante | Alias_Proveedor
```
(Puede arrancar vacía — se va a ir llenando cuando construyamos la Pantalla 3 de armado de OC.)

**CentrosCosto**
```
ID | Nombre | Tipo | Cliente
```
Cargar acá las obras (Tipo = "Obra") y los establecimientos propios (Tipo = "Establecimiento"), ej:
```
1 | YPF Terminal San Lorenzo | Obra | YPF
2 | Neo Rodas - Zárate | Obra | Mirgor
3 | Taller Rioja | Establecimiento |
4 | Taller Ruta 11 | Establecimiento |
5 | Oficina | Establecimiento |
```

**ItemsCertificacion**
```
ID | Centro_Costo_ID | Descripcion
```
`Centro_Costo_ID` es el ID de la hoja CentrosCosto al que pertenece ese ítem.

**CategoriasGasto**
```
ID | Nombre
```
Ej: Herramientas, Mantenimiento, Insumos.

**SolicitudesCotizacion**
```
ID_Solicitud | Fecha | ID_Pedido | Items | Proveedores_Emails
```
Registro simple de trazabilidad: cada vez que José genera un mail o WhatsApp de solicitud de cotización desde la Bandeja, queda una fila acá con qué ítems se cotizaron y a qué contactos. No es el módulo completo de Cotizaciones (eso queda para más adelante) — es solo un historial mínimo.

**Especialidades**
```
ID | Codigo | Nombre
```
Ejemplo:
```
1 | I | Instrumentación
2 | E | Eléctrica
3 | M | Mecánica
4 | C | Civil
```
La cargás y editás vos directamente en el Sheet — se usa en el selector de "Especialidad" al armar la OC (para el número tipo 6540-**I**-LMT).

**OC**
```
ID_OC | Numero_OC | Fecha | Tipo | Especialidad | Proveedor_RazonSocial | Proveedor_Domicilio | Proveedor_Telefono | Proveedor_Email | Proveedor_Contacto | Proveedor_Cargo | Moneda | Condiciones_Pago | Plazo_Entrega | Forma_Entrega | Descuento_Pct | Bonificacion_Pct | IVA_Pct | Nro_Presupuesto | Confecciono | Autorizo | Ejecuto | Requisitos_Cierre | Estado | Observaciones
```
Esta hoja la completa automáticamente la app. `Numero_OC` es el que José tipea a mano (ej: 6540-I-LMT). `Estado` arranca en "Pendiente de aprobación".

**OC_Items**
```
ID_OC | N_Item | ID_Pedido_Origen | N_Item_Pedido_Origen | Descripcion | Cantidad | Unidad | Precio_Unitario | Subtotal | Centro_Costo | Item_Certificacion | Categoria_Gasto | Codigo | IVA_Pct
```
Esta hoja la completa automáticamente la app. Guarda de qué pedido/ítem original viene cada línea de la OC, para trazabilidad. `Codigo` es opcional (código interno/del proveedor). `IVA_Pct` es la alícuota de ese ítem puntual (21 / 10.5 / 0) — el IVA se define por ítem, no por OC completa, porque una misma orden puede mezclar materiales con distintas alícuotas.

Nota: la columna `IVA_Pct` de la hoja **OC** (a nivel de cabecera) quedó sin uso — se mantiene vacía por compatibilidad, pero el IVA real vive en `OC_Items`.

**Proveedores**
```
ID_Proveedor | Razon_Social | Domicilio | Telefono | Email | Contacto | Cargo
```
Esta hoja la completa automáticamente la app — arranca vacía. Cada vez que José arma una OC con un proveedor nuevo, se crea la entrada acá; la próxima vez que empiece a escribir ese nombre en "Razón Social", el sistema lo sugiere y completa el resto de los datos solo.

## 2. Copiar el ID del Sheet

De la URL del Google Sheet:
`https://docs.google.com/spreadsheets/d/ESTE_ES_EL_ID/edit`

Pegalo en `Codigo.gs`, reemplazando `PEGAR_AQUI_EL_ID_DEL_GOOGLE_SHEET`.

## 3. Crear el proyecto de Apps Script

1. Desde el mismo Google Sheet: Extensiones → Apps Script.
2. Borrá el contenido de `Código.gs` y pegá el contenido de `Codigo.gs`.
3. Guardá el proyecto.
4. Implementar → Nueva implementación → tipo "Aplicación web".
   - Ejecutar como: **Yo**
   - Quién tiene acceso: **Cualquier usuario** (o "Cualquier usuario con cuenta de Google" según prefieran)
5. Copiá la URL que te da (termina en `/exec`).

## 4. Configurar el frontend

En `pedido.html` y `bandeja.html`, reemplazá:
```js
const API_URL = 'PEGAR_AQUI_LA_URL_DEL_APPS_SCRIPT_DEPLOYADO';
```
por la URL `/exec` del paso anterior.

## 5. Publicar en GitHub Pages

1. En tu repo (`mauricioemaldonado-cyber`), creá una carpeta `compras/` (o un repo nuevo, como prefieras organizarlo).
2. Subí `pedido.html` y `bandeja.html`.
3. Activá GitHub Pages en la rama correspondiente.
4. Las URLs quedarían como:
   - `https://mauricioemaldonado-cyber.github.io/TU-REPO/pedido.html`
   - `https://mauricioemaldonado-cyber.github.io/TU-REPO/bandeja.html`

## Qué falta (próximas pantallas)

- **Pantalla 4**: Armado de PM (versión simplificada, sin precio).
- **Pantalla 5**: Recepción rápida (Almacén/jefe de obra confirma cantidades recibidas).
- Aprobación de OC por Gerencia (hoy toda OC nace en estado "Pendiente de aprobación" y no hay pantalla para que Gerencia la apruebe/rechace — se puede editar directamente en el Sheet por ahora).

## Pantallas ya construidas

1. `pedido.html` — Nuevo Pedido (solicitante)
2. `bandeja.html` — Bandeja de Pedidos (José): filtra, ve detalle, marca Stock/Anulación por ítem, solicita cotización por mail o WhatsApp
3. `armado-oc.html` — Arma OC combinando ítems de varios pedidos, define nomenclatura oficial de catálogo
4. `ordenes-compra.html` — Lista las OC generadas, ve detalle, e imprime con formato tipo papel (vía "Imprimir del navegador → Guardar como PDF")
