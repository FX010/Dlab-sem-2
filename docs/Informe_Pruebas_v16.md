# Informe de pruebas · Rappi Hunter v16

**Proyecto:** Repartidores como Hunters · Rappi Chile (dLab UDD 2026, Desafío 18)
**Fecha:** 13 de noviembre de 2026
**Archivos:** `Rappi_Hunter_v16.html` (entregable, también publicado como `index.html`) · base: `Rappi_Hunter_v15.html`
**Datos:** `docs/qa/resultados-v16.json` (generado con `tests/measure.mjs`)

> **Todo lo que dice "simulado" en este informe viene de un modelo con parámetros de ejemplo, no de datos de Rappi.** Sirve para explorar «¿qué pasaría si…?». No es un pronóstico ni una cifra de negocio. Este informe no se conecta con el modelo VAN/TIR: esa conexión requiere la aprobación de la empresa.

---

## 1. Resumen ejecutivo

La v16 agrega tres cosas: un **escenario virtual** en la Oficina, cinco **palancas de rediseño** que el gemelo de la v14 recomendaba y una **suite de pruebas automáticas** que corre fuera del navegador antes de publicar.

| Pregunta | Resultado simulado (20 semillas) | Meta | ¿Cumple? |
|---|---|---|---|
| ¿El anti-spam por distancia frena los duplicados con nombre alterado? | Colados: de **~29 % a ~0,1 %** (escenario «Ola de duplicados»), con ~0,1 % de locales legítimos frenados por error | < 5 % colados, < 1 % falsos | Sí |
| ¿Se puede volver a reportar un local descartado? | Ya no, durante 30 días (parámetro) | Frenado < N días, admitido después | Sí |
| ¿La «pausa por cola» protege a la oficina? | Escenario «Cupo lleno»: fuera de SLA de **~2.770 a ~51**, conversión de **16 % a 51 %**, primer contacto de 305 h a 62 h | Carga < 95 %, fuera de SLA ≈ 0 | **En parte**: la carga sigue en 100 % y quedan ~51 fuera de SLA |
| ¿El tope por comuna y día sirve solo? | No. Aun con 10 leads por comuna al día quedan ~950 fuera de SLA | — | No es la palanca útil |
| ¿Las misiones llevan Hunters a comunas frías? | Leads desde comunas que partieron frías: de **~18 % a ~35 %** (escenario base) | > 20 % | Sí |
| ¿El SLA por etapa evita el «espejismo» del SLA? | No baja la conversión frente a FIFO (19,4 % vs 19,6 %), pero tampoco baja los fuera de SLA | No bajar la conversión | Sí, pero no mejora nada por sí solo |

**Lo más importante para Rappi:**

1. **El duplicado ya no es un problema** si la app puede usar la ubicación del local: con 50 a 75 m de radio, prácticamente no se cuelan duplicados. Con 25 m se cuela ~10 %; sobre 100 m empiezan a frenarse locales legítimos (0,2–0,3 %). **Propuesta: 75 m.**
2. **La palanca que protege a la oficina es pausar la captación cuando la cola se llena**, no el tope por comuna. El costo: entran menos leads (en «Oficina saturada», de ~1.030 a ~250), pero se incorporan los mismos locales (~240) y la conversión sube de 19 % a 49 %. Es decir: **los leads extra de una oficina saturada no se convierten en locales**; solo generan atraso.
3. **Con un ejecutivo enfermo una semana**, sin palancas el primer contacto sube a ~72 h; con la pausa por cola se mantiene en ~18 h y casi no quedan leads fuera de plazo.
4. **En un lanzamiento de 100 a 1.000 Hunters en 60 días**, la oficina se atrasa (~305 fuera de SLA); con palancas bajan a ~34 y la conversión sube de 49 % a 57 %.
5. **Sin valle sigue sin haber programa**: ninguna palanca cambia eso (leads de Hunters = 0 cuando la espera es cercana a 0).

---

## 2. Qué cambió en la v16

