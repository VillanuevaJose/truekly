-- =============================================================================
-- MIGRACIÓN INICIAL TRUEKLY (20 TABLAS + RLS + SEGURIDAD)
-- Archivo: supabase/migrations/20260928000000_schema_inicial_truekly.sql
-- Instrucciones: Copiar y pegar el contenido completo en el SQL Editor de Supabase.
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- 1. TABLA: usuario
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.usuario (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    telefono VARCHAR(20) UNIQUE,
    fecha_nacimiento DATE NOT NULL CHECK (fecha_nacimiento <= CURRENT_DATE - INTERVAL '18 years'),
    ciudad VARCHAR(80),
    distrito_zona VARCHAR(80),
    foto_perfil_url TEXT,
    email_verificado BOOLEAN NOT NULL DEFAULT false,
    telefono_verificado BOOLEAN NOT NULL DEFAULT false,
    nivel_confianza NUMERIC(3,2) NOT NULL DEFAULT 0.00 CHECK (nivel_confianza >= 0.00 AND nivel_confianza <= 5.00),
    estado_cuenta VARCHAR(20) NOT NULL DEFAULT 'activo' CHECK (estado_cuenta IN ('activo', 'suspendido', 'eliminado')),
    fecha_registro TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- =============================================================================
-- 2. TABLA: verificacion_identidad
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.verificacion_identidad (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES public.usuario(id) ON DELETE CASCADE,
    doc_identidad_url TEXT NOT NULL,
    selfie_url TEXT NOT NULL,
    estado_revision VARCHAR(20) NOT NULL DEFAULT 'pendiente' CHECK (estado_revision IN ('pendiente', 'aprobado', 'rechazado')),
    revisado_por VARCHAR(100),
    fecha_solicitud TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    fecha_revision TIMESTAMPTZ
);

-- =============================================================================
-- 3. TABLA: categoria
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.categoria (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(60) NOT NULL UNIQUE,
    icono VARCHAR(60)
);

-- =============================================================================
-- 4. TABLA: publicacion
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.publicacion (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES public.usuario(id) ON DELETE CASCADE,
    categoria_id INT NOT NULL REFERENCES public.categoria(id) ON DELETE RESTRICT,
    titulo VARCHAR(120) NOT NULL,
    descripcion TEXT NOT NULL,
    estado_producto VARCHAR(20) NOT NULL CHECK (estado_producto IN ('nuevo', 'como_nuevo', 'buen_estado', 'usado')),
    zona VARCHAR(80) NOT NULL,
    estado_publicacion VARCHAR(20) NOT NULL DEFAULT 'activo' CHECK (estado_publicacion IN ('activo', 'pausado', 'intercambiado', 'eliminado')),
    bloqueado_edicion_estado BOOLEAN NOT NULL DEFAULT false,
    fecha_publicacion TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    fecha_actualizacion TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- =============================================================================
-- 5. TABLA: foto_publicacion
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.foto_publicacion (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    publicacion_id UUID NOT NULL REFERENCES public.publicacion(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    orden SMALLINT NOT NULL DEFAULT 1
);

-- =============================================================================
-- 6. TABLA: chat
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.chat (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    publicacion_id UUID NOT NULL REFERENCES public.publicacion(id) ON DELETE CASCADE,
    interesado_id UUID NOT NULL REFERENCES public.usuario(id) ON DELETE CASCADE,
    publicador_id UUID NOT NULL REFERENCES public.usuario(id) ON DELETE CASCADE,
    estado VARCHAR(30) NOT NULL DEFAULT 'activo' CHECK (estado IN ('activo', 'cerrado_intercambio', 'rechazado', 'cerrado_auto')),
    fecha_inicio TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT chat_participantes_distintos CHECK (interesado_id <> publicador_id),
    CONSTRAINT unique_publicacion_interesado UNIQUE (publicacion_id, interesado_id)
);

-- =============================================================================
-- 7. TABLA: mensaje
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.mensaje (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_id UUID NOT NULL REFERENCES public.chat(id) ON DELETE CASCADE,
    emisor_id UUID NOT NULL REFERENCES public.usuario(id) ON DELETE CASCADE,
    tipo_contenido VARCHAR(20) NOT NULL DEFAULT 'texto' CHECK (tipo_contenido IN ('texto', 'foto', 'emoji')),
    contenido TEXT NOT NULL,
    estado_envio VARCHAR(20) NOT NULL DEFAULT 'enviado' CHECK (estado_envio IN ('enviado', 'entregado', 'leido')),
    fecha_envio TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- =============================================================================
-- 8. TABLA: intercambio
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.intercambio (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    publicacion_id UUID NOT NULL REFERENCES public.publicacion(id) ON DELETE CASCADE,
    chat_id UUID NOT NULL REFERENCES public.chat(id) ON DELETE CASCADE,
    confirmado_publicador BOOLEAN NOT NULL DEFAULT false,
    confirmado_interesado BOOLEAN NOT NULL DEFAULT false,
    punto_encuentro VARCHAR(150),
    tipo_entrega VARCHAR(30) NOT NULL DEFAULT 'punto_seguro' CHECK (tipo_entrega IN ('punto_seguro', 'delivery_simulado')),
    estado VARCHAR(20) NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'finalizado')),
    resultado VARCHAR(30) CHECK (resultado IN ('intercambiado', 'no_intercambiado')),
    motivo_no_intercambio TEXT,
    fecha_confirmacion TIMESTAMPTZ,
    fecha_cierre TIMESTAMPTZ
);

-- =============================================================================
-- 9. TABLA: calificacion
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.calificacion (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    intercambio_id UUID NOT NULL REFERENCES public.intercambio(id) ON DELETE CASCADE,
    usuario_calificador_id UUID NOT NULL REFERENCES public.usuario(id) ON DELETE CASCADE,
    usuario_calificado_id UUID NOT NULL REFERENCES public.usuario(id) ON DELETE CASCADE,
    estrellas SMALLINT NOT NULL CHECK (estrellas >= 1 AND estrellas <= 5),
    tags VARCHAR(200),
    comentario TEXT,
    fecha TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT calificacion_no_autocalificarse CHECK (usuario_calificador_id <> usuario_calificado_id),
    CONSTRAINT unique_calificacion_por_parte UNIQUE (intercambio_id, usuario_calificador_id)
);

-- =============================================================================
-- 10. TABLA: reporte
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.reporte (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_reportante_id UUID NOT NULL REFERENCES public.usuario(id) ON DELETE CASCADE,
    usuario_reportado_id UUID NOT NULL REFERENCES public.usuario(id) ON DELETE CASCADE,
    motivo VARCHAR(60) NOT NULL,
    descripcion TEXT NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'revisado', 'descartado')),
    fecha TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT no_autoreporte CHECK (usuario_reportante_id <> usuario_reportado_id)
);

