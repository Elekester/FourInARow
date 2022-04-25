/******************************************************************************
 * Four In A Row
 * 
 * v. alpha-2022-04-18-a
 ******************************************************************************
 * Changelog:
 * 
 * March 24, 2022                                         v. alpha 2022-04-24-a
 * - Added GUI for human play.
 *
 * March 18, 2022                                         v. alpha 2022-04-18-a
 * - Began creating website. Currently the board appears, though nothing is
 *   functional.
 *
 * March 17, 2022                                         v. alpha 2022-04-17-b
 * - Completed the game, negamax, and demo modes.
 * 
 * March 17, 2022                                         v. alpha 2022-04-17-a
 * - Restarted the project so that I would have less spaghetti code. The main
 *   reason is so that negamax can be its own function independent of the game.
 *   This should improve debugging, but I still have quite a bit to translate
 *   over from the previous build.
 * 
 * March 16, 2022                                         v. alpha-2022-04-16-b
 * - Did everything but transposition table.
 * - Discovered a bug in the win checker. It doesn't look like Player O and
 *   draws aren't being checked correctly.
 * 
 * March 16, 2022                                         v. alpha-2022-04-16-a
 * - Implemented a winner getter prototype.
 * - Implemented a print function to display the board in the console.
 *
 * March 14, 2022                                         v. alpha-2022-04-14-b
 * - Implemented a move generator for negamax and for the game itself.
 * - Implemented moving in the game.
 * 
 * March 14, 2022                                         v. alpha-2022-04-14-a
 * - Began project.
 ******************************************************************************
 * To-do:
 * 
 * [x] 1. Write negamax function.
 * [x] 2. Create FourInARow class.
 * [x] 3. Create FourInARow prototype function for logging the game to the console.
 * [x] 4. Create FourInARow prototype getters necessary for negamax.
 *        [x] a. Create children getter.
 *        [x] b. Create heuristicValue getter.
 *        [x] c. Create terminal getter.
 * [x] 5. Create FourInARow demo modes.
 *        [x] a. Create an AI vs. AI demo.
 *        [x] b. Create a Human vs. AI demo.
 * [x] 6. Create a GUI.
 * [ ] 7. Implement CPU play for GUI.
 * [ ] 8. Implement transposition tables for negamax.
 ******************************************************************************
 * Introduction:
 * 
 * Four In A Row is a game played with students at Mathnasium. The goal is to
 * connect four squares in a row by using multiplication facts using only one-
 * digit numbers.
 * 
 * The board looks like this.
 * 
 * |  1 |  2 |  3 |  4 |  5 |  6 |
 * |  7 |  8 |  9 | 10 | 12 | 14 |
 * | 15 | 16 | 18 | 20 | 21 | 24 |
 * | 25 | 27 | 28 | 30 | 32 | 35 |
 * | 36 | 40 | 42 | 45 | 48 | 49 |
 * | 54 | 56 | 63 | 64 | 72 | 81 |
 *
 * | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 |
 *
 * The top board is where you are trying to make four in a row. The bottom
 * board has the numbers 1 through 9. On the bottom board are two markers. On a
 * player's turn they may move one of the markers to a different number and
 * multiply the numbers under the two markers together. They then put their
 * mark on the result on the top board. If the number spot is already taken,
 * they have to make a different move.
 *
 * There are different ways to choose the starting position of the two markers.
 * Here's a few methods:
 * 1. Randomly place both markers. The first player then makes their move.
 * 2. The first player places the first marker and the second player places the
 *    second marker. The first player then makes their move.
 * 3. The second player places both markers. Then the first player makes their
 *    move.
 * 4. The first player places both markers and multiplies the two numbers as
 *    their first move. The second player then makes their move.
 ******************************************************************************
 * Copyright 2022 Clayton P Craig
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to
 * deal in the Software without restriction, including without limitation the
 * rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
 * sell copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 * IN THE SOFTWARE.
 *****************************************************************************/
 
// Version Information

const version = 'v. alpha 2022-04-24-a'

