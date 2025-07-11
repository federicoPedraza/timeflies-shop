# Timeflies App

Una aplicación de dashboard para gestión de tiendas de relojes integrada con TiendaNube.

## Características

### ✅ Implementado
- **Dashboard Overview**: Vista general con estadísticas, gráficos y actividad reciente
- **Sistema de Navegación**: Sidebar funcional con navegación entre secciones
- **Sección de Configuración**: Panel completo de configuración con múltiples opciones
- **Integración con TiendaNube**: Autenticación y conexión con la API de TiendaNube
- **Diseño Responsivo**: Interfaz moderna y adaptable a diferentes dispositivos

### 🚧 En Desarrollo
- **Gestión de Órdenes**: Panel para administrar pedidos
- **Gestión de Productos**: Catálogo y administración de productos
- **Analytics**: Análisis detallado de ventas y métricas
- **Gestión de Clientes**: Base de datos de clientes

## Tecnologías Utilizadas

- **Next.js 15**: Framework de React con App Router
- **TypeScript**: Tipado estático para mayor robustez
- **Tailwind CSS**: Framework de estilos utilitarios
- **shadcn/ui**: Componentes de UI modernos y accesibles
- **Convex**: Base de datos en tiempo real
- **TiendaNube API**: Integración con la plataforma de e-commerce

## Estructura del Proyecto

```
timeflies-app/
├── app/                    # Páginas y rutas de Next.js
├── components/             # Componentes reutilizables
│   ├── ui/                # Componentes base de UI
│   ├── app-sidebar.tsx    # Sidebar principal
│   ├── dashboard-content.tsx
│   ├── settings-content.tsx
│   └── placeholder-section.tsx
├── hooks/                 # Hooks personalizados
│   └── use-navigation.ts  # Gestión de navegación
├── convex/               # Base de datos y lógica de backend
└── thirdparties/         # Integraciones externas
    └── tiendanube/       # Cliente de TiendaNube
```

## Configuración

### Variables de Entorno

Crea un archivo `.env.local` con las siguientes variables:

```env
NEXT_PUBLIC_CONVEX_URL=tu_url_de_convex
TIENDANUBE_CLIENT_ID=tu_client_id_de_tiendanube
TIENDANUBE_CLIENT_SECRET=tu_client_secret_de_tiendanube
```

### Instalación

1. Clona el repositorio
2. Instala las dependencias:
   ```bash
   pnpm install
   ```
3. Configura las variables de entorno
4. Ejecuta el servidor de desarrollo:
   ```bash
   pnpm dev
   ```

## Uso

1. **Autenticación**: La aplicación redirige automáticamente a TiendaNube para autorización
2. **Navegación**: Usa el sidebar para navegar entre las diferentes secciones
3. **Configuración**: Accede a la sección Settings para personalizar la aplicación

## Secciones Disponibles

### Dashboard Overview
- Estadísticas de ventas
- Gráficos de órdenes
- Actividad reciente
- Información de la tienda

### Settings
- **Tienda**: Configuración básica de la tienda
- **Usuario**: Información de la cuenta
- **Seguridad**: Configuración de seguridad y autenticación
- **Notificaciones**: Preferencias de notificaciones
- **Apariencia**: Personalización del tema
- **Datos**: Exportación y gestión de datos

## Desarrollo

### Agregar Nuevas Secciones

1. Crea un nuevo componente de contenido en `components/`
2. Actualiza el tipo `NavigationItem` en `hooks/use-navigation.ts`
3. Agrega el nuevo caso en `components/dynamic-content.tsx`
4. Actualiza el array `menuItems` en `components/app-sidebar.tsx`

### Estructura de Componentes

Los componentes siguen un patrón consistente:
- Usan TypeScript para tipado
- Implementan diseño responsivo con Tailwind CSS
- Siguen las mejores prácticas de accesibilidad
- Utilizan los componentes base de shadcn/ui

## Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.
