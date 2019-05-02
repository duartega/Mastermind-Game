/*
    Project 1:  Mastermind
    Author:     Gabriel Duarte
    Class:      CS 386: Web Frameworks
    Year:       Spring 2019
    Date:       March 15, 2019
    Description:
                The key to playing this game is to guess a 4 color winning code with in 8 tries.
                the catch is that all colors must be in the correct spot. You will get feedback
                on if a color you chose is in the array and/or it is in the correct position in
                that array (the winning code array).
    Site:       https://en.wikipedia.org/wiki/Mastermind_%28board_game%29
 */

import React, { Component } from 'react';
import './Mastermind.css';

let uniqueSeed = 0;
function nextUniqueKey() {
    return uniqueSeed += 1;
}
// Set the global number of rows and columns
let NUM_ROWS = 8, NUM_COLUMNS = 5;

// Import the pictures
const red = require('./images/redCircle.png');
const blue = require('./images/blueCircle.png');
const green = require('./images/greenCircle.png');
const purple = require('./images/purpleCircle.png');
const teal = require('./images/tealCircle.png');
const magenta = require('./images/magentaCircle.png');
const emptyCircle = require('./images/emptyCircle.png');

class Cell extends React.Component {
    // Create one cell at a time for a single row
    render() {
        return (
            <td key={nextUniqueKey()} onClick={() => this.props.handleClick(this.props.colIdx, this.props.rowIndex)} width="50px" height="50px">
                <img className="large_circle" src={this.props.cell['color']} alt={this.props.cell['colorName']} />
            </td>
        )
    }
}

class Row extends React.Component {

    // Show the rows and properly fill them with colors
    render() {
        /*This will only show a new row when you have filled a row so that
           all rows are not displayed at the beginning */
        if (this.props.currRow <= this.props.rowIndex) {
            return (
                <tr>
                    {this.props.row.map((cell, idx) =>
                        <Cell key={nextUniqueKey()} rowIdx={this.props.row} rowIndex={this.props.rowIndex} cell={cell}
                              handleClick={this.props.handleClick} feedback={this.props.feedback} colIdx={idx}/>)

                    }
                    <td><table>
                        <tbody className="feedback_table">
                        <tr><td><img className="small_circle" src={this.props.feedback[this.props.rowIndex][0].color} alt={this.props.feedback[this.props.rowIndex][0].colorName} /></td>
                            <td><img className="small_circle" src={this.props.feedback[this.props.rowIndex][1].color} alt={this.props.feedback[this.props.rowIndex][1].colorName} /></td></tr>
                        <tr><td><img className="small_circle" src={this.props.feedback[this.props.rowIndex][2].color} alt={this.props.feedback[this.props.rowIndex][2].colorName} /></td>
                            <td><img className="small_circle" src={this.props.feedback[this.props.rowIndex][3].color} alt={this.props.feedback[this.props.rowIndex][3].colorName} /></td></tr>
                        </tbody>
                    </table></td>
                </tr>

            )
        }
        else
        {
            return (<tr></tr>)
        }
    }
}

class Mastermind extends React.Component {
    // Array that holds the colors for the palette
    paletteColors = [
        {color: green, colorName: 'Green'},
        {color: teal, colorName: 'Teal'},
        {color: magenta, colorName: 'Magenta'},
        {color: blue, colorName: 'Blue'},
        {color: red, colorName: 'Red'},
        {color: purple, colorName: 'Purple'}
    ];

    // Create the array that contains empty circles
    nonFilledCircle = {
        color: emptyCircle,
        colorName: 'Empty circle'
    };

    // Set up the initial state of the game
    constructor(props) {
        super(props);

        // Create a board for the 8
        let board = Array(NUM_ROWS).fill(Array(this.nonFilledCircle, this.nonFilledCircle, this.nonFilledCircle, this.nonFilledCircle));
        board = board.map((row, rowIdx) => row.map( (col, colIdx) => {
            return {...board[rowIdx][colIdx], row: rowIdx, column: colIdx}
        }));

        // Create the array for feedback circles
        let feedback = Array(NUM_ROWS).fill(Array(this.nonFilledCircle, this.nonFilledCircle, this.nonFilledCircle, this.nonFilledCircle));
        feedback = feedback.map((row, rowIdx) => row.map( (col, colIdx) => {
            return {...feedback[rowIdx][colIdx], row: rowIdx, column: colIdx}
        }));

        // Check to differentiate between the constructor and reset function
        console.log("This is the initial board created in the constructor: ", board);

        // Make sure that when we click in a row, it does not create a new row right away
        // Demonstrated later on in the code (handleClick)
        this.positionOfCircle = Array(NUM_COLUMNS).fill(NUM_ROWS-1);

        // Create the random winning code at the beginning and set the won and lost to false
        let randomWiningCode = this.randomCode(this.paletteColors);
        let wonGame = false;
        let lostGame = false;

        // Add the objects to the state so we can modify them whenever we have updates
        this.state = {
            board,
            feedback,
            statusCircle: {color: emptyCircle, colorName: 'Empty circle'},
            currentRowState: NUM_ROWS - 1,
            WinningCode: randomWiningCode
        };

        /* We bind these functions so that we are able to send the functions to other classes.
           Such as handleClick being sent to Cell and Row */
        this.handleClick = this.handleClick.bind(this);
        this.reset = this.reset.bind(this);
    }

