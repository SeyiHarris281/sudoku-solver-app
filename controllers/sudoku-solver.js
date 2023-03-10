class SudokuSolver {

  validate(puzzleString) {
    if(!puzzleString || puzzleString.length === 0) return { error: "Required field missing" };
    if(puzzleString.length !== 81) return { error: "Expected puzzle to be 81 characters long" };
    if(!/^(\d|\.)+$/.test(puzzleString)) return { error: "Invalid characters in puzzle" };

    return "valid";
    
  }

  checkRowPlacement(puzzleString, row, column, value) {
    let rowCheck = true; // value CAN be added to row

    let rowNum = row.charCodeAt(0) - 64;

    // "value" already exists at given coordinates
    if(puzzleString[(rowNum - 1) * 9 + (+column) - 1] == value) {
      return rowCheck;
    }

    // suggested coords already filled with another value
    if(puzzleString[(rowNum - 1) * 9 + (+column) - 1] !== "." && puzzleString[(rowNum - 1) * 9 + column - 1] !== value) {
      return "location already filled with a valid value";
    }
    
    const start = (rowNum - 1) * 9;
    const end = start + 8;

    for(let i = start; i <= end; ++i) {
      if(puzzleString[i] == value) {
        rowCheck = false; // value CANNOT be added to column as it is already present
        break;
      }
    }
    
    return rowCheck;
    
  }

  checkColPlacement(puzzleString, row, column, value) {
    let colCheck = true // value CAN be added to column

    let rowNum = row.charCodeAt(0) - 64;

    // "value" already exists at given coordinates
    if(puzzleString[(rowNum - 1) * 9 + (+column) - 1] == value) {
      return colCheck;
    }

    // suggested coords already filled with another value
    if(puzzleString[(rowNum - 1) * 9 + (+column) - 1] !== "." && puzzleString[(rowNum - 1) * 9 + column - 1] !== value) {
      return "location already filled with a valid value";
    }
    
    for (let i = 0; i <= 8; ++i) {
      if(puzzleString[+column - 1 + i * 9] == value) {
        colCheck = false; // value CANNOT be added to column as it is already present
        break;
      }
    }
    
    return colCheck;
  }

  checkRegionPlacement(puzzleString, row, column, value) {
    let regionCheck = true; // meaning value CAN be added to region

    let rowNum = row.charCodeAt(0) - 64;

    // "value" already exists at given coordinates
    if(puzzleString[(rowNum - 1) * 9 + (+column) - 1] == value) {
      return regionCheck;
    }

    // suggested coords already filled with another value
    if(puzzleString[(rowNum - 1) * 9 + (+column) - 1] !== "." && puzzleString[(rowNum - 1) * 9 + column - 1] !== value) {
      return "location already filled with a valid value";
    }
    
    // Identify region
    let region, possibleRegions;
    switch(row) {
      case "A":
      case "B":
      case "C":
        possibleRegions = [1, 2, 3];
        break;
      case "D":
      case "E":
      case "F":
        possibleRegions = [4, 5, 6];
        break;
      case "G":
      case "H":
      case "I":
        possibleRegions = [7, 8, 9];
    }

    switch(column) {
      case "1":
      case "2":
      case "3":
        region = possibleRegions[0];
        break;
      case "4":
      case "5":
      case "6":
        region = possibleRegions[1];
        break;
      case "7":
      case "8":
      case "9":
        region = possibleRegions[2];
        break;
    }
    
    // Identify coordinate of top-left corner
    let topLeftCorner = this.getTopLeftCorner(region);
    
    //-- Loop through rows
    for (let i = topLeftCorner; i <= (topLeftCorner + 18); i += 9) {
      //-- Loop through columns
      for(let j = i; j <= i + 2; j++) {
        if(puzzleString[j] == value) {
          regionCheck = false; // value CANNOT be added to region as it is already present
          break;
        }
      }
      
      if(regionCheck == false) {
        break;
      }
    }
    
    return regionCheck;
  }
  

  solve(puzzleString) {
    let validation = this.validate(puzzleString);
    if (validation !== 'valid') {
      return validation;
    }
    let activePuzzle = puzzleString.slice();
    
    let regionsArray = this.createRegionsArray(puzzleString);
    let solvable = true;
    let updated = false;
    let totalEmptyPositions = regionsArray.reduce((total, el) => total + el.countOfEmpty, 0);

    while (solvable && totalEmptyPositions > 0) {
      updated = false;
      regionsArray.sort((a,b) => a.countOfEmpty - b.countOfEmpty);

      for (let region of regionsArray) {
        
        for (let missNum of region.missingNums) {
          
          let locOptions = [];
          for (let emptyLoc of region.emptyPositions) {
            
            let rowCheck = this.checkRowPlacement(activePuzzle, emptyLoc[0], emptyLoc[1], missNum);
            let colCheck = this.checkColPlacement(activePuzzle, emptyLoc[0], emptyLoc[1], missNum);
            let regCheck = this.checkRegionPlacement(activePuzzle, emptyLoc[0], emptyLoc[1], missNum);

            if (rowCheck && colCheck && regCheck) {
              locOptions.push(emptyLoc);
            }
            
          }

          if (locOptions.length === 1) {
            // confiermed only valid location
            let confirmed = locOptions[0];
            // update activePuzzle
            let index = (confirmed[0].charCodeAt(0) - 65) * 9 + (+confirmed[1]) - 1;
            
            activePuzzle = activePuzzle.substring(0, index) + missNum + activePuzzle.substring(index + 1);
            // update missingNums
            let updatedMissingNums = region.missingNums.filter(el => el !== missNum);
            region.missingNums.length = 0;
            region.missingNums.push(...updatedMissingNums);
            // update emptyPositions
            let updatedEmptyPositions = region.emptyPositions.filter(el => el !== confirmed);
            region.emptyPositions.length = 0;
            region.emptyPositions.push(...updatedEmptyPositions);
            // update countOfEmpty
            --region.countOfEmpty;
            // set updated to true
            updated = true;
          }
          
        }
      }

      solvable = updated;
      totalEmptyPositions = regionsArray.reduce((total, el) => total + el.countOfEmpty, 0);
    }

    if (totalEmptyPositions === 0) {
      return { solution: activePuzzle };
    } else {
      return { error: 'Puzzle cannot be solved' };
    }
    
    
    
  }

  
  getTopLeftCorner(region) {
    
    switch(region) {
      case 1:
        return 0;
      case 2:
        return 3;
      case 3:
        return 6;
      case 4:
        return 27;
      case 5:
        return 30;
      case 6:
        return 33;
      case 7:
        return 54;
      case 8:
        return 57;
      case 9:
        return 60;
    }
    
  }

  createRegionsArray(puzzleString) {
    // create regions array
    const regionsArray = [];
    
    // loop through regions
    for (let i = 1; i <= 9; ++i) {
      let topLeftCorner = this.getTopLeftCorner(i);
      let missingNums = ["1","2","3","4","5","6","7","8","9"];
      let emptyPositions = []; 
      let countOfEmpty = 0;
      
      //-- Loop through rows
      for (let j = topLeftCorner; j <= (topLeftCorner + 18); j += 9) {
        
        //-- Loop through columns
        for (let k = j; k <= j + 2; k++) {
          
          if (missingNums.includes(puzzleString[k])) {
            let updatedMissingNums = missingNums.filter(el => el !== puzzleString[k]);
            missingNums.length = 0;
            missingNums.push(...updatedMissingNums);
          } else {
            let rowIndex = Math.floor(k/9);
            let rowLetter = String.fromCharCode(rowIndex + 65);
            let colNum = k - rowIndex * 9 + 1;
            emptyPositions.push(`${rowLetter}${colNum}`);
            ++countOfEmpty;
          }
          
        }
        
      }

      let newRegion = {
        region: i,
        missingNums,
        emptyPositions,
        countOfEmpty
      };

      regionsArray.push(newRegion);
    }
    return regionsArray;
  }
  
}

module.exports = SudokuSolver;

