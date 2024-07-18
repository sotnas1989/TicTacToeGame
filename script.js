/** @type {HTMLCanvasElement} */
let canvas = document.getElementById("myCanvas");
let cellWidth = parseInt(canvas.getAttribute("width")) / 3 ; // We want a 3x3 board
let mouseX = -1; // The X Y coordenates of the of the top left coner of the 
let mouseY = -1; // cell clicked by the user in the canvas. Default -1 if no cell was clicked

window.addEventListener("load", paint);
canvas.addEventListener("click", canvasClicked);



/**
 * Does all the painting related to the canvas
 */
function paint() 
{
    let gctx = canvas.getContext("2d"); // Graphic Context of Canvas
    gctx.clearRect(0, 0, 3*cellWidth, 3*cellWidth); // Very important. Erases the previous grafics before painting
    if(game.gameOver.isOver && game.winCells.length === 3) fillWinCells();
    // Reseting to normal line properties
    gctx.strokeStyle = "#000000"; // Color of the lines
    gctx.lineWidth = 1;
    // Drawing the 3x3 board
    for (let i = cellWidth; i < 3*cellWidth; i += cellWidth) {
        // Drawing the vertical lines
        gctx.beginPath();
        gctx.moveTo(i, 0);
        gctx.lineTo(i, 3*cellWidth);
        gctx.closePath();
        gctx.stroke();
        // Drawing horizontal lines
        gctx.beginPath();
        gctx.moveTo(0, i);
        gctx.lineTo(3*cellWidth, i);
        gctx.closePath();
        gctx.stroke();
    }
    // Drawing the content of the matrix
    gctx.closePath();
    gctx.strokeStyle = "#000dff";
    gctx.lineWidth = 10;
    for (let r = 0; r < 3; r++)     
        for (let c = 0; c < 3; c++) 
        {
            let value = game.board[r][c];
            if(value === "X") drawCross(r, c);
            else if( value === "O") drawRing(r, c);            
        }
        

    /**
     * Inner function. Draws the O (Ring) on a cell.
     * @param {number} row Row of the cell
     * @param {number} col Column of the cell
     */
    function drawRing(row, col)
    {
        // gctx.strokeStyle = "#000dff";
        // gctx.lineWidth = 10; 
        let xCell = col*cellWidth;
        let yCell = row*cellWidth;       
        gctx.beginPath();
        gctx.arc(xCell + cellWidth/2, yCell + cellWidth/2, cellWidth/2 - 10, 0, 2*Math.PI, false);
        // gctx.closePath();
        gctx.stroke();
    }

    /**
     * Inner function. Draws the X (Cross) on a cell.
     * @param {number} row Row of the cell
     * @param {number} col Column of the cell
     */
    function drawCross(row, col)
    {
        let xCell = col*cellWidth;
        let yCell = row*cellWidth; 
        // gctx.strokeStyle = "#000dff";
        // gctx.lineWidth = 10;
        gctx.lineCap = "round";        
        // Drawing right diagonal
        gctx.beginPath();              
        gctx.moveTo(xCell + 10, yCell + 10);
        gctx.lineTo(xCell + cellWidth - 10, yCell + cellWidth - 10);               
        // gctx.closePath();
        gctx.stroke();
        // Drawing left diagonal
        gctx.beginPath();
        gctx.moveTo(col*cellWidth + cellWidth - 10, row*cellWidth + 10);
        gctx.lineTo(col*cellWidth + 10, row*cellWidth + cellWidth - 10);        
        // gctx.closePath();
        gctx.stroke();
        
    }

    /**
     * Inner function. Fills the winning cells after the game is over
     */
    function fillWinCells()
    {        
        for (let i = 0; i < game.winCells.length; i++) 
        {
            const aux = game.winCells[i];
            gctx.fillStyle = "rgba(221, 224, 36, 0.5)";
            gctx.fillRect(aux.col*cellWidth, aux.row*cellWidth, cellWidth, cellWidth);
        }
    }
}

/**
 * It starts when the user clicks on the canvas.
 * @param {MouseEvent} mouseEvt Event generated when click on canvas
 */
function canvasClicked(mouseEvt)
{
    if(game.gameOver.isOver) return; // Game over. Nothing to do
    // Getting the mouse coordinates relative to the canvas
    let rect = canvas.getBoundingClientRect(); // Alows access to canvas coordenates
    mouseX = mouseEvt.clientX - rect.left; // X relative to canvas (substracting left margin)
    mouseY = mouseEvt.clientY - rect.top;  // Y relative to canvas (substracting top margin)       
    mouseX -= mouseX % cellWidth; // Removes the excedent pixels calculating  the uper left corner 
    mouseY -= mouseY % cellWidth; // of the clicked cell
    if(mouseX >= 3*cellWidth) mouseX -= cellWidth; // Verification needed when clicking on the outter borders of the canvas. 
    if(mouseY >= 3*cellWidth) mouseY -= cellWidth; // Avoids selecting a cell that does not exists
    let row = mouseY/cellWidth; // Converting the mouse coordenates of the mouse  
    let col = mouseX/cellWidth; // to coordenates of the matrix
    game.play(row, col);


    // console.log(game.board);
    // console.log(`X: ${mouseX} Y: ${mouseY}  F: ${mouseY/cellWidth} C: ${mouseX/cellWidth}`);
    requestAnimationFrame(paint); // Repaints the canvas without reloading the page. 
    // location.reload(); // Reload the page. The canvas is repainted. NOT good all global variables are reset, game progress lost
}

