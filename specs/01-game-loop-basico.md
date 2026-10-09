# SPEC 01 — Loop básico del juego (paddle, bola y bloques)

> **Status:** Aprobado
> **Depends on:** (ninguno)
> **Date:** 2026-10-08
> **Objective:** Implementar el loop jugable mínimo de Arkanoid: paddle controlable, bola que rebota, un grid fijo de bloques destructibles, y reinicio/victoria simples, sin HUD ni sistema de niveles.

## Scope

**In:**

- Canvas HTML5 fijo de 800x600.
- `index.html` que carga `assets/spritesheet.js` y `js/game.js`.
- Paddle controlable con teclado (flechas izquierda/derecha) y mouse (sigue la posición X del cursor sobre el canvas).
- Bola con movimiento continuo, rebote en paredes (arriba, izquierda, derecha) y rebote en el paddle con ángulo de salida variable según el punto de impacto.
- Grid fijo hardcodeado de bloques: 5 filas x 10 columnas, un color por fila, usando los sprites existentes (`hotpink`, `red`, `yellow`, `green`, `cyan`).
- Detección de colisión bola-bloque: el bloque golpeado se destruye y se descuenta del estado interno.
- Puntaje interno (`state.score`) que se incrementa al romper un bloque, aunque no se muestre en pantalla.
- Condición de derrota: la bola cae debajo del paddle → se reinicia paddle, bola y bloques a su estado inicial (una sola vida, sin contador de vidas).
- Condición de victoria: se rompen todos los bloques → el loop deja de actualizar posiciones y se dibuja un mensaje de texto simple ("YOU WIN") en el canvas.
- Carga y dibujo de sprites usando el módulo existente `assets/spritesheet.js` (`loadSpritesheet`, `drawSprite`).

**Out of scope (for future specs):**

- HUD (vidas visibles, puntaje visible, pantalla de pausa/game over).
- Sistema de niveles y carga de layouts de bloques desde archivo.
- Power-ups.
- Efectos de sonido (`ball-bounce.mp3`, `break-sound.mp3`) — este spec no reproduce audio.
- Animaciones de explosión al romper bloques (`EXPLOSION_FRAMES`) — el bloque se destruye sin animar la explosión.
- Canvas responsive o escalado a distintos tamaños de pantalla.

## Data model

```js
// js/game.js
const state = {
  score: 0,
  running: true, // false cuando se gana la partida (el loop deja de actualizar)
  paddle: { x: 319, y: 560, w: 162, h: 14, speed: 7 },
  ball: { x: 400, y: 300, w: 16, h: 16, vx: 4, vy: -4 },
  blocks: [ /* { x, y, w, h, color, alive: true } */ ],
};
```

Conventions:

- Origen de coordenadas: esquina superior izquierda.
- Velocidades en píxeles/frame (loop basado en `requestAnimationFrame`).
- Colores de bloque por fila, de arriba hacia abajo: `hotpink`, `red`, `yellow`, `green`, `cyan`.
- Grid de bloques: 10 columnas x 5 filas, bloques de 76x24px, gap de 4px entre bloques, margen superior de 60px, margen izquierdo de 10px.
- `state.blocks` se reconstruye por completo (todos vuelven a `alive: true` en sus posiciones originales) al perder la bola.

## Implementation plan

