# Informe de pruebas · Rappi Hunter v13 → V14 con gemelo digital

**Proyecto:** Repartidores como Hunters · Rappi Chile (dLab UDD 2026, Desafío 18)
**Fecha:** 30 de octubre de 2026
**Archivos:** `Rappi_Hunter_v13.html` (revisado, no modificado) · `Rappi_Hunter_v14.html` (entregable)

> **Todo lo que dice "simulado" en este informe viene de un modelo con parámetros de ejemplo, no de datos de Rappi.** Sirve para explorar «¿qué pasaría si…?». No es un pronóstico ni una cifra de negocio.

---

## 1. Resumen ejecutivo

**Veredicto:** v13 está en buen estado para ser un prototipo de pruebas. En la revisión no apareció ningún error funcional grave en los flujos del repartidor ni en la Oficina. El único defecto confirmado fue menor (ruido en consola por la vibración), y está corregido en V14. Lo más valioso del trabajo está en **lo que el gemelo digital dejó ver sobre las reglas del programa**:

1. **La oficina es el cuello de botella, no el repartidor.** En el escenario base simulado (600 repartidores, 8 ejecutivos) los ejecutivos trabajan al 90 % de su capacidad. Con 1.000 repartidores la oficina se satura: el primer contacto pasa de ~17 h a ~109 h y quedan ~590 leads fuera del SLA de 48 h.
2. **El tope de 5 leads activos no protege a la oficina.** Con repartidores muy activos (escenario "Cupo lleno") el cupo se usa al 97 %, pero igual entran ~3.900 leads en 30 días y la oficina colapsa (carga 100 %, ~2.800 fuera de SLA). El cupo limita a cada repartidor, no el volumen total.
3. **El anti-spam por texto deja pasar cerca de 1 de cada 4 duplicados** cuando el nombre viene alterado (en el escenario base ~34 se cuelan contra ~107 frenados). Teléfono y nombre no bastan; conviene sumar ubicación GPS y revisión humana.
4. **"Priorizar el SLA" puede ser un espejismo.** En una oficina saturada, atender primero lo que está por vencer baja los fuera de SLA de ~750 a ~9, pero la conversión a "activo" cae de ~19 % a ~7 %, porque los leads que ya iban avanzando quedan abandonados. Medir solo el primer contacto incentiva la conducta equivocada.
5. **Sin valle no hay programa.** Con tiempo de espera cercano a 0 (feedback de Rappi) los leads de Hunters caen a **0**. Con mucha demanda ("hora punta") caen ~66 %. El programa depende por completo de que existan esperas largas.
6. **Las comunas frías casi no se cubren solas.** En el escenario base solo ~9 % de los leads de Hunters vienen de comunas frías; si los Hunters se concentran donde ya hay actividad, baja a ~1,4 %. Hace falta una señal (misión, zona sugerida) para dirigirlos.

**Para mostrar a Rappi:** la vista **"Gemelo digital"** de V14 permite repetir cualquiera de estos escenarios en vivo, con parámetros editables y semilla fija.

---

## 2. Alcance, método y límites

### Qué se probó
- **Lectura del código** de v13 (5.558 líneas, HTML + CSS + JS puro, un solo archivo) y sus reglas: cupo de 5, anti-spam, embudo, alerta de 50 postulaciones, SLA de 48 h, zona caliente desde 15.
- **Ejecución en un navegador real** (Chromium del navegador integrado), desde un servidor local, en escritorio (1024×768) y móvil (375×812), tema claro y oscuro: flujo del repartidor (pedido en curso, entrega, carta de invitación, Modo Hunter, formulario, anti-spam, cupo, recarga de página), Oficina (lead recibido, importar/exportar), consola de errores.
- **El gemelo digital** se verificó con **autopruebas** dentro del propio archivo (botón "Autoprueba" o `__rhDTO.selfTest()`): determinismo, aislamiento, reglas reales, extremos, 7 escenarios × 20 semillas, y pruebas de mutación (se rompe a propósito cada regla y se comprueba que el sistema lo detecta).