-- =============================================================================
-- 11. TABLA: strike
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.strike (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES public.usuario(id) ON DELETE CASCADE,
    reporte_id UUID REFERENCES public.reporte(id) ON DELETE SET NULL,
    motivo VARCHAR(100) NOT NULL,
    fecha_emision TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    fecha_expiracion TIMESTAMPTZ NOT NULL DEFAULT (timezone('utc'::text, now()) + INTERVAL '1 month')
);

-- =============================================================================
-- 12. TABLA: comunidad
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.comunidad (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(100) NOT NULL,
    ciudad VARCHAR(80) NOT NULL,
    descripcion TEXT,
    creador_id UUID NOT NULL REFERENCES public.usuario(id) ON DELETE CASCADE,
    fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- =============================================================================
-- 13. TABLA: miembro_comunidad
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.miembro_comunidad (
    comunidad_id UUID NOT NULL REFERENCES public.comunidad(id) ON DELETE CASCADE,
    usuario_id UUID NOT NULL REFERENCES public.usuario(id) ON DELETE CASCADE,
    fecha_union TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    PRIMARY KEY (comunidad_id, usuario_id)
);

-- =============================================================================
-- 14. TABLA: ong
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.ong (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(120) NOT NULL,
    descripcion TEXT,
    ciudad VARCHAR(80) NOT NULL,
    verificada BOOLEAN NOT NULL DEFAULT false,
    contacto VARCHAR(150),
    fecha_registro TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- =============================================================================
-- 15. TABLA: causa_social
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.causa_social (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    publicacion_id UUID NOT NULL REFERENCES public.publicacion(id) ON DELETE CASCADE,
    ong_id UUID NOT NULL REFERENCES public.ong(id) ON DELETE CASCADE,
    estado VARCHAR(20) NOT NULL DEFAULT 'disponible' CHECK (estado IN ('disponible', 'entregado')),
    fecha TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- =============================================================================
-- 16. TABLA: subasta
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.subasta (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    publicacion_id UUID NOT NULL REFERENCES public.publicacion(id) ON DELETE CASCADE,
    usuario_id UUID NOT NULL REFERENCES public.usuario(id) ON DELETE CASCADE,
    monto_inicial NUMERIC(10,2) NOT NULL CHECK (monto_inicial >= 0),
    monto_actual NUMERIC(10,2) NOT NULL CHECK (monto_actual >= monto_inicial),
    fin_benefico BOOLEAN NOT NULL DEFAULT false,
    fecha_inicio TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    fecha_fin TIMESTAMPTZ NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'activa' CHECK (estado IN ('activa', 'finalizada', 'cancelada')),
    CONSTRAINT subasta_fechas_validas CHECK (fecha_fin > fecha_inicio)
);

-- =============================================================================
-- 17. TABLA: puja
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.puja (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subasta_id UUID NOT NULL REFERENCES public.subasta(id) ON DELETE CASCADE,
    usuario_id UUID NOT NULL REFERENCES public.usuario(id) ON DELETE CASCADE,
    monto NUMERIC(10,2) NOT NULL CHECK (monto > 0),
    fecha TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- =============================================================================
-- 18. TABLA: notificacion
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.notificacion (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES public.usuario(id) ON DELETE CASCADE,
    tipo VARCHAR(40) NOT NULL CHECK (tipo IN ('chat', 'intercambio', 'sistema', 'comunidad', 'subasta', 'reporte')),
    contenido TEXT NOT NULL,
    leida BOOLEAN NOT NULL DEFAULT false,
    fecha TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- =============================================================================
-- 19. TABLA: logro
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.logro (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(80) NOT NULL UNIQUE,
    descripcion TEXT NOT NULL,
    icono VARCHAR(60)
);

-- =============================================================================
-- 20. TABLA: usuario_logro
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.usuario_logro (
    usuario_id UUID NOT NULL REFERENCES public.usuario(id) ON DELETE CASCADE,
    logro_id INT NOT NULL REFERENCES public.logro(id) ON DELETE CASCADE,
    fecha_obtenido TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    PRIMARY KEY (usuario_id, logro_id)
);

-- =============================================================================
-- ÍNDICES DE RENDIMIENTO Y SEGURIDAD
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_publicacion_usuario ON public.publicacion(usuario_id);
CREATE INDEX IF NOT EXISTS idx_publicacion_categoria ON public.publicacion(categoria_id);
CREATE INDEX IF NOT EXISTS idx_publicacion_estado ON public.publicacion(estado_publicacion);
CREATE INDEX IF NOT EXISTS idx_foto_publicacion_publicacion ON public.foto_publicacion(publicacion_id);
CREATE INDEX IF NOT EXISTS idx_chat_participantes ON public.chat(interesado_id, publicador_id);
CREATE INDEX IF NOT EXISTS idx_chat_publicacion ON public.chat(publicacion_id);
CREATE INDEX IF NOT EXISTS idx_mensaje_chat ON public.mensaje(chat_id);
CREATE INDEX IF NOT EXISTS idx_mensaje_fecha ON public.mensaje(fecha_envio);
CREATE INDEX IF NOT EXISTS idx_intercambio_chat ON public.intercambio(chat_id);
CREATE INDEX IF NOT EXISTS idx_intercambio_publicacion ON public.intercambio(publicacion_id);
CREATE INDEX IF NOT EXISTS idx_calificacion_intercambio ON public.calificacion(intercambio_id);
CREATE INDEX IF NOT EXISTS idx_calificacion_usuarios ON public.calificacion(usuario_calificado_id, usuario_calificador_id);
CREATE INDEX IF NOT EXISTS idx_notificacion_usuario ON public.notificacion(usuario_id, leida);

-- =============================================================================
-- PROTECCIÓN DE NIVEL_CONFIANZA (SOLO SERVIDOR)
-- =============================================================================
-- Revoca permisos de actualización directa en la columna nivel_confianza para clientes
REVOKE UPDATE (nivel_confianza) ON public.usuario FROM authenticated, anon;

-- Trigger de defensa en profundidad para evitar escalación de privilegios desde el cliente
CREATE OR REPLACE FUNCTION public.prevent_usuario_privilege_escalation()
RETURNS TRIGGER AS $$
BEGIN
    -- Si la llamada no proviene del rol del servidor (service_role)
    IF (auth.jwt() ->> 'role') IS DISTINCT FROM 'service_role' THEN
        IF NEW.nivel_confianza IS DISTINCT FROM OLD.nivel_confianza THEN
            RAISE EXCEPTION 'Acción denegada: nivel_confianza solo puede ser modificado por triggers o funciones del servidor.';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER trg_prevent_usuario_privilege_escalation
BEFORE UPDATE ON public.usuario
FOR EACH ROW
EXECUTE FUNCTION public.prevent_usuario_privilege_escalation();

-- Trigger automático para sincronizar nuevos usuarios de auth.users hacia public.usuario
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.usuario (
        id,
        nombre,
        email,
        foto_perfil_url,
        fecha_nacimiento,
        email_verificado
    )
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'nombre', NEW.raw_user_meta_data->>'name', 'Usuario Truekly'),
        NEW.email,
        NEW.raw_user_meta_data->>'avatar_url',
        COALESCE((NEW.raw_user_meta_data->>'fecha_nacimiento')::DATE, '2000-01-01'::DATE),
        COALESCE(NEW.email_confirmed_at IS NOT NULL, false)
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        email_verificado = EXCLUDED.email_verificado;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================================================
-- [PENDIENTE] TRIGGER: BLOQUEO DE EDICIÓN DE ESTADO_PUBLICACION
-- =============================================================================
-- NOTA: Este bloque queda marcado como pendiente por directiva de arquitectura.
-- Cuándo se activará: En la fase de integración de lógica de chat.
-- Lógica prevista:
--   Un trigger BEFORE UPDATE ON public.publicacion verificará si existen filas en
--   la tabla public.chat asociadas a esta publicación con estado = 'activo'.
--   Si existen chats activos y se intenta modificar estado_producto o estado_publicacion
--   a un valor no permitido, se lanzará una excepción previniendo estafas de último minuto.
-- =============================================================================

-- =============================================================================
-- [PENDIENTE] TRIGGER: CIERRE AUTOMÁTICO DE CHATS AL CONFIRMAR INTERCAMBIO
-- =============================================================================
-- NOTA: Este bloque queda marcado como pendiente por directiva de arquitectura.
-- Cuándo se activará: En la fase de confirmación de acuerdos de intercambio.
-- Lógica prevista:
--   Un trigger AFTER UPDATE ON public.intercambio verificará cuando:
--   NEW.confirmado_publicador = true AND NEW.confirmado_interesado = true.
--   En ese instante:
--     1) Actualizará public.publicacion SET estado_publicacion = 'intercambiado'
--     2) Actualizará public.chat SET estado = 'cerrado_intercambio' WHERE id = NEW.chat_id
--     3) Actualizará todos los demás chats de esa publicacion a estado = 'cerrado_auto'
--     4) Insertará automáticamente mensajes del sistema alertando a los participantes.
-- =============================================================================

