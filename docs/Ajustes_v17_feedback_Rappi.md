# v17 · Ajustes tras el feedback de Rappi Chile (13-nov-2026)

| # | Feedback de Rappi | Qué cambió en la app (v17) | Pendiente / supuesto |
|---|---|---|---|
| 1 | Costos de integración subestimados (app, HubSpot, billetera) | La Oficina rotula cada lead de Hunter como «HubSpot: lead sincronizado (simulado)» y, si es pertinente, «bono a la billetera». Hace visibles los 3 sistemas que hay que conectar. | **No toca el modelo financiero.** Las horas de ingeniería reales de las 3 integraciones deben estimarlas Producto/Tecnología de Rappi y reemplazar el ítem de integración del Hito 2. |
| 2 | Frustración si el lead es bueno pero no cierra | Nuevo reconocimiento: cuando el ejecutivo califica el lead como **pertinente** (etapa «Gestión comercial») el repartidor ve «Pertinente · bono» y conserva el bono aunque el local no firme. La Oficina marca esos leads. FAQ actualizado. | Monto del bono por pertinencia: el modelo del equipo usa $1.500 por lead calificado; Rappi debe confirmarlo y definir quién califica «pertinente». |
| 3 | Demasiado texto en la interfaz | Se acortó la carta de invitación, el formulario, la pantalla de GPS, el QR, los avisos, el seguimiento y las novedades: frases de una línea. | Falta validar con repartidores reales en calle (prueba de lectura < 3 s). |
| 4 | No distraer a full-time en zonas de alta demanda | Nuevo ajuste «Cómo trabajas» (Part-time / Full-time). Full-time en una comuna con alta demanda de pedidos: el botón Hunter queda **en pausa**. La Oficina y el panel de zona muestran la demanda de pedidos junto a las oportunidades. | La demanda por comuna es un **supuesto simulado**; en producción debe venir del mapa de calor de pedidos de Operaciones, y el tipo de repartidor, de su perfil real. El gemelo digital aún no modela esta regla. |
| 5 | Piloto en solo 2 comunas confunde | Fuera de las 10 comunas con datos ya **no se bloquea**: el lead se anota en la comuna más cercana. Ajustes y la invitación dicen «piloto con grupo reducido, todas las comunas de Santiago». | La selección del grupo reducido (quiénes y cuántos) la define Rappi. |

Pruebas: `cd tests && node run.mjs` (31 comprobaciones, incluye 6 nuevas de la v17).
