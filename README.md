# USM Red — Red Académica Universitaria

Red social académica para la Universidad Santa María (USM), diseñada para centralizar publicaciones, tesis, artículos, eventos y recursos multimedia en una experiencia moderna y funcional.

---

## Estado del Proyecto

**Frontend funcional + Backend Supabase integrado** — Autenticación real, CRUD contra PostgreSQL, sistema de roles, recuperación de contraseña y UI completamente responsive.

> Última actualización: 21 de febrero de 2026

---

## Tech Stack

| Tecnología | Versión | Uso |
|---|---|---|
| React | 19.2.0 | UI con componentes funcionales y hooks |
| Vite | 7.3.1 | Build tool con SWC (`@vitejs/plugin-react-swc`) |
| Tailwind CSS | 4.1.18 | Estilos utility-first con tema USM personalizado |
| Framer Motion | 12.34.0 | Animaciones y transiciones |
| React Router DOM | 7.13.0 | Enrutamiento SPA |
| Lucide React | 0.564.0 | Iconografía |
| Supabase JS | 2.97.0 | Auth, Database, Storage, Realtime |
| clsx + tailwind-merge | — | Utilidades de composición de clases CSS |

**Backend (Supabase BaaS):**
- PostgreSQL 15 con Row Level Security (RLS)
- Supabase Auth (email/password, recuperación de contraseña)
- Supabase Storage (buckets para archivos y avatares)
- 13 tablas, 8 triggers, políticas RLS por tabla, índices, datos semilla

---

## Arquitectura del Sistema

```
┌─────────────────────────────────────────────────┐
│                    Frontend                      │
│  React 19 + Vite + Tailwind + Framer Motion     │
│                                                  │
│  Context API (4 providers):                      │
│  ThemeProvider → AuthProvider → ContentProvider   │
│  → ToastProvider → App                           │
└───────────────────┬─────────────────────────────┘
                    │ @supabase/supabase-js
                    ▼
┌─────────────────────────────────────────────────┐
│               Supabase (BaaS)                    │
│                                                  │
│  ┌─────────┐ ┌──────────┐ ┌──────────────────┐ │
│  │  Auth    │ │ Database │ │ Storage (buckets)│ │
│  │ (JWT)   │ │ (Pg 15)  │ │ publications-    │ │
│  │         │ │ + RLS    │ │ media / avatars  │ │
│  └─────────┘ └──────────┘ └──────────────────┘ │
└─────────────────────────────────────────────────┘
```

---

## Funcionalidades Implementadas (✅)

### Autenticación Real (Supabase Auth)
- ✅ Login con `signInWithPassword` — validación real de credenciales
- ✅ Registro con `signUp` — crea usuario en Auth + perfil en tabla `profiles`
- ✅ Restauración de sesión automática al recargar (JWT persistido)
- ✅ Listener `onAuthStateChange` para sincronizar estado en tiempo real
- ✅ Cierre de sesión (`signOut`) desde dashboard y configuración
- ✅ Campo "Confirmar contraseña" en el registro con validación

### Recuperación de Contraseña (flujo completo)
- ✅ Vista dedicada "Recuperar cuenta" dentro del login (animación toggle)
- ✅ Envío de enlace de recuperación via `resetPasswordForEmail`
- ✅ Página `/reset-password` que detecta la sesión de recuperación
- ✅ Formulario de nueva contraseña + confirmación con `updateUser`
- ✅ Estados: verificando enlace → enlace inválido → formulario → éxito
- ✅ Redirección automática al dashboard tras cambiar contraseña

### Sistema de Roles
- ✅ Roles en base de datos: `student`, `professor`, `admin`
- ✅ Rutas protegidas con `ProtectedRoute` (auth + admin)
- ✅ Panel admin solo accesible para rol `admin`
- ✅ Redirección automática: admin → `/admin`, estudiante → `/dashboard`
- ✅ Para asignar admin: `UPDATE profiles SET role = 'admin' WHERE email = 'correo@ejemplo.com';`

### Dashboard Principal
- ✅ Feed con cards de contenido académico desde Supabase
- ✅ Filtros por facultad, tipo de contenido y búsqueda de texto
- ✅ Sistema de guardados (bookmarks) — tabla `bookmarks` en Supabase
- ✅ Skeleton loaders durante carga
- ✅ Notificaciones reales desde tabla `notifications`
- ✅ Sidebar responsive con drawer animado en móvil
- ✅ Barra lateral derecha: perfil, stats, trending, sugeridos
- ✅ Vista de detalle de publicaciones en modal con visor de medios

### Panel de Administración
- ✅ Formulario de publicación: título, autor, descripción, tipo, facultad
- ✅ Subida de archivos al bucket `publications-media` de Supabase Storage
- ✅ Enlaces externos opcionales
- ✅ CRUD completo asíncrono: crear, ver, editar, eliminar
- ✅ Modal de edición con reemplazo de archivos adjuntos
- ✅ Diálogo de confirmación para eliminaciones
- ✅ Filtro por tipo de contenido en la lista
- ✅ Tipos de contenido y facultades cargados dinámicamente desde Supabase