-- =============================================================================
-- ACTIVACIÓN DE ROW LEVEL SECURITY (RLS) EN LAS 20 TABLAS
-- =============================================================================
ALTER TABLE public.usuario ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verificacion_identidad ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categoria ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.publicacion ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.foto_publicacion ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mensaje ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intercambio ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calificacion ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reporte ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.strike ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comunidad ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.miembro_comunidad ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ong ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.causa_social ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subasta ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.puja ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notificacion ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logro ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuario_logro ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- POLÍTICAS RLS (ROW LEVEL SECURITY)
-- =============================================================================

-- 1. usuario
CREATE POLICY "usuario_select_perfiles" ON public.usuario
    FOR SELECT USING (estado_cuenta = 'activo' OR auth.uid() = id);

CREATE POLICY "usuario_update_propio" ON public.usuario
    FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "usuario_insert_propio" ON public.usuario
    FOR INSERT WITH CHECK (auth.uid() = id);

-- 2. verificacion_identidad
CREATE POLICY "verificacion_select_propio" ON public.verificacion_identidad
    FOR SELECT USING (auth.uid() = usuario_id);

CREATE POLICY "verificacion_insert_propio" ON public.verificacion_identidad
    FOR INSERT WITH CHECK (auth.uid() = usuario_id);

