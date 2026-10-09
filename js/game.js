const canvas = document.getElementById( 'game' );
const ctx = canvas.getContext( '2d' );

const state = {
  status: 'playing', // 'playing' | 'gameover' | 'win'
  score: 0,
  lives: 3,
  paddle: { x: 319, y: 560, w: 162, h: 14, speed: 7 },
  ball: { x: 400, y: 300, w: 16, h: 16, vx: 4, vy: -4 },
  blocks: [],
};

function draw() {
  ctx.clearRect( 0, 0, canvas.width, canvas.height );
  drawSprite( ctx, 'paddle', state.paddle.x, state.paddle.y, state.paddle.w, state.paddle.h );
  drawSprite( ctx, 'ball', state.ball.x, state.ball.y, state.ball.w, state.ball.h );
}

loadSpritesheet( draw );
