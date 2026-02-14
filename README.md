# USM Red - Red Académica Universitaria

Red social académica para la Universidad Santa María (USM), diseñada para centralizar publicaciones, tesis, artículos, eventos y recursos multimedia en una experiencia moderna y funcional.

## Estado del Proyecto

**MVP Frontend** — Interfaz completamente funcional con datos en memoria (sin backend/base de datos aún).

## Tech Stack

| Tecnología | Versión | Uso |
|---|---|---|
| React | 19.2.0 | UI con componentes funcionales y hooks |
| Vite | 7.3.1 | Build tool con SWC |
| Tailwind CSS | 4.1.18 | Estilos utility-first con tema personalizado |
| Framer Motion | 12.34.0 | Animaciones y transiciones |
| React Router DOM | 7.13.0 | Enrutamiento SPA |
| Lucide React | 0.564.0 | Iconografía |
| clsx + tailwind-merge | — | Utilidades de clases CSS |

## Funcionalidades Implementadas

### Autenticación y Roles
- Login y registro con estado global (Context API)
- Roles automáticos: emails con "admin" obtienen rol administrador
- Rutas protegidas con redirección según autenticación y rol
- Cierre de sesión desde dashboard y configuración

### Dashboard Principal
- Feed tipo masonry con cards de contenido académico
- Filtros por facultad, tipo de contenido y búsqueda de texto
- Sistema de guardados (bookmarks) con contador
- Skeleton loaders durante carga simulada
- Notificaciones con dropdown animado
- Sidebar responsive con drawer animado en móvil
- Vista de detalle de publicaciones en modal

### Panel de Administración
- Formulario de publicación con campos: título, autor, descripción, tipo, facultad
- **Subida de archivos**: PDFs, videos (MP4, WebM), imágenes (JPG, PNG) hasta 100MB
- **Enlaces externos**: pegar URLs a recursos externos
- CRUD completo: crear, ver, editar y eliminar publicaciones
- Modal de edición con soporte de archivos adjuntos
- Diálogo de confirmación para eliminaciones
- Filtro por tipo de contenido en la lista
- Indicadores visuales de tipo de archivo adjunto (badge por tipo)

### Sistema de Medios
- Soporte para archivos: PDF, Video, Imagen, Enlace externo
- Visor de PDF embebido con opción de descarga
- Reproductor de video nativo HTML5
- Visor de imágenes responsive
- Preview de enlaces externos con metadata
- Badges de tipo de archivo en cards del feed y panel admin
- Archivos almacenados como Blob URLs (temporal, en memoria)

### Tema y Apariencia
- Dark mode completo con persistencia en localStorage
- Toggle animado en página de configuración
- Soporte dark mode en todas las páginas: landing, dashboard, admin, settings
- Colores personalizados USM (azul institucional, amarillo, variantes)

### Notificaciones Toast
- Sistema global de toasts (success, error, info)
- Auto-dismiss a los 3 segundos
- Animaciones de entrada/salida
- Posición fija esquina inferior derecha

### Landing Page
- Hero con parallax y glassmorphism
- Sección de características con cards animadas
- Carrusel de eventos con scroll horizontal
- Sección "USM Red como software" con grid de features
- CTA de registro/login
- Footer con navegación
- Dark mode completo

## Estructura del Proyecto

