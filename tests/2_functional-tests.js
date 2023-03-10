const chai = require("chai");
const chaiHttp = require('chai-http');
const assert = chai.assert;
const server = require('../server');

const puzzleStrings = require('../controllers/puzzle-strings.js');
const puzzles = puzzleStrings.puzzlesAndSolutions;

chai.use(chaiHttp);

suite('Functional Tests', () => {
  test("Solve a puzzle with valid puzzle string: POST request to /api/solve", (done) => {
    chai
      .request(server)
      .post('/api/solve')
      .type('form')
      .send({ 'puzzle': puzzles[0][0]})
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.body.solution, puzzles[0][1]);
        done();
      });
  });

  test("Solve a puzzle with missing puzzle string: POST request to /api/solve", (done) => {
    chai
      .request(server)
      .post('/api/solve')
      .type('form')
      .send({})
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, { error: "Required field missing" });
        done();
      });
  });

  test("Solve a puzzle with invalid characters: POST request to /api/solve", (done) => {
    const invalidCharPuzz = "..9..5.1.85.4....2432..inv.1...69.83.9.....6.62.71...9.char.1945....4.37.4.3..6.."; 
    chai
      .request(server)
      .post('/api/solve')
      .type('form')
      .send({ puzzle: invalidCharPuzz })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, { error: "Invalid characters in puzzle" });
        done();
      });
  });

  test("Solve a puzzle with incorrect length: POST request to /api/solve", (done) => {
    const tooLongPuzz = "..9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6...."; 
    chai
      .request(server)
      .post('/api/solve')
      .type('form')
      .send({ puzzle: tooLongPuzz })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, { error: "Expected puzzle to be 81 characters long" });
        done();
      });
  });

  test("Solve a puzzle that cannot be solved: POST request to /api/solve", (done) => {
    const unsolvablePuzz = "..9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1..5....4.37.4.3..6.."; 
    chai
      .request(server)
      .post('/api/solve')
      .type('form')
      .send({ puzzle: unsolvablePuzz })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, { error: 'Puzzle cannot be solved' });
        done();
      });
  });

  test("Check a puzzle placement with all fields: POST request to /api/check", (done) => {
    const samplePuzzle = "..9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..";
    chai
      .request(server)
      .post('/api/check')
      .type('form')
      .send({ puzzle: samplePuzzle, coordinate: "A4", value: "6" })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.isTrue(res.body.valid);
        done();
      });
    
  });

  test("Check a puzzle placement with single placement conflict: POST request to /api/check", (done) => {
    const samplePuzzle = "..9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..";
    chai
      .request(server)
      .post('/api/check')
      .type('form')
      .send({ puzzle: samplePuzzle, coordinate: "A4", value: "9" })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.isFalse(res.body.valid);
        assert.isArray(res.body.conflict);
        assert.equal(res.body.conflict.length, 1);
        assert.equal(res.body.conflict[0], "row");
        done();
      });
  });

  test("Check a puzzle placement with multiple placement conflicts: POST request to /api/check", (done) => {
    const samplePuzzle = "..9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..";
    chai
      .request(server)
      .post('/api/check')
      .type('form')
      .send({ puzzle: samplePuzzle, coordinate: "B3", value: "9" })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.isFalse(res.body.valid);
        assert.isArray(res.body.conflict);
        assert.equal(res.body.conflict.length, 2);
        assert.include(res.body.conflict, "col");
        assert.include(res.body.conflict, "region");
        done();
      });
  });

  test("Check a puzzle placement with all placement conflicts: POST request to /api/check", (done) => {
    const samplePuzzle = "..9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..";
    chai
      .request(server)
      .post('/api/check')
      .type('form')
      .send({ puzzle: samplePuzzle, coordinate: "D3", value: "9" })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.isFalse(res.body.valid);
        assert.isArray(res.body.conflict);
        assert.equal(res.body.conflict.length, 3);
        assert.include(res.body.conflict, "row");
        assert.include(res.body.conflict, "col");
        assert.include(res.body.conflict, "region");
        done();
      });
  });

  test("Check a puzzle placement with missing required fields: POST request to /api/check", (done) => {
    const samplePuzzle = "..9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..";
    chai
      .request(server)
      .post('/api/check')
      .type('form')
      .send({ coordinate: "D3", value: "9" })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.body.error, "Required field(s) missing");
        done();
      });
  });

  test("Check a puzzle placement with invalid characters: POST request to /api/check", (done) => {
    const invCharPuzzle = "..9..5.1.85.4....2432.inv..1...69.83.9.....6.62.71...9.char.1945....4.37.4.3..6..";
    chai
      .request(server)
      .post('/api/check')
      .type('form')
      .send({ puzzle: invCharPuzzle, coordinate: "D3", value: "9" })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.body.error, "Invalid characters in puzzle");
        done();
      });
  });

  test("Check a puzzle placement with incorrect length: POST request to /api/check", (done) => {
    const tooShortPuzzle = "..9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6";
    chai
      .request(server)
      .post('/api/check')
      .type('form')
      .send({ puzzle: tooShortPuzzle, coordinate: "D3", value: "9" })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.body.error, "Expected puzzle to be 81 characters long");
        done();
      });
  });

  test("Check a puzzle placement with invalid placement coordinate: POST request to /api/check", (done) => {
    const samplePuzzle = "..9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..";
    chai
      .request(server)
      .post('/api/check')
      .type('form')
      .send({ puzzle: samplePuzzle, coordinate: "D33", value: "9" })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.body.error, "Invalid coordinate");
        done();
      });
  });

  test("Check a puzzle placement with invalid placement value: POST request to /api/check", (done) => {
    const samplePuzzle = "..9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..";
    chai
      .request(server).keepOpen()
      .post('/api/check')
      .type('form')
      .send({ puzzle: samplePuzzle, coordinate: "D3", value: "69" })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.body.error, "Invalid value");
        done();
      });
  });
});

