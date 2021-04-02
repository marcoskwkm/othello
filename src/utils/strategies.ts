import { countLegalMoves, listLegalMoves, opposite, performMove } from '.'
import { InvalidMoveError } from './errors'

const legalMovesHeuristic = (
  heuristic: (
    myMoves: [number, number][],
    theirMoves: [number, number][]
  ) => number
): Strategy => (state: BoardState, turn: 'black' | 'white') => {
  let [bestRow, bestCol, bestValue] = [-1, -1, -Infinity]

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      try {
        const nextState = performMove(state, turn, row, col)
        const value = heuristic(
          listLegalMoves(nextState, turn),
          listLegalMoves(nextState, opposite(turn))
        )
        if (value > bestValue) {
          bestValue = value
          bestRow = row
          bestCol = col
        }
      } catch (err) {
        if (!(err instanceof InvalidMoveError)) {
          console.error(err)
        }
      }
    }
  }

  return [bestRow, bestCol]
}

export const maximizeLegalMovesDifference = legalMovesHeuristic(
  (mine, theirs) => mine.length - theirs.length
)

export const minimizeOpponentLegalMoves = legalMovesHeuristic(
  (_, theirs) => -theirs.length
)

const isFixedPiece = (state: BoardState, row: number, col: number) => {
  let flag = true
  for (let r = 0; r <= row; r++) {
    for (let c = 0; c <= col; c++) {
      if (state[r][c] !== state[row][col]) {
        flag = false
      }
    }
  }
  if (flag) return true

  flag = true
  for (let r = 0; r <= row; r++) {
    for (let c = col; c <= 7; c++) {
      if (state[r][c] !== state[row][col]) {
        flag = false
      }
    }
  }
  if (flag) return true

  flag = true
  for (let r = row; r <= 7; r++) {
    for (let c = 0; c <= col; c++) {
      if (state[r][c] !== state[row][col]) {
        flag = false
      }
    }
  }
  if (flag) return true

  flag = true
  for (let r = row; r <= 7; r++) {
    for (let c = col; c <= 7; c++) {
      if (state[r][c] !== state[row][col]) {
        flag = false
      }
    }
  }
  if (flag) return true

  return false
}

const calcPositionScore = (state: BoardState, turn: 'black' | 'white') => {
  let value = countLegalMoves(state, turn)
  ;[
    [0, 0],
    [0, 7],
    [7, 0],
    [7, 7],
  ].forEach(([r, c]) => {
    if (state[r][c] === turn) {
      value += 10
    }
  })

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (state[r][c] === turn && isFixedPiece(state, r, c)) {
        value += 2
      }
    }
  }

  return value
}

export const countPieces = (state: BoardState, color: 'black' | 'white') =>
  state.flat().filter((cell) => cell === color).length

export const evaluatePosition = (state: BoardState) => {
  if (checkGameOver(state)) {
    const countBlack = countPieces(state, 'black')
    const countWhite = countPieces(state, 'white')
    if (countBlack > countWhite) {
      return -1000000 * (countBlack - countWhite)
    } else if (countWhite > countBlack) {
      return 1000000 * (countWhite - countBlack)
    } else {
      return 0
    }
  } else {
    return calcPositionScore(state, 'white') - calcPositionScore(state, 'black')
  }
}

export const checkGameOver = (state: BoardState) =>
  countLegalMoves(state, 'black') === 0 && countLegalMoves(state, 'white') === 0

export const minMaxPositionScore: Strategy = (
  state: BoardState,
  turn: 'black' | 'white'
) => {
  let [bestRow, bestCol] = [-1, -1]

  const MAX_DEPTH = 4

  const rec = (
    curState: BoardState,
    curTurn: 'black' | 'white' = turn,
    depth: number = 0
  ): number => {
    let bestValue = curTurn === 'black' ? Infinity : -Infinity

    let foundMove = false
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        try {
          const nextState = performMove(curState, curTurn, row, col)

          const value =
            depth === MAX_DEPTH || checkGameOver(nextState)
              ? evaluatePosition(nextState)
              : rec(nextState, opposite(curTurn), depth + 1)

          foundMove = true

          if (
            (curTurn === 'black' && value < bestValue) ||
            (curTurn === 'white' && value > bestValue)
          ) {
            bestValue = value
            if (depth === 0) {
              bestRow = row
              bestCol = col
            }
          }
        } catch (err) {
          if (!(err instanceof InvalidMoveError)) {
            console.error(err)
          }
        }
      }
    }

    if (!foundMove) {
      return rec(curState, opposite(curTurn), depth)
    }

    return bestValue
  }

  rec(state)

  return [bestRow, bestCol]
}