/** Class representing a game of Four In A Row. */
class FourInARow {
	/**
	 * Create a game of Four In A Row.
	 * @param {number} n - The number that the first marker is on.
	 * @param {number} m - The number that the second marker is on.
	 * @param {number} turn - 1 for First Player. -1 for Second Player
	 * @param {number[]} board - The bitboard. Each character represents a position on the board, as read left to right, top to bottom. A 0 entry means that no one has played there, 1 for First Player, -1 for Second Player.
	 */
	constructor(n = 1, m = 1, turn = 1, board = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]) {
		this.n = n;
	 	this.m = m;
		this.turn = turn;
		this.board = board;
	}
	
	
	
	// Precomputed bitboard helpers.
	
	/** The numbers at each board position, by index. */
	static boardNumbers = [1,2,3,4,5,6,7,8,9,10,12,14,15,16,18,20,21,24,25,27,28,30,32,35,36,40,42,45,48,49,54,56,63,64,72,81];
	
	/** An array of array of numbers. Each array of numbers represents the board positions of four positions that make four in a row. */
	static fourInARows = [[0,1,2,3],[1,2,3,4],[2,3,4,5],[6,7,8,9],[7,8,9,10],[8,9,10,11],[12,13,14,15],[13,14,15,16],[14,15,16,17],[18,19,20,21],[19,20,21,22],[20,21,22,23],[24,25,26,27],[25,26,27,28],[26,27,28,29],[30,31,32,33],[31,32,33,34],[32,33,34,35],[0,6,12,18],[1,7,13,19],[2,8,14,20],[3,9,15,21],[4,10,16,22],[5,11,17,23],[6,12,18,24],[7,13,19,25],[8,14,20,26],[9,15,21,27],[10,16,22,28],[11,17,23,29],[12,18,24,30],[13,19,25,31],[14,20,26,32],[15,21,27,33],[16,22,28,34],[17,23,29,35],[3,8,13,18],[9,14,19,24],[4,9,14,19],[15,20,25,30],[10,15,20,25],[5,10,15,20],[16,21,26,31],[11,16,21,26],[17,22,27,32],[12,19,26,33],[6,13,20,27],[13,20,27,34],[0,7,14,21],[7,14,21,28],[14,21,28,35],[1,8,15,22],[8,15,22,29],[2,9,16,23]];
	
	/** A table of arrays of legal moves. legalMarkersFromMarkers[i][j] will be an array of legal marker moves [n,m] (with n < m) when the markers are at (i,j). i and j must be integers from 1 to 9.*/
	static legalMarkersFromMarkers = [null,[null,[[1,2],[1,3],[1,4],[1,5],[1,6],[1,7],[1,8],[1,9]],[[1,1],[1,3],[1,4],[1,5],[1,6],[1,7],[1,8],[1,9],[2,2],[2,3],[2,4],[2,5],[2,6],[2,7],[2,8],[2,9]],[[1,1],[1,2],[1,4],[1,5],[1,6],[1,7],[1,8],[1,9],[2,3],[3,3],[3,4],[3,5],[3,6],[3,7],[3,8],[3,9]],[[1,1],[1,2],[1,3],[1,5],[1,6],[1,7],[1,8],[1,9],[2,4],[3,4],[4,4],[4,5],[4,6],[4,7],[4,8],[4,9]],[[1,1],[1,2],[1,3],[1,4],[1,6],[1,7],[1,8],[1,9],[2,5],[3,5],[4,5],[5,5],[5,6],[5,7],[5,8],[5,9]],[[1,1],[1,2],[1,3],[1,4],[1,5],[1,7],[1,8],[1,9],[2,6],[3,6],[4,6],[5,6],[6,6],[6,7],[6,8],[6,9]],[[1,1],[1,2],[1,3],[1,4],[1,5],[1,6],[1,8],[1,9],[2,7],[3,7],[4,7],[5,7],[6,7],[7,7],[7,8],[7,9]],[[1,1],[1,2],[1,3],[1,4],[1,5],[1,6],[1,7],[1,9],[2,8],[3,8],[4,8],[5,8],[6,8],[7,8],[8,8],[8,9]],[[1,1],[1,2],[1,3],[1,4],[1,5],[1,6],[1,7],[1,8],[2,9],[3,9],[4,9],[5,9],[6,9],[7,9],[8,9],[9,9]]],[null,[[1,1],[1,3],[1,4],[1,5],[1,6],[1,7],[1,8],[1,9],[2,2],[2,3],[2,4],[2,5],[2,6],[2,7],[2,8],[2,9]],[[1,2],[2,3],[2,4],[2,5],[2,6],[2,7],[2,8],[2,9]],[[1,2],[1,3],[2,2],[2,4],[2,5],[2,6],[2,7],[2,8],[2,9],[3,3],[3,4],[3,5],[3,6],[3,7],[3,8],[3,9]],[[1,2],[1,4],[2,2],[2,3],[2,5],[2,6],[2,7],[2,8],[2,9],[3,4],[4,4],[4,5],[4,6],[4,7],[4,8],[4,9]],[[1,2],[1,5],[2,2],[2,3],[2,4],[2,6],[2,7],[2,8],[2,9],[3,5],[4,5],[5,5],[5,6],[5,7],[5,8],[5,9]],[[1,2],[1,6],[2,2],[2,3],[2,4],[2,5],[2,7],[2,8],[2,9],[3,6],[4,6],[5,6],[6,6],[6,7],[6,8],[6,9]],[[1,2],[1,7],[2,2],[2,3],[2,4],[2,5],[2,6],[2,8],[2,9],[3,7],[4,7],[5,7],[6,7],[7,7],[7,8],[7,9]],[[1,2],[1,8],[2,2],[2,3],[2,4],[2,5],[2,6],[2,7],[2,9],[3,8],[4,8],[5,8],[6,8],[7,8],[8,8],[8,9]],[[1,2],[1,9],[2,2],[2,3],[2,4],[2,5],[2,6],[2,7],[2,8],[3,9],[4,9],[5,9],[6,9],[7,9],[8,9],[9,9]]],[null,[[1,1],[1,2],[1,4],[1,5],[1,6],[1,7],[1,8],[1,9],[2,3],[3,3],[3,4],[3,5],[3,6],[3,7],[3,8],[3,9]],[[1,2],[1,3],[2,2],[2,4],[2,5],[2,6],[2,7],[2,8],[2,9],[3,3],[3,4],[3,5],[3,6],[3,7],[3,8],[3,9]],[[1,3],[2,3],[3,4],[3,5],[3,6],[3,7],[3,8],[3,9]],[[1,3],[1,4],[2,3],[2,4],[3,3],[3,5],[3,6],[3,7],[3,8],[3,9],[4,4],[4,5],[4,6],[4,7],[4,8],[4,9]],[[1,3],[1,5],[2,3],[2,5],[3,3],[3,4],[3,6],[3,7],[3,8],[3,9],[4,5],[5,5],[5,6],[5,7],[5,8],[5,9]],[[1,3],[1,6],[2,3],[2,6],[3,3],[3,4],[3,5],[3,7],[3,8],[3,9],[4,6],[5,6],[6,6],[6,7],[6,8],[6,9]],[[1,3],[1,7],[2,3],[2,7],[3,3],[3,4],[3,5],[3,6],[3,8],[3,9],[4,7],[5,7],[6,7],[7,7],[7,8],[7,9]],[[1,3],[1,8],[2,3],[2,8],[3,3],[3,4],[3,5],[3,6],[3,7],[3,9],[4,8],[5,8],[6,8],[7,8],[8,8],[8,9]],[[1,3],[1,9],[2,3],[2,9],[3,3],[3,4],[3,5],[3,6],[3,7],[3,8],[4,9],[5,9],[6,9],[7,9],[8,9],[9,9]]],[null,[[1,1],[1,2],[1,3],[1,5],[1,6],[1,7],[1,8],[1,9],[2,4],[3,4],[4,4],[4,5],[4,6],[4,7],[4,8],[4,9]],[[1,2],[1,4],[2,2],[2,3],[2,5],[2,6],[2,7],[2,8],[2,9],[3,4],[4,4],[4,5],[4,6],[4,7],[4,8],[4,9]],[[1,3],[1,4],[2,3],[2,4],[3,3],[3,5],[3,6],[3,7],[3,8],[3,9],[4,4],[4,5],[4,6],[4,7],[4,8],[4,9]],[[1,4],[2,4],[3,4],[4,5],[4,6],[4,7],[4,8],[4,9]],[[1,4],[1,5],[2,4],[2,5],[3,4],[3,5],[4,4],[4,6],[4,7],[4,8],[4,9],[5,5],[5,6],[5,7],[5,8],[5,9]],[[1,4],[1,6],[2,4],[2,6],[3,4],[3,6],[4,4],[4,5],[4,7],[4,8],[4,9],[5,6],[6,6],[6,7],[6,8],[6,9]],[[1,4],[1,7],[2,4],[2,7],[3,4],[3,7],[4,4],[4,5],[4,6],[4,8],[4,9],[5,7],[6,7],[7,7],[7,8],[7,9]],[[1,4],[1,8],[2,4],[2,8],[3,4],[3,8],[4,4],[4,5],[4,6],[4,7],[4,9],[5,8],[6,8],[7,8],[8,8],[8,9]],[[1,4],[1,9],[2,4],[2,9],[3,4],[3,9],[4,4],[4,5],[4,6],[4,7],[4,8],[5,9],[6,9],[7,9],[8,9],[9,9]]],[null,[[1,1],[1,2],[1,3],[1,4],[1,6],[1,7],[1,8],[1,9],[2,5],[3,5],[4,5],[5,5],[5,6],[5,7],[5,8],[5,9]],[[1,2],[1,5],[2,2],[2,3],[2,4],[2,6],[2,7],[2,8],[2,9],[3,5],[4,5],[5,5],[5,6],[5,7],[5,8],[5,9]],[[1,3],[1,5],[2,3],[2,5],[3,3],[3,4],[3,6],[3,7],[3,8],[3,9],[4,5],[5,5],[5,6],[5,7],[5,8],[5,9]],[[1,4],[1,5],[2,4],[2,5],[3,4],[3,5],[4,4],[4,6],[4,7],[4,8],[4,9],[5,5],[5,6],[5,7],[5,8],[5,9]],[[1,5],[2,5],[3,5],[4,5],[5,6],[5,7],[5,8],[5,9]],[[1,5],[1,6],[2,5],[2,6],[3,5],[3,6],[4,5],[4,6],[5,5],[5,7],[5,8],[5,9],[6,6],[6,7],[6,8],[6,9]],[[1,5],[1,7],[2,5],[2,7],[3,5],[3,7],[4,5],[4,7],[5,5],[5,6],[5,8],[5,9],[6,7],[7,7],[7,8],[7,9]],[[1,5],[1,8],[2,5],[2,8],[3,5],[3,8],[4,5],[4,8],[5,5],[5,6],[5,7],[5,9],[6,8],[7,8],[8,8],[8,9]],[[1,5],[1,9],[2,5],[2,9],[3,5],[3,9],[4,5],[4,9],[5,5],[5,6],[5,7],[5,8],[6,9],[7,9],[8,9],[9,9]]],[null,[[1,1],[1,2],[1,3],[1,4],[1,5],[1,7],[1,8],[1,9],[2,6],[3,6],[4,6],[5,6],[6,6],[6,7],[6,8],[6,9]],[[1,2],[1,6],[2,2],[2,3],[2,4],[2,5],[2,7],[2,8],[2,9],[3,6],[4,6],[5,6],[6,6],[6,7],[6,8],[6,9]],[[1,3],[1,6],[2,3],[2,6],[3,3],[3,4],[3,5],[3,7],[3,8],[3,9],[4,6],[5,6],[6,6],[6,7],[6,8],[6,9]],[[1,4],[1,6],[2,4],[2,6],[3,4],[3,6],[4,4],[4,5],[4,7],[4,8],[4,9],[5,6],[6,6],[6,7],[6,8],[6,9]],[[1,5],[1,6],[2,5],[2,6],[3,5],[3,6],[4,5],[4,6],[5,5],[5,7],[5,8],[5,9],[6,6],[6,7],[6,8],[6,9]],[[1,6],[2,6],[3,6],[4,6],[5,6],[6,7],[6,8],[6,9]],[[1,6],[1,7],[2,6],[2,7],[3,6],[3,7],[4,6],[4,7],[5,6],[5,7],[6,6],[6,8],[6,9],[7,7],[7,8],[7,9]],[[1,6],[1,8],[2,6],[2,8],[3,6],[3,8],[4,6],[4,8],[5,6],[5,8],[6,6],[6,7],[6,9],[7,8],[8,8],[8,9]],[[1,6],[1,9],[2,6],[2,9],[3,6],[3,9],[4,6],[4,9],[5,6],[5,9],[6,6],[6,7],[6,8],[7,9],[8,9],[9,9]]],[null,[[1,1],[1,2],[1,3],[1,4],[1,5],[1,6],[1,8],[1,9],[2,7],[3,7],[4,7],[5,7],[6,7],[7,7],[7,8],[7,9]],[[1,2],[1,7],[2,2],[2,3],[2,4],[2,5],[2,6],[2,8],[2,9],[3,7],[4,7],[5,7],[6,7],[7,7],[7,8],[7,9]],[[1,3],[1,7],[2,3],[2,7],[3,3],[3,4],[3,5],[3,6],[3,8],[3,9],[4,7],[5,7],[6,7],[7,7],[7,8],[7,9]],[[1,4],[1,7],[2,4],[2,7],[3,4],[3,7],[4,4],[4,5],[4,6],[4,8],[4,9],[5,7],[6,7],[7,7],[7,8],[7,9]],[[1,5],[1,7],[2,5],[2,7],[3,5],[3,7],[4,5],[4,7],[5,5],[5,6],[5,8],[5,9],[6,7],[7,7],[7,8],[7,9]],[[1,6],[1,7],[2,6],[2,7],[3,6],[3,7],[4,6],[4,7],[5,6],[5,7],[6,6],[6,8],[6,9],[7,7],[7,8],[7,9]],[[1,7],[2,7],[3,7],[4,7],[5,7],[6,7],[7,8],[7,9]],[[1,7],[1,8],[2,7],[2,8],[3,7],[3,8],[4,7],[4,8],[5,7],[5,8],[6,7],[6,8],[7,7],[7,9],[8,8],[8,9]],[[1,7],[1,9],[2,7],[2,9],[3,7],[3,9],[4,7],[4,9],[5,7],[5,9],[6,7],[6,9],[7,7],[7,8],[8,9],[9,9]]],[null,[[1,1],[1,2],[1,3],[1,4],[1,5],[1,6],[1,7],[1,9],[2,8],[3,8],[4,8],[5,8],[6,8],[7,8],[8,8],[8,9]],[[1,2],[1,8],[2,2],[2,3],[2,4],[2,5],[2,6],[2,7],[2,9],[3,8],[4,8],[5,8],[6,8],[7,8],[8,8],[8,9]],[[1,3],[1,8],[2,3],[2,8],[3,3],[3,4],[3,5],[3,6],[3,7],[3,9],[4,8],[5,8],[6,8],[7,8],[8,8],[8,9]],[[1,4],[1,8],[2,4],[2,8],[3,4],[3,8],[4,4],[4,5],[4,6],[4,7],[4,9],[5,8],[6,8],[7,8],[8,8],[8,9]],[[1,5],[1,8],[2,5],[2,8],[3,5],[3,8],[4,5],[4,8],[5,5],[5,6],[5,7],[5,9],[6,8],[7,8],[8,8],[8,9]],[[1,6],[1,8],[2,6],[2,8],[3,6],[3,8],[4,6],[4,8],[5,6],[5,8],[6,6],[6,7],[6,9],[7,8],[8,8],[8,9]],[[1,7],[1,8],[2,7],[2,8],[3,7],[3,8],[4,7],[4,8],[5,7],[5,8],[6,7],[6,8],[7,7],[7,9],[8,8],[8,9]],[[1,8],[2,8],[3,8],[4,8],[5,8],[6,8],[7,8],[8,9]],[[1,8],[1,9],[2,8],[2,9],[3,8],[3,9],[4,8],[4,9],[5,8],[5,9],[6,8],[6,9],[7,8],[7,9],[8,8],[9,9]]],[null,[[1,1],[1,2],[1,3],[1,4],[1,5],[1,6],[1,7],[1,8],[2,9],[3,9],[4,9],[5,9],[6,9],[7,9],[8,9],[9,9]],[[1,2],[1,9],[2,2],[2,3],[2,4],[2,5],[2,6],[2,7],[2,8],[3,9],[4,9],[5,9],[6,9],[7,9],[8,9],[9,9]],[[1,3],[1,9],[2,3],[2,9],[3,3],[3,4],[3,5],[3,6],[3,7],[3,8],[4,9],[5,9],[6,9],[7,9],[8,9],[9,9]],[[1,4],[1,9],[2,4],[2,9],[3,4],[3,9],[4,4],[4,5],[4,6],[4,7],[4,8],[5,9],[6,9],[7,9],[8,9],[9,9]],[[1,5],[1,9],[2,5],[2,9],[3,5],[3,9],[4,5],[4,9],[5,5],[5,6],[5,7],[5,8],[6,9],[7,9],[8,9],[9,9]],[[1,6],[1,9],[2,6],[2,9],[3,6],[3,9],[4,6],[4,9],[5,6],[5,9],[6,6],[6,7],[6,8],[7,9],[8,9],[9,9]],[[1,7],[1,9],[2,7],[2,9],[3,7],[3,9],[4,7],[4,9],[5,7],[5,9],[6,7],[6,9],[7,7],[7,8],[8,9],[9,9]],[[1,8],[1,9],[2,8],[2,9],[3,8],[3,9],[4,8],[4,9],[5,8],[5,9],[6,8],[6,9],[7,8],[7,9],[8,8],[9,9]],[[1,9],[2,9],[3,9],[4,9],[5,9],[6,9],[7,9],[8,9]]]];
	
	/** A table of board positions, by index, for a combination of markers.*/
	static markers2boardIndex = [null,[null,0,1,2,3,4,5,6,7,8],[null,1,3,5,7,9,10,11,13,14],[null,2,5,8,10,12,14,16,17,19],[null,3,7,10,13,15,17,20,22,24],[null,4,9,12,15,18,21,23,25,27],[null,5,10,14,17,21,24,26,28,30],[null,6,11,16,20,23,26,29,31,32],[null,7,13,17,22,25,28,31,33,34],[null,8,14,19,24,27,30,32,34,35]];
	
	
	
	// Game functions.
	
	/**
	 * Checks to see if the move is legal.
	 * @param {number} n - The number that the first marker is on.
	 * @param {number} m - The number that the second marker is on.
	 * @returns {boolean} Returns true if the move is legal and false if it is not.
	 */
	checkMove(n, m) {
		if (((n === this.n && m !== this.m) || (m === this.m && n !== this.n) || (n === this.m && m !== this.n) || (m === this.n && n !== this.m)) && (this.board[this.constructor.markers2boardIndex[n][m]] === 0)) return true;
		else return false;
	}
	
	makeMove(n, m) {
		this.board[this.constructor.markers2boardIndex[n][m]] = this.turn;
		this.n = n;
		this.m = m;
		this.turn = -1 * this.turn;
	}
	
	
	
	// Developer functions.
	
	/**
	 * Logs the game board to the console in a pretty format.
	 * @param {string} first - The single character to use for the First Player's markers.
	 * @param {string} second - The single character to use for the Second Player's markers.
	 */
	log(first = 'X', second = 'O') {
		let str = '';
		if (!this.terminal) {str += '    ' + (this.turn === 1 ? first : second) + ' to play\n';}
		else {
			let value = this.heuristicValue;
			if (value === Infinity) {str += '     X won!\n'}
			else if (value === -Infinity) {str += '     O won!\n'}
			else {str += '      Draw!\n'}
		}
		for (let i = 0; i < 6; ++i) {
			for (let j = 0; j < 6; ++j) {
				if (this.board[i * 6 + j] === 1) {str += ' ' + first + ' ';}
				else if (this.board[i * 6 + j] === -1) {str += ' ' + second + ' ';}
				else {
					let boardNumber = this.constructor.boardNumbers[i * 6 + j];
					if (boardNumber > 9) {str += boardNumber + ' ';}
					else {str += ' ' + boardNumber + ' ';}
				}
			}
			str += '\n';
		}
		str += '  Markers: ' + this.n + ', ' + this.m;
		console.log(str, this);
	}
	
	
	
	// Negamax functions.
	
	/**
	 * Generates an array of all possible games of Four In A Row, after one move.
	 * @returns {FourInARow[]} Returns an array of FourInARow objects.
	 */
	get children() {
		let children = [];
		for (const markers of this.constructor.legalMarkersFromMarkers[this.n][this.m]) {
			if (this.board[this.constructor.markers2boardIndex[markers[0]][markers[1]]] === 0) {
				let newBoard = [...this.board];
				newBoard[this.constructor.markers2boardIndex[markers[0]][markers[1]]] = this.turn;
				children.push(new this.constructor(markers[0], markers[1], -1 * this.turn, newBoard));
			}
		}
		return children;
	}
	
	/**
	 * The heuristic value of the game. If the game is won, it evaluates to +Infinity if First Player is winning and -Infinity if Second Player is winning. Otherwise, for all possible ways to get four in a row still available it adds up the number of positions owned in those rows, possibly double counting a position in multiple rows. All these are added, with second player's being negative.
	 * @returns {number} The heuristic value of the game. +Infinity if First Player is winning and -Infinity if Second Player is winning.
	 */
	get heuristicValue() {
		let value = 0;
		let newValue = 0;
		let row = [];
		for (const rowNums of this.constructor.fourInARows) {
			row = rowNums.map((index) => this.board[index]);
			if (!(row.includes(1) && row.includes(-1))) {
				newValue = row.reduce((p,c) => p + c);
				if (newValue === 4) {
					return Infinity;
				}
				else if (newValue === -4) {
					return -Infinity;
				}
				else {value += newValue;}
			}
		}
		return value;
	}
	
	/**
	 * Whether or not the game is in a terminal state: Either someone has won or there are no more legal moves.
	 * @returns {boolean} True if the game is terminal and false if it is not.
	 */
	get terminal() {
		if (this.children.length === 0) return true;
		let row = [];
		for (const rowNums of this.constructor.fourInARows) {
			row = rowNums.map((index) => this.board[index]);
			if (!(row.includes(0) || row.includes(1)) || !(row.includes(0) || row.includes(-1))) return true;
		}
		return false;
	}
	
	
	
	// Negamax Demo
	
	/**
	 * Demos the negamax algorithm by having the computer play against itself, picking the move with the best negamax value. The game is played in the console.
	 * @param {number} depth - The depth that negamax should be searched at.
	 * @requires Negamax
	 */
	static demo(depth) {
		let game = new FourInARow(Negamax.randInt(9) + 1, Negamax.randInt(9) + 1);
		game.log();
		while (!game.terminal) {
			let children = game.children;
			children = children.map((child) => [child.n, child.m, -Negamax.negamax(child, depth - 1, -Infinity, Infinity, child.turn)]);
			children.sort((a, b) => b[2] - a[2]);
			game.makeMove(...children[0].slice(0,2));
			game.log();
		}
	}
	
	/**
	 * Demos the negamax algorithm by having the computer play against the player, picking the move with the best negamax value. The game is played in the console, the human inputs their moves via prompts.
	 * @param {number} depth - The depth that negamax should be searched at.
	 * @requires Negamax
	 */
	static demoHuman(depth) {
		let game = new FourInARow(Negamax.randInt(9) + 1, Negamax.randInt(9) + 1);
		game.log();
		let human = Negamax.randInt(2);
		
		while (!game.terminal) {
			if (human) {
				let legal = false;
				while (!legal) {
					move = JSON.parse('[' + prompt('Make a move: n,m') + ']');
					legal = game.checkMove(...move);
				}
				game.makeMove(...move);
			}
			else {
				let children = game.children;
				children = children.map((child) => [child.n, child.m, -Negamax.negamax(child, depth - 1, -Infinity, Infinity, child.turn)]);
				children.sort((a, b) => b[2] - a[2]);
				game.makeMove(...children[0].slice(0,2));
			}
			game.log();
			human = !human;
		}
	}
}