```
src/
├── assets/                  # Imágenes y recursos estáticos
├── components/
│   ├── landing/
│   │   ├── Navbar.jsx       # Navegación principal landing
│   │   ├── Hero.jsx         # Sección hero con parallax
│   │   ├── Features.jsx     # Grid de características
│   │   └── EventsCarousel.jsx # Carrusel de eventos
│   ├── ui/
│   │   ├── Button.jsx       # Botón reutilizable con variantes
│   │   ├── Card.jsx         # Card base con dark mode
│   │   ├── Modal.jsx        # Modal animado reutilizable
│   │   ├── Toast.jsx        # Sistema de notificaciones
│   │   ├── Skeleton.jsx     # Skeleton loaders
│   │   ├── ConfirmDialog.jsx # Diálogo de confirmación
│   │   ├── ContentDetailModal.jsx # Modal de detalle con visor de medios
│   │   └── FeedCard.jsx     # Card del feed con indicadores de media
│   └── ProtectedRoute.jsx   # HOC de protección de rutas
├── context/
│   ├── AuthContext.jsx       # Estado de autenticación
│   ├── ContentContext.jsx    # CRUD de contenido y guardados
│   ├── ThemeContext.jsx      # Dark/light mode
│   └── ToastContext.jsx      # Cola de notificaciones
├── hooks/
│   └── useContent.js         # Hook de acceso a contenido
├── pages/
│   ├── LandingPage.jsx       # Página de inicio pública
│   ├── LoginPage.jsx         # Inicio de sesión
│   ├── RegisterPage.jsx      # Registro de usuario
│   ├── DashboardPage.jsx     # Dashboard principal
│   ├── AdminPage.jsx         # Panel de administración
│   └── SettingsPage.jsx      # Configuración de usuario
├── mockData.js               # Datos de demostración
├── App.jsx                   # Rutas y layout principal
├── main.jsx                  # Entry point con providers
└── index.css                 # Estilos globales y tema Tailwind
```

## Instalación y Uso

```bash
# Instalar dependencias
npm install

# Servidor de desarrollo
npm run dev

# Build de producción
npm run build

# Preview del build
npm run preview
```

### Acceso a la Aplicación

| Rol | Cómo acceder |
|---|---|
| Estudiante | Login con cualquier email (ej: `usuario@usm.edu.ve`) |
| Administrador | Login con email que contenga "admin" (ej: `admin@usm.edu.ve`) |

La contraseña puede ser cualquiera (no hay validación de backend).

## Roadmap - Futuras Implementaciones

### Base de Datos y Backend
- [ ] Integración con Supabase/Firebase para persistencia de datos
- [ ] Autenticación real con JWT o sesiones
- [ ] Almacenamiento de archivos en cloud storage (S3, Supabase Storage)
- [ ] API REST o GraphQL para operaciones CRUD
- [ ] Validación de credenciales y recuperación de contraseña

### Funcionalidades Planificadas
- [ ] Sistema de comentarios en publicaciones
- [ ] Likes/reacciones funcionales con conteo
- [ ] Perfil de usuario editable con foto
- [ ] Notificaciones en tiempo real (WebSockets)
- [ ] Búsqueda avanzada con filtros combinados
- [ ] Paginación/infinite scroll en el feed
- [ ] Sistema de categorías/tags personalizados
- [ ] Historial de actividad del usuario
- [ ] Panel de estadísticas para administradores

### Mejoras Técnicas
- [ ] Migración a TypeScript
- [ ] Testing con Vitest + Testing Library
- [ ] CI/CD pipeline
- [ ] SEO y meta tags dinámicos
- [ ] PWA (Progressive Web App) con service worker
- [ ] Optimización de imágenes y lazy loading
- [ ] Code splitting por rutas
- [ ] Internacionalización (i18n)

### Integraciones
- [ ] Calendario académico sincronizado
- [ ] Exportación de contenido a PDF
- [ ] Compartir en redes sociales
- [ ] Integración con sistema de notas/calificaciones USM
- [ ] Notificaciones por email

## Notas Técnicas

- Los archivos subidos se almacenan temporalmente como Blob URLs en memoria del navegador. Se pierden al recargar la página. Esto será reemplazado por cloud storage cuando se implemente el backend.
- Los datos mock se reinician al recargar. Todo el estado es en memoria via Context API.
- El tema oscuro se persiste en `localStorage` y sobrevive recargas.
- El sistema de archivos soporta PDF, Video (MP4/WebM/OGG/MOV), Imagen (JPG/PNG/GIF/WebP) y enlaces externos.