### Sistema de Medios
- ✅ Soporte para archivos: PDF, Video, Imagen, Enlace externo
- ✅ Visor de PDF embebido con opción de descarga
- ✅ Reproductor de video nativo HTML5
- ✅ Visor de imágenes responsive
- ✅ Preview de enlaces externos
- ✅ Badges de tipo de archivo en cards del feed y panel admin
- ✅ Subida al bucket de Supabase Storage con registro en tabla `media_files`

### Responsive Design
- ✅ Todas las páginas optimizadas para móvil, tablet y desktop
- ✅ Hero con breakpoints `text-4xl → sm → md → lg:text-8xl`
- ✅ Botones que se apilan en columna en móvil
- ✅ Login: botón "Volver al inicio" con flujo correcto (no overlap)
- ✅ Dashboard: search bar compacto, notificaciones con scroll, padding reducido
- ✅ Admin: header stack en móvil, padding responsive
- ✅ Landing: todas las secciones con padding `px-4 sm:px-6 md:px-12`
- ✅ Grids con breakpoints intermedios (`sm:grid-cols-2`)
- ✅ `min-h-screen` + `100dvh` para compatibilidad con Safari móvil
- ✅ CSS global: `scrollbar-hide`, smooth scroll, safe-area padding, tap-highlight removal

### Tema y Apariencia
- ✅ Dark mode completo con persistencia en `localStorage`
- ✅ Toggle animado en configuración
- ✅ Colores personalizados: `--color-usm-blue: #002855`, `--color-usm-blue-bright: #0D6EFD`, `--color-usm-yellow: #FFB81C`

### Landing Page
- ✅ Hero con parallax, glassmorphism y cards informativas
- ✅ Features grid, Estadísticas animadas, Carrusel de eventos
- ✅ Secciones: Facultades, Misión/Visión, Campus/Sedes
- ✅ Software section, CTA registro/login, Footer
- ✅ Navbar con menú mobile (overlay animado)

---

## Base de Datos (PostgreSQL / Supabase)





## Estructura del Proyecto

```
src/
├── lib/
│   └── supabase.js              # Cliente Supabase singleton
├── context/
│   ├── AuthContext.jsx           # Auth real (Supabase Auth)
│   ├── ContentContext.jsx        # CRUD real (Supabase Database + Storage)
│   ├── ThemeContext.jsx          # Dark/light mode (localStorage)
│   └── ToastContext.jsx          # Cola de notificaciones toast
├── components/
│   ├── ProtectedRoute.jsx       # Guard de rutas (auth + rol)
│   ├── landing/
│   │   ├── Navbar.jsx           # Navegación principal + menú mobile
│   │   ├── Hero.jsx             # Hero con parallax responsive
│   │   ├── Features.jsx         # Grid de características
│   │   ├── FacultadesSection.jsx # Cards de facultades
│   │   ├── MisionVision.jsx     # Misión y visión institucional
│   │   ├── StatsSection.jsx     # Contadores animados
│   │   ├── CampusGrid.jsx       # Grid bento de sedes
│   │   ├── EventsCarousel.jsx   # Carrusel horizontal de eventos
│   │   └── Footer.jsx           # Footer con navegación
│   └── ui/
│       ├── Button.jsx           # Botón con variantes
│       ├── Card.jsx             # Card base
│       ├── Modal.jsx            # Modal animado
│       ├── Toast.jsx            # Notificaciones toast
│       ├── Skeleton.jsx         # Skeleton loaders
│       ├── ConfirmDialog.jsx    # Diálogo de confirmación
│       ├── ContentDetailModal.jsx # Modal de detalle + visor de medios
│       └── FeedCard.jsx         # Card del feed
├── hooks/
│   └── useContent.js            # Hook de acceso a ContentContext
├── pages/
│   ├── LandingPage.jsx          # Página de inicio pública
│   ├── LoginPage.jsx            # Login + vista de recuperación
│   ├── RegisterPage.jsx         # Registro con confirm password
│   ├── ResetPasswordPage.jsx    # Nueva contraseña (post-recovery)
│   ├── DashboardPage.jsx        # Dashboard principal (feed)
│   ├── AdminPage.jsx            # Panel de administración CRUD
│   ├── ProfilePage.jsx          # Perfil de usuario
│   └── SettingsPage.jsx         # Configuración (tema, sesión)
├── App.jsx                      # Rutas y layout principal
├── main.jsx                     # Entry point con providers
└── index.css                    # Estilos globales + tema Tailwind
```

## Instalación y Configuración

### 1. Clonar e instalar dependencias

```bash
git clone <url-del-repo>
cd usm_red
npm install
```


### 4. Configurar variables de entorno