// Negamax Implementation

Negamax = {};

/**
 * Evaluates a game using the Negamax algorithm with alpha beta pruning.
 * @param {Object} node - The game to be evaluated.
 * @param {Object[]} node.children - An array of all children of the node. Possibly a getter.
 * @param {number} node.heuristicValue - The heuristic value of the game. Possibly a getter.
 * @param {boolean} node.terminal - The terminalness of the game: false if the game has not finished yet, true if it has. Possibly a getter.
 * @param {number} a - Alpha, the lower bound for a child node value.
 * @param {number} b - Beta, the upper bound for a child node value.
 * @param {number} turn - Whose turn is it: +1 or -1.
 */
Negamax.negamax = function(node, depth, a = -Infinity, b = Infinity, turn = 1) {
	if (depth === 0 || node.terminal) return (turn * node.heuristicValue);
	let children = node.children;
	children = Negamax.orderNodes(children);
	let value = -Infinity;
	for (const child of children) {
		value = Math.max(value, -Negamax.negamax(child, depth - 1, -b, -a, -turn));
		if (a >= b) break;
		a = Math.max(a, value);
	}
	return value;
}

/**
 * Orders an array of nodes using some criteria, currently by using its heuristic value.
 * @param {Object[]} nodes - The nodes to be ordered.
 * @param {number} nodes[i].heuristicValue - The heuristic value of nodes[i], for any i. Possibly a getter.
 * @returns {Object[]} The ordered nodes.
 */
