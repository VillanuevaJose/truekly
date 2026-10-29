# CONTEXTO MAESTRO: TRUEKLY (versión vigente)

> Este archivo es la única fuente de verdad sobre Truekly. Las reglas generales de ingeniería, diseño y seguridad están en `directivas-maestras.md` y aplican por encima de este contexto en caso de conflicto (precedencia: seguridad > accesibilidad > identidad visual > estética).

## 1. Identidad
- **Nombre:** Truekly.
- **Qué es:** plataforma web C2C de trueque e intercambio de bienes de segunda mano entre personas (en la misma ciudad o entre distintas ciudades según disponibilidad de publicaciones), con fuerte componente de comunidad y confianza (no es un trueque exclusivo de vecinos).
- **Rubro:** tecnología / economía circular.
- **Ciudad piloto:** Chimbote, Perú. La arquitectura debe ser escalable a cualquier ciudad o país: cero ubicaciones hardcodeadas (ciudades, zonas y puntos seguros salen de datos).
- **Propuesta de valor:** resolver la desconfianza, los riesgos de seguridad física y la falta de registros de los grupos informales (Facebook/WhatsApp), con perfiles verificados, zonas de encuentro seguras recomendadas, acuerdos registrados y una UX cuidada.

## 2. Decisiones vigentes (prevalecen sobre cualquier documento antiguo)
- Truekly es **solo un aplicativo web** (no app móvil nativa). Debe ser responsive y mobile-first desde 360 px.
- El trueque es **libre**: objeto por objeto o combinaciones acordadas por los usuarios en descripción/chat. **No existe valuación, tasación ni campos rígidos de valor monetario** (no usar "valuación justa", "trueque inteligente" ni indicadores de valor).
- El único módulo con dinero es Subastas, y es **simulado**.
- Delivery **simulado** (sin repartidores reales). Verificación de identidad **simulada** (DNI + selfie guardados como respaldo, revisión manual).
- Todo debe funcionar dentro de los **planes 100% gratuitos** (Supabase Free: 500 MB DB, 1 GB Storage; Vercel free).

## 3. Diseño y psicología
### Paleta oficial
| Token | Nombre | Hex | Uso |
|---|---|---|---|
| primary | Verde Jade | #0F6D5F | Confianza, seguridad, acciones principales |
| accent | Ámbar | #E8A33D | Solo elementos destacados o urgencia real (nunca escasez falsa). Máx. 3 a 5 usos por pantalla |
| ink | Tinta | #16201C | Texto principal |
| muted | Salvia | #6B7A72 | Texto secundario y metadatos |
| bg | Papel | #F7F8F6 | Fondo general |

### Tipografía
- Plus Jakarta Sans: fuente única para toda la app (títulos, texto, botones e interfaz), con escala modular, jerarquía por pesos (400, 500, 600, 700) y fallbacks del sistema (-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif).
- Logo/nombre en el feed: Plus Jakarta Sans geométrica limpia en Verde Jade.
- Fuentes autoalojadas en `/fonts/` (.woff2).

### Psicología aplicada
- Cialdini: prueba social (contadores reales), autoridad (badges de verificación), reciprocidad.
- Modelo de Fogg: reducir fricción en cada pantalla.
- Aversión a la pérdida solo con métricas reales (ej. "X personas viendo este producto"). Cero datos inventados.
- Dirección visual sugerida en las referencias: "Editorial cálido" (marketplaces/comunidades), coherente con Fraunces + paleta actual. Debe declararse en `docs/DESIGN.md`.

## 4. Módulos funcionales
### 4.1 Feed y exploración
- Feed estilo Facebook Marketplace con tarjetas de imagen completa (sin comprimir ni recortar visualmente).
- Filtros combinables: categoría (obligatoria al publicar), estado del producto (nuevo, como nuevo, buen estado, usado), zona/distrito y buscador de texto libre.
- "Cerca de mí" es **manual por zona/distrito**, sin GPS exacto (privacidad).
- Acceso libre para visitantes: pueden explorar todo el feed sin cuenta.

### 4.2 Publicaciones (trueque libre)
- 3 a 9 fotos por publicación, categoría, estado y descripción libre (incluye qué se busca a cambio).
- Todo editable, salvo el campo **estado** mientras haya chats activos negociando (previene estafas de último minuto). Se desbloquea rechazando esos chats.
- Eliminación libre en cualquier momento.
- Fotos con compresión previa en el cliente para cuidar el free tier.

