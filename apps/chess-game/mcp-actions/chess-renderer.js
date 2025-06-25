/**
 * Chess Board Renderer MCP Server
 * 专门负责象棋棋盘的高效SVG渲染
 * 让LLM专注于象棋逻辑，而不是SVG生成
 * 使用标准FEN格式描述棋盘状态
 */

/**
 * 棋子Unicode映射
 */
const PIECE_SYMBOLS = {
  // 白方棋子 (大写)
  'K': '♔', 'Q': '♕', 'R': '♖', 'B': '♗', 'N': '♘', 'P': '♙',
  // 黑方棋子 (小写) 
  'k': '♚', 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟'
};

/**
 * SVG模板 - 预生成棋盘框架，只需要填入棋子
 */
const SVG_TEMPLATE = {
  // 紧凑版本 450x450 (增加边距用于坐标)
  compact: {
    header: '<svg width="450" height="450" viewBox="0 0 450 450" xmlns="http://www.w3.org/2000/svg"><defs><style>.light{fill:#f0d9b5}.dark{fill:#b58863}.piece{font-family:Arial Unicode MS;font-size:32;text-anchor:middle;fill:#000}.coord{font-family:Arial;font-size:12;text-anchor:middle;fill:#333}.highlight{stroke:#ffff00;stroke-width:3;fill:none}</style></defs>',
    
    board: '<g id="board" transform="translate(25,25)">' +
      // 第1行 (a8-h8)
      '<rect class="light" x="0" y="0" width="50" height="50"/><rect class="dark" x="50" y="0" width="50" height="50"/><rect class="light" x="100" y="0" width="50" height="50"/><rect class="dark" x="150" y="0" width="50" height="50"/><rect class="light" x="200" y="0" width="50" height="50"/><rect class="dark" x="250" y="0" width="50" height="50"/><rect class="light" x="300" y="0" width="50" height="50"/><rect class="dark" x="350" y="0" width="50" height="50"/>' +
      // 第2行 (a7-h7)
      '<rect class="dark" x="0" y="50" width="50" height="50"/><rect class="light" x="50" y="50" width="50" height="50"/><rect class="dark" x="100" y="50" width="50" height="50"/><rect class="light" x="150" y="50" width="50" height="50"/><rect class="dark" x="200" y="50" width="50" height="50"/><rect class="light" x="250" y="50" width="50" height="50"/><rect class="dark" x="300" y="50" width="50" height="50"/><rect class="light" x="350" y="50" width="50" height="50"/>' +
      // 第3行 (a6-h6)
      '<rect class="light" x="0" y="100" width="50" height="50"/><rect class="dark" x="50" y="100" width="50" height="50"/><rect class="light" x="100" y="100" width="50" height="50"/><rect class="dark" x="150" y="100" width="50" height="50"/><rect class="light" x="200" y="100" width="50" height="50"/><rect class="dark" x="250" y="100" width="50" height="50"/><rect class="light" x="300" y="100" width="50" height="50"/><rect class="dark" x="350" y="100" width="50" height="50"/>' +
      // 第4行 (a5-h5)
      '<rect class="dark" x="0" y="150" width="50" height="50"/><rect class="light" x="50" y="150" width="50" height="50"/><rect class="dark" x="100" y="150" width="50" height="50"/><rect class="light" x="150" y="150" width="50" height="50"/><rect class="dark" x="200" y="150" width="50" height="50"/><rect class="light" x="250" y="150" width="50" height="50"/><rect class="dark" x="300" y="150" width="50" height="50"/><rect class="light" x="350" y="150" width="50" height="50"/>' +
      // 第5行 (a4-h4)
      '<rect class="light" x="0" y="200" width="50" height="50"/><rect class="dark" x="50" y="200" width="50" height="50"/><rect class="light" x="100" y="200" width="50" height="50"/><rect class="dark" x="150" y="200" width="50" height="50"/><rect class="light" x="200" y="200" width="50" height="50"/><rect class="dark" x="250" y="200" width="50" height="50"/><rect class="light" x="300" y="200" width="50" height="50"/><rect class="dark" x="350" y="200" width="50" height="50"/>' +
      // 第6行 (a3-h3)
      '<rect class="dark" x="0" y="250" width="50" height="50"/><rect class="light" x="50" y="250" width="50" height="50"/><rect class="dark" x="100" y="250" width="50" height="50"/><rect class="light" x="150" y="250" width="50" height="50"/><rect class="dark" x="200" y="250" width="50" height="50"/><rect class="light" x="250" y="250" width="50" height="50"/><rect class="dark" x="300" y="250" width="50" height="50"/><rect class="light" x="350" y="250" width="50" height="50"/>' +
      // 第7行 (a2-h2)
      '<rect class="light" x="0" y="300" width="50" height="50"/><rect class="dark" x="50" y="300" width="50" height="50"/><rect class="light" x="100" y="300" width="50" height="50"/><rect class="dark" x="150" y="300" width="50" height="50"/><rect class="light" x="200" y="300" width="50" height="50"/><rect class="dark" x="250" y="300" width="50" height="50"/><rect class="light" x="300" y="300" width="50" height="50"/><rect class="dark" x="350" y="300" width="50" height="50"/>' +
      // 第8行 (a1-h1)
      '<rect class="dark" x="0" y="350" width="50" height="50"/><rect class="light" x="50" y="350" width="50" height="50"/><rect class="dark" x="100" y="350" width="50" height="50"/><rect class="light" x="150" y="350" width="50" height="50"/><rect class="light" x="200" y="350" width="50" height="50"/><rect class="dark" x="250" y="350" width="50" height="50"/><rect class="light" x="300" y="350" width="50" height="50"/><rect class="dark" x="350" y="350" width="50" height="50"/>' +
      '</g>',
    
    coords: '<g id="coords">' +
      // 底部字母坐标 (a-h) - 在棋盘下方
      '<text class="coord" x="50" y="440">a</text><text class="coord" x="100" y="440">b</text><text class="coord" x="150" y="440">c</text><text class="coord" x="200" y="440">d</text><text class="coord" x="250" y="440">e</text><text class="coord" x="300" y="440">f</text><text class="coord" x="350" y="440">g</text><text class="coord" x="400" y="440">h</text>' +
      // 右侧数字坐标 (1-8) - 在棋盘右边
      '<text class="coord" x="435" y="390">1</text><text class="coord" x="435" y="340">2</text><text class="coord" x="435" y="290">3</text><text class="coord" x="435" y="240">4</text><text class="coord" x="435" y="190">5</text><text class="coord" x="435" y="140">6</text><text class="coord" x="435" y="90">7</text><text class="coord" x="435" y="40">8</text>' +
      // 左侧数字坐标 (8-1) - 在棋盘左边  
      '<text class="coord" x="15" y="40">8</text><text class="coord" x="15" y="90">7</text><text class="coord" x="15" y="140">6</text><text class="coord" x="15" y="190">5</text><text class="coord" x="15" y="240">4</text><text class="coord" x="15" y="290">3</text><text class="coord" x="15" y="340">2</text><text class="coord" x="15" y="390">1</text>' +
      // 顶部字母坐标 (a-h) - 在棋盘上方
      '<text class="coord" x="50" y="15">a</text><text class="coord" x="100" y="15">b</text><text class="coord" x="150" y="15">c</text><text class="coord" x="200" y="15">d</text><text class="coord" x="250" y="15">e</text><text class="coord" x="300" y="15">f</text><text class="coord" x="350" y="15">g</text><text class="coord" x="400" y="15">h</text>' +
      '</g>',
    
    footer: '</svg>'
  },
  
  // 极简版本 370x370 (增加边距)
  minimal: {
    header: '<svg width="370" height="370" viewBox="0 0 370 370" xmlns="http://www.w3.org/2000/svg"><defs><style>.l{fill:#f0d9b5}.d{fill:#b58863}.p{font:24px Arial Unicode MS;text-anchor:middle;fill:#000}.c{font:10px Arial;text-anchor:middle;fill:#333}.h{stroke:#ff0;stroke-width:2;fill:none}</style></defs>',
    
    board: '<g transform="translate(25,25)">' +
      '<rect class="l" x="0" y="0" width="40" height="40"/><rect class="d" x="40" y="0" width="40" height="40"/><rect class="l" x="80" y="0" width="40" height="40"/><rect class="d" x="120" y="0" width="40" height="40"/><rect class="l" x="160" y="0" width="40" height="40"/><rect class="d" x="200" y="0" width="40" height="40"/><rect class="l" x="240" y="0" width="40" height="40"/><rect class="d" x="280" y="0" width="40" height="40"/>' +
      '<rect class="d" x="0" y="40" width="40" height="40"/><rect class="l" x="40" y="40" width="40" height="40"/><rect class="d" x="80" y="40" width="40" height="40"/><rect class="l" x="120" y="40" width="40" height="40"/><rect class="d" x="160" y="40" width="40" height="40"/><rect class="l" x="200" y="40" width="40" height="40"/><rect class="d" x="240" y="40" width="40" height="40"/><rect class="l" x="280" y="40" width="40" height="40"/>' +
      '<rect class="l" x="0" y="80" width="40" height="40"/><rect class="d" x="40" y="80" width="40" height="40"/><rect class="l" x="80" y="80" width="40" height="40"/><rect class="d" x="120" y="80" width="40" height="40"/><rect class="l" x="160" y="80" width="40" height="40"/><rect class="d" x="200" y="80" width="40" height="40"/><rect class="l" x="240" y="80" width="40" height="40"/><rect class="d" x="280" y="80" width="40" height="40"/>' +
      '<rect class="d" x="0" y="120" width="40" height="40"/><rect class="l" x="40" y="120" width="40" height="40"/><rect class="d" x="80" y="120" width="40" height="40"/><rect class="l" x="120" y="120" width="40" height="40"/><rect class="d" x="160" y="120" width="40" height="40"/><rect class="l" x="200" y="120" width="40" height="40"/><rect class="d" x="240" y="120" width="40" height="40"/><rect class="l" x="280" y="120" width="40" height="40"/>' +
      '<rect class="l" x="0" y="160" width="40" height="40"/><rect class="d" x="40" y="160" width="40" height="40"/><rect class="l" x="80" y="160" width="40" height="40"/><rect class="d" x="120" y="160" width="40" height="40"/><rect class="l" x="160" y="160" width="40" height="40"/><rect class="d" x="200" y="160" width="40" height="40"/><rect class="l" x="240" y="160" width="40" height="40"/><rect class="d" x="280" y="160" width="40" height="40"/>' +
      '<rect class="d" x="0" y="200" width="40" height="40"/><rect class="l" x="40" y="200" width="40" height="40"/><rect class="d" x="80" y="200" width="40" height="40"/><rect class="l" x="120" y="200" width="40" height="40"/><rect class="d" x="160" y="200" width="40" height="40"/><rect class="l" x="200" y="200" width="40" height="40"/><rect class="d" x="240" y="200" width="40" height="40"/><rect class="l" x="280" y="200" width="40" height="40"/>' +
      '<rect class="l" x="0" y="240" width="40" height="40"/><rect class="d" x="40" y="240" width="40" height="40"/><rect class="l" x="80" y="240" width="40" height="40"/><rect class="d" x="120" y="240" width="40" height="40"/><rect class="l" x="160" y="240" width="40" height="40"/><rect class="d" x="200" y="240" width="40" height="40"/><rect class="l" x="240" y="240" width="40" height="40"/><rect class="d" x="280" y="240" width="40" height="40"/>' +
      '<rect class="d" x="0" y="280" width="40" height="40"/><rect class="l" x="40" y="280" width="40" height="40"/><rect class="d" x="80" y="280" width="40" height="40"/><rect class="l" x="120" y="280" width="40" height="40"/><rect class="d" x="160" y="280" width="40" height="40"/><rect class="l" x="200" y="280" width="40" height="40"/><rect class="d" x="240" y="280" width="40" height="40"/><rect class="l" x="280" y="280" width="40" height="40"/>' +
      '</g>',
    
    coords: '<g>' +
      // 底部字母坐标
      '<text class="c" x="45" y="360">a</text><text class="c" x="85" y="360">b</text><text class="c" x="125" y="360">c</text><text class="c" x="165" y="360">d</text><text class="c" x="205" y="360">e</text><text class="c" x="245" y="360">f</text><text class="c" x="285" y="360">g</text><text class="c" x="325" y="360">h</text>' +
      // 右侧数字坐标
      '<text class="c" x="355" y="310">1</text><text class="c" x="355" y="270">2</text><text class="c" x="355" y="230">3</text><text class="c" x="355" y="190">4</text><text class="c" x="355" y="150">5</text><text class="c" x="355" y="110">6</text><text class="c" x="355" y="70">7</text><text class="c" x="355" y="30">8</text>' +
      '</g>',
    
    footer: '</svg>'
  }
};

