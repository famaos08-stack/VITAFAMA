# VITAFAMA — Tienda en línea

Tienda de suplementos y vitaminas 100% originales importados de EE.UU.

## Cómo editar los datos de la tienda

Abre `index.html` y busca el bloque `const CONFIG = { ... }` al inicio del `<script>`:

- `whatsapp`, `whatsappTexto`, `email`, `instagram`, `tiktok`, `facebook`: datos de contacto y redes.
- `envioGratisDesde` y `costoEnvio`: reglas de envío.
- `epayco.publicKey`: llave pública de ePayco para activar el pago en línea (tarjeta, PSE, Nequi, Daviplata). Mientras esté vacía, el pago en línea aparece como "Próximamente". Para probarlo sin llave, abre la página con `?demo` al final de la URL.
- `banco`: datos para pagos por transferencia.

- `horario`: horario de los asesores humanos (lo usa el chatbot).
- `sheetsUrl`: URL de la aplicación web de Apps Script que guarda clientes, conversaciones y pedidos en Google Sheets.

Las categorías y subcategorías están en `CATS`, las marcas en `BRANDS` y las preguntas frecuentes en `FAQS`.

## Chatbot de atención al cliente

El chat (botón verde abajo a la derecha) responde al instante más de 30 temas: originalidad, envíos, pagos, devoluciones, estado del pedido, recomendaciones por necesidad, ventas al por mayor, etc. También:

- Recomienda productos del catálogo según la necesidad del cliente.
- Pide nombre, WhatsApp, correo y ciudad (con autorización de datos) y los guarda en Google Sheets.
- Pasa la conversación a un asesor por WhatsApp con el resumen de lo que preguntó el cliente.

Para agregar o cambiar respuestas, edita la lista `KB` en `index.html` (`k` = palabras clave, `a` = respuesta). En la hoja de Google, la pestaña **Conversaciones** marca con «No» las preguntas que el bot no supo responder: úsalas para agregar respuestas nuevas.

## Google Sheets

`apps-script/Codigo.gs` contiene el script que recibe los datos. Las instrucciones de instalación están al inicio de ese archivo.

## Estructura

- `index.html`: la tienda completa (catálogo, carrito, checkout, preguntas frecuentes y panel de administración).
- `img/`: imágenes.
