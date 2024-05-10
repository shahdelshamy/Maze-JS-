const numRows = 20;
const numCols = 20;

const grid = [];

let startRow = null;
let startCol = null;
let endRow = null;
let endCol = null;

// Call the function to create the grid when the page loads

let obstacleState = true;

function createGrid() {
  const gridElement = document.getElementById("grid");

  for (let i = 0; i < numRows; i++) {
    const newRow = [];
    const row = document.createElement("tr");
    for (let j = 0; j < numCols; j++) {
      const cell = document.createElement("td");
      cell.setAttribute("id", `${i}-${j}`);
      newRow.push(0);
      row.appendChild(cell);
      cell.addEventListener("click", onGridCellClick);
      cell.addEventListener("mouseenter", onGridCellMouseenter);
      cell.addEventListener("dblclick", onGridCelldoubleClick);
    }
    grid.push(newRow);
    gridElement.appendChild(row);
  }
  // Handling performance issue
  gridElement.addEventListener("mouseleave", onGridMouseLeave);
}

window.onload = createGrid;

let startButton = document.getElementById("start-point-button");
let endButton = document.getElementById("end-point-button");
let obstaclesButton = document.getElementById("obstacle-button");
let RemoveObstacleButton = document.getElementById("remove-obstacle-button");
let Clear = document.getElementById("clear-button");

// events
startButton.addEventListener("click", function () {
  onButtonClick("start-point-button");
});
endButton.addEventListener("click", function () {
  onButtonClick("end-point-button");
});
obstaclesButton.addEventListener("click", function () {
  onButtonClick("obstacle-button");
  onObstacleButtonClick();
});
RemoveObstacleButton.addEventListener("click", function () {
  onButtonClick("remove-obstacle-button");
});
Clear.addEventListener("click", function () {
  location.reload();
});

function onButtonClick(id) {
  const buttons = document.querySelectorAll(".button");
  buttons.forEach((button) => {
    button.classList.remove("active");
  });
  document.getElementById(id).classList.add("active");
}

function onGridCellClick(event) {
  const cell = event.target;
  if (
    document.getElementById("start-point-button").classList.contains("active")
  ) {
    const allCells = document.querySelectorAll("td");
    allCells.forEach((cell) => {
      cell.classList.remove("start");
    });
    cell.classList.add("start");
    const [row, col] = cell.id.split("-").map(Number);
    startRow = row;
    startCol = col;
  } else if (
    document.getElementById("end-point-button").classList.contains("active")
  ) {
    const allCells = document.querySelectorAll("td");
    allCells.forEach((cell) => {
      cell.classList.remove("end");
    });
    cell.classList.add("end");
    const [row, col] = cell.id.split("-").map(Number);
    endRow = row;
    endCol = col;
  } else if (
    document
      .getElementById("remove-obstacle-button")
      .classList.contains("active")
  ) {
    const [row, col] = cell.id.split("-").map(Number);
    if (
      !(
        (row === startRow && col === startCol) ||
        (row === endRow && col === endCol)
      )
    ) {
      grid[row][col] = 0;
      cell.classList.remove("obstacle");
    }
  }
}

/****Handling Adding Obstacle****/

function onGridCellMouseenter(event) {
  const cell = event.target;
  if (
    document.getElementById("obstacle-button").classList.contains("active") &&
    obstacleState == true
  ) {
    const [row, col] = cell.id.split("-").map(Number);
    if (
      !(
        (row === startRow && col === startCol) ||
        (row === endRow && col === endCol)
      )
    ) {
      grid[row][col] = 1;
      cell.classList.add("obstacle");
    }
  }
}
function onGridCelldoubleClick() {
  if (document.getElementById("obstacle-button").classList.contains("active"))
    obstacleState = false;
}
function onGridMouseLeave() {
  document.getElementById("obstacle-button").classList.remove("active");
}
function onObstacleButtonClick() {
  obstacleState = true;
}

/************* Algo Buttons **********/

document.getElementById("bfs-button").addEventListener("click", function () {
  onButtonClick("bfs-button");
  runBFS();
});

document.getElementById("dfs-button").addEventListener("click", function () {
  onButtonClick("dfs-button");
  runDFS();  
});

document
  .getElementById("dijkstra-button")
  .addEventListener("click", function () {
    onButtonClick("dijkstra-button");
    runDijkstra();
  });

