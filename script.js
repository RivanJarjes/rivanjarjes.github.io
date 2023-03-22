//Establish Canvas and Grid values
const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");
const BoardColor1 = "#779556";
const BoardColor2 = "#EBECD0";
const canvasWidth = 550;
const canvasHeight = 550;
const gridSize = 8;
const gridLength = 60;
const xOffset = (canvasWidth / 2)  - (gridSize * gridLength / 2);
const yOffset = (canvasHeight / 2) - (gridSize * gridLength / 2);

var MouseX = 0;
var MouseY = 0;
var MouseClick = false;
var SelectX = 0;
var SelectY = 0;
var lastSelectX = 0;
var lastSelectY = 0;
var newSelection = false;
var Turn = "white";

var gameOver = false;

//establish grid
var grid = new Array(gridSize);
for(let i = 0; i < gridSize; i++)
{
    grid[i] = new Array(gridSize);
}

for(let x = 0; x < gridSize; x++)
{
    for (let y = 0; y < gridSize; y++)
    {
        grid[x][y] = {
            Status: null,
            Color: null,
            Selection: false,
            Original: true
        }
    }
}

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
const whiteQueen = document.getElementById("WhiteQueen");
const blackQueen = document.getElementById("BlackQueen");
const PlaceOption = document.getElementById("GreyCircle");
const PlaceOption2 = document.getElementById("GreyCircle2");

//Set board
for (let x = 0; x < gridSize; x++){
    for (let y = 0; y < gridSize; y++){
        if (y < 2){
            grid[x][y].Color = "black"
        }
        if (y > gridSize - 3){
            grid[x][y].Color = "white"
        }
        if (y == 1 || y == gridSize - 2){
            grid[x][y].Status = "Pawn";
        }
        if (y == 0 || y == gridSize - 1){
            if (x == 0 || x == gridSize - 1){
                grid[x][y].Status = "Rook";
            }
            if (x == 1 || x == gridSize - 2){
                grid[x][y].Status = "Knight";
            }
            if (x == 2 || x == gridSize - 3){
                grid[x][y].Status = "Bishop";
            }
            if (x == 3){
                grid[x][y].Status = "Queen";
            }
            if (x == 4){
                grid[x][y].Status = "King";
            }
        }
    }
}

//draw grid
function drawSquare()
{
    for(let x = 0; x < gridSize; x++)
    {
        for (let y = 0; y < gridSize; y++)
        {
            this.$x = xOffset + gridLength * x;
            this.$y = yOffset + gridLength * y;
            this.$length = gridLength;

            let colorCode;
            if (x % 2 == 0)
            {
                if (y % 2 == 0)
                {
                    colorCode = BoardColor1
                }else{
                    colorCode = BoardColor2
                }
            }else{
                if (y % 2 == 0)
                {
                    colorCode = BoardColor2
                }else{
                    colorCode = BoardColor1
                }
            }
            ctx.beginPath();
            ctx.fillStyle = colorCode;
            ctx.rect(this.$x, this.$y, this.$length, this.$length);
            ctx.fill();

            if (grid[x][y].Status != null){
                ctx.drawImage(eval(grid[x][y].Color + grid[x][y].Status), this.$x, this.$y, this.$length, this.$length);
            }
            if (grid[x][y].Status == null && grid[x][y].Selection == true){
                ctx.drawImage(PlaceOption, this.$x, this.$y, this.$length, this.$length);
            }
            if (grid[x][y].Status != null && grid[x][y].Selection == true){
                ctx.drawImage(PlaceOption2, this.$x, this.$y, this.$length, this.$length);
            }

            ctx.closePath();

            if (MouseX >= this.$x && MouseX < this.$x + this.$length &&
                MouseY >= this.$y && MouseY < this.$y + this.$length &&
                MouseClick)
                {
                    lastSelectX = SelectX;
                    lastSelectY = SelectY;
                    SelectX = x;
                    SelectY = y;
                    newSelection = true;
                    MouseClick = false;
                }
        }
    }
}