/**
 * 坐标转换：棋盘记法转数组索引
 * @param {string} square - 棋盘坐标 (如 "e4")
 * @returns {[number, number]} [row, col] 数组索引
 */
function squareToIndex(square) {
  const file = square.charCodeAt(0) - 97; // a=0, b=1, ..., h=7
  const rank = 8 - parseInt(square[1]);   // 8=0, 7=1, ..., 1=7
  return [rank, file];
}

/**
 * 数组索引转SVG坐标
 * @param {number} row - 行索引 (0-7)
 * @param {number} col - 列索引 (0-7)
 * @param {string} size - 尺寸类型 ('compact' | 'minimal')
 * @returns {[number, number]} [x, y] SVG坐标
 */
function indexToSVGCoords(row, col, size = 'compact') {
  if (size === 'minimal') {
    // 加上25px偏移量（transform translate）
    return [col * 40 + 20 + 25, row * 40 + 28 + 25];
  } else {
    // 加上25px偏移量（transform translate）
    return [col * 50 + 25 + 25, row * 50 + 35 + 25];
  }
}

/**
 * 解析FEN棋盘部分为8x8数组
 * @param {string} fenBoard - FEN棋盘部分 (如 "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR")
 * @returns {Array<Array<string>>} 8x8棋盘数组
 */