class TicTacToeGame
{   

    constructor()
    {
        this.board = [["", "", ""], 
                     ["", "", ""],  // Initial state of the board
                     ["", "", ""]];         
        this.player1 = "X"; // First to play
        this.player2 = "O"; // Second to play
        this.playCounter = 0; // Default: 0 No one has played. 
        this.plays = new Array(); // Allows to have the order of plays. It stores objects with the format {row:1 col:2}.
        this.gameOver = {isOver: false, winner: ""}; // Reflects the state of the game an the winner
        this.winCells = new Array(); // Stores objects with the coordenates of the 3 in-line cells
    }

    play(row, col) 
    {
        if(row < 0 || row >= 3 || col < 0 || col >= 3) // Validating input
        {
            console.log(`row: ${row} col: ${col} are NOT valid values for a 3x3 matrix`);
            return false; // The play was not made
        }
        if(this.board[row][col] !== "") // Cell already played
        {
            console.log(`Already played in [${row}][${col}]`);
            return false;
        }  
        if(this.playCounter % 2 === 0) // "X" is next to play
        {
            this.board[row][col] = "X";
        }
        else // "O" is next to Play
        {
            this.board[row][col] = "O";
        }
        this.playCounter++;
        this.plays.push({row, col}); // Adding the new play to the record
        if(this.victoryAchived()) // Someone won
        {
            this.gameOver.isOver = true;
            let r = this.winCells[0].row;
            let c = this.winCells[0].col;
            this.gameOver.winner = this.board[r][c];            
        }
        else
        {
            if(this.plays.length === 9) // The board is full. Game is DRAW
            {
                this.gameOver.isOver = true;
                this.gameOver.winner = "DRAW";
                this.winCells = [];
            }
        }
        console.log(game);
        return true; // The play was made
    }

    victoryAchived()
    {
        if( this.playCounter < 5) return false; // Victory can only happen after 5th play
        //         N  NE   E  SE   S  SW   W  NW   Directions arrays, following cardinal points
        let dr = [-1, -1,  0,  1,  1,  1,  0, -1];
        let dc = [ 0,  1,  1,  1,  0, -1, -1, -1];
        let last = this.plays[this.plays.length-1]; // Last play
        // Searching for inline cells with a radius = 2
        for (let i = 0; i < dr.length; i++) 
        {
            this.winCells = [last]; // The last play will always be part of the winning plays, if there is a winner
            let r = last.row;
            let c = last.col;
            for (let j = 1; j <= 2; j++)
            {
                r +=  dr[i];
                c +=  dc[i];
                if( !this.isValidCell(r,c) ) break; // Out of the matrix. Cell not exist
                if(this.board[last.row][last.col] === this.board[r][c])
                    this.winCells.push( {row: r, col: c} ); // Found an in-line cell
                else break; // First cell was no in-line, no need to search for the other
            }
            if(this.winCells.length === 3) return true; // Found the 3 in-line cells            
        }
        // Searching for in-line cells with a radius = 1
        // Directions used 0 to 3 and the oposites are generated *(-1)
        for(let i = 0; i <= 3; i++)
        {
            this.winCells = [last];
            let r = last.row + dr[i];
            let c = last.col + dc[i];
            if( !this.isValidCell(r,c) ) break; // Out of the matrix. Cell not exist
            if(this.board[last.row][last.col] === this.board[r][c])
                this.winCells.push( {row: r, col: c} ); // Found an in-line cell
            // searching for the last in-line cell. Has to be in oposite direction
            r = last.row + dr[i]*(-1);
            c = last.col + dc[i]*(-1);
            if( !this.isValidCell(r,c) ) break; // Out of the matrix. Cell not exist
            if(this.board[last.row][last.col] === this.board[r][c])
                this.winCells.push( {row: r, col: c} ); // Found the last in-line cell
            if(this.winCells.length === 3) return true;
        }
        return false;
    }

    /**
     * Given the coordenates of a cell, determines if is valid for a 3x3 matrix
     * @param {*} row Row of the cell
     * @param {*} col Column of the cell
     * @returns true if valid, false if not
     */
    isValidCell(row, col)
    {
        return (row >= 0 && row < 3 && col >= 0 && col < 3) ;
    }
}

// Representation of the current game. 
// Can't call new TicTacToeGame() before defining the class TicTacToeGame
let game = new TicTacToeGame(); 


// Future Implementation:
// * After a game is over allow to see a replay of the game. (use of intervals)