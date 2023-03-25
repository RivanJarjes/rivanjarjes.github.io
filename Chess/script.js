//Establish Canvas and Grid values
const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");
const BoardColor1 = "#EBECD0";
const BoardColor2 = "#779556";
const gridSize = 8;
const gridLength = 60;
const xOffset = canvas.width / 2 - (gridSize * gridLength) / 2;
const yOffset = canvas.height / 2 - (gridSize * gridLength) / 2;

var TransitionAlpha = 0;
var MouseX = 0;
var MouseY = 0;
var MouseClick = false;
var SelectX = 0;
var SelectY = 0;
var lastSelectX = 0;
var lastSelectY = 0;
var newSelection = false;
var Turn = "white";
var AbleToMove = true;
var AwaitPromotion = false;
var gameOver = false;
var Winner = null;

//pieces
const whitePawn = document.getElementById("WhitePawn");
const blackPawn = document.getElementById("BlackPawn");
const whiteRook = document.getElementById("WhiteRook");
const blackRook = document.getElementById("BlackRook");
const whiteBishop = document.getElementById("WhiteBishop");
const blackBishop = document.getElementById("BlackBishop");
const whiteKnight = document.getElementById("WhiteKnight");
const blackKnight = document.getElementById("BlackKnight");
const whiteKing = document.getElementById("WhiteKing");
const blackKing = document.getElementById("BlackKing");
const CHwhiteKing = document.getElementById("CheckWhiteKing");
const CHblackKing = document.getElementById("CheckBlackKing");
const whiteQueen = document.getElementById("WhiteQueen");
const blackQueen = document.getElementById("BlackQueen");
const PlaceOption = document.getElementById("GreyCircle");
const PlaceOption2 = document.getElementById("GreyCircle2");

//establish grid
var grid = new Array(gridSize);
for (let i = 0; i < gridSize; i++) {
  grid[i] = new Array(gridSize);
}

for (let x = 0; x < gridSize; x++) {
  for (let y = 0; y < gridSize; y++) {
    grid[x][y] = {
      Status: null,
      Color: null,
      Selection: false,
      Original: true,
    };
  }
}

//Set board
function SetBoard() {
  for (let x = 0; x < gridSize; x++) {
    for (let y = 0; y < gridSize; y++) {
      if (y < 2) {
        grid[x][y].Color = "black";
      }
      if (y > gridSize - 3) {
        grid[x][y].Color = "white";
      }
      if (y == 1 || y == gridSize - 2) {
        grid[x][y].Status = "Pawn";
      }
      if (y == 0 || y == gridSize - 1) {
        if (x == 0 || x == gridSize - 1) {
          grid[x][y].Status = "Rook";
        }
        if (x == 1 || x == gridSize - 2) {
          grid[x][y].Status = "Knight";
        }
        if (x == 2 || x == gridSize - 3) {
          grid[x][y].Status = "Bishop";
        }
        if (x == 3) {
          grid[x][y].Status = "Queen";
        }
        if (x == 4) {
          grid[x][y].Status = "King";
        }
      }

      if (y >= 2 && y <= 5) {
        grid[x][y].Color = null;
        grid[x][y].Status = null;
      }
      grid[x][y].Selection = false;
      grid[x][y].Original = true;
    }
  }
}
SetBoard();

//draw grid and handle selections
function drawSquare() {
  for (let x = 0; x < gridSize; x++) {
    for (let y = 0; y < gridSize; y++) {
      this.$x = xOffset + gridLength * x;
      this.$y = yOffset + gridLength * y;
      this.$length = gridLength;

      let colorCode;
      if (x % 2 == 0) {
        if (y % 2 == 0) {
          colorCode = BoardColor1;
        } else {
          colorCode = BoardColor2;
        }
      } else {
        if (y % 2 == 0) {
          colorCode = BoardColor2;
        } else {
          colorCode = BoardColor1;
        }
      }

      function DrawPiece(piece) {
        ctx.drawImage(piece, this.$x, this.$y, this.$length, this.$length);
      }

      ctx.beginPath();
      ctx.globalAlpha = 1;
      ctx.fillStyle = colorCode;
      ctx.rect(this.$x, this.$y, this.$length, this.$length);
      ctx.fill();

      //if king in check, add prefix to display alternate sprite
      let Check = "";
      if (grid[x][y].Status == "King" && isKingCheck(grid, grid[x][y].Color)) {
        Check = "CH";
      }

      //draw piece
      if (grid[x][y].Status != null) {
        DrawPiece(eval(Check + grid[x][y].Color + grid[x][y].Status));
      }

      //draw selection
      if (grid[x][y].Status == null && grid[x][y].Selection == true) {
        DrawPiece(PlaceOption);
      }
      if (grid[x][y].Status != null && grid[x][y].Selection == true) {
        DrawPiece(PlaceOption2);
      }

      ctx.closePath();

      if (
        MouseX >= this.$x &&
        MouseX < this.$x + this.$length &&
        MouseY >= this.$y &&
        MouseY < this.$y + this.$length &&
        MouseClick &&
        AbleToMove
      ) {
        lastSelectX = SelectX;
        lastSelectY = SelectY;
        SelectX = x;
        SelectY = y;
        newSelection = true;
        MouseClick = false;
      }
    }
  }
  if (MouseClick && AbleToMove) {
    MouseClick == false;
  }
}

