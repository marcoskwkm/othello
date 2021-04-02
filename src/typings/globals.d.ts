type BoardCellState = 'empty' | 'black' | 'white'

type BoardRowState = [
  BoardCellState,
  BoardCellState,
  BoardCellState,
  BoardCellState,
  BoardCellState,
  BoardCellState,
  BoardCellState,
  BoardCellState
]

type BoardState = [
  BoardRowState,
  BoardRowState,
  BoardRowState,
  BoardRowState,
  BoardRowState,
  BoardRowState,
  BoardRowState,
  BoardRowState
]