-- 3. categoria (Lectura pública, edición solo admin/servidor)
CREATE POLICY "categoria_select_publico" ON public.categoria
    FOR SELECT USING (true);

-- 4. publicacion (Lectura pública, solo el dueño edita/borra)
CREATE POLICY "publicacion_select_publico" ON public.publicacion
    FOR SELECT USING (estado_publicacion <> 'eliminado' OR auth.uid() = usuario_id);

CREATE POLICY "publicacion_insert_propio" ON public.publicacion
    FOR INSERT WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "publicacion_update_dueno" ON public.publicacion
    FOR UPDATE USING (auth.uid() = usuario_id) WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "publicacion_delete_dueno" ON public.publicacion
    FOR DELETE USING (auth.uid() = usuario_id);

-- 5. foto_publicacion
CREATE POLICY "foto_publicacion_select_publico" ON public.foto_publicacion
    FOR SELECT USING (true);

CREATE POLICY "foto_publicacion_insert_dueno" ON public.foto_publicacion
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.publicacion p
            WHERE p.id = foto_publicacion.publicacion_id AND p.usuario_id = auth.uid()
        )
    );

CREATE POLICY "foto_publicacion_delete_dueno" ON public.foto_publicacion
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.publicacion p
            WHERE p.id = foto_publicacion.publicacion_id AND p.usuario_id = auth.uid()
        )
    );