function movePiece(newX = SelectX, newY = SelectY, oldX = lastSelectX, oldY = lastSelectY, usedGrid = grid, changeTurn = true){
    if (usedGrid[newX][newY].Selection == true)
    {
        usedGrid[newX][newY].Original = false;
        usedGrid[newX][newY].Status = usedGrid[oldX][oldY].Status;
        usedGrid[newX][newY].Color = usedGrid[oldX][oldY].Color;
        usedGrid[oldX][oldY].Status = null;
        usedGrid[oldX][oldY].Color = null;
        usedGrid[newX][newY].Selection == false;

        if (changeTurn){
            if (Turn == "white"){
                Turn = "black"
            }else{
                Turn = "white"
            }
        }
    }

}

function drawOverlay(){
    let OverlayList = possibleMoves(SelectX, SelectY);

    for(let x = 0; x < gridSize; x++)
    {
        for (let y = 0; y < gridSize; y++)
        {
            if (grid[SelectX][SelectY].Color == Turn)
            {
                let Match = false;

                for (let i = 0; i < OverlayList.length; i++)
                {
                    if (x == OverlayList[i].X && y == OverlayList[i].Y)
                    {
                        Match = true;
                        break;
                    }
                }
                if (Match){
                    grid[x][y].Selection = true;
                }else{
                    grid[x][y].Selection = false;
                }
            }else{
                grid[x][y].Selection = false;
            }
        }
    }
}

