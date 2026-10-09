# SPEC 01 — Loop básico del juego (paddle, bola, bloques, vidas y HUD)

> **Status:** Aprobado
> **Depends on:** (ninguno)
> **Date:** 2026-10-08
> **Objective:** Implementar el loop jugable mínimo de Arkanoid con paddle, bola, un grid fijo de bloques, sistema de 3 vidas, HUD de score/vidas y overlays de victoria/derrota con reinicio.

## Scope

**In:**

- Canvas HTML5 fijo de 800x600.
- `index.html` que carga `assets/spritesheet.js` y `js/game.js`.
- Paddle controlable con teclado (flechas izquierda/derecha) y mouse (sigue la posición X del cursor sobre el canvas).
- Bola con movimiento continuo, rebote en paredes (arriba, izquierda, derecha) y rebote en el paddle con ángulo de salida variable según el punto de impacto.
- Grid fijo hardcodeado de bloques: 6 filas x 10 columnas, un color por fila, usando los sprites existentes (`hotpink`, `red`, `yellow`, `green`, `cyan`, `magenta`).
- Detección de colisión bola-bloque: el bloque golpeado se destruye, se descuenta del estado interno e incrementa `state.score`.
- Sistema de 3 vidas (`state.lives`). Si la bola cae debajo del paddle: se resta una vida y se reinician solo `paddle` y `ball` a su posición inicial; los bloques ya rotos y el score se mantienen.
- Game over: al llegar a 0 vidas, `state.status` pasa a `'gameover'` y se muestra un overlay.
- Victoria: al romper todos los bloques, `state.status` pasa a `'win'` y se muestra un overlay.
- Overlay de game-over/victoria: rectángulo semitransparente sobre todo el canvas con el mensaje (`"GAME OVER"` o `"YOU WIN"`), el score final, y la instrucción de reinicio ("Press R to restart").
- Reinicio: con `state.status` en `'gameover'` o `'win'`, presionar la tecla `R` reinicia todo (`score = 0`, `lives = 3`, bloques reconstruidos completos, `paddle`/`ball` en posición inicial, `status = 'playing'`).
- HUD: texto simple dibujado con `fillText` en la franja superior del canvas — `"Score: N"` arriba a la izquierda y `"Lives: N"` arriba a la derecha — visible siempre, incluso debajo del overlay de game-over/victoria.
- Carga y dibujo de sprites usando el módulo existente `assets/spritesheet.js` (`loadSpritesheet`, `drawSprite`).

**Out of scope (for future specs):**

- Sistema de niveles y carga de layouts de bloques desde archivo.
- Power-ups.
- Pantalla de pausa.
- Efectos de sonido (`ball-bounce.mp3`, `break-sound.mp3`) — este spec no reproduce audio.
- Animaciones de explosión al romper bloques (`EXPLOSION_FRAMES`) — el bloque se destruye sin animar la explosión.
- Canvas responsive o escalado a distintos tamaños de pantalla.
- Persistencia de score/high-scores entre sesiones (no hay localStorage en este spec).

## Data model

```js
// js/game.js
const state = {
  status: 'playing', // 'playing' | 'gameover' | 'win'
  score: 0,
  lives: 3,
  paddle: { x: 319, y: 560, w: 162, h: 14, speed: 7 },
  ball: { x: 400, y: 300, w: 16, h: 16, vx: 4, vy: -4 },
  blocks: [
    /* { x, y, w, h, color, alive: true } */
  ],
};
```

Conventions:

- Origen de coordenadas: esquina superior izquierda.
- Velocidades en píxeles/frame (loop basado en `requestAnimationFrame`).
- Colores de bloque por fila, de arriba hacia abajo: `hotpink`, `red`, `yellow`, `green`, `cyan`, `magenta`.
- Grid de bloques: 10 columnas x 6 filas, bloques de 76x24px, gap de 4px entre bloques, margen superior de 60px, margen izquierdo de 10px.
- HUD dibujado dentro del margen superior de 60px, antes de los bloques, en cada frame (`"Score: N"` en `x=10`, `"Lives: N"` alineado a la derecha en `x=790`, ambos en `y=20`).
- Al perder una vida: solo `paddle` y `ball` vuelven a su posición/velocidad inicial. `state.blocks` y `state.score` NO se reinician.
- Al reiniciar desde un overlay (tecla `R`): se reinician `score`, `lives`, `blocks` (todos `alive: true`), `paddle`, `ball` y `status`.

## Implementation plan

