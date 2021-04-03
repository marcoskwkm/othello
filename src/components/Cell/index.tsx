import React from 'react'
import classNames from 'classnames'

interface Props {
  state: BoardCellState
  highlighted?: boolean
  onClick?: () => void
  className?: string
}

const Cell: React.FC<Props> = (props) => {
  return (
    <button
      className={classNames('relative w-full rounded-md bg-green-500', {
        'p-1': props.state !== 'empty',
        'pb-full': props.state === 'empty',
      })}
      disabled={props.state !== 'empty'}
      onClick={() => props.onClick?.()}
    >
      {props.state !== 'empty' ? (
        <div
          className={classNames(
            'rounded-full pb-full w-full flex items-center justify-center',
            {
              'bg-white': props.state === 'white',
              'bg-black': props.state === 'black',
            }
          )}
        >
          {props.highlighted ? (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-red-500" />
          ) : null}
        </div>
      ) : null}
    </button>
  )
}

export default Cell
