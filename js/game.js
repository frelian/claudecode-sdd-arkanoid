const canvas = document.getElementById( 'game' );
const ctx = canvas.getContext( '2d' );

const BLOCK_ROW_COLORS = [ 'hotpink', 'red', 'yellow', 'green', 'cyan', 'magenta' ];
const BLOCK_COLS = 10;
const BLOCK_ROWS = 6;
const BLOCK_W = 76;
const BLOCK_H = 24;
const BLOCK_GAP = 4;
const BLOCK_TOP_MARGIN = 60;
const BLOCK_LEFT_MARGIN = 10;

const state = {
  status: 'playing', // 'playing' | 'gameover' | 'win'
  score: 0,
  lives: 3,
  paddle: { x: 319, y: 560, w: 162, h: 14, speed: 7 },
  ball: { x: 400, y: 300, w: 16, h: 16, vx: 4, vy: -4 },
  blocks: [],
};

function createBlocks() {
  const blocks = [];
  for ( let row = 0; row < BLOCK_ROWS; row++ ) {
    for ( let col = 0; col < BLOCK_COLS; col++ ) {
      blocks.push( {
        x: BLOCK_LEFT_MARGIN + col * ( BLOCK_W + BLOCK_GAP ),
        y: BLOCK_TOP_MARGIN + row * ( BLOCK_H + BLOCK_GAP ),
        w: BLOCK_W,
        h: BLOCK_H,
        color: BLOCK_ROW_COLORS[ row ],
        alive: true,
      } );
    }
  }
  return blocks;
}

state.blocks = createBlocks();

const keys = { left: false, right: false };

window.addEventListener( 'keydown', e => {
  if ( e.key === 'ArrowLeft' ) keys.left = true;
  if ( e.key === 'ArrowRight' ) keys.right = true;
} );

window.addEventListener( 'keyup', e => {
  if ( e.key === 'ArrowLeft' ) keys.left = false;
  if ( e.key === 'ArrowRight' ) keys.right = false;
} );

canvas.addEventListener( 'mousemove', e => {
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  state.paddle.x = mouseX - state.paddle.w / 2;
  clampPaddle();
} );

function clampPaddle() {
  state.paddle.x = Math.max( 0, Math.min( canvas.width - state.paddle.w, state.paddle.x ) );
}

const PADDLE_MAX_BOUNCE_VX = 6;

function handlePaddleCollision() {
  const paddle = state.paddle;
  const ball = state.ball;

  const collides = ball.vy > 0 &&
    ball.x + ball.w >= paddle.x &&
    ball.x <= paddle.x + paddle.w &&
    ball.y + ball.h >= paddle.y &&
    ball.y + ball.h <= paddle.y + paddle.h;

  if ( !collides ) return;

  const ballCenterX = ball.x + ball.w / 2;
  const paddleCenterX = paddle.x + paddle.w / 2;
  const relativeIntersectX = ( ballCenterX - paddleCenterX ) / ( paddle.w / 2 );

  ball.vx = relativeIntersectX * PADDLE_MAX_BOUNCE_VX;
  ball.vy = -Math.abs( ball.vy );
  ball.y = paddle.y - ball.h;
}

const SCORE_PER_BLOCK = 10;

function handleBlockCollision() {
  const ball = state.ball;

  for ( const block of state.blocks ) {
    if ( !block.alive ) continue;

    const overlapX = Math.min( ball.x + ball.w, block.x + block.w ) - Math.max( ball.x, block.x );
    const overlapY = Math.min( ball.y + ball.h, block.y + block.h ) - Math.max( ball.y, block.y );

    if ( overlapX <= 0 || overlapY <= 0 ) continue;

    block.alive = false;
    state.score += SCORE_PER_BLOCK;

    if ( overlapX < overlapY ) {
      ball.vx *= -1;
    } else {
      ball.vy *= -1;
    }
    break;
  }
}

function update() {
  const paddle = state.paddle;
  const ball = state.ball;

  if ( keys.left ) paddle.x -= paddle.speed;
  if ( keys.right ) paddle.x += paddle.speed;
  clampPaddle();

  ball.x += ball.vx;
  ball.y += ball.vy;

  if ( ball.x <= 0 || ball.x + ball.w >= canvas.width ) ball.vx *= -1;
  if ( ball.y <= 0 ) ball.vy *= -1;

  handlePaddleCollision();
  handleBlockCollision();
}

function render() {
  ctx.clearRect( 0, 0, canvas.width, canvas.height );
  drawSprite( ctx, 'paddle', state.paddle.x, state.paddle.y, state.paddle.w, state.paddle.h );
  drawSprite( ctx, 'ball', state.ball.x, state.ball.y, state.ball.w, state.ball.h );
  state.blocks.forEach( block => {
    if ( block.alive ) drawSprite( ctx, `block_${ block.color }`, block.x, block.y, block.w, block.h );
  } );
}

function loop() {
  update();
  render();
  requestAnimationFrame( loop );
}

loadSpritesheet( loop );
