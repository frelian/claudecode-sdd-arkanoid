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

function draw() {
  ctx.clearRect( 0, 0, canvas.width, canvas.height );
  drawSprite( ctx, 'paddle', state.paddle.x, state.paddle.y, state.paddle.w, state.paddle.h );
  drawSprite( ctx, 'ball', state.ball.x, state.ball.y, state.ball.w, state.ball.h );
  state.blocks.forEach( block => {
    if ( block.alive ) drawSprite( ctx, `block_${ block.color }`, block.x, block.y, block.w, block.h );
  } );
}

loadSpritesheet( draw );