Negamax.orderNodes = function(nodes) {
	return nodes.map((node) => [node, node.heuristicValue]).sort((a,b) => b[1] - a[1]).map((node) => node[0]);
}

/**
 * Generates a random integer from 0 to max - 1.
 * @param {number} max - The range of integers.
 * @returns {number} A random integer form 0 to max - 1, inclusive.
 */
Negamax.randInt = function(max) {
	return Math.floor(Math.random() * max);
}



// Webpage

/**
 * Gets the first page element with the matching id.
 * @param {string} id - The ID.
 * @returns {HTMLElement} The element with the matching id.
 */
function e(id) {
	return document.getElementById(id);
}

Game = {active: 0};

Game.drawBoard = function() {
	for (let i = 1; i < 10; ++i) e('marker' + i).className = '';
	e('marker' + Game.game.n).classList.add('clip1');
	e('marker' + Game.game.m).classList.add('clip2');
	
	for (let i = 0; i < 36; ++i) {
		if (Game.game.board[i] === 0) {e('board' + i).className = ''}
		else if (Game.game.board[i] === 1) {e('board' + i).className = 'player1'}
		else if (Game.game.board[i] === -1) {e('board' + i).className = 'player2'}
	}
	
	if (!Game.game.terminal) {
		let turn = Game.game.turn === 1 ? 1 : 2;
		e('turnDisplay').className = 'player' + turn;
		e('turnDisplay').innerText = 'Player ' + turn + '\'s Turn'
	} else {
		if (Game.game.heuristicValue === Infinity) {
			e('turnDisplay').className = 'player1';
			e('turnDisplay').innerText = 'Player 1 Wins!'
		} else if (Game.game.heuristicValue === -Infinity) {
			e('turnDisplay').className = 'player2';
			e('turnDisplay').innerText = 'Player 2 Wins!'
		} else {
			e('turnDisplay').className = 'playerDraw';
			e('turnDisplay').innerText = 'It\'s A Draw!'
		}
	}
}