function movePiece(
  newX = SelectX,
  newY = SelectY,
  oldX = lastSelectX,
  oldY = lastSelectY,
  usedGrid = grid,
  changeTurn = true
) {
  //castling
  if (
    usedGrid[oldX][oldY].Status == "King" &&
    usedGrid[newX][newY].Status == "Rook" &&
    usedGrid[newX][newY].Color == usedGrid[oldX][oldY].Color &&
    usedGrid[newX][newY].Selection == true
  ) {
    if (newX == gridSize - 1) {
      usedGrid[6][oldY].Status = "King";
      usedGrid[6][oldY].Color = usedGrid[oldX][oldY].Color;
      usedGrid[6][oldY].Original = true;
      usedGrid[5][oldY].Status = "Rook";
      usedGrid[5][oldY].Color = usedGrid[oldX][oldY].Color;
      usedGrid[5][oldY].Original = true;
      usedGrid[7][oldY].Status = null;
      usedGrid[4][oldY].Status = null;
    }
    if (newX == 0) {
      usedGrid[2][oldY].Status = "King";
      usedGrid[2][oldY].Color = usedGrid[oldX][oldY].Color;
      usedGrid[2][oldY].Original = true;
      usedGrid[3][oldY].Status = "Rook";
      usedGrid[3][oldY].Color = usedGrid[oldX][oldY].Color;
      usedGrid[3][oldY].Original = true;
      usedGrid[0][oldY].Status = null;
      usedGrid[4][oldY].Status = null;
    }
    
    //change turn
    if (changeTurn) {
      if (Turn == "white") {
        Turn = "black";
      } else {
        Turn = "white";
      }
    }
    return;
  }
  
  //moves piece when new click selection is a possible move
  if (usedGrid[newX][newY].Selection == true) {
    usedGrid[newX][newY].Original = false;
    usedGrid[newX][newY].Status = usedGrid[oldX][oldY].Status;
    usedGrid[newX][newY].Color = usedGrid[oldX][oldY].Color;
    usedGrid[oldX][oldY].Status = null;
    usedGrid[oldX][oldY].Color = null;
    usedGrid[newX][newY].Selection == false;

    if (
      usedGrid[newX][newY].Status == "Pawn" &&
      ((usedGrid[newX][newY].Color == "white" && newY == 0) ||
        (usedGrid[newX][newY].Color == "black" && newY == gridSize - 1))
    ) {
      AwaitPromotion = true;
      return;
    }

    if (changeTurn) {
      if (Turn == "white") {
        Turn = "black";
      } else {
        Turn = "white";
      }
    }
  }
}

//check if any box is a possible move for selected piece
function drawOverlay() {
  let OverlayList = possibleMoves(SelectX, SelectY);

  for (let x = 0; x < gridSize; x++) {
    for (let y = 0; y < gridSize; y++) {
      if (grid[SelectX][SelectY].Color == Turn) {
        let Match = false;

        for (let i = 0; i < OverlayList.length; i++) {
          if (x == OverlayList[i].X && y == OverlayList[i].Y) {
            Match = true;
            break;
          }
        }
        if (Match) {
          grid[x][y].Selection = true;
        } else {
          grid[x][y].Selection = false;
        }
      } else {
        grid[x][y].Selection = false;
      }
    }
  }
}