### Qué NO se pudo probar
- **GPS real** (permisos, movimiento, precisión) y el mapa real **sin red** (Leaflet y teselas vienen de servidores externos).
- **Dispositivos físicos** (iPhone/Android), lectores de pantalla, y navegadores distintos de Chromium.
- **El botón Bluetooth (hardware)**: solo se probó en simulador en fases anteriores, no en placa real.
- **Revisión legal** de los tres documentos del proyecto: requiere un abogado.
- **Avance de etapas y rechazo desde la Oficina con clics reales** y el tracker del perfil del repartidor se revisaron por lectura del código y por el comportamiento observado (insignias, cupo); no se hizo un recorrido exhaustivo de todos los filtros y estados.
- **Importación** de Excel/KML/GeoJSON: solo se probó CSV (incluido un caso malicioso).

### Límites del gemelo digital
Es un **modelo**. Los repartidores, ejecutivos y locales siguen reglas simples y probabilidades supuestas. Las reglas del programa (cupo, anti-spam, embudo, umbrales) sí son las reales de la app, y se invocan directamente. Lo supuesto está rotulado en la interfaz como "supuesto". Ver sección 5.

---

## 3. Errores de v13

| ID | Severidad | Vista | Qué pasa | Estado en V14 |
|---|---|---|---|---|
| H-01 | Baja | Todas | Avisos *"Blocked call to navigator.vibrate…"* en consola antes del primer toque (6 llamadas sin comprobar interacción previa). | **Corregido** (`rhVib`). |
| H-02 | Media | Anti-spam | Un local en estado "rechazado" puede volver a reportarse. | Pendiente: **decisión de negocio** (¿cuánto tiempo se bloquea un descartado?). Documentado con prueba. |
| H-03 | Media | Anti-spam | Un nombre alterado evade la detección. Medido: ~1 de cada 4 duplicados con nombre alterado se cuela. | Pendiente: limitación del enfoque por texto; ver recomendaciones. |
| H-04 | Baja | Oficina | "hace instantes" no se actualiza con el tiempo en la sesión. | No se corrige (prototipo). |
| H-05 | Baja | Mi QR Hunter | El QR de demo apunta a `linktr.ee/PedroH192`, un perfil personal ajeno a Rappi. | **Cambiar antes de mostrar a terceros.** Requiere URL propia. |
| H-06 | Informativa | Mapa real | Depende de servidores externos (CDN y teselas). Sin red no carga. | No probado sin red. |
| H-07 | Informativa | GPS | No se pudo probar GPS real. | No probado. |

Detalle de pasos y causas: `qa/hallazgos-v13.md`.

**Probado y sin hallazgos:** bloqueo por pedido en curso (texto exacto presente; se muestra una vez que el repartidor acepta el rol Hunter), formulario con las dos fotos obligatorias, duplicado por nombre y por teléfono, doble toque sin duplicar, cupo de 5 (incluida la recarga de página), importación con nombre `<img onerror>` (se muestra como texto, no se ejecuta) y exportación CSV que neutraliza celdas que empiezan con `=`.

**Nota sobre la calidad de v13:** la defensa contra inyección de código y de fórmulas está bien resuelta. Es la parte donde más se suele fallar y aquí funciona.

---

## 4. Resultados de la simulación

**Condiciones:** 30 días, 600 repartidores, 20 semillas por escenario (semillas 14 a 33), salvo los barridos (8 semillas). **Ninguna regla se rompió en ninguna corrida** (7 reglas vigiladas). Datos completos en `qa/resultados-simulacion.json`.