| ID | Cambio | Dónde |
|---|---|---|
| M1 | **Escenario virtual** en la Oficina: Santiago simulado con reloj acelerado, pines con borde punteado, franja «SIMULADO», panel «Qué está pasando». Guarda en un espacio aparte y no toca los datos reales | Oficina |
| M2 | Leads del gemelo con coordenadas y **anti-spam por distancia** (mismo local si está cerca y el nombre se parece). También en el formulario real del repartidor | Gemelo + App |
| M3 | **Bloqueo de locales descartados** por N días (supuesto: 30). También en el formulario real | Gemelo + App |
| M4 | **Valle por hora del día**: poco en almuerzo y cena, más en horas intermedias | Gemelo |
| M5 | QR de «Mi código Hunter» y enlaces del perfil apuntan a la demo del proyecto, no a perfiles personales | App |
| M6 | Tope de leads por comuna y por día, y **pausa por cola** de la oficina | Gemelo |
| M7 | **Misiones** a comunas frías (fracción de Hunters que sigue la sugerencia) | Gemelo |
| M8 | **SLA por etapa** como nueva política de la oficina | Gemelo |
| M9 | Escenarios nuevos: **Lanzamiento**, **Feriado/lluvia**, **Ejecutivo enfermo** | Gemelo |
| M12 | «hace instantes» se actualiza con el tiempo | App + Oficina |
| M14 | Búsqueda de duplicados agrupada por comuna (para que el escenario virtual no se vuelva lento) | Motor |

**No se hizo:** M13 (subir el tope del gemelo de 1.000 a 2.000 repartidores) — se mantiene en 1.000. Tampoco la conexión con el modelo VAN/TIR (requiere aprobación de la empresa).

**Compatibilidad:** con las palancas apagadas (modo «v15»), los 7 escenarios originales reproducen exactamente las cifras de la v15 (prueba de regresión automática).

---

## 3. Cómo se probó

| Capa | Qué cubre | Resultado |
|---|---|---|
| A + B · Autopruebas internas | Determinismo, aislamiento, reglas, extremos, pruebas de mutación (se rompe una regla a propósito y la prueba debe fallar), nuevas reglas M2–M8 | **92/92** |
| C · Suite fuera del navegador (`tests/run.mjs`, Playwright + Edge sin ventana) | Abre el archivo, corre las autopruebas, recorre el formulario del repartidor (local existente, descartado reciente, sin fotos, envío, recarga), QR, enlaces, regresión v15, escenario virtual (enciende, genera leads en 7 días, apaga, datos reales intactos) | **25/25** |
| D · Revisión visual | Escritorio claro y móvil oscuro (375 px), las 3 vistas, sin desborde horizontal, consola sin errores | OK |
| Matriz de simulación (`tests/measure.mjs`) | 10 escenarios × 20 semillas × {v15, v16 sin palancas, v16 con palancas} + 6 barridos con 8 semillas | 0 violaciones de reglas en todas las corridas |

**Palancas usadas en «con palancas»:** pausa por cola de la oficina, 30 % de Hunters siguiendo misiones, SLA por etapa.

---

## 4. Resultados de la matriz (promedio de 20 semillas, 30 días)

| Escenario | Versión | Leads Hunters | 1er contacto | Fuera de SLA | Conversión | Incorporados | Duplicados colados | Leads de comunas frías* |
|---|---|---|---|---|---|---|---|---|
| Base | v15 | 1.074 | 19,9 h | 20 | 49 % | 585 | 24,4 % | 18 % |
| | v16 | 1.055 | 17,7 h | 18 | 49 % | 576 | 0,0 % | 18 % |
| | v16 + palancas | 1.044 | 16,3 h | 10 | 50 % | 581 | 0,1 % | **35 %** |
| Ola de duplicados | v15 | 765 | 3,7 h | 0 | 52 % | 461 | **28,8 %** | 18 % |
| | v16 | 599 | 2,4 h | 0 | 53 % | 377 | **0,1 %** | 18 % |
| Oficina saturada | v15 | 1.062 | 199 h | 774 | 18 % | 239 | 25,3 % | 17 % |
| | v16 | 1.028 | 196 h | 737 | 19 % | 240 | 0,1 % | 18 % |
| | v16 + palancas | 254 | **62 h** | **18** | **49 %** | 244 | 0,0 % | 43 % |
| Cupo lleno | v15 | 3.934 | 306 h | 2.776 | 16 % | 663 | 23,7 % | 18 % |
| | v16 + palancas | 1.190 | **62 h** | **51** | **51 %** | 664 | 0,1 % | 33 % |
| Comunas frías | v15 | 1.084 | 22,7 h | 32 | 49 % | 585 | 24,8 % | 2,5 % |
| | v16 + palancas | 1.042 | 16,5 h | 10 | 50 % | 581 | 0,0 % | **28,5 %** |
| Lanzamiento (nuevo) | v16 | 1.948 | 41 h | 305 | 49 % | 1.062 | 0,1 % | 18 % |
| | v16 + palancas | 1.626 | 29 h | **34** | **57 %** | 1.059 | 0,1 % | 35 % |
| Ejecutivo enfermo (nuevo) | v16 | 1.052 | 72 h | 110 | 43 % | 498 | 0,1 % | 18 % |
| | v16 + palancas | 901 | **18 h** | **2** | **48 %** | 490 | 0,2 % | 37 % |
| Feriado/lluvia (nuevo) | v16 | 728 | 2,6 h | 0 | 52 % | 444 | 0,1 % | 19 % |
| Hora punta | v16 | 347 | 2,1 h | 0 | 52 % | 244 | 0,6 % | 19 % |
| Sin valle | v16 | **0** | — | 0 | — | 64** | — | — |

