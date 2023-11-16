const board = document.getElementById('board');
const rowsInput = document.getElementById('rowsInput');
const columnsInput = document.getElementById('columnsInput');
const winInput = document.getElementById('winInput');
const result = document.getElementById('result');
const difficultySlider = document.getElementById('difficultySlider');
const selectedDifficulty = document.getElementById('selectedDifficulty');

const EMPTY = '';
const PLAYER_X = 'X';
const PLAYER_O = 'O';

const EASY = 'Низкая';
const MEDIUM = 'Средняя';
const HARD = 'Высокая';
const DIFFICULTIES = [EASY, MEDIUM, HARD];
const ALGORITHMS = new Map();

ALGORITHMS.set(EASY, getComputerMoveRandom);
ALGORITHMS.set(MEDIUM, getComputerMoveBlockAttack);
ALGORITHMS.set(HARD, getComputerMoveMinimax);

let currentRows;
let currentColumns;
let currentDifficulty = HARD;
let currentWin = 3;
let currentPlayer = PLAYER_X;
let bot = PLAYER_O;
let gameBoard;

difficultySlider.addEventListener('input', updateDifficulty);
function updateDifficulty() {
    const difficultyLevel = parseInt(difficultySlider.value);
    currentDifficulty = DIFFICULTIES[difficultyLevel];
    selectedDifficulty.textContent = `Сложность: ${currentDifficulty}`;
}

function createTwoDimensionalArray(rows, columns, e = EMPTY) {
    const twoDimensionalArray = [];

    for (let i = 0; i < rows; i++) {
        const row = [];
        for (let j = 0; j < columns; j++) {
            row.push(e);
        }
        twoDimensionalArray.push(row);
    }

    return twoDimensionalArray;
}

function isBadInt(value, min, max) {
    return Number.isNaN(value) || value < min || value > max;
}

function initGame() {
    const resultElement = document.getElementById('result');
    board.innerHTML = '';
    resultElement.innerHTML = '&nbsp;';
    const rowsNumber = parseInt(rowsInput.value);
    const columnsNumber = parseInt(columnsInput.value);
    const winNumber = parseInt(winInput.value);
    const min = Math.min(rowsNumber, columnsNumber);

    if (isBadInt(rowsNumber, 3, 30) || isBadInt(columnsNumber, 3, 30)) {
        resultElement.textContent = 'Пожалуйста, введите корректную размерность (от 3 до 30).';
    } else if (isBadInt(winNumber, 3, min)) {
        resultElement.textContent = `Пожалуйста, введите корректное значение для победы (от 3 до ${min}).`;
    } else {
        currentRows = rowsNumber;
        currentColumns = columnsNumber;
        currentWin = winNumber;
        gameBoard = createTwoDimensionalArray(rowsNumber, columnsNumber);
        renderBoard();
    }
}

function renderBoard() {
    board.innerHTML = '';
    board.style.gridTemplateColumns = `repeat(${currentColumns}, 100px)`;
    gameBoard.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
            const cellElement = document.createElement('div');
            if (cell === PLAYER_X) {
                cellElement.classList.add('cell-X');
            } else if (cell === PLAYER_O) {
                cellElement.classList.add('cell-O');
            } else {
                cellElement.classList.add('cell');
            }
            cellElement.textContent = cell;
            cellElement.addEventListener('click', () => cellClick(rowIndex, colIndex));
            board.appendChild(cellElement);
        });
    });
}

function cellClick(row, col, board = gameBoard) {
    if (board[row][col] === EMPTY && !isGameOver()) {
        board[row][col] = currentPlayer;
        renderBoard();
        if (isGameOver()) {
            if (checkWinner()) {
                result.textContent = `Игра окончена! ${getWinner(board)} победил!`;
            } else {
                result.textContent = 'Игра окончена!'
            }
        } else {
            currentPlayer = currentPlayer === PLAYER_X ? PLAYER_O : PLAYER_X;
            if (currentPlayer === bot && !isGameOver(board)) {
                computerMove();
            }
        }
    }
}

function isGameOver(board = gameBoard) {
    const isOver = checkWinner(board) || isBoardFull(board);
    if (isOver) {
        currentPlayer = currentPlayer === PLAYER_X ? PLAYER_O : PLAYER_X;
        bot = currentPlayer === PLAYER_X ? PLAYER_O : PLAYER_X;
    }
    return isOver;
}