| Escenario | Leads Hunter (media y rango) | Primer contacto | Fuera de SLA | Conversión a activo | Carga ejecutivos |
|---|---|---|---|---|---|
| Base | 1.074 (988–1.188) | 20 h | 20 (0–95) | 49 % | 90 % |
| Hora punta (poco valle) | 363 (325–405) | 3 h | 0 | 52 % | 40 % |
| **Valle = 0** | **0** | — | 0 | — | 10 % (solo otros canales) |
| Ola de duplicados | 765 (693–840) | 4 h | 0 | 52 % | 72 % |
| Oficina saturada (3 ejecutivos, otros canales ×2) | 1.062 (984–1.155) | 199 h | 774 (698–858) | 18 % | 99 % |
| Zonas frías | 1.084 (968–1.183) | 23 h | 32 | 49 % | 90 % |
| Cupo lleno (Hunters muy activos) | 3.934 (3.910–3.964) | 306 h | 2.776 | 16 % | 100 % |

### Respuestas a las preguntas del diseño

**¿Qué pasa si el tiempo de espera tiende a 0?** Los leads de Hunters caen a cero. El programa solo funciona en el "valle". En "hora punta" (poco valle) caen ~66 %.

**¿Cuántos leads absorbe la oficina antes de incumplir el SLA de 48 h?** Con 20 gestiones por ejecutivo al día (supuesto), el umbral cae entre 8 y 10 ejecutivos para ~1.050 leads de Hunters al mes. Con 8 ejecutivos hay incumplimientos intermitentes (0 a 95 según la semilla); con 10 o más no hay. Por el lado de la demanda: hasta ~300 repartidores no hay incumplimientos; con 600 aparecen; con 1.000 la oficina se satura (primer contacto ~109 h).

| Ejecutivos | Primer contacto | Fuera de SLA | Conversión a activo |
|---|---|---|---|
| 2 | 229 h | 772 | 14 % |
| 4 | 149 h | 500 | 28 % |
| 6 | 72 h | 226 | 40 % |
| 8 | 17 h | 13 | 49 % |
| 10 | 4 h | 0 | 51 % |

**¿Cuánto frena el anti-spam y cuánto se escapa?** En el escenario base se frenan ~107 intentos y se cuelan ~34 duplicados con el nombre alterado (~24 % de los intentos de duplicado). En "Ola de duplicados": ~418 frenados y ~169 colados (~29 %). Un duplicado colado es trabajo repetido para la oficina y puede generar dos incentivos por el mismo local.

**¿El cupo de 5 frena el programa o protege a la oficina?** Ni una cosa ni la otra de forma relevante: en el escenario base el cupo se usa al ~27 %, así que rara vez frena. En el escenario extremo se usa al ~97 % y aun así entran miles de leads. Protege al repartidor de acumular demasiados pendientes, pero **no regula la carga de la oficina**. Si se quiere proteger a la oficina hace falta un control por volumen (por zona o por día), no solo por repartidor.

**¿Se concentra todo en comunas calientes?** Sí. En base, ~9 % de los leads de Hunters vienen de comunas frías; con Hunters que se concentran donde ya hay actividad baja a ~1,4 %.

**¿Qué comportamientos generan más leads útiles?** (corrida base, semilla 14, por tipo, no por persona) Los "constantes" aportan ~4,0 leads por repartidor, los "oportunistas de valle" ~2,9, los "esporádicos" ~0,7. Los oportunistas son el grupo que más leads aporta en total porque son mayoría. Coincide con el feedback de Rappi de **segmentar por comportamiento y no por reputación**.

### Hallazgo sobre cómo medir el SLA
En oficina saturada, si se prioriza lo que está por vencer, los "fuera de SLA" bajan de ~749 a ~9, pero la conversión a local activo baja de ~19 % a ~7 %. Para el equipo comercial importa el local activo, no el primer llamado. **Recomendación:** medir SLA por etapa y también la conversión completa, y evitar un indicador único de "primer contacto".

### Lo que NO puede concluirse de estos números
- Las **tasas de contacto, avance, descarte y la capacidad de un ejecutivo** son supuestos de ejemplo. Con tasas reales los niveles cambian; lo que importa son las **formas** (saturación, efecto del SLA, efecto del valle).
- No se modelan costos, bonos ni dinero (por el feedback de Rappi); el costo del programa sigue sin resolver.
- El comportamiento de los repartidores es simplificado (turnos, esperas y decisiones al azar según el perfil).
- La conversión simulada (~49 %) es **optimista** y no debe citarse.