-- 6. chat (Solo los participantes leen y gestionan su chat)
CREATE POLICY "chat_select_participantes" ON public.chat
    FOR SELECT USING (auth.uid() = interesado_id OR auth.uid() = publicador_id);

CREATE POLICY "chat_insert_interesado" ON public.chat
    FOR INSERT WITH CHECK (auth.uid() = interesado_id);

CREATE POLICY "chat_update_participantes" ON public.chat
    FOR UPDATE USING (auth.uid() = interesado_id OR auth.uid() = publicador_id);

-- 7. mensaje (Solo los participantes del chat leen y envían)
CREATE POLICY "mensaje_select_participantes" ON public.mensaje
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.chat c
            WHERE c.id = mensaje.chat_id AND (c.interesado_id = auth.uid() OR c.publicador_id = auth.uid())
        )
    );

CREATE POLICY "mensaje_insert_participantes" ON public.mensaje
    FOR INSERT WITH CHECK (
        auth.uid() = emisor_id AND
        EXISTS (
            SELECT 1 FROM public.chat c
            WHERE c.id = mensaje.chat_id AND (c.interesado_id = auth.uid() OR c.publicador_id = auth.uid())
        )
    );

CREATE POLICY "mensaje_update_estado" ON public.mensaje
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.chat c
            WHERE c.id = mensaje.chat_id AND (c.interesado_id = auth.uid() OR c.publicador_id = auth.uid())
        )
    );

-- 8. intercambio (Solo los participantes del acuerdo)
CREATE POLICY "intercambio_select_participantes" ON public.intercambio
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.chat c
            WHERE c.id = intercambio.chat_id AND (c.interesado_id = auth.uid() OR c.publicador_id = auth.uid())
        )
    );

CREATE POLICY "intercambio_insert_participantes" ON public.intercambio
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.chat c
            WHERE c.id = intercambio.chat_id AND (c.interesado_id = auth.uid() OR c.publicador_id = auth.uid())
        )
    );

CREATE POLICY "intercambio_update_participantes" ON public.intercambio
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.chat c
            WHERE c.id = intercambio.chat_id AND (c.interesado_id = auth.uid() OR c.publicador_id = auth.uid())
        )
    );

-- 9. calificacion (Solo las partes involucradas leen y registran)
CREATE POLICY "calificacion_select_participantes" ON public.calificacion
    FOR SELECT USING (auth.uid() = usuario_calificador_id OR auth.uid() = usuario_calificado_id);

CREATE POLICY "calificacion_insert_participante" ON public.calificacion
    FOR INSERT WITH CHECK (
        auth.uid() = usuario_calificador_id AND
        EXISTS (
            SELECT 1 FROM public.intercambio i
            JOIN public.chat c ON c.id = i.chat_id
            WHERE i.id = calificacion.intercambio_id
              AND (c.interesado_id = auth.uid() OR c.publicador_id = auth.uid())
        )
    );

