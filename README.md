# Rappi Hunters · Prototipo y gemelo digital

> **¿Y si los repartidores aprovecharan sus tiempos de espera para descubrir locales que aún no están en Rappi?**
> Prototipo funcional de un programa de captación de locales hecho por repartidores, con una Oficina para gestionarlos y un **gemelo digital** que simula si las reglas del programa aguantan a escala.

<p align="center">
  <a href="https://fx010.github.io/Dlab-sem-2/"><img alt="Ver demo" src="https://img.shields.io/badge/▶_Ver_demo_en_vivo-DE3410?style=for-the-badge"></a>
  <a href="docs/Informe_Pruebas_v16.md"><img alt="Informe de pruebas" src="https://img.shields.io/badge/Informe_de_pruebas-26211d?style=for-the-badge"></a>
</p>

<p align="center">
  <img alt="Estado" src="https://img.shields.io/badge/Estado-Prototipo_de_pruebas-DE3410?style=flat-square">
  <img alt="Programa" src="https://img.shields.io/badge/dLab-UDD_2026-26211d?style=flat-square">
  <img alt="Stack" src="https://img.shields.io/badge/Stack-HTML_·_CSS_·_JS_puro-26211d?style=flat-square">
  <img alt="Sin dependencias" src="https://img.shields.io/badge/Dependencias-ninguna-26211d?style=flat-square">
</p>

<p align="center">
  <img src="docs/img/app-repartidor.png" alt="App del repartidor con pedido en curso" width="32%">
  <img src="docs/img/oficina-mapa.jpg" alt="Oficina: mapa de calor por comuna y leads" width="32%">
  <img src="docs/img/gemelo-digital.png" alt="Gemelo digital: escenarios y parámetros" width="32%">
</p>
<p align="center"><sub><b>App del repartidor</b> · <b>Oficina (mapa y leads)</b> · <b>Gemelo digital</b></sub></p>

Proyecto del **dLab UDD 2026 · Desafío 18 «Repartidores como Hunters»**, para Rappi Chile.
**Versión actual: v18** (interfaz mínima del repartidor: −58 % de texto en pantalla, ver [docs/Interfaz_minima_v18.md](docs/Interfaz_minima_v18.md)). Antes, v17: (ajustes tras el feedback de Rappi del 13-nov: bono por lead pertinente, pausa por alta demanda para full-time, textos más cortos y piloto en todo Santiago; ver [docs/Ajustes_v17_feedback_Rappi.md](docs/Ajustes_v17_feedback_Rappi.md)). Antes, v16: (escenario virtual en la Oficina, anti-spam por distancia, bloqueo de locales descartados, misiones a comunas frías, pausa por cola de la oficina y pruebas automáticas antes de publicar). Todo corre en el navegador: un único archivo HTML, sin servidor, sin dependencias y sin instalar nada.

## Qué incluye

| Vista | Para quién | Qué hace |
|---|---|---|
| **App repartidor** | Repartidor | Pedido en curso, tiempo de valle, carta de invitación al **Modo Hunter**, formulario para reportar un local (fachada + carta), cupo de 5 leads activos, código QR personal y seguimiento de cada lead. |
| **Oficina Rappi** | Equipo comercial | Resumen del día, mapa con zonas calientes y frías, cola de primer contacto con SLA de 48 h, embudo de conversión, importar y exportar. **Escenario virtual** (v16): un Santiago simulado con reloj acelerado para ver la Oficina funcionando, sin mezclarse nunca con los datos reales. |
| **Gemelo digital** | Equipo del proyecto | Simulación basada en agentes (repartidores, locales, ejecutivos) con escenarios, semilla fija y chequeo automático de invariantes. |

**Reglas de diseño que cuidamos**
- Con un pedido en curso el Modo Hunter queda **bloqueado**: las entregas siempre van primero.
- No hay metas obligatorias ni rankings de repartidores individuales: los resultados son agregados.
- Todo dato simulado está rotulado «Simulado», y cada parámetro inventado, «supuesto».