var possibleMoves = function(x, y, usedGrid = grid, onlyAttacks = false)
{
    let MoveList = [];
    let e = 0;
    let Direction;
    if (usedGrid[x][y].Color == "white"){
        Direction = 1;
    }else{
        Direction = -1;
    }
    switch(usedGrid[x][y].Status) {
        case "Pawn":
            if (y - 1 * Direction > -1 &&
                y - 1 * Direction < gridSize){
                    if (usedGrid[x][y - 1 * Direction].Status == null &&
                        onlyAttacks == false){
                        if (onlyAttacks == true || isKingCheck(dummyGrid(x, y - 1 * Direction, x, y), Turn) == false)
                        {
                        MoveList.push({X: x, Y: y - 1 * Direction});
                        }

                        if(y - 2 * Direction > -1 &&
                            y - 2 * Direction < gridSize){
                                if (usedGrid[x][y - 2 * Direction].Status == null &&
                                    usedGrid[x][y].Original == true){
                                    if (onlyAttacks == true || isKingCheck(dummyGrid(x, y - 2 * Direction, x, y), Turn) == false)
                                    {
                                        MoveList.push({X: x, Y: y - 2 * Direction});
                                    }
                            }
                        }
                    }

                    if (x - 1 > -1)
                        {
                            if (onlyAttacks == true || usedGrid[x - 1][y - 1 * Direction].Status != null &&
                                usedGrid[x - 1][y - 1 * Direction].Color != usedGrid[x][y].Color){
                                if (onlyAttacks == true || isKingCheck(dummyGrid(x - 1, y - 1 * Direction, x, y), Turn) == false)
                                {
                                    MoveList.push({X: x - 1, Y: y - 1 * Direction});
                                }
                            }
                        }
                    if (x + 1 < gridSize)
                        {
                            if (onlyAttacks == true || usedGrid[x + 1][y - 1 * Direction].Status != null &&
                                usedGrid[x + 1][y - 1 * Direction].Color != usedGrid[x][y].Color){
                                if (onlyAttacks == true || isKingCheck(dummyGrid(x + 1, y - 1 * Direction, x, y), Turn) == false)  
                                {
                                    MoveList.push({X: x + 1, Y: y - 1 * Direction});
                                }
                            }
                        }
                }
            if (onlyAttacks == false)
            {
                for (let i = MoveList.length -1; i > -1; i--){
                    if (isKingCheck(dummyGrid(MoveList[i].X, MoveList[i].Y, x , y))){
                        MoveList.splice(i, 1)
                    }
                }
            }
            return MoveList;
        
        case "Knight":
            if (x - 1 > -1 && y - 2 > -1)
            {
                if (usedGrid[x-1][y-2].Color != usedGrid[x][y].Color){
                    if (onlyAttacks == true || isKingCheck(dummyGrid(x - 1, y - 2, x, y), Turn) == false)  
                    {
                        MoveList.push({X: x - 1, Y: y - 2})
                    }
                }
            }

            if (y - 2 > -1 &&
                x + 1 < gridSize)
            {
                if (usedGrid[x+1][y-2].Color != usedGrid[x][y].Color){
                    if (onlyAttacks == true || isKingCheck(dummyGrid(x + 1, y - 2, x, y), Turn) == false)  
                    {
                    MoveList.push({X: x + 1, Y: y - 2})
                    }
                }
            }

            if (x - 1 > -1 &&
                y + 2 < gridSize)
            {
                if (usedGrid[x-1][y+2].Color != usedGrid[x][y].Color){
                    if (onlyAttacks == true || isKingCheck(dummyGrid(x - 1, y + 2, x, y), Turn) == false)  
                    {
                    MoveList.push({X: x - 1,Y: y + 2})
                    }
                }
            }

            if (x + 1 < gridSize && 
                y + 2 < gridSize)
            {
                if (usedGrid[x+1][y+2].Color != usedGrid[x][y].Color){
                    if (onlyAttacks == true || isKingCheck(dummyGrid(x + 1, y + 2, x, y), Turn) == false)  
                    {
                    MoveList.push({X: x + 1,Y: y + 2})
                    }
                }
            }
            if (x - 2 > -1 && 
                y - 1 > -1)
            {
                if (usedGrid[x-2][y-1].Color != usedGrid[x][y].Color){
                    if (onlyAttacks == true || isKingCheck(dummyGrid(x - 2, y - 1, x, y), Turn) == false)  
                    {
                        MoveList.push({X: x - 2, Y: y - 1})
                    }
                }
            }

            if (y - 1 > -1 &&
                x + 2 < gridSize)
            {
                if (usedGrid[x+2][y-1].Color != usedGrid[x][y].Color){
                    if (onlyAttacks == true || isKingCheck(dummyGrid(x + 2, y - 1, x, y), Turn) == false)  
                    {
                    MoveList.push({X: x + 2, Y: y - 1})
                    }
                }
            }

            if (x - 2 > -1 &&
                y + 1 < gridSize)
            {
                if (usedGrid[x-2][y+1].Color != usedGrid[x][y].Color){
                    if (onlyAttacks == true || isKingCheck(dummyGrid(x - 2, y + 1, x, y), Turn) == false)  
                    {
                    MoveList.push({X: x - 2, Y: y + 1})
                    }
                }
            }

            if (x + 2 < gridSize && 
                y + 1 < gridSize)
            {
                if (usedGrid[x+2][y+1].Color != usedGrid[x][y].Color){
                    if (onlyAttacks == true || isKingCheck(dummyGrid(x + 2, y + 1, x, y), Turn) == false)  
                    {
                    MoveList.push({X: x + 2,Y: y + 1})
                    }
                }
            }
            
            if (onlyAttacks == false)
            {
                for (let i = MoveList.length -1; i > -1; i--){
                    if (isKingCheck(dummyGrid(MoveList[i].X, MoveList[i].Y, x , y))){
                        MoveList.splice(i, 1)
                    }
                }
            }
            return MoveList
        
        case "Rook":
            for (let i = x; i < gridSize; i++)
            {
                if (usedGrid[i][y].Color == usedGrid[x][y].Color &&
                    i != x ){
                    break;
                }
                if (x != i){
                    MoveList.push({X: i, Y: y});
                }
                if (usedGrid[i][y].Status != null &&
                    i != x){
                    break;
                }
            }
            for (let i = x; i > -1; i--)
            {
                if (usedGrid[i][y].Color == usedGrid[x][y].Color &&
                    i != x){
                    break;
                }
                if (x != i)
                {
                    MoveList.push({X: i, Y: y});
                }
                if (usedGrid[i][y].Status != null &&
                    i != x)
                {
                    break;
                }
            }
            for (let i = y; i > -1; i--)
            {
                if (usedGrid[x][i].Color == usedGrid[x][y].Color &&
                    i != y){
                    break;
                }
                if (i != y){
                    MoveList.push({X: x, Y: i});
                }
                if (usedGrid[x][i].Status != null &&
                    i != y)
                {
                    break;
                }
            }
            for (let i = y; i < gridSize; i++)
            {
                if (usedGrid[x][i].Color == usedGrid[x][y].Color &&
                    i != y){
                    break;
                }
                if (i != y){
                    MoveList.push({X: x, Y: i});
                }
                if (usedGrid[x][i].Status != null &&
                    i != y)
                {
                    break;
                }
            }
            if (onlyAttacks == false)
            {
                for (let i = MoveList.length -1; i > -1; i--){
                    if (isKingCheck(dummyGrid(MoveList[i].X, MoveList[i].Y, x , y))){
                        MoveList.splice(i, 1)
                    }
                }
            }
            return MoveList
        
        case "Bishop":
            for (let Xi = -1; Xi <= 1; Xi += 2)
            {
                for (let Yi = -1; Yi <= 1; Yi += 2){
                    for (let i = 1; i < gridSize; i++){
                        if (x + i * Xi > -1 && x + i * Xi < gridSize &&
                            y + i * Yi > -1 && y + i * Yi < gridSize){
                            if (usedGrid[x + i * Xi][y + i * Yi].Status == null){
                                    MoveList.push({X: x + i * Xi, Y: y + i * Yi})
                            }else{
                                if (usedGrid[x + i * Xi][y + i * Yi].Color != usedGrid[x][y].Color){
                                        MoveList.push({X: x + i * Xi, Y: y + i * Yi})
                                        break;
                                }else{
                                    break;
                                }
                            }
                        }
                    }
                }
            }
            if (onlyAttacks == false)
            {
                for (let i = MoveList.length -1; i > -1; i--){
                    if (isKingCheck(dummyGrid(MoveList[i].X, MoveList[i].Y, x , y))){
                        MoveList.splice(i, 1)
                    }
                }
            }
            return MoveList
        
        case "Queen":
            for (let i = x; i < gridSize; i++)
            {
                if (usedGrid[i][y].Color == usedGrid[x][y].Color &&
                    i != x ){
                    break;
                }
                if (x != i){
                    if (onlyAttacks == true || isKingCheck(dummyGrid(i, y, x, y), Turn) == false)  
                    {
                        MoveList.push({X: i, Y: y});
                    }
                }
                if (usedGrid[i][y].Status != null &&
                    i != x){
                    break;
                }
            }
            for (let i = x; i > -1; i--)
            {
                if (usedGrid[i][y].Color == usedGrid[x][y].Color &&
                    i != x){
                    break;
                }
                if (x != i)
                {
                    if (onlyAttacks == true || isKingCheck(dummyGrid(i, y, x, y), Turn) == false)  
                    {
                    MoveList.push({X: i, Y: y});
                    }
                }
                if (usedGrid[i][y].Status != null &&
                    i != x)
                {
                    break;
                }
            }
            for (let i = y; i > -1; i--)
            {
                if (usedGrid[x][i].Color == usedGrid[x][y].Color &&
                    i != y){
                    break;
                }
                if (i != y){
                    if (onlyAttacks == true || isKingCheck(dummyGrid(x, i, x, y), Turn) == false)  
                    {
                    MoveList.push({X: x, Y: i});
                    }
                }
                if (usedGrid[x][i].Status != null &&
                    i != y)
                {
                    break;
                }
            }
            for (let i = y; i < gridSize; i++)
            {
                if (usedGrid[x][i].Color == usedGrid[x][y].Color &&
                    i != y){
                    break;
                }
                if (i != y){
                    if (onlyAttacks == true || isKingCheck(dummyGrid(x, i, x, y), Turn) == false)  
                    {
                    MoveList.push({X: x, Y: i});
                    }
                }
                if (usedGrid[x][i].Status != null &&
                    i != y)
                {
                    break;
                }
            }
            for (let Xi = -1; Xi <= 1; Xi += 2)
            {
                for (let Yi = -1; Yi <= 1; Yi += 2){
                    for (let i = 1; i < gridSize; i++){
                        if (x + i * Xi > -1 && x + i * Xi < gridSize &&
                            y + i * Yi > -1 && y + i * Yi < gridSize){
                            if (usedGrid[x + i * Xi][y + i * Yi].Status == null){
                                    MoveList.push({X: x + i * Xi, Y: y + i * Yi})
                            }else{
                                if (usedGrid[x + i * Xi][y + i * Yi].Color != usedGrid[x][y].Color){
                                        MoveList.push({X: x + i * Xi, Y: y + i * Yi})
                                        break;
                                }else{
                                    break;
                                }
                            }
                        }
                    }
                }
            }
            if (onlyAttacks == false)
            {
                for (let i = MoveList.length -1; i > -1; i--){
                    if (isKingCheck(dummyGrid(MoveList[i].X, MoveList[i].Y, x , y))){
                        MoveList.splice(i, 1)
                    }
                }
            }
            return MoveList
            

        case "King":
            for (let a = -1; a <= 1; a++)
            {
                for (let b = -1; b <= 1; b++)
                {
                    if (x + a > -1 && x + a < gridSize &&
                        y + b > -1 && y + b < gridSize)
                    {
                        if (usedGrid[x+a][y+b].Color != usedGrid[x][y].Color){
                            MoveList.push({X: x + a, Y: y + b});
                        }
                    }
                }
            }
            if (onlyAttacks == false)
            {
                for (let i = MoveList.length -1; i > -1; i--){
                    if (isKingCheck(dummyGrid(MoveList[i].X, MoveList[i].Y, x , y))){
                        MoveList.splice(i, 1)
                    }
                }
            }
            return MoveList
    }
    return [];
}