---

## 5. Lo que cambia en V14

1. **Nueva pestaña "Gemelo digital"** (tercera pestaña de la barra inferior). Escenarios, parámetros editables con etiqueta "supuesto/control", ejecución por trozos con barra de avance y botón Cancelar, KPIs, 4 gráficos (leads por día, embudo, oportunidades por comuna, SLA e incorporaciones), modo "Reproducir", panel de **7 reglas vigiladas**, bitácora, **"Repetir con 20 semillas"** (media y rango), exportar JSON/CSV y botón **Autoprueba**.
2. **Aislamiento:** el gemelo trabaja sobre una copia de los datos. No cambia los leads del repartidor ni los de la Oficina. Solo guarda su última configuración en `rh_dto14`.
3. **Reproducible:** misma semilla y mismos parámetros dan exactamente los mismos resultados.
4. **Corrección H-01** (vibración).
5. **Barra inferior de 3 pestañas** adaptada (en móvil las tres caben en una fila).
6. `findExisting` acepta una lista opcional (con caché) para poder usarse sobre la copia del gemelo; el comportamiento original no cambia.
7. Título y rótulos: "concepto v14".

**Tope de tamaño del gemelo:** 1.000 repartidores y 60 días (en una prueba, 1.000 × 60 tardó ~5 s en el entorno de pruebas). El plan decía 2.000; con 2.000 tardaba ~17 s, por lo que se redujo y se mantiene la interfaz fluida.

### Cómo se verificó V14
- **Autopruebas del gemelo: 59 de 59 pasan** (corrida completa, ~16 s; la prueba de rendimiento con 1.000 repartidores × 60 días tardó ~4 s). Incluyen determinismo, aislamiento (no toca `zones` ni `localStorage`), reglas reales, extremos (0 repartidores, 0 ejecutivos, 1 día, valores inválidos), 7 escenarios × 20 semillas sin romper reglas, y **5 mutaciones** (ignorar cupo, ignorar bloqueo por pedido, ignorar anti-spam, retroceder etapa, perder un lead): cada una es detectada por la regla correspondiente.
- **Flujo completo del repartidor y la Oficina** repetido sobre V14: sin regresiones.
- **Consola** sin errores en las tres vistas.
- **Móvil (375 px) y tema claro/oscuro** de la vista nueva revisados visualmente.

---

## 6. Consideraciones para el proyecto

### Producto y experiencia
- **El valle es la materia prima.** Si Rappi optimiza para que haya menos esperas, el programa pierde su fuente de leads. Conviene decirlo explícitamente en la propuesta: Hunter es un uso del tiempo muerto, no un reemplazo.
- **La interfaz del repartidor no debe mostrar dinero ni metas.** El gemelo lo vigila como regla (la salida no contiene montos ni individualiza repartidores).
- **Direccionar a las comunas frías** requiere un mecanismo (misión, sugerencia de zona). Por defecto no se cubren solas.
- **El tracker de seguimiento** del repartidor depende de que la oficina avance los estados. Si la oficina está saturada, el repartidor ve un lead "congelado" durante días: riesgo de frustración. Conviene comunicar tiempos esperados.

### Oficina y operación
- **Dimensionar a los ejecutivos** antes de escalar Hunters. En el modelo, pasar de 300 a 1.000 repartidores sin sumar ejecutivos degrada el primer contacto de ~3 h a ~109 h.
- **Medir más de un SLA** (primer contacto, tiempo hasta gestionado, tiempo hasta activo) y la conversión final.
- **Control de volumen por zona o por día** si se quiere proteger a la oficina; el cupo de 5 no lo hace.
- **Duplicados:** sumar ubicación (distancia al local conocido) y revisión humana a las coincidencias dudosas, además de teléfono y nombre. Definir qué pasa con un local descartado (H-02).
- **"Regla del primer referidor"** (del documento legal): el sistema debe registrar el orden de llegada con hora fiable; en esta app la hora es del dispositivo.

