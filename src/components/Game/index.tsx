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

const removePreTurn = (turn: 'black' | 'white' | 'pre-black' | 'pre-white') =>
  turn === 'pre-black' ? 'black' : turn === 'pre-white' ? 'white' : turn

const Game: React.FC = () => {
  const [turn, setTurn] = useState<
    'black' | 'white' | 'pre-black' | 'pre-white'
  >('black')
  const [boardState, setBoardState] = useState<BoardState>(() =>
    getInitialState()
  )
  const [lastMove, setLastMove] = useState<[number, number]>([-1, -1])
  const [blackStrategy, setBlackStrategy] = useState<Strategy | null>(null)
  const [whiteStrategy, setWhiteStrategy] = useState<Strategy | null>(
    () => minMaxPositionScore
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
      if (nextTurn === 'white' && whiteStrategy !== null) {
        setTurn('pre-white')
      } else if (nextTurn === 'black' && blackStrategy !== null) {
        setTurn('pre-black')
      } else {
        setTurn(nextTurn)
      }

      setLastMove([row, col])
    },
    [boardState, turn, blackStrategy, whiteStrategy]
  )

  const handleClick = (row: number, col: number) => {
    if (
      (turn === 'white' && whiteStrategy !== null) ||
      (turn === 'black' && blackStrategy !== null)
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
    if (turn === 'white' && whiteStrategy !== null) {
      const [row, col] = whiteStrategy(boardState, turn)
      makeMove(row, col)
    } else if (turn === 'black' && blackStrategy !== null) {
      const [row, col] = blackStrategy(boardState, turn)
      makeMove(row, col)
    }
  }, [isGameOver, boardState, turn, makeMove, blackStrategy, whiteStrategy])

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
      <div className="grid grid-cols-max-3">
        <span>Black:</span>
        <label className="flex items-center cursor-pointer">
          <input
            className="ml-2 mr-1"
            type="radio"
            value="human"
            checked={blackStrategy === null}
            onClick={() => setBlackStrategy(null)}
            readOnly
          />
          Human
        </label>
        <label className="flex items-center cursor-pointer">
          <input
            className="ml-2 mr-1"
            type="radio"
            value="cpu"
            checked={blackStrategy !== null}
            onClick={() => setBlackStrategy(() => minMaxPositionScore)}
            readOnly
          />
          CPU
        </label>
        <span>White:</span>
        <label className="flex items-center cursor-pointer">
          <input
            className="ml-2 mr-1"
            type="radio"
            value="human"
            checked={whiteStrategy === null}
            onClick={() => setWhiteStrategy(null)}
            readOnly
          />
          Human
        </label>
        <label className="flex items-center cursor-pointer">
          <input
            className="ml-2 mr-1"
            type="radio"
            value="cpu"
            checked={whiteStrategy !== null}
            onClick={() => setWhiteStrategy(() => minMaxPositionScore)}
            readOnly
          />
          CPU
        </label>
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
      <Board
        boardState={boardState}
        onClick={handleClick}
        lastMove={lastMove}
      />
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