//check all the possible moves
var possibleMoves = function (x, y, usedGrid = grid, onlyAttacks = false) {
  let MoveList = [];
  let Direction;
  if (usedGrid[x][y].Color == "white") {
    Direction = 1;
  } else {
    Direction = -1;
  }

  switch (usedGrid[x][y].Status) {
    case "Pawn":
      if (y - 1 * Direction > -1 && y - 1 * Direction < gridSize) {
        //move pawn up if possible
        if (
          usedGrid[x][y - 1 * Direction].Status == null &&
          onlyAttacks == false
        ) {
          MoveList.push({ X: x, Y: y - 1 * Direction });

          //allow pawn to move 2 spaces if first move
          if (y - 2 * Direction > -1 && y - 2 * Direction < gridSize) {
            if (
              usedGrid[x][y - 2 * Direction].Status == null &&
              usedGrid[x][y].Original == true
            ) {
              MoveList.push({ X: x, Y: y - 2 * Direction });
            }
          }
        }

        //allow 
        if (x - 1 > -1) {
          if (
            onlyAttacks == true ||
            (usedGrid[x - 1][y - 1 * Direction].Status != null &&
              usedGrid[x - 1][y - 1 * Direction].Color != usedGrid[x][y].Color)
          ) {
            MoveList.push({ X: x - 1, Y: y - 1 * Direction });
          }
        }
        if (x + 1 < gridSize) {
          if (
            onlyAttacks == true ||
            (usedGrid[x + 1][y - 1 * Direction].Status != null &&
              usedGrid[x + 1][y - 1 * Direction].Color != usedGrid[x][y].Color)
          ) {
            MoveList.push({ X: x + 1, Y: y - 1 * Direction });
            
          }
        }
      }
      break;

    case "Knight":
      if (x - 1 > -1 && y - 2 > -1) {
        if (usedGrid[x - 1][y - 2].Color != usedGrid[x][y].Color) {
            MoveList.push({ X: x - 1, Y: y - 2 });
        }
      }

      if (y - 2 > -1 && x + 1 < gridSize) {
        if (usedGrid[x + 1][y - 2].Color != usedGrid[x][y].Color) {
            MoveList.push({ X: x + 1, Y: y - 2 });
        }
      }

      if (x - 1 > -1 && y + 2 < gridSize) {
        if (usedGrid[x - 1][y + 2].Color != usedGrid[x][y].Color) {
            MoveList.push({ X: x - 1, Y: y + 2 });
        }
      }

      if (x + 1 < gridSize && y + 2 < gridSize) {
        if (usedGrid[x + 1][y + 2].Color != usedGrid[x][y].Color) {
            MoveList.push({ X: x + 1, Y: y + 2 });
        }
      }
      if (x - 2 > -1 && y - 1 > -1) {
        if (usedGrid[x - 2][y - 1].Color != usedGrid[x][y].Color) {
            MoveList.push({ X: x - 2, Y: y - 1 });
        }
      }

      if (y - 1 > -1 && x + 2 < gridSize) {
        if (usedGrid[x + 2][y - 1].Color != usedGrid[x][y].Color) {
            MoveList.push({ X: x + 2, Y: y - 1 });
        }
      }

      if (x - 2 > -1 && y + 1 < gridSize) {
        if (usedGrid[x - 2][y + 1].Color != usedGrid[x][y].Color) {
            MoveList.push({ X: x - 2, Y: y + 1 });
        }
      }

      if (x + 2 < gridSize && y + 1 < gridSize) {
        if (usedGrid[x + 2][y + 1].Color != usedGrid[x][y].Color) {
            MoveList.push({ X: x + 2, Y: y + 1 });
        }
      }

      break;

    case "Queen":
    //goes to rook

    case "Rook":
      for (let i = x; i < gridSize; i++) {
        if (usedGrid[i][y].Color == usedGrid[x][y].Color && i != x) {
          break;
        }
        if (x != i) {
          MoveList.push({ X: i, Y: y });
        }
        if (usedGrid[i][y].Status != null && i != x) {
          break;
        }
      }
      for (let i = x; i > -1; i--) {
        if (usedGrid[i][y].Color == usedGrid[x][y].Color && i != x) {
          break;
        }
        if (x != i) {
          MoveList.push({ X: i, Y: y });
        }
        if (usedGrid[i][y].Status != null && i != x) {
          break;
        }
      }
      for (let i = y; i > -1; i--) {
        if (usedGrid[x][i].Color == usedGrid[x][y].Color && i != y) {
          break;
        }
        if (i != y) {
          MoveList.push({ X: x, Y: i });
        }
        if (usedGrid[x][i].Status != null && i != y) {
          break;
        }
      }
      for (let i = y; i < gridSize; i++) {
        if (usedGrid[x][i].Color == usedGrid[x][y].Color && i != y) {
          break;
        }
        if (i != y) {
          MoveList.push({ X: x, Y: i });
        }
        if (usedGrid[x][i].Status != null && i != y) {
          break;
        }
      }

      //if queen, give it the same moves as bishop as well
      if (usedGrid[x][y].Status != "Queen") {
        break;
      }

    case "Bishop":
      for (let Xi = -1; Xi <= 1; Xi += 2) {
        for (let Yi = -1; Yi <= 1; Yi += 2) {
          for (let i = 1; i < gridSize; i++) {
            if (
              x + i * Xi > -1 &&
              x + i * Xi < gridSize &&
              y + i * Yi > -1 &&
              y + i * Yi < gridSize
            ) {
              if (usedGrid[x + i * Xi][y + i * Yi].Status == null) {
                MoveList.push({ X: x + i * Xi, Y: y + i * Yi });
              } else {
                if (
                  usedGrid[x + i * Xi][y + i * Yi].Color != usedGrid[x][y].Color
                ) {
                  MoveList.push({ X: x + i * Xi, Y: y + i * Yi });
                  break;
                } else {
                  break;
                }
              }
            }
          }
        }
      }
      break;

    case "King":
      for (let a = -1; a <= 1; a++) {
        for (let b = -1; b <= 1; b++) {
          if (
            x + a > -1 &&
            x + a < gridSize &&
            y + b > -1 &&
            y + b < gridSize
          ) {
            if (
              usedGrid[x + a][y + b].Color != usedGrid[x][y].Color &&
              !(a == 0 && b == 0)
            ) {
              MoveList.push({ X: x + a, Y: y + b });
            }
          }
        }
      }
      //Castling
      //right side castling
      if (usedGrid[x][y].Original) {
        if (
          usedGrid[5][y].Status == null &&
          usedGrid[6][y].Status == null &&
          usedGrid[7][y].Original
        ) {
          MoveList.push({ X: x + 3, Y: y });
        }
      }
      //left side castling
      if (usedGrid[x][y].Original) {
        if (
          usedGrid[3][y].Status == null &&
          usedGrid[2][y].Status == null &&
          usedGrid[1][y].Status == null &&
          usedGrid[0][y].Original
        ) {
          MoveList.push({ X: x - 4, Y: y });
        }
      }

      break;
  }

  if (onlyAttacks == false) {
    for (let i = MoveList.length - 1; i > -1; i--) {
      if (isKingCheck(dummyGrid(MoveList[i].X, MoveList[i].Y, x, y))) {
        MoveList.splice(i, 1);
      }
    }
  }
  return MoveList;
};

