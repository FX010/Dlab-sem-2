# Hallazgos de la revisión de v13 (2026-10-30)

Método: lectura del código y ejecución en un navegador real (navegador integrado de la sesión, Chromium, escritorio 1024×768 y móvil 375×812, tema claro y oscuro) servido desde `http://localhost`. Los flujos se ejercitaron con scripts sobre la interfaz real (clics, formularios, archivos), y la consola se revisó en cada carga.

## Hallazgos corregidos en V14

| ID | Severidad | Vista | Qué pasa en v13 | Causa | Estado en V14 |
|---|---|---|---|---|---|
| H-01 | Baja | Todas | La consola se llena de avisos *"Blocked call to navigator.vibrate because user hasn't tapped on the frame"* al cargar y cuando una vibración se dispara por temporizador antes del primer toque (por ejemplo, al terminar la espera de un pedido). No rompe nada, pero ensucia el diagnóstico real y es ruido en cualquier revisión técnica. | 6 llamadas directas a `navigator.vibrate` sin comprobar que la persona ya interactuó con la página. | **Corregido.** Nuevo `rhVib()` que solo vibra si `navigator.userActivation.hasBeenActive`. |

## Hallazgos que NO se corrigen (decisión de diseño o requieren definición del equipo)

| ID | Severidad | Dónde | Observación | Por qué no se toca |
|---|---|---|---|---|
| H-02 | Media | Formulario (anti-spam) | `findExisting` ignora los locales en estado `rechazado`. Un local descartado por la oficina puede volver a reportarse (por ejemplo, otro Hunter lo reporta días después). | Puede ser lo deseado (un rechazo por "cerró" o por datos malos no debería bloquear para siempre), pero es una **regla de negocio** que debe confirmar Rappi: ¿por cuánto tiempo se bloquea un local descartado? Queda documentada con una prueba (`findExisting/ignora-rechazados`). |
| H-03 | Media | Anti-spam | Un nombre alterado (letras cambiadas de lugar, otra ortografía) no se detecta. El gemelo digital lo mide: en el escenario base, una fracción de los duplicados "variante" se cuela. | Es una limitación inherente a comparar texto. La mitigación real es otra (comparar por ubicación GPS y por teléfono, y revisión de la oficina). Se reporta con cifras en el informe. |
| H-04 | Baja | Oficina | El texto de antigüedad de un lead enviado en la sesión ("hace instantes") no se actualiza con el paso del tiempo hasta recargar. | Es un prototipo de demostración; el valor numérico interno (`sentAt`) sí avanza y alimenta el SLA. |
| H-05 | Baja (seguridad de demostración) | Mi QR Hunter | El QR de demo apunta a `linktr.ee/PedroH192`, un perfil personal ajeno a Rappi. | Reemplazarlo requiere una URL propia que decide el equipo. **Cambiar antes de mostrarlo a terceros.** |
| H-06 | Informativa | Mapa real | El mapa real carga Leaflet y las teselas desde CDN/servidores externos. Sin red, el mapa real no carga (queda el mapa esquemático). | No se probó sin red real; solo por lectura. Para una demo sin conexión conviene alojar esos archivos dentro del paquete. |
| H-07 | Informativa | Mapa / GPS | No se pudo probar GPS real (permiso, movimiento, precisión) en este entorno. | Declarado como **no probado**. |

## Probado y sin hallazgos

- **Carga**: sin errores de JavaScript (solo H-01).
- **Bloqueo por pedido en curso**: con pedido activo el Modo Hunter está deshabilitado y el texto *"Funcionalidad bloqueada: Completa tu pedido en curso para cazar leads."* existe; el bloque aparece una vez que el repartidor acepta el rol Hunter (comportamiento de v13, `data-hrole`). Tras entregar el pedido, el modo se habilita y la carta de invitación aparece.
- **Formulario**: el envío está deshabilitado hasta tener nombre, teléfono de 9 dígitos y las dos fotos; el duplicado por nombre parecido y por teléfono bloquea con el mensaje esperado; un doble toque en "Enviar" **no** duplica el lead; el borrador se conserva al cerrar.
- **Cupo de 5**: se llega a 5 de 5, el botón deja de abrir el formulario, y tras recargar la página se restauran los leads propios (`rh_state12`) sin superar el cupo.
- **Oficina**: el lead enviado aparece con insignia, los controles de avance de etapa existen, los KPIs se calculan.
- **Importar / exportar**: un CSV con un nombre `<img src=x onerror=…>` se muestra como texto (no se ejecuta) en la previsualización y en la lista; en la exportación CSV una celda que empieza con `=` se neutraliza con `'` (previene inyección de fórmulas).
- **Persistencia**: `localStorage` protegido con `try/catch` en todos los accesos revisados.
