import React from 'react'
import classNames from 'classnames'

import Cell from '../Cell'

interface Props {
  className?: string
  boardState: BoardState
  onClick?: (row: number, col: number) => void
}

const Board: React.FC<Props> = (props) => {
  return (
    <div
      className={classNames(
        'p-2 rounded-md bg-black grid grid-template-rows grid-cols-board gap-2',
        props.className
      )}
    >
      {[...new Array(8)].map((_, rowIdx) =>
        [...new Array(8)].map((_, colIdx) => (
          <Cell
            key={8 * rowIdx + colIdx}
            state={props.boardState[rowIdx][colIdx]}
            onClick={() => props.onClick?.(rowIdx, colIdx)}
          />
        ))
      )}
    </div>
  )
}

export default Board