function isKingCheck(usedGrid = grid, KingColor = Turn) {
  let KingX;
  let KingY;
  //look for the king piece and document it's coordinates
  for (let x = 0; x < gridSize; x++) {
    for (let y = 0; y < gridSize; y++) {
      if (
        usedGrid[x][y].Status == "King" &&
        usedGrid[x][y].Color == KingColor
      ) {
        KingX = x;
        KingY = y;
      }
    }
  }

  if (KingX != undefined || KingY != undefined) {
    for (let x = 0; x < gridSize; x++) {
      for (let y = 0; y < gridSize; y++) {
        if (usedGrid[x][y].Color != usedGrid[KingX][KingY].Color) {
          let OverlayList = possibleMoves(x, y, usedGrid, true);
          for (let i = 0; i < OverlayList.length; i++) {
            if (OverlayList[i].X == KingX && OverlayList[i].Y == KingY) {
              return true;
            }
          }
        }
      }
    }
  }
  return false;
}

function checkForCheckMate(Color = Turn) {
  if (isKingCheck() == false) {
    return false;
  }

  for (let x = 0; x < gridSize; x++) {
    for (let y = 0; y < gridSize; y++) {
      if (grid[x][y].Color == Color) {
        let OverlayList = possibleMoves(x, y, grid, false);
        if (OverlayList.length > 0) {
          return false;
        }
      }
    }
  }
  if (Color == "white") {
    Winner = "Black";
  } else {
    Winner = "White";
  }
  return true;
}

