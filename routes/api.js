'use strict';

const SudokuSolver = require('../controllers/sudoku-solver.js');

module.exports = function (app) {
  
  let solver = new SudokuSolver();

  app.route('/api/check')
    .post((req, res) => {
      
      let puzzle = req.body.puzzle;
      let coord = req.body.coordinate.toUpperCase();
      let value = req.body.value;

      

      if ((!puzzle) || (!coord) || (!value)) {
        return res.json({ error: 'Required field(s) missing' });
      }

      let puzzleValidation = solver.validate(puzzle);

      if (puzzleValidation !== 'valid') {
        return res.json(puzzleValidation);
      }

      if (!(/^[A-I][1-9]$/.test(coord))) {
        return res.json({ error: "Invalid coordinate" });
      }

      if (!(/^[1-9]$/.test(value))) {
        return res.json({ error: "Invalid value" });
      }

      let rowCheck = solver.checkRowPlacement(puzzle, coord[0], coord[1], value);
      let colCheck = solver.checkColPlacement(puzzle, coord[0], coord[1], value);
      let regionCheck = solver.checkRegionPlacement(puzzle, coord[0], coord[1], value);

      if (rowCheck && colCheck && regionCheck) {
        return res.json({ valid: true });
      } else {
        let conflict = [];
        if (!rowCheck) conflict.push("row");
        if (!colCheck) conflict.push("col");
        if (!regionCheck) conflict.push("region");
        return res.json({ valid: false, conflict });
      }
      
    });
    
  app.route('/api/solve')
    .post((req, res) => {
      let puzzle = req.body.puzzle;
      let result = solver.solve(puzzle);
      
      res.json(result);

    });
};
