'use strict'
console.log('playing mine sweeper!');

// CR -  Since your gBoard contains only strings and not objects, you end up having
// CR... to rely on the DOM for a lot of your state (checking if a cell if flagged or shown...).
// CR... With a more robust model, you wouldn't have to do that.

const MINE = '*';
const EMPTY = '';
const FLAG = '!';
const DIFFICULTIES = [{ lvl: 0, size: 4, mines: 2 }, { lvl: 1, size: 6, mines: 5 }, { lvl: 2, size: 8, mines: 15 }];

var gStats = {
    isGame: false,
    isProccessing: false, //BUG FIX
    flags: 0,
    startTime: 0,
    clock: 0
}

var gTimeInterval;
var gCurrLevel = 0;
var gCurrSize;

var gBoard = [];


// CR -  This function is called twice for every game, which is unnecessary
// CR... and also results in a gBoard that has twice the number of rows it was intended to have.
//creates mat
function buildBoard(board, mineNum, clickedCellPos) {
    //sets random location for mines, makes sure it is not where the user clicked
    for (var i = 0; i < gCurrSize; i++) {
        var newRow = []
        board.push(newRow)
        for (var j = 0; j < gCurrSize; j++) {
            board[i].push(EMPTY);
        }
    }
    if (!clickedCellPos) return;

    var minePoss = [];
    for (var i = 0; i < mineNum; i++) {
        var currMinePos = getRandPos(gCurrSize)
        var isMineExists = false;
        if (currMinePos.i === clickedCellPos.i && currMinePos.j === clickedCellPos.j) { //checks its not the cell we clicked
            i--
            continue;
        }
        // CR -  You could also check if the cell in board[i][j] already has a mine,
        // CR... then place one if it does not, or decrement the i if it does. 
        for (var j = 0; j < minePoss.length; j++) {                                       //checks the cell isnt repeating in the board
            if (currMinePos.i === minePoss[j].i && currMinePos.j === minePoss[j].j) {
                isMineExists = true;
            }

        }
        if (isMineExists) i--;
        else minePoss.push(currMinePos);
    }

    //locates mines
    for (var i = 0; i < minePoss.length; i++) {
        var currMinePos = minePoss[i];
        board[currMinePos.i][currMinePos.j] = MINE;
    }

    //locates game numbers
    for (var i = 0; i < gCurrSize; i++) {
        for (var j = 0; j < gCurrSize; j++) {
            if (board[i][j] === MINE) continue;
            var currPos = { i: i, j: j }
            var mineNeigNum = getCellNegsCount(board, currPos)
            if (mineNeigNum) board[i][j] = mineNeigNum;
        }
    }
}


//runs the basics to start or restart
function init(board, level, cellClicked) {
    setHighScore(level);
    gStats.isGame = true;
    gStats.startTime = 0;
    gCurrSize = DIFFICULTIES[level].size;
    buildBoard(board, DIFFICULTIES[level].mines, cellClicked)
    renderBoard(board, cellClicked)
    gStats.flags = 0;
    gStats.clock = 0;
    renderFlags()
    setSmiley('new')
}

//takes care of the event of a Left click, reveals the cell and checks for victory
function cellClicked(elCell) {
    if (!gStats.isGame || gStats.isProccessing) return;
    if (elCell.classList.contains('flagged')) return;
    var cellPos = getCellPos(elCell)
    //makes sure the first click won't be a mine, game really starts here
    if (!gStats.startTime) {
        // CR - instead of using startTime as a condition, consider something like isFirstClick:
        // CR...false at first and given the value true here. That would eliminate the need for the setTimeout.
        gStats.isProccessing = true;
        // CR - You shouldn't call init twice for every game
        init(gBoard, gCurrLevel, cellPos)
        gTimeInterval = setInterval(setClock, 500);
        elCell.classList.remove('covered')
        setTimeout(() => {
            gStats.isProccessing = false;
        }, 500);
    }
    elCell.classList.remove('covered')
    if (gBoard[cellPos.i][cellPos.j] === MINE) gameOver(false)
    else if (gBoard[cellPos.i][cellPos.j] === EMPTY) revealNeig(cellPos);
    revealCells(true);
}

//reveals all the cells around a blank cell
function revealNeig(cellPos) {
    for (var i = -1; i <= 1; i++) {
        for (var j = -1; j <= 1; j++) {
            var posToCheck = { i: cellPos.i + i, j: cellPos.j + j }
            if (posToCheck.i < 0 || posToCheck.i > gCurrSize - 1 || posToCheck.j < 0 || posToCheck.j > gCurrSize - 1) continue;
            var idStr = 'cell-' + posToCheck.i + '-' + posToCheck.j;
            var cell = document.getElementById(idStr)
            if (gBoard[posToCheck.i][posToCheck.j] === EMPTY) {
                // CR - If you're not a fan of 'continue', than there are better alternatives than this :)
                if (i === 0 && j === 0) var x;
                else if (!cell.classList.contains('covered')) var x;
                else revealNeig(posToCheck)
            }
            if (!cell.classList.contains('flagged')) cell.classList.remove('covered')
        }
    }
}

//shuts down clock and clicking ability if user won or lost, sets the smiley accordingly
function gameOver(isWin) {
    // var announc = document.querySelector('.announce')
    gStats.isGame = false;
    clearInterval(gTimeInterval)

    // announc.classList.remove ('invisible')
    if (!isWin) {
        revealCells(false)
        setSmiley('lose')
        // announc.innerHTML = 'YOU LOSE!'
    } else {
        setHighScore(gCurrLevel, true)
        setSmiley('win')
        // announc.innerHTML = 'YOU WIN!';
    }
}

//checks the score and sets it as highscore in local storage
function setHighScore(lvl, isFinish) {
    var propertyList = ['easy score', 'normal score', 'hard score']
    var currProperty = propertyList[lvl];
    var elHighScore = document.querySelector('.high-score')
    if (isFinish) {
        var highScore = localStorage.getItem(currProperty)
        if (gStats.clock < highScore) localStorage.setItem(currProperty, gStats.clock);
        elHighScore.innerHTML = localStorage.getItem(currProperty);
    }
    else {
        // debugger;
        if (!localStorage.getItem(currProperty)) {
            localStorage.setItem(currProperty, Infinity)
            elHighScore.innerHTML = 'none yet'
        } else if (localStorage.getItem(currProperty) == Infinity) elHighScore.innerHTML = 'none yet'
        else elHighScore.innerHTML = localStorage.getItem(currProperty);
    }
}

//restarts the game in given level
function restart(lvl) {
    clearInterval(gTimeInterval)
    gStats.isGame = false;
    gBoard = [];
    document.querySelector('tbody').innerHTML = '';
    init(gBoard, lvl, undefined)
}

//gets the new level and restarts the game in given level
function changeLevel(newLvl) {
    gCurrLevel = DIFFICULTIES[newLvl].lvl
    restart(gCurrLevel);
}

// function test (ev) {
//     console.log(ev.which);

// }