function checkForStaleMate(Color = Turn) {
  if (isKingCheck()) {
    return false;
  }
  for (let x = 0; x < gridSize; x++) {
    for (let y = 0; y < gridSize; y++) {
      if (grid[x][y].Color == Color) {
        let OverlayList = possibleMoves(x, y, grid, false);
        if (OverlayList.length > 0) {
          return false;
        }
      }
    }
  }
  return true;
}

function dummyGrid(newX, newY, oldX = SelectX, oldY = SelectY) {
  let newGrid = structuredClone(grid);
  newGrid[newX][newY].Original = false;
  newGrid[newX][newY].Status = newGrid[oldX][oldY].Status;
  newGrid[newX][newY].Color = newGrid[oldX][oldY].Color;
  newGrid[oldX][oldY].Status = null;
  newGrid[oldX][oldY].Color = null;
  return newGrid;
}

function promptScreen(promptType = "Checkmate") {
  ctx.beginPath();
  if (TransitionAlpha < 1) {
    TransitionAlpha += 0.1;
  }
  ctx.globalAlpha = TransitionAlpha;
  this.$length = gridSize * gridLength;
  ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
  ctx.rect(xOffset, yOffset, this.$length, this.$length);
  ctx.fill();
  ctx.closePath();

  switch (promptType) {
    case "Checkmate":
      this.$Width = 550 / 2;
      this.$Height = 550 / 3;
      this.$xOffset = canvas.width / 2 - this.$Width / 2;
      this.$yOffset = canvas.height / 2 - this.$Height / 2;
      gameOver = true;
      ctx.beginPath();
      ctx.fillStyle = BoardColor1;
      ctx.rect(this.$xOffset, this.$yOffset, this.$Width, this.$Height);
      ctx.fill();
      ctx.font = "20px OpenSans";
      ctx.textAlign = "center";
      ctx.fillStyle = "black";
      ctx.fillText(
        Winner + " wins by checkmate!",
        canvas.width / 2,
        canvas.height / 2 - 20
      );
      ctx.closePath();

      ctx.beginPath();
      this.ButtonWidth = 100;
      this.ButtonHeight = 50;
      this.ButtonX = canvas.width / 2 - this.ButtonWidth / 2;
      this.ButtonY = canvas.height / 2 - this.ButtonHeight / 2 + 50;
      ctx.fillStyle = BoardColor2;
      ctx.roundRect(
        this.ButtonX,
        this.ButtonY,
        this.ButtonWidth,
        this.ButtonHeight,
        [40]
      );
      ctx.fill();
      ctx.font = "20px OpenSans";
      ctx.textAlign = "center";
      ctx.fillStyle = "white";
      ctx.fillText("Retry", canvas.width / 2, canvas.height / 2 + 57);

      if (
        MouseX >= this.ButtonX &&
        MouseX < this.ButtonX + this.ButtonWidth &&
        MouseY >= this.ButtonY &&
        MouseY < this.ButtonY + this.ButtonHeight &&
        MouseClick
      ) {
        restartBoard();
      }

      if (MouseClick) {
        MouseClick = false;
      }
      ctx.closePath();
      break;

    case "Stalemate":
      this.$Width = 550 / 2;
      this.$Height = 550 / 3;
      this.$xOffset = canvas.width / 2 - this.$Width / 2;
      this.$yOffset = canvas.height / 2 - this.$Height / 2;
      gameOver = true;
      ctx.beginPath();
      ctx.fillStyle = BoardColor1;
      ctx.rect(this.$xOffset, this.$yOffset, this.$Width, this.$Height);
      ctx.fill();
      ctx.font = "20px OpenSans";
      ctx.textAlign = "center";
      ctx.fillStyle = "black";
      ctx.fillText("Stalemate!", canvas.width / 2, canvas.height / 2 - 20);
      ctx.closePath();

      ctx.beginPath();
      this.ButtonWidth = 100;
      this.ButtonHeight = 50;
      this.ButtonX = canvas.width / 2 - this.ButtonWidth / 2;
      this.ButtonY = canvas.height / 2 - this.ButtonHeight / 2 + 50;
      ctx.fillStyle = BoardColor2;
      ctx.roundRect(
        this.ButtonX,
        this.ButtonY,
        this.ButtonWidth,
        this.ButtonHeight,
        [40]
      );
      ctx.fill();
      ctx.font = "20px OpenSans";
      ctx.textAlign = "center";
      ctx.fillStyle = "white";
      ctx.fillText("Retry", canvas.width / 2, canvas.height / 2 + 57);

      if (
        MouseX >= this.ButtonX &&
        MouseX < this.ButtonX + this.ButtonWidth &&
        MouseY >= this.ButtonY &&
        MouseY < this.ButtonY + this.ButtonHeight &&
        MouseClick
      ) {
        restartBoard();
      }

      if (MouseClick) {
        MouseClick = false;
      }
      ctx.closePath();
      break;

    case "Promotion":
      let PromoOptions = ["Queen", "Rook", "Bishop", "Knight"];
      this.$xOffset = canvas.width / 2 - (4 * gridLength) / 2;
      this.$yOffset = canvas.height / 2 - gridLength / 2;
      this.$Width = 4 * gridLength;
      this.$Length = gridLength;
      let Choice = null;

      ctx.beginPath();
      ctx.fillStyle = BoardColor1;
      ctx.rect(this.$xOffset, this.$yOffset, this.$Width, this.$Length);
      ctx.fill();
      for (let i = 0; i < 4; i++) {
        let X = this.$xOffset + gridLength * i;
        console.log(X);
        ctx.drawImage(
          eval(Turn + PromoOptions[i]),
          X,
          this.$yOffset,
          gridLength,
          gridLength
        );

        if (
          MouseX >= X &&
          MouseX < X + gridLength &&
          MouseY >= this.$yOffset &&
          MouseY < this.$yOffset + gridLength &&
          MouseClick
        ) {
          Choice = PromoOptions[i];
          console.log("Activate");
          MouseClick = false;
          break;
        }
      }
      if (MouseClick) {
        MouseClick = false;
      }
      ctx.closePath();

      if (Choice != null) {
        let y;
        if (Turn == "white") {
          y = 0;
        } else {
          y = gridSize - 1;
        }

        for (let i = 0; i < gridSize; i++) {
          if (grid[i][y].Status == "Pawn") {
            grid[i][y].Status = Choice;
            if (Turn == "white") {
              Turn = "black";
            } else {
              Turn = "white";
            }
            AwaitPromotion = false;
            return;
          }
        }
      }
      break;
  }
}