\* Porcentaje de leads de Hunters que vienen de comunas que **partieron** frías.
\*\* Locales incorporados por otras fuentes (Google, scraping, automático); los Hunters no aportan nada.

### Barridos (8 semillas)

**Radio del anti-spam por distancia** (escenario «Ola de duplicados»):

| Radio | 25 m | 50 m | 75 m | 100 m | 150 m | 200 m |
|---|---|---|---|---|---|---|
| Duplicados colados | 10,3 % | 0,1 % | 0,1 % | 0,1 % | 0,1 % | 0,1 % |
| Legítimos frenados | 0,0 % | 0,1 % | 0,1 % | 0,2 % | 0,3 % | 0,3 % |

**Días de bloqueo de un descartado:** el efecto se estabiliza desde ~15 días; 30 días cubre el caso con margen.

**Ejecutivos** (escenario base): con 8 o más ejecutivos la pausa por cola no se activa nunca (no hace falta). Con 6 o menos es la diferencia entre ~41 % y ~50 % de conversión.

| Ejecutivos | 2 | 4 | 6 | 8 | 10 |
|---|---|---|---|---|---|
| Fuera de SLA, sin pausa | 751 | 453 | 208 | 11 | 0 |
| Fuera de SLA, con pausa | 10 | 17 | 26 | 6 | 0 |
| Conversión sin / con pausa | 15 % / 50 % | 29 % / 49 % | 41 % / 50 % | 50 % / 50 % | 52 % / 52 % |

**Misiones** (escenario base): leads desde comunas que partieron frías, 17 % sin misiones → 30 % (15 % de Hunters) → 36 % (30 %) → 47 % (70 %). Rendimiento decreciente sobre 30 %.

**Política de la oficina** (escenario «Oficina saturada», sin pausa): FIFO 19,6 % de conversión; **SLA puro 8,0 %** (confirma el espejismo de la v14); SLA por etapa 19,4 %.

---

## 5. Supuestos que debe confirmar Rappi

Quedan como parámetros editables en el gemelo y en la app:

| Supuesto | Valor usado | Por qué importa |
|---|---|---|
| Radio del anti-spam | 75 m | Con menos de 50 m vuelven a colarse duplicados |
| Días de bloqueo de un descartado | 30 | Evita reenvíos del mismo local |
| Tope por comuna y día | 40 | Poco efecto; se puede dejar alto |
| Capacidad diaria por ejecutivo y nº de ejecutivos | Igual que v14 | Define cuándo se activa la pausa por cola |
| Curva de valle por hora | Ejemplo | El programa depende del valle; sin datos reales no se puede estimar volumen |
| Conversión | ~49–52 % | Sigue **sin calibrar**: la v14 ya la calificó de optimista |

---

## 6. Límites

- Todo lo anterior es simulado. Las cifras sirven para **comparar reglas entre sí**, no para estimar cuántos locales se incorporarían.
- El escenario virtual usa locales y coordenadas sintéticos alrededor del centro de cada comuna.
- No se probó GPS real, dispositivos físicos, ni navegadores distintos de Chromium/Edge. Los datos siguen guardándose solo en el navegador.
- Los documentos legales del proyecto siguen requiriendo revisión de un abogado.
