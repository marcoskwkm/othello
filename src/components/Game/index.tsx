import React, { useMemo, useState } from 'react'
import {
  countLegalMoves,
  getInitialState,
  opposite,
  performMove,
} from '../../utils'
import { InvalidMoveError } from '../../utils/errors'

import Board from '../Board'

const Game: React.FC = () => {
  const [turn, setTurn] = useState<'black' | 'white'>('black')
  const [boardState, setBoardState] = useState<BoardState>(() =>
    getInitialState()
  )
  const [error, setError] = useState<string | null>(null)

  const handleClick = (row: number, col: number) => {
    setError(null)
    try {
      const nextState = performMove(boardState, turn, row, col)
      setBoardState(nextState)
      setTurn((curTurn) =>
        countLegalMoves(nextState, opposite(curTurn)) > 0
          ? opposite(curTurn)
          : curTurn
      )
    } catch (err) {
      if (err instanceof InvalidMoveError) {
        setError('Invalid move')
      } else {
        console.error(err)
      }
    }
  }

  const legalMovesCount = useMemo(() => countLegalMoves(boardState, turn), [
    boardState,
    turn,
  ])

  const isGameOver = useMemo(
    () =>
      countLegalMoves(boardState, 'black') === 0 &&
      countLegalMoves(boardState, 'white') === 0,
    [boardState]
  )

  const blackPieceCount = useMemo(
    () => boardState.flat().filter((cell) => cell === 'black').length,
    [boardState]
  )
  const whitePieceCount = useMemo(
    () => boardState.flat().filter((cell) => cell === 'white').length,
    [boardState]
  )

  const handleReset = () => {
    setTurn('black')
    setBoardState(getInitialState())
    setError(null)
  }

  return (
    <div className="w-full max-w-screen-md border">
      <div className="text-2xl text-center">Othello bot</div>
      <div className="text-right text-sm">
        Because the AI from Nintendo's Clubhouse 51 is too stronk
      </div>
      <div className="mt-4 flex justify-around">
        <span>
          Next turn: {turn} ({legalMovesCount} legal moves)
        </span>
        <button
          className="px-2 border rounded-md bg-gray-200 hover:bg-gray-300"
          onClick={() => handleReset()}
        >
          Reset
        </button>
      </div>
      <Board boardState={boardState} onClick={handleClick} />
      <div className="flex justify-around">
        <span>White: {whitePieceCount}</span>
        <span>Black: {blackPieceCount}</span>
      </div>
      {isGameOver && (
        <div className="text-center font-bold">
          Game over!{' '}
          {whitePieceCount > blackPieceCount
            ? 'White wins'
            : whitePieceCount < blackPieceCount
            ? 'Black wins'
            : "It's a draw"}
        </div>
      )}
      {error && <div className="text-center text-red-500">{error}</div>}
    </div>
  )
}

export default Game
