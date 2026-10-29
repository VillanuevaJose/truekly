# TRUEKLY — Design System & Especificación de Producto

**Superficie:** Aplicativo Web Marketplace P2P de Trueque Inteligente y Economía Colaborativa en Perú.  
**Dirección Visual Elegida:** Editorial cálido (comunidades, marketplaces, cultura, contenido).  
**Fecha:** 2026-09-19  

---

## 1. Propósito del Producto
Plataforma P2P que reinventa el intercambio en Perú: trueque justo entre personas mediante valuación referencial transparente en Soles (PEN S/), propuesta de intercambio estructurada, compensación mixta (trueque + diferencia acordada) y reputación comunitaria verificada.

## 2. Audiencia y Usuario Principal
Comunidad activa en Perú (jóvenes profesionales, creativos, estudiantes y emprendedores) que poseen artículos de alto valor funcional (tecnología, movilidad, instrumentos, cámaras, libros técnicos) o habilidades, y prefieren intercambiar directamente sin perder valor en comisiones leoninas ni devaluación inmediata.

## 3. Principios de Diseño
1. **El valor equitativo es el protagonista:** Cada publicación y propuesta muestra con claridad el balance referencial (S/) para que ambas partes negocien con dignidad y justicia.
2. **Confianza comunitaria y seguridad:** Verificación de identidad, historial de intercambios y puntos de encuentro seguros sugeridos (estaciones de metro, centros comerciales, cafeterías concurridas).
3. **Editorial cálido y oficio humano:** Cero estética "cyber" o de neón artificial. Sensación de catálogo curado de alta calidad, con fondo crema (`#FAF8F4`), tipografía serif con carácter para títulos y sans humanista para lectura rápida.
4. **Fluidez 144fps:** Microinteracciones de 150 a 250 ms, transiciones con aceleración por hardware (`transform`, `opacity`), soporte estricto de `prefers-reduced-motion` y cero layout shift.
5. **Presupuesto estricto de acento:** Terracota artesanal (`#C2410C`) limitado a 3–5 focos visuales por vista para no saturar.

---

## 4. Tokens del Sistema

### Colores
- **Fondo Base (Warm Canvas):** `#FAF8F4`
- **Superficie de Tarjeta:** `#FFFFFF`
- **Superficie Secundaria / Badge:** `#F3EFE6`
- **Borde Editorial (1px):** `#E5DFD3`
- **Texto Principal:** `#1C1A17`
- **Texto Secundario:** `#665F55`
- **Acento Primario (Terracota):** `#C2410C` (hover: `#9A3412`, fondo suave: `#FFF7ED`)
- **Acento de Confianza (Bosque Andino):** `#1E4E38` (badges de reputación positiva y trueque verificado)
- **Alerta / Diferencia:** `#B45309`

### Tipografía
- **Titulares:** `"Newsreader", "Playfair Display", Georgia, serif`
- **Cuerpo e Interfaz:** `"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
- **Métricas / Precios referenciales:** tabular-nums, sin fuentes mono genéricas en navegación.

### Espaciado y Radios
- **Radio de tarjetas y paneles:** `8px` (`rounded-lg`)
- **Radio de botones y pills:** `6px` (`rounded-md`)
- **Bordes:** `1px solid var(--border)`
- **Sombra:** Sombra tenue multicapa `0 1px 2px rgba(28, 26, 23, 0.05), 0 4px 12px rgba(28, 26, 23, 0.03)`
