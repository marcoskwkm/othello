import { clone, equals, zip } from 'ramda'

import { InvalidMoveError } from './errors'

export const getInitialState = () => {
  const initialState = [...new Array(8)].map(() =>
    [...new Array(8)].map(() => 'empty')
  ) as BoardState

  initialState[3][3] = initialState[4][4] = 'white'
  initialState[3][4] = initialState[4][3] = 'black'

  return initialState
}

export const opposite = (color: 'black' | 'white') =>
  color === 'black' ? 'white' : 'black'

const isValidPosition = (row: number, col: number) =>
  0 <= row && row <= 7 && 0 <= col && col <= 7

export const performMove = (
  state: BoardState,
  turn: 'black' | 'white',
  row: number,
  col: number
) => {
  if (state[row][col] !== 'empty') {
    throw new InvalidMoveError()
  }

  if (!isValidPosition(row, col)) {
    throw new InvalidMoveError()
  }

  const allDr = [-1, -1, -1, 0, 1, 1, 1, 0]
  const allDc = [-1, 0, 1, 1, 1, 0, -1, -1]
  const dirs = zip(allDr, allDc)

  const nextState = clone(state)

  dirs.forEach(([dr, dc]) => {
    let [nr, nc] = [row + dr, col + dc]
    if (!isValidPosition(nr, nc)) {
      return
    }
    if (state[nr][nc] !== opposite(turn)) {
      return
    }

    do {
      ;[nr, nc] = [nr + dr, nc + dc]
    } while (isValidPosition(nr, nc) && state[nr][nc] === opposite(turn))

    if (!isValidPosition(nr, nc) || state[nr][nc] !== turn) {
      return
    }

    ;[nr, nc] = [nr - dr, nc - dc]
    while (state[nr][nc] === opposite(turn)) {
      nextState[nr][nc] = turn
      ;[nr, nc] = [nr - dr, nc - dc]
    }

    nextState[row][col] = turn
  })

  if (equals(state, nextState)) {
    throw new InvalidMoveError()
  }

  return nextState
}

export const isLegalMove = (
  state: BoardState,
  turn: 'black' | 'white',
  row: number,
  col: number
) => {
  try {
    performMove(state, turn, row, col)
    return true
  } catch (err) {
    if (!(err instanceof InvalidMoveError)) {
      console.error(err)
    }
    return false
  }
}

export const countLegalMoves = (state: BoardState, turn: 'black' | 'white') => {
  let count = 0
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      if (isLegalMove(state, turn, row, col)) {
        count += 1
      }
    }
  }
  return count
}