1. Crear `index.html` con un `<canvas id="game" width="800" height="600">` y los `<script>` para `assets/spritesheet.js` y `js/game.js` (en ese orden). Prueba manual: abrir `index.html`, ver un canvas vacío sin errores en consola.
2. En `js/game.js`, definir `state` con `paddle` y `ball` según el data model, llamar a `loadSpritesheet` y dentro del callback dibujar paddle y bola estáticos con `drawSprite`. Prueba manual: recargar, ver paddle y bola dibujados en sus posiciones iniciales.
3. Generar `state.blocks` con el grid 10x5 y dibujarlos con `drawSprite('block_<color>', ...)`. Prueba manual: ver las 5 filas de bloques de colores sobre el canvas.
4. Implementar el loop con `requestAnimationFrame`: mover la bola (`vx`, `vy`) y rebotarla contra las paredes izquierda/derecha/arriba. Prueba manual: la bola se mueve y rebota en los bordes, sin paddle ni bloques todavía.
5. Implementar el control del paddle: listeners de `keydown`/`keyup` para flechas y `mousemove` sobre el canvas para seguir la X del cursor; clamping dentro de los límites del canvas. Prueba manual: el paddle se mueve con ambos métodos sin salir del canvas.
6. Implementar la colisión bola-paddle con ángulo variable según el punto de impacto (relación entre la posición X de la bola dentro del paddle y el ángulo de salida de `vx`). Prueba manual: golpear la bola en distintos puntos del paddle y ver que el ángulo de salida cambia.
7. Implementar la colisión bola-bloque: detectar el bloque golpeado, marcarlo `alive: false`, invertir la componente de velocidad correspondiente, e incrementar `state.score`. Prueba manual: romper bloques y ver que desaparecen y que `state.score` sube (loggeado en consola o inspeccionado con breakpoint).
8. Implementar la condición de derrota (la bola supera el borde inferior del canvas): resetear `paddle`, `ball` y `blocks` a su estado inicial. Prueba manual: dejar caer la bola a propósito y ver que todo vuelve al estado inicial.
9. Implementar la condición de victoria (todos los bloques con `alive: false`): poner `state.running = false`, detener la actualización de posiciones (pero seguir dibujando el último frame) y renderizar el texto "YOU WIN" centrado en el canvas. Prueba manual: romper todos los bloques y confirmar que aparece el mensaje y que paddle/bola dejan de moverse.

## Acceptance criteria

- [ ] Abrir `index.html` en el navegador no produce errores en la consola.
- [ ] El paddle se mueve con las flechas izquierda/derecha y con el mouse, sin salir de los límites del canvas.
- [ ] La bola rebota correctamente contra las paredes izquierda, derecha y superior.
- [ ] La bola rebota contra el paddle con un ángulo de salida que varía según el punto de impacto.
- [ ] Al golpear un bloque, el bloque desaparece y `state.score` se incrementa.
- [ ] Si la bola cae debajo del paddle, el paddle, la bola y todos los bloques vuelven a su estado inicial.
- [ ] Al romper los 50 bloques, el loop deja de actualizar posiciones y se muestra el texto "YOU WIN" en el canvas.

## Decisions

- **Sí:** canvas fijo 800x600. Simplifica colisiones y el grid de bloques; no se requiere escalado.
- **No:** canvas responsive. Fuera de scope; se evaluaría en un spec aparte si se necesita.
- **Sí:** controles de teclado y mouse simultáneos. Pedido explícito, no agrega complejidad relevante.
- **Sí:** grid hardcodeado de 10x5 bloques con color por fila. Es el layout clásico de Arkanoid y evita construir un sistema de niveles antes de tener el loop funcionando.
- **No:** sistema de niveles / carga de layouts. Va en un spec futuro de "niveles".
- **Sí:** una sola vida, reinicio completo del nivel al perder la bola. Mantiene el loop simple; el manejo de vidas/game over queda para el spec de HUD.
- **No:** pantalla de game over o contador de vidas. Fuera de scope de este spec.
- **Sí:** ángulo de rebote variable en el paddle según punto de impacto. Es la sensación clásica de Arkanoid y no agrega mucha complejidad sobre una reflexión simple.
- **No:** integración de sonido (`ball-bounce.mp3`, `break-sound.mp3`) en este spec. Se deja para un spec de audio/feedback.
- **No:** animación de explosión (`EXPLOSION_FRAMES`) al romper bloques. El bloque simplemente desaparece; la animación queda para un spec de pulido visual.
- **Sí:** puntaje trackeado internamente (`state.score`) aunque no se muestre en pantalla. Prepara el terreno para el spec de HUD sin requerir UI todavía.
- **Sí:** un solo archivo `js/game.js` con todo el estado y lógica. El juego es chico; separar en módulos antes de tener el loop funcionando sería sobre-ingeniería.

## What is **not** in this spec

- HUD, vidas, pantalla de pausa/game over.
- Sistema de niveles y carga de layouts externos.
- Power-ups.
- Sonido (`ball-bounce.mp3`, `break-sound.mp3`).
- Animaciones de explosión de bloques.
- Canvas responsive/escalado.

Each one of those, if it lands, goes in its own spec.
