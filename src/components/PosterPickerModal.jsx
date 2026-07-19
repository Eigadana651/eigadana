import '../App.css'

function PosterPickerModal({
  isOpen,
  onClose,
  posterSort,
  setPosterSort,
  sortedPosterOptions,
  selectedPosterPath,
  setSelectedPosterPath,
  setPosterUrl,
}) {
  if (!isOpen) {
    return null
  }

  return (
    <div className="posterModalOverlay">
      <div className="posterModal">
        <div className="posterModalHeader">
  <h2>ポスターを選択</h2>

  <button
    type="button"
    className="posterModalClose"
    onClick={() => {
      onClose()
      setSelectedPosterPath(null)
    }}
  >
    ×
  </button>
</div>
<div className="posterSortControls">
  <div className="tmdbPosterOptions">
  {sortedPosterOptions.map((poster) => {
    const posterImageUrl =
      `https://image.tmdb.org/t/p/w300${poster.file_path}`

    const isSelected =
      selectedPosterPath === poster.file_path

    return (
      <button
        className={isSelected ? 'isSelected' : ''}
        key={poster.file_path}
        type="button"
        onClick={() => {
          setSelectedPosterPath(poster.file_path)
        }}
        aria-label="このポスターを選択"
      >
        <img
          src={posterImageUrl}
          alt="ポスター候補"
        />
      </button>
    )
  })}
</div>
<div className="posterSelectionActions">
  <button
    type="button"
    disabled={!selectedPosterPath}
    onClick={() => {
      setPosterUrl(
        `https://image.tmdb.org/t/p/w500${selectedPosterPath}`
      )

      onClose()
      setSelectedPosterPath(null)
    }}
  >
    このポスターを使用
  </button>
</div>
  <label>
    <span>候補の並び順</span>

    <select
      value={posterSort}
      onChange={(event) => {
        setPosterSort(event.target.value)
        setSelectedPosterPath(null)
      }}
    >
      <option value="japanese">日本語優先</option>
      <option value="rating">評価順</option>
      <option value="resolution">高解像度順</option>
      <option value="random">ランダム</option>
    </select>
  </label>
</div>
      </div>
    </div>
  )
}

export default PosterPickerModal