function isKingCheck(usedGrid = grid, KingColor = Turn){
    let KingX;
    let KingY;
    //look for the king piece and document it's coordinates
    for (let x = 0; x < gridSize; x++)
    {
        for (let y = 0; y < gridSize; y++)
        {
            if (usedGrid[x][y].Status == "King" && usedGrid[x][y].Color == KingColor) {
                KingX = x;
                KingY = y;
            }
        }
    }
    
    if(KingX != undefined || KingY != undefined)
        {
        for (let x = 0; x < gridSize; x++)
        {
            for (let y = 0; y < gridSize; y++)
            {
                if (usedGrid[x][y].Color != usedGrid[KingX][KingY].Color)
                {
                    let OverlayList = possibleMoves(x, y, usedGrid, true);
                    for (let i = 0; i < OverlayList.length; i++)
                    {
                        if (OverlayList[i].X == KingX && OverlayList[i].Y == KingY)
                        {
                            console.log("KING IN CHECK: (" + OverlayList[i].X + ", " + OverlayList[i].Y + ")")
                            return true;
                        }
                    }
                    
                }
            }
        }
    }
    return false;
}

function checkForMate()
{
    for(let x = 0; x < gridSize; x++)
    {
        for(let y = 0; y < gridSize; y++){
            if (grid[x][y].Color == Turn)
            {
                let OverlayList = possibleMoves(x, y, grid, false);
                if (OverlayList.length > 1)
                {
                    return false;
                }
            }
        }
    }
    return true;
}

