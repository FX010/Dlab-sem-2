# v18 · Interfaz mínima del repartidor

**Meta:** la mitad del texto, de la información y de los botones en pantalla, para no distraer al repartidor.
**Resultado medido** (`cd tests && node measure-ui.mjs ../Rappi_Hunter_v18.html`, texto y controles visibles en cada pantalla, móvil 420 px):

| Pantalla | Texto v17 → v18 (caracteres) | Controles v17 → v18 |
|---|---|---|
| Inicio (repartidor, pedido en curso) | 283 → 147 (−48 %) | 10 → 9 |
| Inicio (valle, sin pedido) | 385 → 145 (−62 %) | 12 → 10 |
| Carta de invitación | 489 → 194 (−60 %) | 3 → 3 |
| Modo Hunter (mapa + panel) | 347 → 186 (−46 %) | 23 → 16 |
| Formulario reportar local | 462 → 151 (−67 %) | 8 → 7 |
| Formulario lleno | 337 → 139 (−59 %) | 8 → 7 |
| Perfil › Perfil | 539 → 161 (−70 %) | 8 → 6 |
| Perfil › Mis leads | 709 → 415 (−41 %) | 5 → 5 |
| Perfil › Ajustes | 736 → 238 (−68 %) | 14 → 10 |
| Metas | 412 → 229 (−44 %) | 0 → 1 |
| Pedidos | 509 → 153 (−70 %) | 12 → 7 |
| Soporte (FAQ) | 706 → 254 (−64 %) | 12 → 7 |
| TOTAL | 5914 → 2412 (−59 %) | 115 → 88 |

Texto total: **−59 %** · palabras: **−58 %** · controles: **−23 %** (meta del 50 % cumplida en texto; en controles quedó más corta).

## Qué se quitó
- **Modo Hunter:** leyenda Calientes/Frías/Mapa demo, botones de zoom, «Mis leads ›», rótulos de cupo, aviso «Tiempo de valle», botón de ayuda «?», «Mi QR» (queda solo el ícono), insignias de origen/prioridad de cada lead. «Detalles ›» pasó a «›» y un segundo toque en la tarjeta abre el detalle. Rótulos de la barra inferior: solo el de la pestaña activa.
- **Formulario:** sin subtítulos, sin dirección ni observaciones (opcionales), sin notas bajo las fotos; solo nombre, teléfono, aviso al dueño, dos fotos y «Enviar».
- **Detalle de lead:** solo nombre, distancia, tiempo en ruta y acciones.
- **Invitación:** título, dos líneas y dos botones.
- **Perfil, Metas, Pedidos, Soporte:** sin insignias, enlaces, textos explicativos, tarjetas de propinas/pagos/referidos ni Apariencia y Preferencias; Soporte pasa de 15 a 5 preguntas cortas; novedades de 5 a 3; guía de 7 a 5 pasos; Pedidos muestra 4 entregas.

## Qué no cambió ni se pudo medir
- La Oficina y el Gemelo digital siguen igual (no son para el repartidor).
- Medimos cantidad, no legibilidad: falta una prueba de lectura con repartidores reales en calle (< 3 s por pantalla).
- Las preguntas de Soporte recortadas y las opciones de Apariencia/Preferencias siguen en el código, solo ocultas o fuera de la lista; recuperarlas es un cambio pequeño si Rappi las pide.