### 4.3 Chat y negociación
- Un dueño puede tener varios chats simultáneos con distintos interesados.
- **Anti-spam:** el interesado envía un mensaje inicial y no puede enviar más hasta que el publicador responda.
- Tiempo real con texto, emojis y fotos; estados estilo WhatsApp (enviado, entregado, leído) y presencia (en línea/desconectado).
- Botón **"Confirmar intercambio"**: acepta primero el publicador y luego la otra parte. Con ambas confirmaciones, la publicación sale del feed y los demás chats abiertos sobre ese artículo se cierran automáticamente con un mensaje automático de aviso.

### 4.4 Logística y registro del acuerdo
- Al confirmar se elige un punto seguro público recomendado (plazas/zonas concurridas) o delivery simulado.
- Formulario de acuerdo guardado como registro/evidencia.
- "Mis Intercambios": pasa de Pendiente a Finalizado registrando el resultado real: "Intercambiado con éxito" o "No se intercambió" (con motivo y opción de reporte).

### 4.5 Confianza, seguridad y moderación
- Registro obligatorio, edad mínima 18 años, verificación real de correo y teléfono, más verificación de identidad simulada (DNI + selfie, revisión manual).
- **Nivel de confianza (score serio):** basado estrictamente en intercambios completados + calificaciones bidireccionales (estrellas obligatorias 1 a 5, tags rápidos predefinidos, comentario opcional) + verificación. Separado de la gamificación (logros motivacionales aparte).
- Reportes con umbral configurable y penalizaciones progresivas: **strikes que caducan al mes**.
- Reputación solo con transacciones confirmadas por ambas partes.

### 4.6 Módulos especiales
- **Comunidades locales por ciudad:** creación gratuita por usuarios; planes para negocios verificados con catálogos integrados y herramientas de interacción.
- **Causas sociales:** los usuarios aportan objetos directamente a ONGs locales pre-aprobadas (albergues, comedores, etc.). Separado de donaciones de dinero.
- **Subastas (simuladas):** reservadas a usuarios con alto nivel de confianza; objetos subastados por dinero real de forma simulada en la interfaz, con fines benéficos o para el vendedor.

### 4.7 Ajustes, accesibilidad y soporte
- Idioma español/inglés (`es-PE` por defecto, sin textos incrustados en componentes), modo oscuro funcional.
- Accesibilidad: tamaño de texto, alto contraste, reducir animaciones.
- Seguridad de cuenta: contraseña, 2FA, sesiones activas, descarga de datos, eliminación de cuenta.
- Notificaciones in-app (campanita con contador).
- Ayuda con chatbot de preguntas predefinidas.

## 5. Stack técnico
- **Frontend:** React 18 + TypeScript (strict) + Vite, Tailwind CSS por build, React Router. Despliegue en Vercel (acceso público por enlace).
- **Backend/BaaS:** Supabase: PostgreSQL, Auth (correo/contraseña y Google), Realtime (chat en vivo), Storage (fotos).
- **Restricción:** solo planes gratuitos.
- Sin Next.js: las referencias que usen `middleware.ts` u `opengraph-image.tsx` de Next deben adaptarse a Vite/Vercel.
- Validación con Zod, RLS en todas las tablas, migraciones versionadas (ver directivas y seguridad).

## 6. Modelo de datos (Supabase/PostgreSQL, 20 tablas)
**usuario:** id UUID PK; nombre VARCHAR(100); email VARCHAR(150) UNIQUE; telefono VARCHAR(20) UNIQUE; password_hash VARCHAR(255); fecha_nacimiento DATE (valida ≥18); ciudad VARCHAR(80); distrito_zona VARCHAR(80); foto_perfil_url TEXT; email_verificado BOOL; telefono_verificado BOOL; nivel_confianza DECIMAL(3,2); estado_cuenta VARCHAR(20) (activo/suspendido/eliminado); fecha_registro TIMESTAMP.

**verificacion_identidad:** id UUID PK; usuario_id FK→usuario; doc_identidad_url TEXT; selfie_url TEXT; estado_revision (pendiente/aprobado/rechazado); revisado_por VARCHAR(100); fecha_solicitud; fecha_revision.

**categoria:** id SERIAL PK; nombre VARCHAR(60); icono VARCHAR(60).

**publicacion:** id UUID PK; usuario_id FK→usuario; categoria_id FK→categoria; titulo VARCHAR(120); descripcion TEXT; estado_producto (nuevo/como_nuevo/buen_estado/usado); zona VARCHAR(80); estado_publicacion (activo/pausado/intercambiado/eliminado); bloqueado_edicion_estado BOOL (true si hay chats activos); fecha_publicacion; fecha_actualizacion.

**foto_publicacion:** id UUID PK; publicacion_id FK; url TEXT; orden SMALLINT.

**chat:** id UUID PK; publicacion_id FK; interesado_id FK→usuario; publicador_id FK→usuario; estado (activo/cerrado_intercambio/rechazado/cerrado_auto); fecha_inicio.