    // Handles what happens when an empty circle on the board was clicked
    handleClick(cidx, ridx) {

        // To test if the click was in the right row and column
            // console.log("row = ", ridx, "column = ", cidx);
        if (ridx < 0)
            return;

        // Make sure that the click stays in the current row until the row is filled
        ridx = this.positionOfCircle[cidx];
        if (ridx < 0)
            return;

        // Slice the board so that we can make a copy and set states within
        let theRow = this.state.board[ridx].slice();
        theRow[cidx] = this.state.statusCircle;

        // Slice the board so that we can make a copy and set states within
        let newBoard = this.state.board.slice();
        newBoard[ridx] = theRow;

        // Set the new state of the board and update visually as well
        this.setState(({board: newBoard}));

        // If needed, will reset the current selected color back to white when filling a circle
            // this.setState({statusCircle: {color: emptyCircle, colorName: 'Empty circle'}});

        // Variable to keep track of if the row is filled or not
        let count = 0;

        // The array that fills the feedback circles appropriately
        // Please see line 257 to understand the 2's, 2 = NOT IN CODE
        let position = [2, 2, 2 ,2];
        let codeArray = [];

        // Checks to make sure that the color of your cell circle is not empty
        for (let i = 0; i < NUM_COLUMNS - 1; i++)
        {
            if (newBoard[ridx][i]['colorName'] !== "Empty circle")
            {
                count++;
            }
        }

        // If the count is four, then we do some checking to see if you have the winning code
        if (count === 4) {
            // Increase the number of rows to spawn a new row
            this.setState ({currentRowState: this.state.currentRowState - 1});

            // Allow user to click in the new row
            this.positionOfCircle[0] -= 1; this.positionOfCircle[1] -= 1;
            this.positionOfCircle[2] -= 1; this.positionOfCircle[3] -= 1;

            // Variable to keep track of the correct position of your chosen pattern
            let correctPosition = 0;

            // Checks each index to see if the colors are in the right place
            for (let i = 0; i < NUM_COLUMNS - 1; i++)
            {
                if (newBoard[ridx][i]['colorName'] === this.state.WinningCode[i])
                {
                    correctPosition++;
                }
                if (correctPosition === 4){
                    console.log("you won!!");
                    this.wonGame = true;
                }
                else {
                    console.log("You have ", correctPosition, " circles in the correct place")
                }

                // Does a check to see if (the color is not in the right position) the color is in the array
                for (let j = 0; j < NUM_COLUMNS - 1; j++)
                {
                    if (newBoard[ridx][i]['colorName'] === this.state.WinningCode[j] && i !== j)
                    {
                        // Keep the color green as we do not want to override a previous green feedback circle
                        // Please see code on line 257 to understand the reference of === 0, 1, and 2
                        if (position [j] === 0 ){  // Turn green, 0 = IN CODE AND IN POSITION
                            position [j] = 0;
                        }
                    else {
                            position [j] = 1; // Turn red, 1 = IN CODE BUT WRONG POSITION

                        }
                    }
                     else if (newBoard[ridx][i]['colorName'] === this.state.WinningCode[j] && i === j) {
                        position [j] = 0; // Turn green, 0 = IN CODE AND IN POSITION
                        }
                }
            }

            // Sort so that green shows in the feedback before red or empty circle - see line 257
            position .sort((a, b) =>
                (a > b) ? 1: -1
            );

            // Push that colors in order (green, red, empty circle) to the array
            for (let i = 0; i < 4; i++){
                if (position [i] === 0)
                    codeArray.push(this.paletteColors[0]);
                else if (position [i] === 1)
                    codeArray.push(this.paletteColors[4]);
                else
                    codeArray.push(this.nonFilledCircle)
            }

            // Happening only when count is 4 so we do not continually update
            let theFB = this.state.feedback[ridx].slice();
            theFB = codeArray;
            console.log(theFB);

            let newFB = this.state.feedback.slice();
            newFB[ridx] = theFB;

            this.setState({feedback: newFB});
        }

        /*
            0 = IN CODE AND IN POSITION
            1 = IN CODE BUT WRONG POSITION
            2 = NOT IN CODE
        */

        // Make sure that no new rows are created when you win
        if (this.wonGame){
            this.setState ({currentRowState: this.state.currentRowState});
            return;
        }
        if (this.state.currentRowState === 0)
            this.lostGame = true;
    }