/***********BFS*********/
function runBFS() {
  const visited = new Set();
  const queue = [[startRow, startCol]];
  const startTime = performance.now();
  let n = 0; // Number of cells in the shortest path
  let m = 0; // Total number of neighbors
  let yellowVisitedCount = 0; // Number of visited cells that are yellow

  function processQueue() {
      if (queue.length === 0) {
          return;
      }
      const [row, col] = queue.shift();

      if (row === endRow && col === endCol) {
          let currentRow = row;
          let currentCol = col;
          while (currentRow !== startRow || currentCol !== startCol) {
              const cell = document.getElementById(`${currentRow}-${currentCol}`);
              if (currentRow !== endRow || currentCol !== endCol){
                cell.classList.add("path");
                ++n;
              }
                  
              const [prevRow, prevCol] = JSON.parse(cell.dataset.prev);
              currentRow = prevRow;
              currentCol = prevCol;

          }
          const endTime = performance.now();
          const runningTime = endTime - startTime; // Calculate the running time
          showData(n,yellowVisitedCount - (n), m, (runningTime / 1000).toFixed(2));
          // console.log(yellowVisitedCount - (n - 1) );
          return;
      }

      visited.add(`${row}-${col}`);
      const neighbors = getNeighbors(row, col);
      for (const [r, c] of neighbors) {
          ++m;
          const key = `${r}-${c}`;
          if (!visited.has(key) && grid[r][c] !== 1) {
              visited.add(key);
              queue.push([r, c]);
              const cell = document.getElementById(`${r}-${c}`);
              if (r !== endRow || c !== endCol) {
                  cell.classList.add("visited");
              }
              cell.dataset.prev = JSON.stringify([row, col]);
              if (cell.classList.contains("visited")) {
                yellowVisitedCount++;
            }
          }
      }
      setTimeout(processQueue, 10);
  }

  processQueue();
}


/***********DFS*********/
function runDFS() {
  const visited = new Set();
  const stack = [[startRow, startCol]];
  const startTime = performance.now();
  let n=0;
  let m=0;
  let yellowVisitedCount = 0;
  function processStack() {
    // Prevent infinty Loops in there is no path , or no end cell
    if (stack.length === 0) {
      return;
    }

    const [row, col] = stack.pop();
   
    if (row === endRow && col === endCol) {
      let currentRow = row;
      let currentCol = col;
      while (currentRow !== startRow || currentCol !== startCol) {
        const cell = document.getElementById(`${currentRow}-${currentCol}`);
        if (currentRow !== endRow || currentCol !== endCol){
          cell.classList.add("path");
          ++n;
        }
          
        const [prevRow, prevCol] = JSON.parse(cell.dataset.prev);
        currentRow = prevRow;
        currentCol = prevCol;
        
      }
      const endTime = performance.now();
      const runningTime = endTime - startTime; // Calculate the running time      
      showData(n, yellowVisitedCount - (n), m, (runningTime / 1000).toFixed(2));
      return;
    }

    visited.add(`${row}-${col}`);
    const neighbors = getNeighbors(row, col);
    for (const [r, c] of neighbors) {
      ++m;
      const key = `${r}-${c}`;
      if (!visited.has(key) && grid[r][c] !== 1) {
        visited.add(key);
        stack.push([r, c]);
        const cell = document.getElementById(`${r}-${c}`);
        if (r !== endRow || c !== endCol){
          cell.classList.add("visited");
          ++yellowVisitedCount;
        } 
        cell.dataset.prev = JSON.stringify([row, col]);
      }

      // No need to continue exploring neighbor cells if you have reached the End Cell
      if (r == endRow && c == endCol) {
        while (stack.isEmpty === false) stack.pop();
        stack.push([r, c]);
        break;
      }
    }

    setTimeout(processStack, 10);
  }

  processStack();
}


