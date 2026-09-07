import React from 'react'
import StarRating from './StarRating'

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

              {movie.originalTitle &&
  movie.originalTitle !== movie.title && (
    <p className="detailOriginalTitle">
      {movie.originalTitle}
    </p>
)}
            </div>

            <div className="detailMeta">
  <p>
  <strong>公　開：</strong>
  <span className="detailValue">
    {movie.year}年
  </span>
</p>

<p>
  <strong>監　督：</strong>
  <span className="detailValue">
    {movie.director || '－'}
  </span>
</p>

<p>
  <strong>制作国：</strong>
  <span className="detailValue">
    {movie.productionCountries?.join(' / ') || '－'}
  </span>
</p>

<p>
  <strong>評　価：</strong>
  <span className="detailValue">
    <StarRating rating={movie.rating} />
  </span>
</p>
</div>

      <div className="detailTags">
  <strong>タグ：</strong>

  <div className="detailTagList">
    {(movie.tags || []).length > 0 ? (
      movie.tags.map((tag) => (
        <span
          key={tag}
          className="tagChip"
        >
          {tag}
        </span>
      ))
    ) : (
      <span className="detailTagEmpty">
        タグなし
      </span>
    )}
  </div>
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