## Lo que descubrió el gemelo digital

Con 600 repartidores y 8 ejecutivos durante 30 días simulados:

1. **La oficina es el cuello de botella, no el repartidor.** Con 1.000 repartidores el primer contacto pasa de ~17 h a ~109 h.
2. **El tope de 5 leads activos no protege a la oficina:** limita a cada persona, no el volumen total.
3. **El anti-spam por texto deja pasar ~1 de cada 4 duplicados** si el nombre viene alterado; conviene sumar ubicación y revisión humana.
4. **Priorizar el SLA puede ser un espejismo:** baja los leads fuera de plazo, pero la conversión cae de ~19 % a ~7 %.
5. **Sin tiempo de valle no hay programa:** con espera cercana a 0, los leads de Hunters caen a 0.
6. **Las comunas frías casi no se cubren solas** (~9 % de los leads), así que hace falta una señal que dirija a los Hunters.

### Lo que agregó la v16 (simulado, 20 semillas)

- **Anti-spam por distancia (75 m):** los duplicados colados bajan de ~29 % a ~0,1 %, frenando ~0,1 % de locales legítimos.
- **Pausar la captación cuando la cola de la oficina se llena** es la palanca que protege a la oficina: en «Cupo lleno» los leads fuera de SLA bajan de ~2.770 a ~51 y la conversión sube de 16 % a 51 %, con los mismos locales incorporados. El tope por comuna, solo, no basta.
- **Misiones a comunas frías:** con 30 % de Hunters siguiendo la sugerencia, los leads desde comunas frías pasan de ~18 % a ~35 %.
- **SLA por etapa** no empeora la conversión (a diferencia del SLA puro), pero por sí solo no la mejora.

Detalle, tablas y supuestos por confirmar en el [informe v16](docs/Informe_Pruebas_v16.md).

> Son resultados de un **modelo con parámetros de ejemplo**, no datos de Rappi. Sirven para explorar «¿qué pasaría si…?», no para pronosticar. El método, los límites y los 7 hallazgos de la v13 están en el [informe completo](docs/Informe_Pruebas.md).

## Cómo probarlo

- **En línea:** abre la [demo](https://fx010.github.io/Dlab-sem-2/).
- **En local:** descarga el repositorio y abre `index.html` en el navegador.
- **Autopruebas del gemelo:** en la vista *Gemelo digital*, botón **Autoprueba** (determinismo, aislamiento, reglas reales, extremos y pruebas de mutación).
- **Pruebas automáticas (desarrollo):** `cd tests && npm install && npm test` abre la app en Edge sin ventana, corre las autopruebas y recorre los flujos clave. `node measure.mjs` regenera la matriz de simulación (`docs/qa/resultados-v16.json`). La app en sí sigue sin dependencias.

## Estructura

```
index.html                 Prototipo publicado (GitHub Pages) · versión actual v16
Rappi_Hunter_v16.html      Misma versión, con nombre de entrega
Rappi_Hunter_v15.html      Versión anterior (mapa real)
Rappi_Hunter_v14.html      Versión base del primer informe de pruebas
docs/Informe_Pruebas_v16.md  Informe de pruebas de la v16 (palancas y escenario virtual)
docs/Informe_Pruebas.md    Informe de pruebas de la v14
docs/qa/                   Hallazgos de la v13 y datos de las corridas (JSON)
tests/                     Pruebas automáticas y matriz de simulación (solo desarrollo)
docs/img/                  Capturas
```

## Tecnología

HTML · CSS · JavaScript puro · Simulación basada en agentes · Leaflet para el mapa real (opcional).

## Límites

Es un prototipo de pruebas: guarda datos solo en el navegador (`localStorage`), no se probó con GPS real ni en dispositivos físicos, y los documentos legales del proyecto requieren revisión de un abogado. Detalle en la sección 2 del informe.
