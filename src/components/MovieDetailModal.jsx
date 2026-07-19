/* ====================
   映画詳細モーダル
==================== */

import React from 'react'

function MovieDetailModal({
  movie,
  onClose,
  onEdit,
}) {
  if (!movie) {
    return null
  }

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
          <h2>作品情報</h2>

          <button
            className="closeButton"
            type="button"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className="detailContent">
          <div className="detailPoster">
            {movie.posterUrl ? (
              <img
                src={movie.posterUrl}
                alt={movie.title}
              />
            ) : (
              <span>POSTER</span>
            )}
          </div>

          <div className="detailInfo">
            <h3>{movie.title}</h3>

            <p>
              公開年：{movie.year}
            </p>

            <p>
              評価：{movie.rating} / 5
            </p>
          </div>

          <div className="detailActions">
            <button
              className="saveButton"
              type="button"
              onClick={() => onEdit(movie)}
            >
              編集
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

export default MovieDetailModal