/***********Dijkstra************/
function runDijkstra() {
  const distances = {};
  const visited = new Set();
  const pq = new PriorityQueue();
  const startTime = performance.now();
  let n=0;
  let m=0;
  let yellowVisitedCount = 0;
  
  for (let i = 0; i < numRows; i++) {
    for (let j = 0; j < numCols; j++) {
      distances[`${i}-${j}`] = Infinity;
    }
  }
      const endTimeInfinitD = performance.now();
      console.log(((endTimeInfinitD - startTime) / 1000).toFixed(5));
      
  distances[`${startRow}-${startCol}`] = 0;

  pq.push(`${startRow}-${startCol}`, 0);

  function processStep() {
    if (pq.isEmpty() || visited.size === numRows * numCols) {
      return;
    }

    const current = pq.pop().element;
    
    const [row, col] = current.split("-").map(Number);

    if (visited.has(current)) return;
    visited.add(current);
    
    
    if (row === endRow && col === endCol) {
      let currentRow = row;
      let currentCol = col;
      while (currentRow !== startRow || currentCol !== startCol) {
        const cell = document.getElementById(`${currentRow}-${currentCol}`);
        if (currentRow !== endRow || currentCol !== endCol){
          cell.classList.add("path");
          ++n;
        }
          
        const [prevRow, prevCol] = JSON.parse(cell.dataset.prev);
        currentRow = prevRow;
        currentCol = prevCol;
        
      }
      const endTime = performance.now();
      const runningTime = endTime - startTime; // Calculate the running time
      showData(n, yellowVisitedCount - (n), m, (runningTime / 1000).toFixed(2));
      return;
    }
    
    const neighbors = getNeighbors(row, col);
    for (const [r, c] of neighbors) {
      ++m;
      if (!visited.has(`${r}-${c}`) && grid[r][c] !== 1) {
        const distance = distances[`${row}-${col}`] + 1;
        if (distance < distances[`${r}-${c}`]) {
          distances[`${r}-${c}`] = distance;
          pq.push(`${r}-${c}`, distance);
          const cell = document.getElementById(`${r}-${c}`);
          if (r !== endRow || c !== endCol){
            cell.classList.add("visited");
            ++yellowVisitedCount;
          } 
          cell.dataset.prev = JSON.stringify([row, col]);
        }
        
      }
      // give the highest priority to end cell , no need to explore more cells
      if (r === endRow && c === endCol) {
        pq.push(`${r}-${c}`, -1);
        break;
      }
    }
    setTimeout(processStep, 10);
  }
  processStep();
}

function getNeighbors(row, col) {
  const neighbors = [];
  if (row > 0) neighbors.push([row - 1, col]);
  if (row < numRows - 1) neighbors.push([row + 1, col]);
  if (col > 0) neighbors.push([row, col - 1]);
  if (col < numCols - 1) neighbors.push([row, col + 1]);
  return neighbors;
}

/**PriorityQueue Implmentation**/
class PriorityQueue {
  constructor() {
    this.elements = {};
    this.priorities = {};
  }

  push(element, priority) {
    this.elements[element] = true;
    this.priorities[element] = priority;
  }

  pop() {
    let minPriority = Infinity;
    let minElement = null;
    for (const element in this.elements) {
      if (this.priorities[element] < minPriority) {
        minPriority = this.priorities[element];
        minElement = element;
      }
    }
    if (minElement !== null) {
      delete this.elements[minElement];
      delete this.priorities[minElement];
      return { element: minElement, priority: minPriority };
    }
    return null;
  }

  isEmpty() {
    return Object.keys(this.elements).length === 0;
  }
}


function showData(n,visited,m,time){
  let container =  document.createElement("div");
  let nDiv = document.createElement("div");
  let visitedDiv = document.createElement("div");
  let mDiv = document.createElement("div");
  let timeDiv = document.createElement("div");

  let nText = document.createTextNode(`Number Of Path Cells:${n}`);
  let visitedText = document.createTextNode(`Number Of Visited Cells:${visited}`);
  let mText = document.createTextNode(`Number Of Neighbors:${m}`);
  let timeText = document.createTextNode(`Total Running Time:${time} Second`);

  nDiv.appendChild(nText);
  visitedDiv.appendChild(visitedText);
  mDiv.appendChild(mText);
  timeDiv.appendChild(timeText);

  container.appendChild(nDiv);
  container.appendChild(visitedDiv);
  container.appendChild(mDiv);
  container.appendChild(timeDiv);

  document.body.appendChild(container);

  nDiv.style.cssText = "padding:6px; background:blue; color:#fff; border-radius:6px; margin:0 0 6px 0; width:fit-content; font-size: 19px";
  visitedDiv.style.cssText = "padding:6px; background:#ffc8009e; color:#fff; border-radius:6px; margin:0 0 6px; width:fit-content; font-size: 19px ";
  mDiv.style.cssText = "padding:6px; background:aqua; color:#fff; border-radius:6px; margin:0 0 6px; width:fit-content; font-size: 19px ";
  timeDiv.style.cssText = "padding:6px; background:red; color:#fff; border-radius:6px; margin:0 0 6px 0; width:fit-content; font-size: 19px";

  container.style.cssText = "width:fit-content; border-radius:4px; position:absolute; top:20%; left:5%; transform:translateY(-50%); padding: 16px  "
}