function checkWinner(board = gameBoard, win = currentWin) {
    const rows = board.length;
    const columns = board[0].length;

    // Проверка по горизонтали
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j <= columns - win; j++) {
            const line = board[i].slice(j, j + win);
            if (checkLine(line)) {
                return true;
            }
        }
    }

    // Проверка по вертикали
    for (let i = 0; i < columns; i++) {
        for (let j = 0; j <= rows - win; j++) {
            const line = [];
            for (let k = 0; k < win; k++) {
                line.push(board[j + k][i]);
            }
            if (checkLine(line)) {
                return true;
            }
        }
    }

    // Проверка по диагоналям
    for (let i = 0; i <= rows - win; i++) {
        for (let j = 0; j <= columns - win; j++) {
            const line1 = [];
            const line2 = [];
            for (let k = 0; k < win; k++) {
                line1.push(board[i + k][j + k]);
                line2.push(board[i + k][j + win - 1 - k]);
            }
            if (checkLine(line1) || checkLine(line2)) {
                return true;
            }
        }
    }

    return false;
}

function checkLine(line) {
    const firstElement = line[0];
    if (firstElement === EMPTY) {
        return false;
    }

    return line.every(element => element === firstElement);
}

function isBoardFull(board = gameBoard) {
    return board.every(row => row.every(cell => cell !== EMPTY));
}

function getWinner() {
    return currentPlayer === PLAYER_X ? PLAYER_O : PLAYER_X;
}

function computerMove(difficulty = currentDifficulty, board = gameBoard) {
    const algo = ALGORITHMS.get(difficulty);
    const {row, col} = algo(board);
    cellClick(row, col);
}

function getComputerMoveRandom(board = gameBoard) {
    const emptyCells = getEmptyCells(board);
    const randomIndex = Math.floor(Math.random() * emptyCells.length);
    return emptyCells[randomIndex];
}

function getComputerMoveBlockAttack(board = gameBoard) {
    const player = bot === PLAYER_X ? PLAYER_O : PLAYER_X;

    // Проверка наличия выигрышного хода
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[i].length; j++) {
            if (board[i][j] === EMPTY) {
                board[i][j] = player;
                if (checkWinner(board)) {
                    board[i][j] = EMPTY; // Отмена хода
                    return { row: i, col: j };
                }
                board[i][j] = EMPTY; // Отмена хода
            }
        }
    }

    // Проверка необходимости блокировки оппонента
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[i].length; j++) {
            if (board[i][j] === EMPTY) {
                board[i][j] = bot;
                if (checkWinner(board)) {
                    board[i][j] = EMPTY; // Отмена хода
                    return { row: i, col: j };
                }
                board[i][j] = EMPTY; // Отмена хода
            }
        }
    }

    // Случайный ход, если нет выигрышных или блокирующих ходов
    return getComputerMoveRandom(board);
}

function minimax(board = gameBoard, depth = 0, maximizingPlayer = false, startTime, maxTime = 2000) {
    const player = bot === PLAYER_X ? PLAYER_O : PLAYER_X;
    if (checkWinner(board)) {
        return maximizingPlayer ? -1 : 1;
    }

    if (isBoardFull(board)) {
        return 0;
    }

    const scores = [];
    const emptyCells = getEmptyCells(board);

    for (const cell of emptyCells) {
        const elapsedTime = Date.now() - startTime;
        if (elapsedTime >= maxTime) {
            return Infinity;
        }
        const i = cell.row;
        const j = cell.col;
        board[i][j] = maximizingPlayer ? bot : player;
        scores.push(minimax(board, depth + 1, !maximizingPlayer, startTime, maxTime));
        board[i][j] = EMPTY; // Отмена хода
    }

    return maximizingPlayer ? Math.max(...scores) : Math.min(...scores);
}

function getComputerMoveMinimax(board = gameBoard, maxTime = 1500) {
    const emptyCells = getEmptyCells(board);
    const bestMove = { score: -Infinity, move: null };
    const startTime = Date.now();

    for (const cell of emptyCells) {
        const i = cell.row;
        const j = cell.col;
        board[i][j] = bot;
        const score = minimax(board, 0, false, startTime, maxTime);
        board[i][j] = EMPTY; // Отмена хода
        if (score === Infinity) return getComputerMoveBlockAttack(board);

        if (score > bestMove.score) {
            bestMove.score = score;
            bestMove.move = { row: i, col: j };
        }
    }

    return bestMove.move;
}

function getEmptyCells(board = gameBoard) {
    const emptyCells = [];

    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[i].length; j++) {
            if (board[i][j] === EMPTY) {
                emptyCells.push({ row: i, col: j });
            }
        }
    }

    return emptyCells;
}