function parseFENBoard(fenBoard) {
  const board = [];
  const ranks = fenBoard.split('/');
  
  for (let i = 0; i < 8; i++) {
    const row = [];
    const rankString = ranks[i] || '8';
    
    for (let j = 0; j < rankString.length; j++) {
      const char = rankString[j];
      
      if (/\d/.test(char)) {
        // 数字表示空格数量
        const emptySquares = parseInt(char);
        for (let k = 0; k < emptySquares; k++) {
          row.push(null);
        }
      } else {
        // 棋子字符
        row.push(char);
      }
    }
    
    // 确保每行有8个位置
    while (row.length < 8) {
      row.push(null);
    }
    
    board.push(row);
  }
  
  return board;
}

/**
 * 解析棋盘状态为8x8数组 (兼容多种格式)
 * @param {string|Array<string>} boardState - FEN棋盘部分、64字符棋盘状态或8行字符串数组
 * @returns {Array<Array<string>>} 8x8棋盘数组
 */
function parseBoardString(boardState) {
  if (typeof boardState === 'string') {
    if (boardState.includes('/')) {
      // FEN格式
      return parseFENBoard(boardState);
    } else if (boardState.length === 64) {
      // 旧格式：64字符字符串（向后兼容）
      const board = [];
      for (let i = 0; i < 8; i++) {
        const row = [];
        for (let j = 0; j < 8; j++) {
          const char = boardState[i * 8 + j];
          row.push(char === '.' ? null : char);
        }
        board.push(row);
      }
      return board;
    }
  } else if (Array.isArray(boardState)) {
    // 旧格式：8行字符串数组（向后兼容）
    const board = [];
    for (let i = 0; i < 8; i++) {
      const row = [];
      const rowString = boardState[i] || '........';
      for (let j = 0; j < 8; j++) {
        const char = rowString[j] || '.';
        row.push(char === '.' ? null : char);
      }
      board.push(row);
    }
    return board;
  }
  
  throw new Error('Invalid board state format');
}

