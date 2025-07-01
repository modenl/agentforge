<script>
  import { onMount, onDestroy } from 'svelte';
  import { writable } from 'svelte/store';
  
  export let serverName = '';
  export let gameState = null;
  export let wsUrl = '';
  
  // Game state
  let board = null;
  let game = null;
  let wsConnection = null;
  let isConnected = false;
  
  // UI state
  let selectedSquare = null;
  let possibleMoves = [];
  let moveHistory = [];
  let currentPlayer = 'white';
  let gameStatus = 'waiting';
  
  // Chess piece Unicode symbols
  const pieceSymbols = {
    'K': '♔', 'Q': '♕', 'R': '♖', 'B': '♗', 'N': '♘', 'P': '♙',
    'k': '♚', 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟'
  };
  
  onMount(() => {
    initializeBoard();
    if (wsUrl) {
      connectWebSocket();
    }
  });
  
  onDestroy(() => {
    if (wsConnection) {
      wsConnection.close();
    }
  });
  
  function initializeBoard() {
    // Initialize 8x8 board
    board = Array(8).fill(null).map(() => Array(8).fill(null));
    
    // Set up initial position if provided
    if (gameState && gameState.fen) {
      loadFEN(gameState.fen);
    } else {
      setupInitialPosition();
    }
  }
  
  function setupInitialPosition() {
    // Standard chess starting position
    const initialPosition = [
      ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
      ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
      ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R']
    ];
    
    board = initialPosition;
  }
  
  function loadFEN(fen) {
    // Parse FEN string and set up board
    const parts = fen.split(' ');
    const position = parts[0];
    const rows = position.split('/');
    
    board = rows.map(row => {
      const squares = [];
      for (let char of row) {
        if (isNaN(char)) {
          squares.push(char);
        } else {
          for (let i = 0; i < parseInt(char); i++) {
            squares.push(null);
          }
        }
      }
      return squares;
    });
    
    currentPlayer = parts[1] === 'w' ? 'white' : 'black';
  }
  
  function connectWebSocket() {
    wsConnection = new WebSocket(wsUrl);
    
    wsConnection.onopen = () => {
      console.log('Connected to chess server');
      isConnected = true;
      
      // Join session
      wsConnection.send(JSON.stringify({
        type: 'join_session',
        clientId: generateClientId(),
        clientName: 'AgentForge User'
      }));
    };
    
    wsConnection.onmessage = (event) => {
      const message = JSON.parse(event.data);
      handleServerMessage(message);
    };
    
    wsConnection.onclose = () => {
      console.log('Disconnected from chess server');
      isConnected = false;
    };
    
    wsConnection.onerror = (error) => {
      console.error('WebSocket error:', error);
      isConnected = false;
    };
  }
  
  function handleServerMessage(message) {
    switch (message.type) {
      case 'session_state':
        if (message.gameState) {
          loadFEN(message.gameState.fen);
          moveHistory = message.gameState.moves || [];
          gameStatus = message.gameState.status || 'playing';
        }
        break;
        
      case 'move':
        applyMove(message.move);
        break;
        
      case 'game_over':
        gameStatus = message.result;
        break;
    }
  }
  
  function handleSquareClick(row, col) {
    if (gameStatus !== 'playing') return;
    
    const piece = board[row][col];
    
    if (selectedSquare) {
      // Try to make a move
      const from = squareToAlgebraic(selectedSquare.row, selectedSquare.col);
      const to = squareToAlgebraic(row, col);
      const move = from + to;
      
      if (possibleMoves.includes(to)) {
        makeMove(move);
      }
      
      // Clear selection
      selectedSquare = null;
      possibleMoves = [];
    } else if (piece && isPlayerPiece(piece)) {
      // Select piece
      selectedSquare = { row, col };
      // TODO: Calculate possible moves
      possibleMoves = [];
    }
  }
  
  function makeMove(move) {
    if (wsConnection && isConnected) {
      wsConnection.send(JSON.stringify({
        type: 'move',
        move: move
      }));
    }
  }
  
  function applyMove(move) {
    // Apply move to board
    // This is simplified - real implementation would need full move validation
    const from = algebraicToSquare(move.substring(0, 2));
    const to = algebraicToSquare(move.substring(2, 4));
    
    if (from && to) {
      board[to.row][to.col] = board[from.row][from.col];
      board[from.row][from.col] = null;
      board = board; // Trigger reactivity
      
      // Switch player
      currentPlayer = currentPlayer === 'white' ? 'black' : 'white';
    }
  }
  
  function isPlayerPiece(piece) {
    return currentPlayer === 'white' ? piece === piece.toUpperCase() : piece === piece.toLowerCase();
  }
  
  function squareToAlgebraic(row, col) {
    return String.fromCharCode(97 + col) + (8 - row);
  }
  
  function algebraicToSquare(notation) {
    if (notation.length < 2) return null;
    const col = notation.charCodeAt(0) - 97;
    const row = 8 - parseInt(notation[1]);
    return { row, col };
  }
  
  function generateClientId() {
    return 'client_' + Math.random().toString(36).substr(2, 9);
  }
  
  function getSquareColor(row, col) {
    return (row + col) % 2 === 0 ? 'light' : 'dark';
  }
  
  function isSelectedSquare(row, col) {
    return selectedSquare && selectedSquare.row === row && selectedSquare.col === col;
  }
  
  function isPossibleMove(row, col) {
    const square = squareToAlgebraic(row, col);
    return possibleMoves.includes(square);
  }
