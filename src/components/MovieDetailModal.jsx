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
      <section className="modal detailModal">
        <button
          className="closeButton"
          type="button"
          onClick={onClose}
        >
          ×
        </button>

        <div className="detailLayout">

          {/* 左側 */}
          <div className="detailLeft">
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
          </div>

          {/* 右側 */}
          <div className="detailRight">

            <div className="detailHeader">
              <h2>{movie.title}</h2>

              <p className="detailOriginalTitle">
                Original Title
              </p>
            </div>

            <div className="detailMeta">
              <p><strong>公開年</strong> {movie.year}</p>
              <p><strong>監督</strong> －</p>
              <p><strong>制作国</strong> －</p>
              <p><strong>評価</strong> {movie.rating} / 5</p>
            </div>

            <div className="detailMemo">
              <h3>メモ</h3>

              <div className="detailMemoBox">
                メモはまだありません。
              </div>
            </div>

            <div className="detailTags">
              <span>タグ</span>
            </div>

            <div className="detailFooter">
              <button
                className="saveButton"
                type="button"
                onClick={() => onEdit(movie)}
              >
                編集
              </button>
            </div>

          </div>

        </div>
      </section>
    </div>
  )
}

export default MovieDetailModal