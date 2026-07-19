/* ====================
   星評価表示
   0.5単位に対応
==================== */

function StarRating({ rating }) {
  const percentage = `${(rating / 5) * 100}%`

  return (
    <div
      className="starRating"
      aria-label={`評価 ${rating} / 5`}
      title={`評価 ${rating} / 5`}
    >
      <span className="emptyStars">★★★★★</span>

      <span
        className="filledStars"
        style={{ width: percentage }}
      >
        ★★★★★
      </span>
    </div>
  )
}

export default StarRating