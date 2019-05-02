import React, { Component } from 'react';
import './Mastermind.css';

const red = require('./images/redCircle.png');
const blue = require('./images/blueCircle.png');
const green = require('./images/greenCircle.png');
const purple = require('./images/purpleCircle.png');
const teal = require('./images/tealCircle.png');
const magenta = require('./images/magentaCircle.png');
const emptyCircle = require('./images/emptyCircle.png');

// class Row extends React.Component {
//     render() {
//         return (
//             this.props.row.map((cell, idx) =>
//             cell={cell}
//             handleClick={this.props.handleClick}
//             cidx={idx}
//             )
//         )
//     }
// }

class Mastermind extends Component {
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


    constructor(props) {
        super(props);

        let board = Array(8).fill(Array(this.nonFilledCircle, this.nonFilledCircle, this.nonFilledCircle, this.nonFilledCircle ));
        board = board.map((row, ridx) => row.map( (col, cidx) => {
            return {...board[ridx][cidx], row: ridx, column: cidx}
        }));
        this.state = {board, nextColor: "blue"};
        this.positionOfCircle = Array(8).fill(3);
        this.handleClick = this.handleClick.bind(this);

        // The first row
        let firstRow = [
            this.nonFilledCircle, // Light Blue
            this.nonFilledCircle, // Dark Blue
            this.nonFilledCircle, // Green
            this.nonFilledCircle, // Purple
        ];

        let firstRowFeedback = [
            {color: red, colorName: 'Red'},
            this.nonFilledCircle,
            this.nonFilledCircle,
            this.nonFilledCircle
        ];

        this.state = {
            mastermindArray: [firstRow],
            feedbackArray: [firstRowFeedback],
            statusCircle: {color: emptyCircle, colorName: 'Empty circle'},
            emptyToColor: {color: emptyCircle, colorName: 'Empty Circle'}
        }
    }

    handleClick(cidx) {
        let ridx = this.positionOfCircle[cidx];
        if (ridx < 0)
            return;

        this.positionOfCircle[cidx] -=1;
        let r = this.state.board[ridx].slice();
        r[cidx] = {color: this.state.nextColor, isOccupied: true};

        let newBoard = this.board.slice();
        newBoard[ridx] = r;

        this.setState(({board: newBoard, nextColor: this.state.nextColor === this.selectedPaletteCircle()}));
        console.log("ridx = ", ridx, "cidx = ", cidx);
        console.log("state is", this.state.board);
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

    selectedEmptyCircle(circle) {
        console.log('selected an empty circle', circle.colorName);
        this.setState({emptyToColor: circle});
    }

    emptyCircles() {
        console.log("PRINT HERE");

        return <table className="board_table"><tbody><tr>
            {
                this.paletteColors.map( (paletteElement, idx) =>
                    <td key={idx} onClick={() => this.selectedEmptyCircle(paletteElement)}>
                        <img className="large_circle" src={paletteElement.color} alt={paletteElement.colorName} /></td>)
            }
        </tr></tbody></table>;
    }

    paletteCircles() {
        return <table className="palette_circles"><tbody><tr>
            {
                this.paletteColors.map((paletteElement, idx) =>
                    <td key={idx} onClick={() => this.selectedPaletteCircle(paletteElement)}>
                        <img className="large_circle" src={paletteElement.color} alt={paletteElement.colorName} /></td>)
            }
          </tr></tbody></table>;

    }
    emptyCircles() {
        console.log("PRINT HERE");
        return <table className="palette_circles"><tbody><tr>
            {
                this.nonFilledCircle.map((paletteElement, idx) =>
                    <td key={idx} onClick={() => this.selectedEmptyCircle(paletteElement)}>
                        <img className="large_circle" src={paletteElement.color} alt={paletteElement.colorName} /></td>)
            }
        </tr></tbody></table>;

    }

    getRandomIdx(low, high) {
        console.log(Math.floor(Math.random() * (high - low + 1) + low));
        return Math.floor(Math.random() * (high - low + 1) + low);
    }


    feedbackCircles(feedback) {
        return (<table>
            <tbody className="feedback_table">
                <tr><td><img className="small_circle" src={feedback[0].color} alt={feedback[0].colorName} /></td>
                    <td><img className="small_circle" src={feedback[1].color} alt={feedback[1].colorName} /></td></tr>
                <tr><td><img className="small_circle" src={feedback[2].color} alt={feedback[2].colorName} /></td>
                    <td><img className="small_circle" src={feedback[3].color} alt={feedback[3].colorName} /></td></tr>
            </tbody>
            </table>);
    }

    // This will get one of the rows
    // Table has 5 cols, 4 for color and one for feedback circles
    mastermindTableRow(row, feedback = undefined) { // Each element will call a circle
        return <tr>
            {row.map((circle, idx) => <td key={idx}><img className="large_circle" src={circle.color} alt={circle.colorName} /></td>)}
            <td className="feedback_cell">{feedback ? this.feedbackCircles(feedback) : ""}</td>
        </tr>
        // Will create the feedback cells (circles)
    }

    // Rendered from bottom to top in this case (usually top to bottom)
    // Adds rows to the game and the feedback component
    mastermindTable() {
        return <table className="board_table"><tbody>
            {this.mastermindTableRow(this.state.mastermindArray[0], this.state.feedbackArray[0])}
        </tbody></table>;
    }

    statusRow() {
        // This will set the values to this.state.statusCircles
        // instead of this.state.statusCircle.color = color
        let {
            color,
            colorName
        } = this.state.statusCircle;

        return <table className="status_circles"><tbody>
           <tr><td><img className="large_circle" src={red} alt="red circle" /></td>
           <td><img className="large_circle" src={color} alt={colorName} /></td></tr>
               </tbody></table>
    }

    render() {
        return (
            <div className="Mastermind">
                {this.statusRow()}
                <div style={{height: "400px"}}>&nbsp;</div>
                    {/*{ this.mastermindTable() }*/}
                    { this.paletteCircles() }
                    {/*{this.state.board.map((r,idx) =>*/}
                        {/*handleClick={this.handleClick},*/}
                        {/*row={idx})*/}
                    {/*}*/}
                {/*{ this.emptyCircles() }*/}
            </div>
        )

    }
}

export default Mastermind;
