const cells = document.querySelectorAll('[data-cell]');
const statusText = document.getElementById('status');
const restartButton = document.getElementById('restartButton');
let currentPlayer = 'X';
let gameActive = true;
let gameState = Array(9).fill('');

const winningConditions = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6]
];

const checkWin = () => {
  for (let i = 0; i < winningConditions.length; i++) {
    const [a, b, c] = winningConditions[i];
    if (gameState[a] && gameState[a] === gameState[b] && gameState[a] === gameState[c]) {
      return gameState[a];
    }
  }
  return gameState.includes('') ? null : 'draw';
};

const updateStatus = (result) => {
  if (result === 'draw') {
    statusText.textContent = 'Draw!';
  } else if (result) {
    statusText.textContent = `${result} Wins!`;
  } else {
    statusText.textContent = `It's ${currentPlayer}'s turn`;
  }
};

const handleCellClick = (index) => {
  if (!gameActive || gameState[index]) return;

  gameState[index] = currentPlayer;
  firebase.database().ref('gameState').set(gameState);

  const result = checkWin();
  if (result) {
    gameActive = false;
    updateStatus(result);
  } else {
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    firebase.database().ref('currentPlayer').set(currentPlayer);
    updateStatus(null);
  }
};

const updateBoard = () => {
  gameState.forEach((value, index) => {
    cells[index].textContent = value;
  });
};

cells.forEach((cell, index) => {
  cell.addEventListener('click', () => handleCellClick(index));
});

restartButton.addEventListener('click', () => {
  gameState.fill('');
  currentPlayer = 'X';
  gameActive = true;
  updateBoard();
  updateStatus(null);
  firebase.database().ref('gameState').set(gameState);
  firebase.database().ref('currentPlayer').set(currentPlayer);
});

firebase.database().ref('gameState').on('value', (snapshot) => {
  const remoteGameState = snapshot.val();
  if (remoteGameState) {
    gameState = remoteGameState;
    updateBoard();
    const result = checkWin();
    if (result) {
      gameActive = false;
      updateStatus(result);
    }
  }
});

firebase.database().ref('currentPlayer').on('value', (snapshot) => {
  currentPlayer = snapshot.val() || 'X';
  updateStatus(null);
});