</script>

<div class="chess-container">
  <div class="chess-header">
    <h3>{serverName || 'Chess Game'}</h3>
    <div class="game-info">
      <span class="status" class:connected={isConnected}>
        {isConnected ? '● Connected' : '○ Disconnected'}
      </span>
      <span class="turn">Turn: {currentPlayer}</span>
      <span class="game-status">{gameStatus}</span>
    </div>
  </div>
  
  <div class="chess-board">
    {#each board as row, rowIndex}
      <div class="board-row">
        {#each row as piece, colIndex}
          <div 
            class="square {getSquareColor(rowIndex, colIndex)}"
            class:selected={isSelectedSquare(rowIndex, colIndex)}
            class:possible-move={isPossibleMove(rowIndex, colIndex)}
            on:click={() => handleSquareClick(rowIndex, colIndex)}
          >
            {#if piece}
              <span class="piece">{pieceSymbols[piece] || piece}</span>
            {/if}
          </div>
        {/each}
      </div>
    {/each}
  </div>
  
  <div class="move-history">
    <h4>Move History</h4>
    <div class="moves">
      {#each moveHistory as move, index}
        <span class="move">
          {Math.floor(index / 2) + 1}.
          {index % 2 === 0 ? '' : '..'}
          {move.san || move.move}
        </span>
      {/each}
    </div>
  </div>
</div>

<style>
  .chess-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: var(--bg-primary);
    padding: 1rem;
  }
  
  .chess-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid var(--border-color);
  }
  
  .chess-header h3 {
    margin: 0;
    color: var(--text-primary);
  }
  
  .game-info {
    display: flex;
    gap: 1rem;
    font-size: 0.9rem;
  }
  
  .status {
    color: var(--text-secondary);
  }
  
  .status.connected {
    color: var(--success);
  }
  
  .turn {
    color: var(--text-primary);
    font-weight: 600;
  }
  
  .game-status {
    color: var(--text-secondary);
  }
  
  .chess-board {
    display: inline-block;
    border: 2px solid var(--border-color);
    margin: 0 auto;
  }
  
  .board-row {
    display: flex;
  }
  
  .square {
    width: 60px;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    position: relative;
  }
  
  .square.light {
    background: #f0d9b5;
  }
  
  .square.dark {
    background: #b58863;
  }
  
  .square.selected {
    background: #7fc27f !important;
  }
  
  .square.possible-move::after {
    content: '';
    position: absolute;
    width: 20px;
    height: 20px;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 50%;
  }
  
  .piece {
    font-size: 48px;
    user-select: none;
  }
  
  .move-history {
    margin-top: 1rem;
    padding: 1rem;
    background: var(--bg-secondary);
    border-radius: 8px;
    max-height: 200px;
    overflow-y: auto;
  }
  
  .move-history h4 {
    margin: 0 0 0.5rem 0;
    color: var(--text-primary);
  }
  
  .moves {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    font-family: monospace;
    font-size: 0.9rem;
  }
  
  .move {
    color: var(--text-secondary);
  }
</style>