/**
 * 生成棋子SVG元素
 * @param {Array<Array<string>>} board - 8x8棋盘数组
 * @param {string} size - 尺寸类型
 * @returns {string} 棋子SVG字符串
 */
function generatePieces(board, size = 'compact') {
  const pieces = [];
  
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece) {
        const symbol = PIECE_SYMBOLS[piece];
        const [x, y] = indexToSVGCoords(row, col, size);
        const className = size === 'minimal' ? 'p' : 'piece';
        pieces.push(`<text class="${className}" x="${x}" y="${y}">${symbol}</text>`);
      }
    }
  }
  
  return `<g id="pieces">${pieces.join('')}</g>`;
}

/**
 * 生成走法高亮
 * @param {string} lastMove - 最后走法 (如 "e2e4")
 * @param {string} size - 尺寸类型
 * @returns {string} 高亮SVG字符串
 */
function generateHighlight(lastMove, size = 'compact') {
  if (!lastMove || lastMove.length < 4) return '';
  
  const from = lastMove.substring(0, 2);
  const to = lastMove.substring(2, 4);
  
  const [fromRow, fromCol] = squareToIndex(from);
  const [toRow, toCol] = squareToIndex(to);
  
  const squareSize = size === 'minimal' ? 40 : 50;
  const offset = 25; // transform translate偏移量
  const className = size === 'minimal' ? 'h' : 'highlight';
  
  return `<g id="highlight">` +
    `<rect class="${className}" x="${fromCol * squareSize + offset}" y="${fromRow * squareSize + offset}" width="${squareSize}" height="${squareSize}"/>` +
    `<rect class="${className}" x="${toCol * squareSize + offset}" y="${toRow * squareSize + offset}" width="${squareSize}" height="${squareSize}"/>` +
    `</g>`;
}

