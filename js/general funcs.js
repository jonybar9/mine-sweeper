// CR - Avoid spaces in your file names.
// CR - Most of these functions are specific to the game (meaning they're not so general).

//print the board to the DOM and sets classes and ID to each cell
function renderBoard(board, cellClicked) {
    // CR - Nice usage
    var numList = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine']
    var strHTML = '';
    for (var i = 0; i < gCurrSize; i++) {
        strHTML += '<tr>'
        for (var j = 0; j < gCurrSize; j++) {
            var currCellVal = board[i][j]
            var currValueName;
            if (!currCellVal) currValueName = 'empty';
            else if (currCellVal === '*') currValueName = 'mine';
            else currValueName = numList[currCellVal]
            
            var addClass = `class = "covered ${currValueName}"`
            // BUG FIX: makes sure the clicked cell is revealed immidiately
            if (currCellVal === '*') currCellVal = ''
            if (cellClicked && cellClicked.i === i && cellClicked.j === j) addClass = `class = "${currValueName}"`;
            strHTML += `<td ${addClass}  id ="cell-${i}-${j}" onclick = "cellClicked (this)"
                        oncontextmenu = "flag(this)">${currCellVal}</td>`
            // strHTML += `<td ${addClass}  id ="cell-${i}-${j}" onmouseup = "mouseUp (this, event)">${board[i][j]}</td>`
        }
        strHTML += '</tr>'
    }
    strHTML += '</tr>'

    document.querySelector('tbody').innerHTML = strHTML;
}


//counts how many mines are there around the cell
function getCellNegsCount(board, pos) {
    var mineCount = 0;
    for (var i = -1; i <= 1; i++) {
        for (var j = -1; j <= 1; j++) {
            if (i === 0 && j === 0) continue;
            var currI = pos.i + i;
            var currJ = pos.j + j;
            if (currI < 0 || currJ < 0 || currI > gCurrSize - 1 || currJ > gCurrSize - 1) continue;
            var currCell = board[currI][currJ]
            if (currCell === MINE) mineCount++;
        }
    }
    return mineCount;
}

//flags or unflags a cell on right click
function flag(elCell) {
    if (!gStats.isGame) return;
    if (elCell.classList.contains('flagged')) {
        elCell.classList.remove('flagged')
        gStats.flags--;

    } else if (elCell.classList.contains('covered')) {
        elCell.classList.add('flagged')
        gStats.flags++;
    }
    renderFlags()
}

//prints number of flags left to win
function renderFlags() {
    //first rendering happens on init()
    var elCounter = document.querySelector('.flag-count')
    // CR - This next line does not really belong here, the flag function is a better fit for it.
    if (gStats.flags === DIFFICULTIES[gCurrLevel].mines) revealCells(true);
    elCounter.innerText = '🚩 ' + (DIFFICULTIES[gCurrLevel].mines - gStats.flags);
}

// CR -  This is a function invocation - not a declaration.
// CR... This code runs when the file first loads. 
//cancels the Right-Click menu opening
addEventListener('contextmenu', function (ev) {
    ev.preventDefault();
    return false;
}, false);

//renders the clock
function setClock() {
    if (!gStats.startTime) gStats.startTime = Date.now()
    var currDiff = Date.now() - gStats.startTime;
    gStats.clock = Math.floor(currDiff / 1000);
    document.querySelector('.clock').innerText = '⏱ ' + gStats.clock;
}

//runs on the Mat, if user lost, reveals all mines, if all flags are right and no covered cells runs victory func
function revealCells(isWin) {
    var rightFlagCount = 0;
    var coveredCells = -DIFFICULTIES[gCurrLevel].mines;
    for (var i = 0; i < gCurrSize; i++) {
        for (var j = 0; j < gCurrSize; j++) {
            var currPos = { i: i, j: j }
            var idStr = 'cell-' + currPos.i + '-' + currPos.j;
            var cell = document.getElementById(idStr)
            if (!isWin) {
                if (gBoard[i][j] === MINE && !cell.classList.contains('flagged')) {
                    cell.classList.remove('covered');
                }
                else if (gBoard[i][j] !== MINE && cell.classList.contains('flagged')) {
                    // CR - Nice, even though currently this class changes nothing visually.
                    cell.classList.add('wrong');
                }
            } else {
                if (cell.classList.contains('covered')) coveredCells++;
                if (gBoard[i][j] === MINE && cell.classList.contains('flagged')) rightFlagCount++
            }
        }
    }
    if (rightFlagCount === DIFFICULTIES[gCurrLevel].mines && !coveredCells) gameOver(true);
}

//gets a random position on the board
function getRandPos(SIZE) {
    var pos = {
        i: Math.floor(Math.random() * SIZE),
        j: Math.floor(Math.random() * SIZE)
    }
    return pos;
}

//gets an element and returns its position as an object
function getCellPos(elCell) {
    var cellPos = {}
    var cellId = elCell.id;
    cellPos.i = +cellId.substring(5, 6)
    cellPos.j = +cellId.substring(7, 8)
    return cellPos;
}

//sets and renders the smiley button
function setSmiley(gameStat) {
    var elSmiley = document.querySelector('.smiley')
    if (gameStat === 'win') elSmiley.innerHTML = '😎'
    else if (gameStat === 'new') elSmiley.innerHTML = '😊'
    else if (gameStat === 'lose') elSmiley.innerHTML = '💀'
}

// function mouseUp (elCell, ev) {
    // if (ev.which === 1) cellClicked (elCell)
    // else if (ev.which === 3) oncontextmenu = flag(elCell)
// }