import React, { useCallback, useEffect, useMemo, useState } from 'react'

import {
  countLegalMoves,
  getInitialState,
  opposite,
  performMove,
} from '../../utils'
import { InvalidMoveError } from '../../utils/errors'
import {
  checkGameOver,
  countPieces,
  evaluatePosition,
  minMaxPositionScore,
} from '../../utils/strategies'

import Board from '../Board'

const BLACK_STRATEGY: Strategy = null
const WHITE_STRATEGY: Strategy = minMaxPositionScore

const removePreTurn = (turn: 'black' | 'white' | 'pre-black' | 'pre-white') =>
  turn === 'pre-black' ? 'black' : turn === 'pre-white' ? 'white' : turn

const Game: React.FC = () => {
  const [turn, setTurn] = useState<
    'black' | 'white' | 'pre-black' | 'pre-white'
  >('black')
  const [boardState, setBoardState] = useState<BoardState>(() =>
    getInitialState()
  )
  const [error, setError] = useState<string | null>(null)

  const makeMove = useCallback(
    (row: number, col: number) => {
      if (turn !== 'black' && turn !== 'white') {
        return
      }
      const nextState = performMove(boardState, turn, row, col)
      setBoardState(nextState)

      const nextTurn =
        countLegalMoves(nextState, opposite(turn)) > 0 ? opposite(turn) : turn
      if (nextTurn === 'white' && WHITE_STRATEGY !== null) {
        setTurn('pre-white')
      } else if (nextTurn === 'black' && BLACK_STRATEGY !== null) {
        setTurn('pre-black')
      } else {
        setTurn(nextTurn)
      }
    },
    [boardState, turn]
  )

  const handleClick = (row: number, col: number) => {
    if (
      (turn === 'white' && WHITE_STRATEGY !== null) ||
      (turn === 'black' && BLACK_STRATEGY !== null)
    ) {
      return
    }
    setError(null)
    try {
      makeMove(row, col)
    } catch (err) {
      if (err instanceof InvalidMoveError) {
        setError('Invalid move')
      } else {
        console.error(err)
      }
    }
  }

  const legalMovesCount = useMemo(
    () => countLegalMoves(boardState, removePreTurn(turn)),
    [boardState, turn]
  )

  const isGameOver = useMemo(() => checkGameOver(boardState), [boardState])

  const blackPieceCount = useMemo(() => countPieces(boardState, 'black'), [
    boardState,
  ])
  const whitePieceCount = useMemo(() => countPieces(boardState, 'white'), [
    boardState,
  ])

  const positionEval = useMemo(() => evaluatePosition(boardState), [boardState])

  useEffect(() => {
    if (isGameOver) {
      return
    }
    if (turn === 'white' && WHITE_STRATEGY !== null) {
      // @ts-ignore
      const [row, col] = WHITE_STRATEGY(boardState, turn)
      makeMove(row, col)
    } else if (turn === 'black' && BLACK_STRATEGY !== null) {
      // @ts-ignore
      const [row, col] = BLACK_STRATEGY(boardState, turn)
      makeMove(row, col)
    }
  }, [isGameOver, boardState, turn, makeMove])

  useEffect(() => {
    if (isGameOver) {
      return
    }
    if (turn === 'pre-white') {
      setTimeout(() => setTurn('white'), 500)
    } else if (turn === 'pre-black') {
      setTimeout(() => setTurn('black'), 500)
    }
  }, [isGameOver, turn])

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
          Next turn: {removePreTurn(turn)} ({legalMovesCount} legal moves)
        </span>
        <span>
          Eval: {positionEval > 0 ? '+' : ''}
          {positionEval}
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