**mensaje:** id UUID PK; chat_id FK; emisor_id FK→usuario; tipo_contenido (texto/foto/emoji); contenido TEXT; estado_envio (enviado/entregado/leido); fecha_envio.

**intercambio:** id UUID PK; publicacion_id FK; chat_id FK; confirmado_publicador BOOL; confirmado_interesado BOOL; punto_encuentro VARCHAR(150); tipo_entrega (punto_seguro/delivery_simulado); estado (pendiente/finalizado); resultado (intercambiado/no_intercambiado); motivo_no_intercambio TEXT; fecha_confirmacion; fecha_cierre.

**calificacion:** id UUID PK; intercambio_id FK; usuario_calificador_id FK; usuario_calificado_id FK; estrellas SMALLINT (1 a 5); tags VARCHAR(200) (CSV o tabla aparte); comentario TEXT opcional; fecha.

**reporte:** id UUID PK; usuario_reportante_id FK; usuario_reportado_id FK; motivo VARCHAR(60); descripcion TEXT; estado (pendiente/revisado/descartado); fecha.

**strike:** id UUID PK; usuario_id FK; reporte_id FK opcional; motivo VARCHAR(100); fecha_emision; fecha_expiracion (emisión + 1 mes).

**comunidad:** id UUID PK; nombre VARCHAR(100); ciudad VARCHAR(80); descripcion TEXT; creador_id FK→usuario; fecha_creacion.

**miembro_comunidad:** PK compuesta (comunidad_id FK, usuario_id FK); fecha_union.

**ong:** id UUID PK; nombre VARCHAR(120); descripcion TEXT; ciudad VARCHAR(80); verificada BOOL; contacto VARCHAR(150).

**causa_social:** id UUID PK; publicacion_id FK; ong_id FK; estado (disponible/entregado); fecha.

**subasta:** id UUID PK; publicacion_id FK; usuario_id FK (vendedor); monto_inicial DECIMAL(10,2); monto_actual DECIMAL(10,2); fin_benefico BOOL; fecha_inicio; fecha_fin; estado (activa/finalizada/cancelada).

**puja:** id UUID PK; subasta_id FK; usuario_id FK; monto DECIMAL(10,2); fecha.

**notificacion:** id UUID PK; usuario_id FK; tipo VARCHAR(40) (chat/intercambio/sistema/…); contenido TEXT; leida BOOL; fecha.

**logro:** id SERIAL PK; nombre VARCHAR(80); descripcion TEXT; icono VARCHAR(60).

**usuario_logro:** PK compuesta (usuario_id FK, logro_id FK); fecha_obtenido.

### Relaciones clave
usuario 1─N publicacion, chat (como interesado o publicador), mensaje, reporte (como reportante o reportado), strike, notificacion, puja. publicacion 1─N foto_publicacion, chat; publicacion 1─1 intercambio (el confirmado); intercambio 1─N calificacion (una por cada parte); categoria 1─N publicacion; comunidad N─M usuario (miembro_comunidad); ong 1─N causa_social; publicacion 1─0..1 subasta o causa_social; subasta 1─N puja; usuario N─M logro (usuario_logro).

### Notas de implementación (sugerencias, no decisiones cerradas)
- Con Supabase Auth, `usuario.id` debe referenciar `auth.users.id`; `password_hash` no se guarda en tabla propia.
- Los tags de calificación pueden migrar a una tabla catálogo + tabla de unión en vez de CSV.
- El cierre automático de chats y el bloqueo de edición de estado deben resolverse en servidor (trigger o función), no solo en el cliente.
- `nivel_confianza` debe calcularse en servidor y no ser editable por el cliente (RLS).

## 7. Seguridad específica de Truekly
Aplicar `referencias/seguridad/seguridad.md`, en especial el bloque de marketplaces P2P:
- RLS en todas las tablas; anti-IDOR en chats, intercambios, calificaciones y verificaciones.
- Bucket privado para DNI y selfie; fotos de publicaciones re-procesadas sin EXIF ni geolocalización.
- Privacidad de ubicación: solo zona aproximada.
- Chat con filtrado de enlaces y advertencias antiestafa; límites para cuentas nuevas; bloqueo y cola de moderación.
- Cumplimiento: Ley 29733 (Perú) y política de privacidad y términos con contenido real.

## 8. Estado actual y hoja de ruta
- **Hecho:** landing page y feed principal funcionales con datos mock.
- **Siguiente (en este orden):** login/registro, perfil, chat, comunidades, ajustes, integración real con Supabase (reemplazar mocks).
- Trabajar una página o módulo por chat; registrar decisiones en `docs/DECISIONS.md` y el estado en `docs/ESTADO.md`.