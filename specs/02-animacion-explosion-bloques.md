# SPEC 02 — Animación de explosión al destruir bloques

> **Status:** Implemented
> **Depends on:** SPEC 01
> **Date:** 2026-10-29
> **Objective:** Reproducir la animación de explosión de 4 frames (ya provista en `assets/spritesheet.js`) en la posición de cada bloque destruido, con timing basado en tiempo real.

## Scope

**In:**

- Animación de explosión de 4 frames al destruir un bloque, usando `EXPLOSION_FRAMES[color]` y la función `drawFrame` existentes en `assets/spritesheet.js`.
- Timing de la animación basado en `performance.now()`. `EXPLOSION_DURATION` (150, en `assets/spritesheet.js`) se interpreta como la duración total de la animación completa, repartida equitativamente entre los 4 frames (~37.5ms cada uno).
- Soporte para múltiples explosiones simultáneas e independientes (cada una con su propio instante de inicio).
- Limpieza de cualquier explosión en curso al reiniciar el juego con la tecla `R`.

**Out of scope (for future specs):**

- Sonido de rotura de bloque (`assets/sounds/break-sound.mp3`). Ya quedó fuera de alcance en SPEC 01; se deja para un futuro spec de audio.
- Partículas o efectos visuales adicionales más allá de los 4 frames ya provistos en el spritesheet.
- Animaciones para otros eventos del juego (pérdida de vida, transición a game-over/win, etc.) — este spec cubre únicamente la rotura de bloques.
- Cambios a la mecánica de colisión bola-bloque existente (detección de impacto, rebote, suma de score). Esta mecánica se reutiliza igual que en SPEC 01.

## Data model

```js
// js/game.js
const state = {
  // ... status, score, lives, paddle, ball, blocks (sin cambios, ver SPEC 01)
  explosions: [
    /* { x, y, w, h, color, startTime } */
  ],
};
```

Conventions:

- Una entrada de `state.explosions` se crea en el momento exacto en que un bloque pasa a `alive: false`, copiando su `x`, `y`, `w`, `h` y `color`.
- `startTime` se guarda con `performance.now()` en el instante de creación.
- El frame actual de cada explosión se calcula como `Math.floor((performance.now() - startTime) / (EXPLOSION_DURATION / 4))`.
- Una entrada se elimina de `state.explosions` cuando su frame calculado es `>= 4` (animación completa).
- No hay límite al número de entradas simultáneas en `state.explosions`.

## Implementation plan

1. Agregar `explosions: []` al estado inicial (`state`) y vaciar el array dentro de `restartGame()`. Prueba manual: recargar la página y reiniciar el juego con `R` sin errores en consola.
2. Crear `spawnExplosion(block)` que agrega a `state.explosions` una entrada `{ x: block.x, y: block.y, w: block.w, h: block.h, color: block.color, startTime: performance.now() }`. Llamarla desde `handleBlockCollision`, justo donde se pone `block.alive = false`. Prueba manual: romper un bloque e inspeccionar en consola que `state.explosions.length` pasa a 1.
3. Crear `updateExplosions()` que recorre `state.explosions`, calcula el frame de cada entrada según `EXPLOSION_DURATION`, y filtra (elimina) las que ya completaron sus 4 frames. Llamarla desde `update()`, después de `handleBlockCollision()`. Prueba manual: romper un bloque y confirmar que `state.explosions` vuelve a quedar vacío pasados ~150ms.
4. Crear `drawExplosions()` que recorre `state.explosions` y dibuja el frame correspondiente de cada una con `drawFrame(ctx, EXPLOSION_FRAMES[color][frameIndex], x, y, w, h)`. Llamarla desde `render()`, después de dibujar los bloques. Prueba manual: romper un bloque y ver la animación de 4 frames reproducirse en su posición antes de desaparecer.

## Acceptance criteria

- [x] Al romper un bloque, en su posición se reproduce la animación de explosión de 4 frames del color correspondiente (`EXPLOSION_FRAMES[color]`).
- [x] La animación dura en total ~150ms (`EXPLOSION_DURATION`) y luego desaparece sin dejar rastro visual.
- [x] Romper varios bloques en sucesión rápida muestra varias explosiones simultáneas, cada una avanzando de forma independiente según su propio `startTime`.
- [x] El score, las vidas y el resto de la mecánica de colisión (bola/paddle/bloques) funcionan igual que antes de este spec.
- [x] Reiniciar el juego con la tecla `R` limpia cualquier explosión en curso (`state.explosions` queda vacío).
- [x] No hay errores en la consola del navegador durante la rotura de bloques ni durante el reinicio.

## Decisions

- **Sí:** usar `performance.now()` para el timing de la animación. Es independiente del framerate y más preciso que contar frames del loop.
- **No:** usar conteo de frames del loop (`requestAnimationFrame`) para el timing. Se priorizó precisión temporal sobre la consistencia estilística con el resto del código (que usa píxeles/frame sin delta time).
- **Sí:** `EXPLOSION_DURATION` (150) es la duración total de la animación completa de 4 frames, no la duración de cada frame individual. Da una explosión rápida y seca, acorde al Arkanoid clásico.
- **No:** incluir el sonido de rotura (`break-sound.mp3`) en este spec. Ya estaba fuera de alcance en SPEC 01; se deja para un spec de audio futuro.
- **Sí:** `state.explosions` como array de entradas independientes entre sí, permitiendo múltiples explosiones simultáneas sin coordinación.
- **No:** detener el movimiento de la bola o el paddle mientras una explosión está en curso. La explosión es puramente visual y no debe afectar el gameplay.

## Risks

| Risk                                                                          | Mitigation                                                                                                   |
| ------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------- |
| Si el juego pasa a `'gameover'`/`'win'` con una explosión en curso, `update()` deja de ejecutarse y la animación queda congelada en su último frame visible. | Comportamiento aceptado: es consistente con que la bola y el paddle también se congelan al mostrarse el overlay. |

## What is **not** in this spec

- Sonido de rotura de bloque (`break-sound.mp3`).
- Partículas o efectos visuales adicionales a los 4 frames ya provistos.
- Animaciones para otros eventos del juego (vida perdida, game-over, win).
- Cambios a la mecánica de colisión bola-bloque existente.

Each one of those, if it lands, goes in its own spec.
