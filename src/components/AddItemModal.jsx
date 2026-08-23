import '../App.css'

function AddItemModal({
  onClose,
  onAddMovie,
  onAddPop,
}) {
  return (
    <div
      className="modalOverlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose()
        }
      }}
    >
      <section className="modal">
        <div className="modalHeader">
          <h2>追加</h2>

          <button
            className="closeButton"
            type="button"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className="movieForm">
          <button
            className="saveButton"
            type="button"
            onClick={onAddMovie}
          >
            映画を追加
          </button>

          <button
            className="saveButton"
            type="button"
            onClick={onAddPop}
          >
            POPを追加
          </button>
        </div>
      </section>
    </div>
  )
}

export default AddItemModal