# Gemelo digital v19 · condiciones y supuestos más realistas

Todo lo de este informe es **simulado**. Los supuestos son nuestros y no están calibrados con datos de Rappi: están marcados «supuesto» en la app y hay que confirmarlos en el piloto.

## Qué cambió en el motor

El motor v16 tenía tres defectos que hacían ver el programa mejor de lo que es:

1. **El embudo reintentaba para siempre.** Una gestión que fallaba se repetía hasta que salía bien, y casi todo lead terminaba activo: **~70 % de conversión** de los leads Hunter, contra 26,6 % observado en terreno y 20 % de meta del proyecto.
2. **Todos los repartidores eran iguales** (misma frecuencia, mismo valle, misma motivación todo el mes) y la semana era plana (la oficina trabajaba domingo).
3. **No había forma de probar el feedback de Rappi** (full-time y zonas calientes, bono por lead pertinente, integración, fraude).

La v19 agrega una capa de realismo que se puede **apagar** («Condiciones realistas: Apagadas»); con `legacy` apagado todo reproduce la v15 exacta (la prueba de regresión sigue idéntica en 7 escenarios × 3 semillas). Las decisiones aleatorias nuevas usan un generador aparte, así que no alteran la secuencia del motor anterior.

| Condición | Supuesto por defecto | De dónde sale |
|---|---|---|
| Embudo realista | Una gestión fallida se reintenta con 30 % de probabilidad, hasta 3 veces; después el lead se descarta | Calibra la conversión a lo observado en terreno |
| Part-time y full-time | 50 % full-time: se conecta 30 % más, 20 % menos valle. Part-time: 20 % menos conexión, 20 % más valle | Minuta de Rappi (#4) |
| Pausa por demanda | El full-time no reporta en zonas de alta demanda de pedidos (Centro, Providencia, Las Condes, Ñuñoa) | Minuta de Rappi (#4); misma regla que la app |
| Demanda y valle | Más demanda, menos valle (×0,7 en zonas altas, ×1,25 en bajas) | Supuesto |
| Frecuencia por perfil | Los «constantes» buscan 2× el promedio y los «esporádicos» 0,5× | Supuesto |
| Desgaste de la novedad | La participación baja 30 % al cabo de un mes | Supuesto |
| Motivación | +0,25 al activarse un lead, +0,10 si es pertinente (con bono), −0,10 si se descarta, −0,02 por día esperando más de 72 h sin respuesta; vuelve al nivel normal 5 % por día | Minuta de Rappi (#2) |
| Bono por lead pertinente | Un lead que llega a gestión da bono aunque no cierre; sin bono, un lead pertinente descartado quita 0,15 de motivación | Minuta de Rappi (#2) |
| Aviso al dueño | 75 % le avisa; si no, la probabilidad de contacto es 25 % menor | Casilla «Avisé al dueño» de la app |
| Integración | 3 % de los leads tarda un día más en llegar al CRM | Minuta de Rappi (#1) |
| Semana laboral | Lunes a viernes completo, sábado medio día, domingo cerrado; 6 % de capacidad perdida por ausencias | Supuesto |
| Fraude | 1 % de los Hunters inventa leads (15 % de las horas libres); se detecta el 85 % en el primer contacto; los falsos nunca se activan | Candados anti-fraude del proyecto |
| Tope diario | Máximo 5 reportes por Hunter al día | «Tope de 5 postulaciones por turno» del proyecto |
| Demora de entrega | Cada reporte cruzado con un pedido nuevo agrega la mitad del desvío (3 min) a ese pedido | Guardrail del proyecto (3 a 5 %) |

Indicadores nuevos: adopción semanal (H1), conversión de leads Hunter con 14 días de madurez (H3), permanencia, leads pertinentes que no cerraron, pausas por demanda, demora de entrega, leads falsos y demora de integración. Se agregó una regla vigilada: «ningún full-time reporta en zonas de alta demanda con la pausa encendida».

Escenarios nuevos: Sin bono por pertinencia, Sin pausa por demanda, Flota casi full-time, Integración inestable, Hunters muy activos y Caza de bonos.

## Resultados (30 días, 600 repartidores, 6 semillas; 0 reglas rotas)

| Escenario | Motor | Leads Hunter | Conv. Hunter | Adopción ≥2/sem | Con ≥1/sem | Horas al 1.er contacto | Fuera de SLA |
|---|---|---:|---:|---:|---:|---:|---:|
| Base | v16 | 1.050 | ~70 % | — | — | 15 | 15 |
| Base | **v19** | 528 | **23,0 %** | 5,5 % | 18,3 % | 6 | 0 |
| Sin pausa por demanda | **v19** | 898 | 23,8 % | 9,5 % | 30,8 % | 9 | 0 |
| Flota casi full-time | **v19** | 324 | 23,2 % | 3,9 % | 9,8 % | 6 | 0 |
| Sin bono por pertinencia | **v19** | 491 | 22,5 % | 5,1 % | 17,4 % | 6 | 0 |
| Integración inestable | **v19** | 537 | 23,2 % | 6,1 % | 17,8 % | 11 | 0 |
| Caza de bonos | **v19** | 742 | **16,8 %** | 9,1 % | 21,6 % | 6 | 0 |
| Hunters muy activos | **v19** | 1.996 | 20,2 % | 27,9 % | 42,7 % | 161 | 570 |
| Oficina saturada | **v19** | 508 | 23,3 % | 5,6 % | 17,3 % | 103 | 166 |

La tabla completa de los 17 escenarios, con ambos motores, está en [tests/out/matriz-v19.md](../tests/out/matriz-v19.md) (se regenera con `node tests/matriz19.mjs`).

## Lo que dicen los números

1. **La conversión realista de los Hunters es ~23 %**, entre el equilibrio (17 %) y la meta (20 %) del proyecto, y cerca del 26,6 % de terreno. El 70 % anterior era un artefacto del motor, no un resultado.
2. **Con estos supuestos el volumen se reduce a la mitad** (528 vs 1.050 leads al mes) por el desgaste de la novedad, el part-time y la pausa. Cualquier proyección de ahorro basada en el volumen de la v16 estaba inflada.
3. **La pausa por demanda del feedback #4 tiene un costo claro:** quitarla sube los leads de 528 a 898 (+70 %), pero esos reportes salen de full-time en zonas con muchos pedidos. La app protege las entregas a costa de leads; el motor aún no valora el beneficio de esas entregas.
4. **La adopción semanal (≥2 leads por semana) queda en ~5 %, lejos de la meta de 40 %.** Solo el escenario «Hunters muy activos» (frecuencia de búsqueda ×3) la acerca (28 %), y entonces la oficina colapsa (SLA fuera 570, 161 h al primer contacto). **La frecuencia con que un Hunter encuentra locales es el supuesto más incierto** y lo debe medir el piloto de 4 semanas; con 8 ejecutivos no alcanza para una adopción del 40 %.
5. **El bono por lead pertinente cubre un caso frecuente:** ~24 % de los leads Hunter llega a gestión (125 de 528 en la base) y se descarta sin cerrar. Sin el bono, esos repartidores quedan sin nada. El efecto sobre la permanencia es moderado en este modelo (87 % → 81 %) y no cambia la conversión: es un tema de confianza, no de volumen.
6. **El fraude es el escenario que rompe la economía:** con 10 % de Hunters inventando leads y detección de solo la mitad, la conversión baja a 16,8 %, bajo el equilibrio de 17 %. Pagar contra adhesión y el tope diario son lo que lo contiene.
7. **Reportar casi no afecta las entregas:** la demora media por pedido es ~0,007 %, muy por debajo del tope de 3 a 5 %. El riesgo para el guardrail está en la oficina, no en el desvío.
8. **Una integración inestable (30 % de leads con un día de demora)** duplica el tiempo al primer contacto (6 → 11 h) pero no rompe el SLA de 48 h.

## Límites

- Ningún supuesto está calibrado; las cifras sirven para comparar escenarios entre sí, no como pronóstico.
- La demanda de pedidos por comuna es un supuesto (en producción debe venir del mapa de calor de Operaciones) y el tipo de repartidor, del perfil real.
- No se valora el beneficio de la pausa (entregas protegidas) ni el costo en pesos: el gemelo no muestra montos por diseño.
- 6 semillas por escenario; la app permite repetir con 20.
- El Escenario virtual de la Oficina usa el mismo motor, así que hereda estas condiciones.