    // Create the random winning code using the getRandomIdx() function
    randomCode(colors)
    {
        let codeArray = [];
        for (let i = 0; i < 4; i++)
        {
            let color = this.getRandomIdx(0, 5);
            let pushColor = colors[color]['colorName'];
            codeArray.push(pushColor);
        }
        /* This is here for testing purposes if you would like to test a specific winning code */
            // codeArray.push(colors[0]['colorName']); codeArray.push(colors[3]['colorName']);
            // codeArray.push(colors[0]['colorName']); codeArray.push(colors[4]['colorName']);
        console.log("Winning Array: ", codeArray);
        return codeArray;
    }

    /*
        This function creates a new instance of its own, but does not work as intended.
        I was trying to set the values from the constructor back to original state.
        It does but it does not update the page visually.
        Although I did not see anywhere in the project that a restart function was needed.
    */
    reset() {
       // super(props);
        this.state.board = Array(NUM_ROWS).fill(Array(this.nonFilledCircle, this.nonFilledCircle, this.nonFilledCircle, this.nonFilledCircle));
        this.state.board = this.state.board.map((row, rowIdx) => row.map( (col, colIdx) => {
            return {...this.state.board[rowIdx][colIdx], row: rowIdx, column: colIdx}
        }));
        this.state.feedback = Array(NUM_ROWS).fill(Array(this.nonFilledCircle, this.nonFilledCircle, this.nonFilledCircle, this.nonFilledCircle));
        this.state.feedback = this.state.feedback.map((row, rowIdx) => row.map( (col, colIdx) => {
            return {...this.state.feedback[rowIdx][colIdx], row: rowIdx, column: colIdx}
        }));


        console.log("This is the initial board created in the reset: ", this.state.board);
        this.positionOfCircle = Array(NUM_COLUMNS).fill(NUM_ROWS-1);

        let randomWiningCode = this.randomCode(this.paletteColors);
        let wonGame = false;
        let lostGame = false;


        this.handleClick = this.handleClick.bind(this);
        this.reset = this.reset.bind(this);
    }

    // Will choose a random number that we will use to get a random color in our winning code
    getRandomIdx(low, high) {
        return Math.floor(Math.random() * (high - low + 1) + low);
    }

    componentDidMount() {
        console.log('Component Did Mount');
    }

    // Checks to see if the color is selected and output a message
    // Sets the color that is selected
    selectedPaletteCircle(circle) {
        console.log('selected a palette color', circle.colorName);
        this.setState({statusCircle: circle});
    }

    // This maps the colors to the palette elements to the circles that show at the bottom
    paletteCircles() {
        return <table className="palette_circles"><tbody><tr>
            {
                this.paletteColors.map((paletteElement, idx) =>
                    <td key={idx} onClick={() => this.selectedPaletteCircle(paletteElement)}>
                        <img className="large_circle" src={paletteElement.color} alt={paletteElement.colorName} /></td>)
            }
          </tr></tbody></table>;

    }

    // This will set the values to this.state.statusCircles
    // instead of this.state.statusCircle.color = color
    statusRow() {
        let {
            color,
            colorName
        } = this.state.statusCircle;

        return <table className="status_circles"><tbody>
           <tr><td><img className="large_circle" src={red} alt="red circle" /></td>
           <td><img className="large_circle" src={color} alt={colorName} /></td></tr>
               </tbody></table>
    };

    // This will be triggered when wonGame = true
    WON() {
        if (this.wonGame){
            return <div><h1>YOU WON!!!</h1>
                {/*{this.setState({board: null, feedback: null, statusCircle: null, currentRowState: 7, WinningCode: null})}*/}
                {/*<button onClick={this.reset}>Reset?*/}
        {/*</button>*/}
            </div>
        }
    };

    // This will be triggered when lostGame = true
    LOST() {
        if (this.lostGame){
            return (<h1>YOU LOST!!!</h1>)
        }
    };

    // Render the objects by sending properties of the constructors to other classes and so on
    render() {
        return (
            <div className="Mastermind">
                <h1 style={{color: "red"}}>Mastermind</h1>
                {this.statusRow()}
                <div style={{height: "100px"}}>&nbsp;</div>
                    <table  align="center">
                        <tbody>
                        {
                            this.state.board.map((r,idx) =>
                                <Row key={nextUniqueKey()}
                                     handleClick={this.handleClick} row = {r} rowIndex={idx}
                                     currRow={this.state.currentRowState}
                                     feedback={this.state.feedback}
                                />)
                        }
                        </tbody>
                    </table>
                { this.paletteCircles() }
                { this.WON() }
                { this.LOST() }
                </div>
        )

    }
}

export default Mastermind;