CREATE POLICY "calificacion_update_propio" ON public.calificacion
    FOR UPDATE USING (auth.uid() = usuario_calificador_id);

-- 10. reporte
CREATE POLICY "reporte_select_propio" ON public.reporte
    FOR SELECT USING (auth.uid() = usuario_reportante_id);

CREATE POLICY "reporte_insert_propio" ON public.reporte
    FOR INSERT WITH CHECK (auth.uid() = usuario_reportante_id);

-- 11. strike
CREATE POLICY "strike_select_propio" ON public.strike
    FOR SELECT USING (auth.uid() = usuario_id);

-- 12. comunidad
CREATE POLICY "comunidad_select_publico" ON public.comunidad
    FOR SELECT USING (true);

CREATE POLICY "comunidad_insert_creador" ON public.comunidad
    FOR INSERT WITH CHECK (auth.uid() = creador_id);

CREATE POLICY "comunidad_update_creador" ON public.comunidad
    FOR UPDATE USING (auth.uid() = creador_id);

CREATE POLICY "comunidad_delete_creador" ON public.comunidad
    FOR DELETE USING (auth.uid() = creador_id);

-- 13. miembro_comunidad
CREATE POLICY "miembro_comunidad_select_publico" ON public.miembro_comunidad
    FOR SELECT USING (true);

CREATE POLICY "miembro_comunidad_insert_propio" ON public.miembro_comunidad
    FOR INSERT WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "miembro_comunidad_delete_propio" ON public.miembro_comunidad
    FOR DELETE USING (auth.uid() = usuario_id);

-- 14. ong
CREATE POLICY "ong_select_publico" ON public.ong
    FOR SELECT USING (true);

-- 15. causa_social
CREATE POLICY "causa_social_select_publico" ON public.causa_social
    FOR SELECT USING (true);

CREATE POLICY "causa_social_insert_dueno" ON public.causa_social
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.publicacion p
            WHERE p.id = causa_social.publicacion_id AND p.usuario_id = auth.uid()
        )
    );

-- 16. subasta
CREATE POLICY "subasta_select_publico" ON public.subasta
    FOR SELECT USING (true);

CREATE POLICY "subasta_insert_dueno" ON public.subasta
    FOR INSERT WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "subasta_update_dueno" ON public.subasta
    FOR UPDATE USING (auth.uid() = usuario_id);

-- 17. puja
CREATE POLICY "puja_select_publico" ON public.puja
    FOR SELECT USING (true);

CREATE POLICY "puja_insert_postor" ON public.puja
    FOR INSERT WITH CHECK (auth.uid() = usuario_id);

-- 18. notificacion
CREATE POLICY "notificacion_select_propio" ON public.notificacion
    FOR SELECT USING (auth.uid() = usuario_id);

CREATE POLICY "notificacion_update_propio" ON public.notificacion
    FOR UPDATE USING (auth.uid() = usuario_id);

CREATE POLICY "notificacion_delete_propio" ON public.notificacion
    FOR DELETE USING (auth.uid() = usuario_id);

-- 19. logro
CREATE POLICY "logro_select_publico" ON public.logro
    FOR SELECT USING (true);

-- 20. usuario_logro
CREATE POLICY "usuario_logro_select_publico" ON public.usuario_logro
    FOR SELECT USING (true);

-- =============================================================================
-- DATOS SEMILLA: CATEGORÍAS BASE
-- =============================================================================
INSERT INTO public.categoria (id, nombre, icono) VALUES
    (1, 'Tecnología y Electrónica', 'smartphone'),
    (2, 'Hogar y Muebles', 'sofa'),
    (3, 'Ropa y Accesorios', 'shirt'),
    (4, 'Libros e Instrumentos', 'book-open'),
    (5, 'Herramientas y Construcción', 'wrench'),
    (6, 'Deportes y Bicicletas', 'bike'),
    (7, 'Juguetes e Infantil', 'gamepad-2'),
    (8, 'Otros', 'package')
ON CONFLICT (id) DO NOTHING;
SELECT setval('categoria_id_seq', (SELECT MAX(id) FROM public.categoria));
