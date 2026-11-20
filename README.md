# VITAFAMA — Tienda en línea

Tienda de suplementos y vitaminas 100% originales importados de EE.UU.

## Cómo editar los datos de la tienda

Abre `index.html` y busca el bloque `const CONFIG = { ... }` al inicio del `<script>`:

- `whatsapp`, `whatsappTexto`, `email`, `instagram`, `tiktok`, `facebook`: datos de contacto y redes.
- `envioGratisDesde` y `costoEnvio`: reglas de envío.
- `epayco.publicKey`: llave pública de ePayco para activar el pago en línea (tarjeta, PSE, Nequi, Daviplata). Mientras esté vacía, el pago en línea aparece como "Próximamente". Para probarlo sin llave, abre la página con `?demo` al final de la URL.
- `banco`: datos para pagos por transferencia.

Las categorías y subcategorías están en `CATS`, las marcas en `BRANDS` y las preguntas frecuentes en `FAQS`.

## Estructura

- `index.html`: la tienda completa (catálogo, carrito, checkout, preguntas frecuentes y panel de administración).
- `img/`: imágenes.