1. Crear `index.html` con un `<canvas id="game" width="800" height="600">` y los `<script>` para `assets/spritesheet.js` y `js/game.js` (en ese orden). Prueba manual: abrir `index.html`, ver un canvas vacío sin errores en consola.
2. En `js/game.js`, definir `state` según el data model (`status`, `score`, `lives`, `paddle`, `ball`), llamar a `loadSpritesheet` y dentro del callback dibujar paddle y bola estáticos con `drawSprite`. Prueba manual: recargar, ver paddle y bola dibujados en sus posiciones iniciales.
3. Generar `state.blocks` con el grid 10x6 y dibujarlos con `drawSprite('block_<color>', ...)`. Prueba manual: ver las 6 filas de bloques de colores sobre el canvas.
4. Implementar el loop con `requestAnimationFrame`: mover la bola (`vx`, `vy`) y rebotarla contra las paredes izquierda/derecha/arriba. Prueba manual: la bola se mueve y rebota en los bordes, sin paddle ni bloques todavía.
5. Implementar el control del paddle: listeners de `keydown`/`keyup` para flechas y `mousemove` sobre el canvas para seguir la X del cursor; clamping dentro de los límites del canvas. Prueba manual: el paddle se mueve con ambos métodos sin salir del canvas.
6. Implementar la colisión bola-paddle con ángulo variable según el punto de impacto (relación entre la posición X de la bola dentro del paddle y el ángulo de salida de `vx`). Prueba manual: golpear la bola en distintos puntos del paddle y ver que el ángulo de salida cambia.
7. Implementar la colisión bola-bloque: detectar el bloque golpeado, marcarlo `alive: false`, invertir la componente de velocidad correspondiente, e incrementar `state.score`. Prueba manual: romper bloques y ver que desaparecen y que `state.score` sube.
8. Dibujar el HUD (`"Score: N"` / `"Lives: N"`) en la franja superior del canvas en cada frame. Prueba manual: ver ambos textos actualizarse al romper bloques.
9. Implementar la pérdida de vida (la bola supera el borde inferior del canvas): `state.lives--`, resetear solo `paddle` y `ball`; si `state.lives === 0`, poner `state.status = 'gameover'`. Prueba manual: dejar caer la bola 3 veces y ver que el HUD de vidas baja y al final cambia el estado.
10. Implementar la condición de victoria (todos los bloques con `alive: false`): poner `state.status = 'win'`. Prueba manual: romper todos los bloques y confirmar el cambio de estado.
11. Dibujar el overlay cuando `state.status !== 'playing'`: rectángulo semitransparente sobre el canvas, mensaje (`"GAME OVER"` / `"YOU WIN"`), score final, y texto `"Press R to restart"`; detener el movimiento de bola/paddle mientras el overlay está activo. Prueba manual: provocar game-over y victoria por separado y ver el overlay correspondiente.
12. Implementar el reinicio: listener de `keydown` para `R` que solo actúa si `state.status !== 'playing'`, reconstruye `blocks`, y resetea `score`, `lives`, `paddle`, `ball` y `status`. Prueba manual: tras un game-over o victoria, presionar `R` y ver que el juego vuelve exactamente al estado inicial.

## Acceptance criteria

- [ ] Abrir `index.html` en el navegador no produce errores en la consola.
- [ ] El paddle se mueve con las flechas izquierda/derecha y con el mouse, sin salir de los límites del canvas.
- [ ] La bola rebota correctamente contra las paredes izquierda, derecha y superior.
- [ ] La bola rebota contra el paddle con un ángulo de salida que varía según el punto de impacto.
- [ ] Al golpear un bloque, el bloque desaparece y el HUD de score se incrementa.
- [ ] El grid inicial tiene 6 filas x 10 columnas (60 bloques).
- [ ] Si la bola cae debajo del paddle, se resta una vida, el HUD de vidas se actualiza, y solo paddle/bola vuelven a su posición inicial (los bloques rotos siguen rotos).
- [ ] Al llegar a 0 vidas, aparece el overlay de "GAME OVER" con el score final y el juego deja de actualizar paddle/bola.
- [ ] Al romper los 60 bloques, aparece el overlay de "YOU WIN" con el score final y el juego deja de actualizar paddle/bola.
- [ ] Con cualquiera de los dos overlays visible, presionar `R` reinicia el juego por completo (score 0, 3 vidas, 60 bloques, paddle/bola en posición inicial).

## Decisions

- **Sí:** canvas fijo 800x600. Simplifica colisiones y el grid de bloques; no se requiere escalado.
- **No:** canvas responsive. Fuera de scope; se evaluaría en un spec aparte si se necesita.
- **Sí:** controles de teclado y mouse simultáneos. Pedido explícito, no agrega complejidad relevante.
- **Sí:** grid hardcodeado de 10x6 bloques con color por fila (`magenta` como 6ª fila). Mantiene el layout clásico de Arkanoid sin requerir un sistema de niveles.
- **No:** sistema de niveles / carga de layouts. Va en un spec futuro de "niveles".
- **Sí:** 3 vidas; al perder una solo se resetean paddle y bola, no los bloques ni el score. Preserva el progreso del jugador en vez de forzar a rehacer el nivel completo en cada vida.
- **Sí:** overlays de game-over/victoria con reinicio vía tecla `R`. Da un ciclo de juego completo sin necesitar recargar la página.
- **No:** pantalla de pausa. No fue pedida y no aporta al loop mínimo.
- **Sí:** ángulo de rebote variable en el paddle según punto de impacto. Es la sensación clásica de Arkanoid y no agrega mucha complejidad sobre una reflexión simple.
- **No:** integración de sonido (`ball-bounce.mp3`, `break-sound.mp3`) en este spec. Se deja para un spec de audio/feedback.
- **No:** animación de explosión (`EXPLOSION_FRAMES`) al romper bloques. El bloque simplemente desaparece; la animación queda para un spec de pulido visual.
- **No:** persistencia de high-scores entre sesiones. Va en un spec futuro si se necesita.
- **Sí:** un solo archivo `js/game.js` con todo el estado y lógica. El juego es chico; separar en módulos antes de tener el loop funcionando sería sobre-ingeniería.

## What is **not** in this spec

- Sistema de niveles y carga de layouts externos.
- Power-ups.
- Pantalla de pausa.
- Sonido (`ball-bounce.mp3`, `break-sound.mp3`).
- Animaciones de explosión de bloques.
- Canvas responsive/escalado.
- Persistencia de score/high-scores entre sesiones.

Each one of those, if it lands, goes in its own spec.
