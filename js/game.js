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

const INITIAL_PADDLE = { x: 319, y: 560, w: 162, h: 14, speed: 7 };
const INITIAL_BALL = { x: 400, y: 300, w: 16, h: 16, vx: 4, vy: -4 };

const state = {
  status: 'playing', // 'playing' | 'gameover' | 'win'
  score: 0,
  lives: 3,
  paddle: { ...INITIAL_PADDLE },
  ball: { ...INITIAL_BALL },
  blocks: [],
};

function resetPaddleAndBall() {
  state.paddle = { ...INITIAL_PADDLE };
  state.ball = { ...INITIAL_BALL };
}

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

function restartGame() {
  if ( state.status === 'playing' ) return;

  state.score = 0;
  state.lives = 3;
  state.blocks = createBlocks();
  resetPaddleAndBall();
  state.status = 'playing';
}

const keys = { left: false, right: false };

window.addEventListener( 'keydown', e => {
  if ( e.key === 'ArrowLeft' ) keys.left = true;
  if ( e.key === 'ArrowRight' ) keys.right = true;

  if ( e.key === 'r' || e.key === 'R' ) restartGame();
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

function checkWinCondition() {
  if ( state.blocks.every( block => !block.alive ) ) {
    state.status = 'win';
  }
}

function handleBallOutOfBounds() {
  if ( state.ball.y <= canvas.height ) return;

  state.lives--;
  resetPaddleAndBall();

  if ( state.lives <= 0 ) {
    state.status = 'gameover';
  }
}

function update() {
  if ( state.status !== 'playing' ) return;

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
  checkWinCondition();
  handleBallOutOfBounds();
}

function drawHUD() {
  ctx.fillStyle = 'white';
  ctx.font = '16px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText( `Score: ${ state.score }`, 10, 20 );
  ctx.textAlign = 'right';
  ctx.fillText( `Lives: ${ state.lives }`, 790, 20 );
}

function drawOverlay() {
  if ( state.status === 'playing' ) return;

  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect( 0, 0, canvas.width, canvas.height );

  const message = state.status === 'win' ? 'YOU WIN' : 'GAME OVER';

  ctx.fillStyle = 'white';
  ctx.textAlign = 'center';
  ctx.font = '48px sans-serif';
  ctx.fillText( message, canvas.width / 2, canvas.height / 2 - 40 );

  ctx.font = '24px sans-serif';
  ctx.fillText( `Score: ${ state.score }`, canvas.width / 2, canvas.height / 2 + 10 );
  ctx.fillText( 'Press R to restart', canvas.width / 2, canvas.height / 2 + 50 );
}

function render() {
  ctx.clearRect( 0, 0, canvas.width, canvas.height );
  drawHUD();
  drawSprite( ctx, 'paddle', state.paddle.x, state.paddle.y, state.paddle.w, state.paddle.h );
  drawSprite( ctx, 'ball', state.ball.x, state.ball.y, state.ball.w, state.ball.h );
  state.blocks.forEach( block => {
    if ( block.alive ) drawSprite( ctx, `block_${ block.color }`, block.x, block.y, block.w, block.h );
  } );
  drawOverlay();
}

function loop() {
  update();
  render();
  requestAnimationFrame( loop );
}

loadSpritesheet( loop );
