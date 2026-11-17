# Interfaz mínima v20 · la mitad de la mitad

La v18 ya había bajado el texto de la app del repartidor a la mitad. La v20 baja **otra mitad** y devuelve los **objetivos y las misiones de actualizar leads**, que la v18 y la v19 habían dejado escondidos.

## Cómo se mide

`node tests/measure-ui.mjs Rappi_Hunter_vNN.html` recorre 14 pantallas del repartidor (inicio, invitación, mapa Hunter, misiones, detalle de lead, formulario, perfil, metas, pedidos, soporte) y cuenta solo lo que se ve de verdad en pantalla: caracteres, palabras y controles tocables. Cuenta también los textos de ejemplo de los campos vacíos, para que no se pueda «esconder» texto en ellos. `VERB=1` imprime cada texto contado y `CTL=1` cada control.

Es una medida de **cantidad de información**, no de comprensión: dice cuánto hay en pantalla, no si el repartidor lo entiende. La misma regla está en la suite (`tests/run.mjs`, sección v20) con tope por pantalla, así que una versión futura que vuelva a llenar la pantalla falla las pruebas.

## Resultado (misma medida en ambas versiones)

| Pantalla | v19 car. | v20 car. | v19 palabras | v20 palabras | v19 controles | v20 controles |
|---|---:|---:|---:|---:|---:|---:|
| 1 Inicio (pedido en curso) | 147 | 56 | 27 | 15 | 9 | 7 |
| 2 Inicio (valle) | 145 | 112 | 22 | 18 | 10 | 10 |
| 3 Carta de invitación | 194 | 91 | 35 | 15 | 3 | 2 |
| 4 Modo Hunter (mapa + panel) | 186 | 141 | 32 | 26 | 16 | 9 |
| 4b Misiones | 233 | 118 | 49 | 26 | 15 | 9 |
| 4c Detalle de lead | 94 | 45 | 18 | 10 | 3 | 3 |
| 5 Formulario | 185 | 101 | 33 | 18 | 7 | 7 |
| 6 Formulario lleno | 139 | 75 | 24 | 14 | 7 | 7 |
| 7 Perfil | 161 | 88 | 32 | 18 | 6 | 5 |
| 8 Perfil › Mis leads | 415 | 152 | 80 | 32 | 5 | 5 |
| 9 Perfil › Ajustes | 238 | 66 | 39 | 12 | 10 | 8 |
| 10 Metas | 213 | 46 | 56 | 12 | 1 | 1 |
| 11 Pedidos | 153 | 50 | 32 | 8 | 7 | 0 |
| 12 Soporte | 254 | 135 | 43 | 24 | 7 | 5 |
| **Total** | **2.757** | **1.276** | **522** | **248** | **106** | **78** |

- **Texto: −54 %** (meta −50 %). **Palabras: −52 %.**
- **Controles: −26 %: no se llegó al −50 %.** Lo que queda se repite en casi todas las pantallas (selector de modo, avatar, barra inferior en el modo repartidor) y quitarlo cambia la navegación. En el modo Hunter ya no hay barra inferior.
- Contra la v16 original (sin los cambios de la v18), el texto baja cerca de −80 %.

## Objetivos y misiones de actualizar leads (de vuelta)

En la v18 las misiones quedaron en una pestaña sin explicación y los objetivos solo se veían al abrirla. Ahora:

- **Tres objetivos siempre a la vista** sobre la lista de leads, sin abrir nada: **Hoy** (reportes, meta 3), **Semana** (locales activos, meta 2) y **Actualizados** (leads visitados y actualizados, meta 2). Son cifras con una barra.
- **Misiones nuevas de actualizar leads:** «Actualiza 1 lead frío» y «Actualiza 2 leads», más «Reporta 1 local» y «Reporta 3 hoy». Cada una muestra su avance (0/2) y su recompensa («Bono»).
- **Actualizar es un solo toque:** el detalle del lead tiene el botón **Actualizar** (antes «Lo visité»). Al tocarlo sube el objetivo, avanza la misión, la oficina ve el lead como visitado y la app avisa «Lead actualizado» o «Misión cumplida».

Los montos de las recompensas siguen sin mostrarse: son bonos, no cifras.

## Qué se sacó

| Dónde | Antes (v19) | Ahora (v20) |
|---|---|---|
| Inicio | Pantalla de novedades de 3 pasos al abrir, nombres de los 3 pasos del pedido, «Saltar simulación», «Sin pedidos activos» | Nada se abre solo; solo el paso actual (1, 2, 3) y la acción |
| Selector de modo | «Repartidor» y «Hunter» con texto | Solo íconos |
| Barra inferior | Nombre bajo cada ícono | Solo íconos; en modo Hunter no se muestra |
| Mapa | Botón «volver a mi ubicación», aviso «Mapa de demostración activado» | Se quitaron |
| Invitación | 4 párrafos, marca «Rappi» y botón de cerrar | «Sé Hunter · Sin pedido, reporta locales nuevos. Ganas bono.» y 2 botones |
| Tarjeta de lead | Comuna · tipo, botón › en cada tarjeta | Solo el nombre y la comuna; el › solo en la tarjeta elegida |
| Formulario | Rótulos «Nombre» y «Teléfono», ubicación larga | El marcador de cada campo hace de rótulo; ubicación = comuna |
| Perfil | «Tu nivel», «Repartidor #4821 · Santiago», Beneficios, títulos de sección | Nivel, cifras cortas y «Ayuda y soporte» |
| Mis leads | «enviado hace 3 h», nombre de la etapa, 3 mensajes | Nombre y una etiqueta («En curso», «Bono», «Activo ✓», «No avanzó») |
| Ajustes | Ubicación, apariencia, preferencias, programa Hunter, guía | Part/Full-time, un interruptor de GPS y el interruptor de Hunter |
| Metas | Gráfico por día, horas conectado, descripciones | Semana, Hoy y las cifras Hunter |
| Pedidos | Filtros, 4 pedidos expandibles | 2 pedidos, sin filtros ni detalle |
| Soporte | 3 pestañas, 7 preguntas con respuestas largas | 3 preguntas con una línea de respuesta |

Se mantienen sin recorte: el aviso de seguridad («Solo con la moto detenida.»), el consentimiento «Avisé al dueño», las dos fotos obligatorias y la pausa por demanda del full-time.

## Límites

- No se probó con repartidores reales. Menos texto no asegura que entiendan; hace falta una prueba de 5 segundos en el piloto (mostrar la pantalla, preguntar qué hace cada cosa).
- Los íconos sin texto (selector de modo, barra inferior) tienen nombre accesible, pero dependen de que el repartidor los reconozca. Es lo primero que hay que validar.
- El botón de simular pedido pasó a ser un ícono «+»: es una ayuda de la demostración, no parte de la app real.
- La medida no puede ver la carga mental ni el tiempo de lectura; es un tope objetivo de cantidad, no un resultado de usabilidad.
