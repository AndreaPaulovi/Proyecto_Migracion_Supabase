# Nova Commerce — frontend para E-Commerce Backend API

Interfaz administrativa en React + Vite conectada a la API Express existente. Incluye inicio de sesión por cookie, vista general, CRUD de categorías, catálogo de productos, consulta de pedidos y espacio para incrustar Looker Studio.

## Requisitos
- Node.js 18 o superior y npm.
- Backend ejecutándose en `http://localhost:3000`.
- Cuenta válida en el backend. Para crear/editar/eliminar productos y categorías se requiere rol `admin`.

## Ejecutar localmente
1. Desde esta carpeta instala dependencias:
   ```bash
   npm install
   ```
2. Copia `.env.example` a `.env`. Para desarrollo no cambies `VITE_API_BASE=/api/v1`; Vite redirige `/api` al backend en el puerto 3000.
3. En otra terminal, arranca el backend con sus propias variables de entorno y su base de datos Supabase:
   ```bash
   npm run dev
   ```
4. En la carpeta `frontend`, ejecuta:
   ```bash
   npm run dev
   ```
5. Abre la URL que Vite indique (por defecto `http://localhost:5173`).

## Integración Looker Studio
1. Publica el informe en Looker Studio y habilita la opción de inserción/compartir correspondiente a la política de tu organización.
2. Copia el URL de inserción (`.../embed/reporting/...`) en `VITE_LOOKER_EMBED_URL` dentro de `frontend/.env`.
3. Reinicia Vite. El informe se mostrará en Inicio y Analítica.

Si no se define la URL, se presenta una vista previa visual claramente identificada como demostrativa; no son datos reales ni reemplaza el informe exigido.

## Notas técnicas importantes
- La interfaz se conecta al backend, no directamente a PostgreSQL. El backend conserva validaciones, roles y reglas transaccionales.
- La sesión usa cookies `httpOnly`; `fetch` envía credenciales con `credentials: 'include'`. El proxy Vite evita CORS durante desarrollo.
- En producción sirve el frontend y configura un proxy HTTPS hacia la API o configura CORS/cookies del backend para el dominio de frontend. `SameSite=Strict` y `Secure` deben ser compatibles con el despliegue.
- El formulario de producto convierte el precio a centavos, tal como espera la API (`price_cents`). Para crear productos hace falta una subcategoría válida y permiso de administrador.
- La vista de pedidos prueba el endpoint autenticado, pero la pantalla detallada de pedidos no se ha implementado porque requiere confirmar el formato final de las respuestas y las necesidades del flujo de compra.
- No agregues claves de PostgreSQL, contraseñas, secretos JWT ni credenciales de Cloudinary a variables `VITE_*`: esas variables se exponen al navegador.

## API usada
- `POST /api/v1/auth/login`, `GET /api/v1/auth/me`, `POST /api/v1/auth/logout`
- `GET/POST /api/v1/categories`, `PATCH/DELETE /api/v1/categories/:categoryId`
- `GET/POST /api/v1/products`, `PATCH/DELETE /api/v1/products/:productId`
- `GET /api/v1/categories/:categorySlug/subcategory`
- `GET /api/v1/orders` (consulta autenticada)

## Verificación
La UI maneja respuestas `success/data` de la API y muestra errores HTTP. Después de crear/editar/eliminar se vuelven a consultar categorías y productos para confirmar lo que la API devuelve. Verifica los resultados en Supabase antes de dar por validada la persistencia.