### Legal y laboral
- **Subordinación y laboralidad** (Ley 21.431): el diseño actual evita metas obligatorias, horarios y ranking punitivo. El gemelo mantiene esa línea (resultados agregados y por tipo de comportamiento, nunca por persona). Cualquier cambio que agregue metas, penalizaciones o rankings debe pasar por revisión legal.
- **Datos personales** (Ley 19.628 vigente; **Ley 21.719 entra en vigencia el 1 de diciembre de 2026**): los leads incluyen teléfonos y fotos de terceros (dueños de locales) tomadas por el repartidor. Falta definir plazo de conservación, base legal del tratamiento, canal de ejercicio de derechos y responsable/DPO. El prototipo guarda fotos y datos solo en el navegador de la persona y no sube nada a un servidor.
- **Consentimiento del dueño del local:** la app ya lo captura (casilla de aviso), pero conviene que sea un paso explícito y verificable.
- **Seguridad vial:** la app bloquea el reporte en movimiento si hay GPS real. No se pudo probar.
- **Los tres documentos legales** (términos del aliado, términos del Hunter, carta de acreditación) requieren revisión de un abogado antes de publicarse.

### Seguridad y datos
- La app es **solo frontend** y guarda datos en `localStorage`. En un producto real los leads, fotos y teléfonos deben ir a un backend con autenticación, cifrado y control de acceso.
- **Cambiar el QR de demo** (H-05) antes de mostrarlo a terceros.
- Mantener la **neutralización de fórmulas** y el escape de texto al importar y exportar (hoy bien resueltos).
- Los recursos externos (mapas) filtran la IP a terceros; para una demo sin conexión, alojar localmente.

### Accesibilidad y rendimiento
- v13 usa roles ARIA, foco atrapado en diálogos y respeta `prefers-reduced-motion`. La vista nueva sigue ese patrón (etiquetas, regiones con nombre, gráficos con descripción).
- No se hizo prueba con lector de pantalla ni auditoría de contraste automática.
- El archivo pesa ~0,5 MB y es de una sola pieza. Para producción conviene separar código, estilos y datos.

### Hardware (botón Bluetooth)
- El sketch del ESP32 se probó solo en simulador. Lo menos seguro: el arranque asistido del GPS NEO-6M y la convivencia WiFi + BLE en el C3. Probar en placa antes de cualquier demostración con hardware.

### Costo del programa
- **Sigue sin resolverse** (feedback de Rappi). El gemelo mide carga operativa, no dinero. Cuando existan datos reales de costo por ejecutivo y por local activo, se pueden agregar al modelo.

---

## 7. Pendientes y supuestos por validar con Rappi

1. Tasas reales por etapa (contacto, gestión, activo, descarte) y capacidad real de un ejecutivo → reemplazar los supuestos del gemelo.
2. Volumen real y distribución de repartidores por comuna.
3. Duración y frecuencia reales del valle (los 15–30 min de las entrevistas).
4. Regla para locales descartados (H-02) y definición de "local activo/adherido".
5. Criterio de SLA por etapa (hoy solo hay primer contacto de 48 h).
6. URL propia para el QR (H-05).
7. Revisión legal y datos a completar en los tres documentos.
8. Probar el botón BLE en placa real; probar GPS real y mapa sin red.
9. Definir presupuesto y costo del programa.

---

## Anexo: cómo reproducir

- **En la app:** pestaña **Gemelo digital** → elegir un escenario → **Ejecutar** (o **Repetir con 20 semillas**). La semilla y los parámetros quedan escritos y se exportan en JSON/CSV.
- **Autoprueba:** botón **Autoprueba** (versión rápida). La versión completa, con la matriz de 7 escenarios × 20 semillas y la prueba de rendimiento, se ejecuta desde la consola del navegador con `await __rhDTO.selfTest()`.
- Los números de este informe salen de `qa/resultados-simulacion.json` (semilla base 14).
