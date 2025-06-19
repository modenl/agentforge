module.exports = {
  pluginName: 'Chess Game',
  version: '1.0.0',
  description: 'International Chess Game between AI and Human player',

  // 游戏配置
  gameConfig: {
    // 初始棋盘状态 (标准国际象棋布局)
    initialBoard: [
      ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'], // 黑方
      ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
      ['.', '.', '.', '.', '.', '.', '.', '.'],
      ['.', '.', '.', '.', '.', '.', '.', '.'],
      ['.', '.', '.', '.', '.', '.', '.', '.'],
      ['.', '.', '.', '.', '.', '.', '.', '.'],
      ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'], // 白方
      ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R']
    ],

    // 棋子映射
    pieceMap: {
      // 白方 (大写)
      'K': '♔', 'Q': '♕', 'R': '♖', 'B': '♗', 'N': '♘', 'P': '♙',
      // 黑方 (小写)
      'k': '♚', 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟',
      // 空格
      '.': ' '
    },

    // 棋子颜色
    pieceColors: {
      // 白方
      'K': 'white', 'Q': 'white', 'R': 'white', 'B': 'white', 'N': 'white', 'P': 'white',
      // 黑方
      'k': 'black', 'q': 'black', 'r': 'black', 'b': 'black', 'n': 'black', 'p': 'black'
    }
  },

  // UI配置
  uiConfig: {
    boardSize: 600,
    squareSize: 75,
    borderWidth: 2,
    lightSquareColor: '#f0d9b5',
    darkSquareColor: '#b58863',
    borderColor: '#8B4513',
    highlightColor: '#ffff99',
    fontSize: 50,
    fontFamily: 'Arial Unicode MS, serif'
  },

  // AI配置
  aiConfig: {
    aiColor: 'black',  // AI执黑棋
    playerColor: 'white', // 玩家执白棋
    difficulty: 'medium',
    thinkingTime: 3000 // AI思考时间 (毫秒)
  },

  // 游戏规则
  gameRules: {
    enableCastling: true,
    enableEnPassant: true,
    enablePromotion: true,
    autoPromoteToQueen: false,
    checkForStalemate: true,
    checkForCheckmate: true
  }
};