Game.clicked = function() {
	if (Game.game.terminal || Game.botTurn) return 0;
	if (!Game.active && this.className !== '') {
		Game.active = [this.classList[0], this.id.slice(6)]; // [Clip to move, it's marker position.]
		this.classList.add('active');
	} else if (Game.active) {
		if (this.id.slice(6) !== Game.active[1]) {
			// Check if move is legal. Break if it ain't.
			let [n, m] = [Game.game.n, Game.game.m];
			if (Game.active[0] === 'clip1') {n = this.id.slice(6)}
			else {m = this.id.slice(6)}
			if (Game.game.checkMove(n, m)) {
				e('marker' + Game.active[1]).classList.remove(Game.active[0]);
				this.classList.add(Game.active[0]);
				Game.game.makeMove(n, m);
				Game.drawBoard();
			} else {
				alert(n + ' \u00D7 ' + m + ' = ' + n*m + ' is already taken.');
			}
		}
		e('marker' + Game.active[1]).classList.remove('active');
		Game.active = 0;
	}
}

/** Initializes the webpage. */
init = function() {
	document.removeEventListener('DOMContentLoaded', init);
	
	console.log('Howdy! I hope you\'ve enjoyed the game!');
	e('topBarVersion').innerText = version;
	e('gameLoading').remove();
	
	let game = e('game');
	
	let messageBox = document.createElement('div');
	messageBox.id = 'messageBox';
	game.appendChild(messageBox);
	let row = document.createElement('div');
	messageBox.appendChild(row);
	let turnDisplay = document.createElement('div');
	turnDisplay.id = 'turnDisplay';
	turnDisplay.innerText = 'Player 1\'s Turn';
	turnDisplay.className = 'player1';
	row.appendChild(turnDisplay);
	
	let topBoard = document.createElement('div');
	topBoard.id = 'topBoard';
	game.appendChild(topBoard);
	
	for (let i = 0; i < 6; ++i) {
		row = document.createElement('div');
		topBoard.appendChild(row);
		for (let j = 0; j < 6; ++j) {
			let cell = document.createElement('div');
			cell.id = 'board' + (i * 6 + j);
			cell.innerText = FourInARow.boardNumbers[i * 6 + j];
			row.appendChild(cell);
		}
	}
	
	let botBoard = document.createElement('div');
	botBoard.id = 'botBoard';
	game.appendChild(botBoard);
	
	row = document.createElement('div');
	botBoard.appendChild(row);
	for (let i = 1; i < 10; ++i) {
		let cell = document.createElement('div');
		cell.id = 'marker' + i;
		cell.innerText = i;
		cell.addEventListener('click', Game.clicked);
		row.appendChild(cell);
	}
	
	function newLocalGame() {
		Game.game = new FourInARow(Negamax.randInt(9)+1, Negamax.randInt(9)+1);
		Game.botTurn = false;
		Game.drawBoard();
	}
	
	e('newLocalGame').addEventListener('click', newLocalGame);
	newLocalGame();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();