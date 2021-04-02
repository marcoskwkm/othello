import React from 'react'
import classNames from 'classnames'

interface Props {
  state: BoardCellState
  onClick?: () => void
  className?: string
}

const Cell: React.FC<Props> = (props) => {
  return (
    <button
      className={classNames('w-full rounded-md bg-green-500', {
        'p-1': props.state !== 'empty',
        'pb-full': props.state === 'empty',
      })}
      disabled={props.state !== 'empty'}
      onClick={() => props.onClick?.()}
    >
      {props.state !== 'empty' ? (
        <div
          className={classNames('rounded-full pb-full w-full', {
            'bg-white': props.state === 'white',
            'bg-black': props.state === 'black',
          })}
        />
      ) : null}
    </button>
  )
}

export default Cell
