import { useState } from 'react'

function PopCreateModal({ onClose }) {
  const [text, setText] = useState('')

  return (
    <div className="modalOverlay">
      <div className="modal">

        <h2>POPを追加</h2>

        <input
          type="text"
          placeholder="例：MCU Phase 1"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <div className="modalButtons">
          <button onClick={onClose}>
            キャンセル
          </button>

          <button disabled={!text.trim()}>
            追加
          </button>
        </div>

      </div>
    </div>
  )
}

export default PopCreateModal