# Interfaz equilibrada v21 · mínima, pero con lo que el repartidor necesita leer

La v20 bajó el texto a la mitad de la mitad, pero en el recorte se perdió información que sí le sirve a un repartidor Hunter (por qué un lead fue «pertinente», qué hace cada misión, por qué el botón está en pausa). La v21 vuelve a poner ese texto **solo donde y cuando se necesita**, y deja el resto fuera.

## La regla: un texto entra a la pantalla solo si cumple una de cuatro condiciones

| Clase | Pregunta | Ejemplos que se mantienen |
|---|---|---|
| **Seguridad o consentimiento** | ¿Evita un daño o un problema legal? | «Solo con la moto detenida.», «Avisé al dueño», «Aceptas los Términos» |
| **Decisión** | ¿Cambia lo que el repartidor hace ahora? | Nombre del modo activo, «fría» en el lead, nombre de cada objetivo, qué hace cada misión, «Tú decides cuándo» |
| **Resultado o estado** | ¿Le dice qué pasó con su esfuerzo o por qué algo no funciona? | «Pertinente · bono», «Ya ganaste bono, cierre o no», «Falta: nombre, teléfono…», «En pausa: mucha demanda de pedidos» |
| **Ayuda puntual** | ¿Responde algo que pregunta en la calle? | 5 preguntas de Soporte, de una línea cada respuesta |

Todo lo demás se queda fuera: títulos de sección, explicaciones de lo que ya muestra el ícono o el número, textos de marca, historiales largos, ajustes que no cambian el comportamiento.

## Qué se restauró respecto de la v20

| Dónde | v20 | v21 |
|---|---|---|
| Selector de modo | Solo íconos | Íconos, con el **nombre del modo activo** |
| Estado de la pantalla Hunter | Punto verde sin texto | «Valle» |
| Objetivos | «Hoy», «Semana», «Actualizados» | «Reportes hoy», «Activos semana», «Leads actualizados» |
| Misiones | Título y avance | Título, **una línea de qué hacer**, avance y recompensa |
| Tarjeta de lead | Nombre y comuna | Además «· fría» en las zonas frías (cuentan para misiones) |
| Detalle de lead | Distancia y botones | Además: «Avisa al dueño: un ejecutivo lo llamará.» |
| Invitación | «Sin pedido, reporta locales nuevos. Ganas bono.» | «…Si avanzan, ganas bono **aunque no cierren**. Tú decides cuándo.» y «Piloto · Aceptas los Términos.» |
| Formulario | Sin rótulos (solo marcadores que desaparecen al escribir) | **Rótulos fijos** («Nombre», «Teléfono»), «Carta y precios» y el motivo por el que Enviar está bloqueado |
| Botón Reportar en pausa | Solo se ve gris | Dice «En pausa: mucha demanda de pedidos» |
| Mis leads | Etiqueta corta sin explicación | «Pertinente · bono», «Bono ganado», «No cerró, pero tu lead era bueno. Conservas el bono.», «Toca el punto rojo para ver el motivo.», cuánto hace que se envió |
| Ajustes | Solo interruptores | Además: «Full-time: Hunter se pausa donde hay mucha demanda.» |
| Soporte | 3 preguntas | 5: se agregan «¿Y si el local no cierra?» y «¿Qué es actualizar un lead?» |

## Resultado de la medida (`node tests/measure-ui.mjs`)

| Pantalla | v19 | v20 | **v21** |
|---|---:|---:|---:|
| 1 Inicio (pedido en curso) | 147 | 56 | **56** |
| 2 Inicio (valle) | 145 | 112 | **169** |
| 3 Carta de invitación | 194 | 91 | **148** |
| 4 Modo Hunter (mapa + panel) | 186 | 141 | **159** |
| 4b Misiones | 233 | 118 | **195** |
| 4c Detalle de lead | 94 | 45 | **85** |
| 5 Formulario | 185 | 101 | **160** |
| 6 Formulario lleno | 139 | 75 | **112** |
| 7 Perfil | 161 | 88 | **88** |
| 8 Mis leads | 415 | 152 | **266** |
| 9 Ajustes | 238 | 66 | **117** |
| 10 Metas | 213 | 46 | **46** |
| 11 Pedidos | 153 | 50 | **50** |
| 12 Soporte | 254 | 135 | **187** |
| **Total (caracteres)** | **2.757** | **1.276** | **1.838** |

La v21 muestra **33 % menos texto que la v19** (354 palabras contra 522) y **44 % más que la v20**: es el costo de recuperar el texto que sí le sirve al repartidor. Los controles quedan en 80, igual que la v20 (la v19 tenía 106).

Las pantallas de mayor decisión (Hunter, formulario, Mis leads, invitación) recuperaron texto; las de bajo valor (Inicio con pedido, Perfil, Metas, Pedidos) quedaron igual que en la v20.

## Cómo se evita que vuelva a pasar

La suite (`node tests/run.mjs`) ahora tiene dos tipos de control, uno contra el exceso y otro contra la falta:

- **Presupuesto:** la app muestra como máximo 1.900 caracteres, 380 palabras y 85 controles en las 14 pantallas medidas.
- **Textos esenciales:** 10 comprobaciones de que el texto clave aparece en el momento justo: invitación (bono aunque no cierre, voluntario, Términos), misiones (una línea cada una), selector de modo, detalle de lead, Mis leads (pertinente, bono conservado, motivo), pausa por demanda, Soporte (manejar, pago, pertinente, actualizar) y formulario (rótulos y motivo de bloqueo).

Si una versión futura recorta un texto esencial, falla una prueba; si lo llena de texto, falla el presupuesto.

## Límites

- La clasificación de qué es «esencial» es un criterio de diseño nuestro, no un resultado de prueba con repartidores. Hay que validarla en el piloto: mostrar cada pantalla 5 segundos y preguntar qué entendió y qué le faltó.
- Los íconos de la barra inferior (modo repartidor) siguen sin texto.
- Los textos de misiones, preguntas y mensajes son propuestas de redacción; Rappi debe confirmarlos (sobre todo lo que promete bono).
