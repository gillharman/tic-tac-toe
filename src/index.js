import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';


function Square(props) {
  const style = props.winning_square ? { backgroundColor: 'yellow' } : {};
  return (
    <button style={style} className="square" onClick={props.onClick}>
      {props.value}
    </button>
  );
}

class Board extends React.Component {
  renderSquare(i) {
    let winning_square = false;
    if(this.props.winning_squares) {
      if(this.props.winning_squares.indexOf(i) > -1) {
        winning_square = true;
      }
    }
    return (
      <Square
        key={i}
        value={this.props.squares[i]}
        winning_square={winning_square}
        onClick={() => this.props.onClick(i)}
      />
    );
  }

  render() {
    const number_of_squares = 9;
    let square_count = 0;

    let rows = [];

    for(let i = 0; i < 3; i++) {
      let columns = [];
      for(let j = 0; j < 3; j++) {
        if(square_count < number_of_squares) {
          columns.push(this.renderSquare(square_count));
          square_count++;
        }
      }
      rows.push(columns);
    }

    var squares = rows.map((row, number) => {
      return (
        <div key={number} className="board-row">{row}</div>
      );
    });

    return (
      <div>
        {squares}
      </div>
    );
  }
}

function Move(props) {
  return (
      <button id={props.id} onClick={props.onClick}>{props.value}</button>
  );
}

class MovesList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      sortByAsc: true,
    }
  }

  handleClick() {
    const sort_order = !this.state.sortByAsc;
    this.setState({
      sortByAsc: sort_order,
    });
  }

  render() {
    const moves = this.props.history.map((step, move) => {
      const desc = move ?
        'Go to move #' + move + ' (' + step.col + ', ' + step.row + ')' :
        'Go to game start';
        return (
          <li key={move}>
            <Move id={'move-number-' + move}  onClick={() => this.props.onClick(move)} value={desc} />
          </li>
        );
    });

    const sort_order = this.state.sortByAsc ? 'descending' : 'ascending';
    const toggle_style = {
      marginTop: 10,
      marginBottom: 6
    };

    const sorted_moves = this.state.sortByAsc ? moves.sort() : moves.reverse();

    return (
      <div>
        <button style={toggle_style} onClick={() => this.handleClick()}>Sort moves in {sort_order} order</button>
        <ol>{sorted_moves}</ol>
      </div>
    );
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [{
        col: null,
        row: null,
        squares: Array(9).fill(null),
      }],
      stepNumber: 0,
      xIsNext: true,
    };
  }

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    if (calculateWinner(squares) || squares[i]) {
      return;
    }
    squares[i] = this.state.xIsNext ? 'X' : 'O';
    this.setState({
      history: history.concat([{
        squares: squares,
        col: i % 3,
        row: getRow(i),
      }]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
    });
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0,
    });

    let selected = document.getElementsByClassName("selected");
    for (var i = 0; i < selected.length; ++i) {
      selected[i].classList.remove("selected");
    }

    document.getElementById("move-number-" + step).classList.add("selected");
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winner = calculateWinner(current.squares);

    let status;
    let winning_squares = null;
    if (winner) {
      status = 'Winner: ' + winner["winner"];
      winning_squares = winner["winningSquares"];
    } else if (current.squares.indexOf(null) === -1) {
      status = 'It\'s a Draw.';
    } else {
      status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
    }

    return (
      <div className="game">
        <div className="game-board">
          <Board
            squares={current.squares}
            winning_squares={winning_squares}
            onClick={(i) => this.handleClick(i)}
          />

        </div>
        <div className="game-info">
          <div>{status}</div>
          <div>
            <MovesList
              history={history}
              onClick={(i) => this.jumpTo(i)}
            />
          </div>
        </div>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return {
        "winner": squares[a],
        "winningSquares": lines[i]
      };
    }
  }
  return null;
}

function getRow(i) {
  let row = null;

  if([0, 1, 2].indexOf(i) > -1) {
    row = 0;
  } 
  else if([3, 4, 5].indexOf(i) > -1) {
    row = 1;
  }
  else if([6, 7, 8].indexOf(i) > -1) {
    row = 2;
  }

  return row;
}