/**
 * 渲染完整的象棋棋盘SVG
 * @param {Object} params - 渲染参数
 * @param {string} params.boardState - FEN棋盘部分或兼容格式
 * @param {string} [params.lastMove] - 最后走法
 * @param {string} [params.size='compact'] - 尺寸类型 ('compact' | 'minimal')
 * @param {boolean} [params.showCoords=true] - 是否显示坐标
 * @returns {string} 完整的SVG字符串
 */
function renderChessBoard(params) {
  const {
    boardState,
    lastMove = '',
    size = 'compact',
    showCoords = true
  } = params;
  
  // 验证输入
  if (!boardState) {
    throw new Error('Invalid board state: boardState is required');
  }
  
  // 解析棋盘
  const board = parseBoardString(boardState);
  const template = SVG_TEMPLATE[size];
  
  // 生成组件
  const pieces = generatePieces(board, size);
  const highlight = generateHighlight(lastMove, size);
  const coords = showCoords ? template.coords : '';
  
  // 组装SVG
  return template.header + 
         template.board + 
         pieces + 
         highlight + 
         coords + 
         template.footer;
}

/**
 * 获取初始棋盘状态 (FEN格式)
 * @returns {string} 初始FEN棋盘部分
 */
function getInitialBoardState() {
  return 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR';
}

/**
 * 验证走法格式
 * @param {string} move - 走法字符串
 * @returns {boolean} 是否为有效格式
 */
function isValidMoveFormat(move) {
  return /^[a-h][1-8][a-h][1-8]$/.test(move);
}

/**
 * MCP Action: 渲染象棋棋盘
 * 这是主要的MCP接口，供LLM调用
 */
async function renderBoard(params) {
  try {
    const {
      boardState,
      lastMove,
      size = 'compact',
      showCoords = true
    } = params;
    
    console.log('🎨 Chess Renderer: 开始渲染棋盘...');
    const boardStatePreview = typeof boardState === 'string'
      ? (boardState.includes('/') ? boardState : `${boardState?.substring(0, 16)}...`)
      : `[${boardState?.[0]}, ${boardState?.[1]}, ...]`;
    console.log(`📋 参数: boardState=${boardStatePreview}, lastMove=${lastMove}, size=${size}`);
    
    const startTime = Date.now();
    
    // 渲染SVG
    const svg = renderChessBoard({
      boardState,
      lastMove,
      size,
      showCoords
    });
    
    const renderTime = Date.now() - startTime;
    console.log(`⚡ 渲染完成，耗时: ${renderTime}ms, SVG长度: ${svg.length} 字符`);
    
    return {
      success: true,
      svg: svg,
      renderTime: renderTime,
      svgLength: svg.length,
      message: `棋盘渲染完成 (${renderTime}ms)`
    };
    
  } catch (error) {
    console.error('❌ Chess Renderer 错误:', error);
    return {
      success: false,
      error: error.message,
      svg: null
    };
  }
}

/**
 * MCP Action: 获取初始棋盘
 */
async function getInitialBoard(params = {}) {
  const { size = 'compact' } = params;
  
  return renderBoard({
    boardState: getInitialBoardState(),
    lastMove: '',
    size,
    showCoords: true
  });
}

/**
 * MCP Action: 性能测试
 */
async function performanceTest(params = {}) {
  const { iterations = 100 } = params;
  const boardState = getInitialBoardState();
  
  console.log(`🏃‍♂️ 开始性能测试: ${iterations} 次渲染...`);
  
  const startTime = Date.now();
  
  for (let i = 0; i < iterations; i++) {
    renderChessBoard({
      boardState,
      lastMove: 'e2e4',
      size: 'minimal'
    });
  }
  
  const totalTime = Date.now() - startTime;
  const avgTime = totalTime / iterations;
  
  console.log(`📊 性能测试结果: ${iterations} 次渲染总耗时 ${totalTime}ms, 平均 ${avgTime.toFixed(2)}ms/次`);
  
  return {
    success: true,
    iterations,
    totalTime,
    averageTime: avgTime,
    renderingsPerSecond: Math.round(1000 / avgTime)
  };
}

// 导出MCP Actions
module.exports = {
  renderBoard,
  getInitialBoard,
  performanceTest
}; 