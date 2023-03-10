const chai = require('chai');
const assert = chai.assert;

const Solver = require('../controllers/sudoku-solver.js');
let solver = new Solver;

const puzzleStrings = require('../controllers/puzzle-strings.js');

suite('Unit Tests', function() {
  this.timeout(5000);
  
  test('Logic handles a valid puzzle string of 81 characters', () => {
    let samplePuzzle = "..9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..";
    let testResult = solver.validate(samplePuzzle);
    assert.equal(testResult, 'valid');
  });

  test("Logic handles a puzzle string with invalid characters (not 1-9 or .)", () => {
    let samplePuzzle = "..9..5.1.85.4....2432..h...1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..";
    let testResult = solver.validate(samplePuzzle);
    assert.deepEqual(testResult, { error: "Invalid characters in puzzle"});
  });

  test("Logic handles a puzzle string that is not 81 characters in length", () => {
    let samplePuzzle = "..9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..more";
    let testResult = solver.validate(samplePuzzle);
    assert.deepEqual(testResult, { error: "Expected puzzle to be 81 characters long"});
  });

  test("Logic handles a valid row placement", () => {
    let samplePuzzle = "..9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..";
    let testResult = solver.checkRowPlacement(samplePuzzle, "A", "1", "7");
    assert.equal(testResult, true);
  });

  test("Logic handles an invalid row placement", () => {
    let samplePuzzle = "..9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..";
    let testResult = solver.checkRowPlacement(samplePuzzle, "A", "1", "1");
    assert.equal(testResult, false);
  });

  test("Logic handles a valid column placement", () => {
    let samplePuzzle = "..9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..";
    let testResult = solver.checkColPlacement(samplePuzzle, "A", "2", "7");
    assert.equal(testResult, true);
  });

  test("Logic handles an invalid column placement", () => {
    let samplePuzzle = "..9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..";
    let testResult = solver.checkColPlacement(samplePuzzle, "A", "4", "7");
    assert.equal(testResult, false);
  });

  test("Logic handles a valid region (3x3 grid) placement", () => {
    let samplePuzzle = "..9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..";
    let testResult = solver.checkRegionPlacement(samplePuzzle, "B", "5", "3");
    assert.equal(testResult, true);
  });

  test("Logic handles an invalid region (3x3 grid) placement", () => {
    let samplePuzzle = "..9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..";
    let testResult = solver.checkRegionPlacement(samplePuzzle, "B", "5", "5");
    assert.equal(testResult, false);
  });

  test("Valid puzzle strings pass the solver", () => {
    let samplePuzzle = "..9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..";
    let result = solver.solve(samplePuzzle);
    assert.isString(result.solution);
    assert.isTrue(/^[1-9]{81}$/.test(result.solution));
  });

  test("Invalid puzzle strings fail the solver", () => {
    let samplePuzzle = "..9..5.1.85.4....2432......1...99.83.9.....6.62.71...9......1945....4.37.4.3..6..";
    let result = solver.solve(samplePuzzle);
    assert.deepEqual(result, { error: 'Puzzle cannot be solved' });
  });

  test("Solver returns the expected solution for an incomplete puzzle", () => {
    let puzzles = puzzleStrings.puzzlesAndSolutions;
    let result1 = solver.solve(puzzles[0][0]);
    let result2 = solver.solve(puzzles[1][0]);
    let result3 = solver.solve(puzzles[2][0]);
    let result4 = solver.solve(puzzles[3][0]);
    let result5 = solver.solve(puzzles[4][0]);
    
    assert.equal(puzzles[0][1], result1.solution);
    assert.equal(puzzles[1][1], result2.solution);
    assert.equal(puzzles[2][1], result3.solution);
    assert.equal(puzzles[3][1], result4.solution);
    assert.equal(puzzles[4][1], result5.solution);
  });

});
