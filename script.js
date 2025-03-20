const mazeLayout = [
    [0,  1,  0,  1,  0,  1,  1,  1,  0,  0,  1,  "B"], 
    [0,  1,  0,  1,  0,  0,  0,  1,  0,  1,  1,  0], 
    [0,  0,  0,  1,  0,  1,  0,  0,  0,  1,  1,  0], 
    [1,  0,  1,  1,  0,  1,  0,  1,  0,  1,  1,  0], 
    [1,  0,  0,  0,  0,  1,  0,  1,  0,  0,  0,  0],
    [1,  1,  1,  0,  1,  1,  0,  1,  1,  1,  1,  1],
    [0,  0,  0,  0,  1,  1,  0,  0,  0,  0,  0,  0],
    ["A",0,  0,  0,  1,  1,  0,  0,  0,  0,  0,  0] 
];

const stateMapping = [
    ["8",  0,  "9",  0,  "11", 0,  0,  0,  "18", "19", 0,  0], 
    [0,    0,   0,   0,  "10", "12", "13", 0,    0,    0,  0,  0], 
    ["6", "5", "7",  0,    0,  0,  "14", 0,  "17",  0,  0,  0],
    [0,    0,   0,   0,    0,  0,    0,  0,    0,  0,  0,  0],
    [0,  "3",  0,  "2",  "4",  0,    0,  0,  "20",  0,  0,  "21"],
    [0,    0,   0,   0,    0,  0,    0,  0,    0,  0,  0,  0],
    [0,    0,   0,   0,    0,  0,    0,  0,    0,  0,  0,  0], 
    [0,    0,   0,  "1",    0,  0,  "15", 0,    0,  0,  0,  "16"],
];

const mazeContainer = document.getElementById('maze');
let visitedCells = [];
let solutionPath = [];
let isPaused = false; // Flag to track if the search is paused

// Heuristic function table (from the file)
const heuristicTable = {
    "A": 8, "1": 6, "2": 6, "3": 6, "4": 7, "5": 4, "6": 12, "7": 7, "8": 15, "9": 18,
    "10": 6, "11": 8, "12": 6, "13": 5, "14": 4, "15": 8, "16": 6, "17": 3, "18": 5,
    "19": 5, "20": 2, "21": 1, "B": 0
};

function createMaze() {
    mazeContainer.innerHTML = '';
    mazeLayout.forEach((row, rIdx) => {
        row.forEach((cell, cIdx) => {
            const div = document.createElement('div');
            div.classList.add('cell');
            if (cell === 1) div.classList.add('wall');
            // Display states (like "6", "5", "7") and letters (like "A", "B")
            if (stateMapping[rIdx][cIdx] !== 0) {
                div.textContent = stateMapping[rIdx][cIdx];
            }
            if (cell === "A" || cell === "B") {
                div.textContent = cell;
            }
            div.dataset.row = rIdx;
            div.dataset.col = cIdx;
            mazeContainer.appendChild(div);
        });
    });
}

function solveMaze(algorithm) {
    const directions = [[0,1],[1,0],[0,-1],[-1,0]];
    let start = [7,0], goal = [0,11]; // Start at "A" (7,0), goal at "B" (0,11)
    let queue = [[start]];
    let visited = new Set();
    visitedCells = [];
    solutionPath = [];
    isPaused = false; // Reset pause flag

    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    async function search() {
        while (queue.length > 0 && !isPaused) {
            let path;
            if (algorithm === 'AStar') {
                // A* prioritizes paths with the lowest f(n) = g(n) + h(n)
                queue.sort((a, b) => {
                    let [rowA, colA] = a[a.length - 1];
                    let [rowB, colB] = b[b.length - 1];
                    let stateA = stateMapping[rowA][colA];
                    let stateB = stateMapping[rowB][colB];
                    let fA = a.length + (heuristicTable[stateA] || 0); // f(n) = g(n) + h(n)
                    let fB = b.length + (heuristicTable[stateB] || 0); // f(n) = g(n) + h(n)
                    return fA - fB;
                });
                path = queue.shift();
            } else {
                path = (algorithm === 'BFS') ? queue.shift() : queue.pop();
            }
            let [row, col] = path[path.length - 1];
            let cellKey = `${row},${col}`;
            
            if (visited.has(cellKey)) continue;
            visited.add(cellKey);
            visitedCells.push([row, col]);
            document.querySelector(`[data-row='${row}'][data-col='${col}']`).classList.add('visited');
            
            if (row === goal[0] && col === goal[1]) {
                solutionPath = path;
                highlightPath();
                return;
            }
            
            for (let [dr, dc] of directions) {
                let newRow = row + dr, newCol = col + dc;
                if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 12 && mazeLayout[newRow][newCol] !== 1) {
                    queue.push([...path, [newRow, newCol]]);
                }
            }
            await delay(300);
        }
    }
    search();
}

function pauseMaze() {
    isPaused = true; // Set pause flag to true
}

function highlightPath() {
    solutionPath.forEach(([row, col]) => {
        document.querySelector(`[data-row='${row}'][data-col='${col}']`).classList.add('path');
    });
}

function resetMaze() {
    visitedCells.forEach(([row, col]) => {
        document.querySelector(`[data-row='${row}'][data-col='${col}']`).classList.remove('visited', 'path');
    });
    solutionPath.forEach(([row, col]) => {
        document.querySelector(`[data-row='${row}'][data-col='${col}']`).classList.remove('path');
    });
    visitedCells = [];
    solutionPath = [];
    isPaused = false; // Reset pause flag
}

createMaze();