function dummyGrid(newX, newY, oldX = SelectX, oldY = SelectY){
    let newGrid = structuredClone(grid);
    newGrid[newX][newY].Original = false;
    newGrid[newX][newY].Status = newGrid[oldX][oldY].Status;
    newGrid[newX][newY].Color = newGrid[oldX][oldY].Color;
    newGrid[oldX][oldY].Status = null;
    newGrid[oldX][oldY].Color = null;
    return newGrid;
}

function update(){
    ctx.clearRect(0,0, canvasWidth, canvasHeight)
    drawSquare()
    if (newSelection == true && gameOver == false)
    {
        document.getElementById("value").innerHTML = "<center>Currently selected: " + String.fromCharCode(97 + SelectX) + (SelectY + 1) + "</center>";
        movePiece()
        drawOverlay()
        newSelection = false;
    }
    isKingCheck();
    if (checkForMate()) {
        gameOver = true;
    }
    if (gameOver)
    {
        
    }
}
setInterval(update, 20)

//get mouse position
function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}

//report the mouse position on click
canvas.addEventListener("mousedown", function (evt) {
    var mousePos = getMousePos(canvas, evt);
    MouseX = mousePos.x;
    MouseY = mousePos.y;
    MouseClick = true;
}, false);
canvas.addEventListener("mouseup", function (evt) {
    var mousePos = getMousePos(canvas, evt);
    MouseX = mousePos.x;
    MouseY = mousePos.y;
    MouseClick = true;
    console.log(possibleMoves(SelectX,SelectY))
}, false);

//copy array
function copy(aObject) {
    // Prevent undefined objects
    // if (!aObject) return aObject;
  
    let bObject = Array.isArray(aObject) ? [] : {};
  
    let value;
    for (const key in aObject) {
  
      // Prevent self-references to parent object
      // if (Object.is(aObject[key], aObject)) continue;
      
      value = aObject[key];
  
      bObject[key] = (typeof value === "object") ? copy(value) : value;
    }
  
    return bObject;
  }