const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");
var gridSize = 20;
var grid;
var defaultColor = "#FFFFFF";
var brushColor = "#FF0000";
var outlineColor = "#808080"
var pixelSeperation = 2;
var mouseHeld = false;
var mouseX = 0;
var mouseY = 0;
var rangeInput = document.getElementById("myRange").value;

function initializeGrid() {
  gridSize = document.getElementById("myRange").value;
  grid = new Array(gridSize);
  for (let i = 0; i < gridSize; i++) {
    grid[i] = new Array(gridSize);
  }

  for (let x = 0; x < gridSize; x++) {
    for (let y = 0; y < gridSize; y++) {
      grid[x][y] = {
        Color: defaultColor,
      };
    }
  }
}
initializeGrid();

function handleGrid() {
  for (let x = 0; x < gridSize; x++) {
    for (let y = 0; y < gridSize; y++) {
      let pixelSize = Math.floor(canvas.clientWidth / gridSize);
      let $x = pixelSize * x;
      let $y = pixelSize * y;
      ctx.beginPath();
      ctx.fillStyle = grid[x][y].Color;
      ctx.rect($x, $y, pixelSize, pixelSize);
      ctx.fill();
      ctx.closePath();
      if (
        mouseHeld &&
        mouseX >= $x &&
        mouseX < $x + pixelSize &&
        mouseY >= $y &&
        mouseY < $y + pixelSize
      ) {
        grid[x][y].Color = brushColor;
      }
    }
  }
}
handleGrid();

function update() {
  
  checkSlider();
  if (mouseHeld){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    handleGrid();
  }
}
setInterval(update, 5);

function checkSlider() {
  if (rangeInput != document.getElementById("myRange").value) {
    initializeGrid();
    rangeInput = document.getElementById("myRange").value;
  }
}

document.addEventListener("coloris:pick", (event) => {
  brushColor = event.detail.color;
});

//get mouse position
function getMousePos(canvas, evt) {
  var rect = canvas.getBoundingClientRect();
  return {
    x: evt.clientX - rect.left,
    y: evt.clientY - rect.top,
  };
}
//report the mouse position on click
document.addEventListener(
  "mousedown",
  function (evt) {
    mouseHeld = true;
  },
  false
);
document.addEventListener(
  "mouseup",
  function (evt) {
    mouseHeld = false;
  },
  false
);
document.addEventListener(
  "mousemove",
  function (evt) {
    var mousePos = getMousePos(canvas, evt);
    mouseX = mousePos.x;
    mouseY = mousePos.y;
  },
  false
);
