# Cliente Tiendanube

Este módulo proporciona una interfaz completa para interactuar con la API de Tiendanube/Nuvemshop.

## Características

- ✅ Headers automáticos (Authentication, User-Agent, Content-Type)
- ✅ Manejo completo de errores (400, 422, 5xx)
- ✅ Soporte para paginación
- ✅ Tipos TypeScript completos
- ✅ Métodos específicos para productos
- ✅ Método genérico para cualquier endpoint

## Configuración

### Variables de entorno requeridas

```env
TIENDANUBE_APP_ID=123456
TIENDANUBE_USER_AGENT=MyApp (name@email.com)
```

### Access Token

El `ACCESS_TOKEN` debe obtenerse del localStorage después de la autenticación OAuth.

## Uso básico

```typescript
import { createTiendanubeClient } from '@/thirdparties/tiendanube';

// Obtener configuración
const appId = process.env.TIENDANUBE_APP_ID!;
const userAgent = process.env.TIENDANUBE_USER_AGENT!;
const accessToken = localStorage.getItem('tiendanube_access_token')!;

// Crear cliente
const client = createTiendanubeClient(appId, userAgent, accessToken);

// Obtener productos
const response = await client.getProducts({ page: 1, per_page: 50 });
console.log(response.data); // productos
console.log(response.headers['x-total-count']); // total de productos
```

## Métodos disponibles

### Productos

```typescript
// Obtener todos los productos
const products = await client.getProducts();

// Obtener productos con paginación
const products = await client.getProducts({ page: 2, per_page: 100 });

// Obtener un producto específico
const product = await client.getProduct('product_id');

// Crear un nuevo producto
const newProduct = await client.createProduct({
  name: 'Mi nuevo producto',
  price: 1000,
  // ... otros campos
});

// Actualizar un producto
const updatedProduct = await client.updateProduct('product_id', {
  name: 'Producto actualizado'
});

// Eliminar un producto
await client.deleteProduct('product_id');
```

### Método genérico

```typescript
// Para cualquier endpoint
const response = await client.request('/orders', {
  method: 'GET',
  params: { page: 1, per_page: 50 }
});

// POST con datos
const response = await client.request('/products', {
  method: 'POST',
  body: { name: 'Nuevo producto' }
});
```

## Manejo de errores

El cliente maneja automáticamente diferentes tipos de errores:

```typescript
try {
  const products = await client.getProducts();
} catch (error) {
  if (error.message.includes('Error de parsing JSON')) {
    // Error 400 - JSON inválido
  } else if (error.message.includes('Error de validación')) {
    // Error 422 - Campos inválidos
  } else if (error.message.includes('Error del servidor')) {
    // Error 5xx - Problemas del servidor
  }
}
```

## Paginación

```typescript
import { parsePaginationLinks } from '@/thirdparties/tiendanube/utils';

const response = await client.getProducts({ page: 1, per_page: 50 });

// Obtener enlaces de paginación
const links = parsePaginationLinks(response.headers.link || '');
console.log(links.next); // URL de la siguiente página
console.log(links.last); // URL de la última página

// Obtener total de resultados
const totalCount = parseInt(response.headers['x-total-count'] || '0');
```

## Headers automáticos

El cliente incluye automáticamente:

- `Authentication: bearer ACCESS_TOKEN`
- `User-Agent: TIENDANUBE_USER_AGENT`
- `Content-Type: application/json; charset=utf-8` (para POST/PUT)

## Estructura de archivos

```
thirdparties/tiendanube/
├── index.ts          # Exportaciones principales
├── client.ts         # Cliente principal
├── types.ts          # Tipos TypeScript
├── utils.ts          # Utilidades y helpers
└── README.md         # Esta documentación
```