function update() {
  //if prompt occurs, disallow movement
  if (AwaitPromotion || gameOver) {
    AbleToMove = false;
  } else {
    AbleToMove = true;
    TransitionAlpha = 0;
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawSquare();

  if (newSelection == true && gameOver == false) {
    //Edit current selection
    document.getElementById("value").innerHTML =
      "<center>Currently selected: " +
      String.fromCharCode(97 + SelectX) +
      (SelectY + 1) +
      "</center>";

    //Move piece if there's a new selection
    movePiece();
    //Find all selections with
    drawOverlay();
    newSelection = false;
  }

  //bring up prompt based on scenario
  if (AwaitPromotion) {
    promptScreen("Promotion");
  }

  if (checkForCheckMate()) {
    promptScreen("Checkmate");
  }

  if (checkForStaleMate()) {
    promptScreen("Stalemate");
  }
}
setInterval(update, 20);

//Restart game
function restartBoard() {
  Turn = "white";
  SetBoard();
  AbleToMove = true;
  AwaitPromotion = false;
  gameOver = false;
  Winner = null;
  SelectX = 0;
  SelectY = 0;
}

//get mouse position
function getMousePos(canvas, evt) {
  var rect = canvas.getBoundingClientRect();
  return {
    x: evt.clientX - rect.left,
    y: evt.clientY - rect.top,
  };
}
//report the mouse position on click
canvas.addEventListener(
  "mousedown",
  function (evt) {
    MouseClick = true;
  },
  false
);
canvas.addEventListener(
  "mouseup",
  function (evt) {
    MouseClick = true;
  },
  false
);
canvas.addEventListener(
  "mousemove",
  function (evt) {
    var mousePos = getMousePos(canvas, evt);
    MouseX = mousePos.x;
    MouseY = mousePos.y;
  },
  false
);