Crear archivo `.env` en la raíz:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbG...tu-anon-key-aqui
```

> ⚠️ **Usa la anon/public key, NO la service_role key.** Ambos valores deben ser del mismo proyecto.

### 5. Configurar Supabase Auth

- **Authentication → Providers → Email**: desactivar "Confirm email" para desarrollo
- **Authentication → URL Configuration**: poner `http://localhost:5173` como Site URL
- La URL de redirect para recuperación de contraseña es: `http://localhost:5173/reset-password`

### 6. Iniciar servidor de desarrollo

```bash
npm run dev
```

### 7. Crear usuario administrador

1. Registrar la cuenta desde la UI (`/registro`)
2. En Supabase SQL Editor:
```sql
UPDATE profiles SET role = 'admin' WHERE email = 'tu-correo@ejemplo.com';
```

Para futuros admins, repetir el mismo `UPDATE` con el email correspondiente.

---

## Acceso a la Aplicación

| Rol | Cómo acceder |
|---|---|
| Estudiante | Registrarse desde `/registro` y hacer login |
| Administrador | Registrarse + marcar como admin en la DB (ver paso 7) |
| Recuperar contraseña | Desde login → "Recuperar cuenta" → enlace por email |

---

## Tareas Pendientes y Futuras Implementaciones

### 🔴 Prioridad Alta — Pendientes inmediatos

- [ ] **Crear buckets de Storage en Supabase** — Los buckets `publications-media` y `avatars` están definidos en `schema.sql` pero deben crearse ejecutando el schema. Sin ellos, la subida de archivos (PDF, imágenes, videos) falla silenciosamente. El código en `ContentContext.jsx` ya sube a `publications-media`.
- [ ] **Verificar políticas RLS de Storage** — Las políticas están en el schema.sql pero pueden necesitar ajuste según la configuración del proyecto Supabase.
- [ ] **Likes funcionales** — La tabla `likes` existe en la DB y el componente `FeedCard.jsx` muestra el botón, pero no está conectado a Supabase (actualmente solo estado local).
- [ ] **Sistema de comentarios** — La tabla `comments` existe en la DB. El `FeedCard.jsx` tiene UI para comentarios pero no persiste en Supabase.
- [ ] **Perfil editable** — `ProfilePage.jsx` muestra datos del perfil pero no permite editarlos. Falta: cambiar nombre, bio, avatar (subir a bucket `avatars`), facultad.
- [ ] **Eliminar `mockData.js`** — El archivo aún existe pero ya no es importado por ningún componente. Se puede borrar.

### 🟡 Prioridad Media — Mejoras funcionales

- [ ] Notificaciones en tiempo real (Supabase Realtime subscriptions)
- [ ] Paginación / infinite scroll en el feed (actualmente carga todo)
- [ ] Búsqueda avanzada con filtros combinados (texto + facultad + tipo)
- [ ] Sistema de follows funcional (tabla `follows` existe en DB)
- [ ] Historial de actividad del usuario (tabla `activity_log` existe)
- [ ] Panel de estadísticas para el administrador (conteos, gráficos)
- [ ] Subida y cambio de avatar en perfil (bucket `avatars` definido)
- [ ] Contador de likes visible en las cards del feed
- [ ] Tags/etiquetas en publicaciones (tablas `tags` y `publication_tags` existen)

### 🟢 Prioridad Baja — Mejoras técnicas

- [ ] Code splitting por rutas (lazy loading con `React.lazy()`)
- [ ] Testing con Vitest + Testing Library
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] SEO y meta tags dinámicos
- [ ] PWA con service worker
- [ ] Optimización de imágenes y lazy loading de media
- [ ] Internacionalización (i18n)
- [ ] Rate limiting en operaciones sensibles

### 🔵 Integraciones futuras

- [ ] Calendario académico sincronizado
- [ ] Exportación de contenido a PDF
- [ ] Compartir en redes sociales
- [ ] Notificaciones por email (Supabase Edge Functions)
- [ ] Integración con el sistema académico USM

---

## Notas Técnicas

- **Supabase Auth**: Usa JWT con auto-refresh. La sesión se persiste en `localStorage` automáticamente por el SDK.
- **RLS (Row Level Security)**: Todas las tablas tienen políticas. Los usuarios solo pueden modificar sus propios datos; los admins tienen permisos extendidos.
- **Storage**: Los buckets están definidos como públicos para lectura (cualquier usuario puede ver archivos). La escritura requiere autenticación; la eliminación requiere ser el owner o admin.
- **Tema oscuro**: Se persiste en `localStorage` y sobrevive recargas.
- **Archivos**: Soporta PDF, Video (MP4/WebM/OGG/MOV), Imagen (JPG/PNG/GIF/WebP) y enlaces externos. Límite de 100MB por archivo.
- **Build**: 2187 módulos, ~685KB JS + ~100KB CSS (gzip: ~200KB JS + ~14KB CSS). El warning de chunk size se puede resolver con code splitting.

---


## Licencia

Proyecto académico — Servicio Comunitario, Universidad Santa María.
