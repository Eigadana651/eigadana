/* ====================
   映画追加フォーム
==================== */

import PosterPickerModal from './PosterPickerModal'
import { useState } from 'react'
import '../App.css'
import {
  searchTmdbMovie,
  fetchTmdbPosters,
  fetchTmdbMovieDetails,
} from '../services/tmdb'

function AddMovieModal({ onClose, onCancel, onAdd }) {
  const [title, setTitle] = useState('')
  const [year, setYear] = useState('')
  const [rating, setRating] = useState('3')
  const [posterUrl, setPosterUrl] = useState('')
  const [posterFileName, setPosterFileName] = useState('')

  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedTmdbId, setSelectedTmdbId] = useState(null)

  const [posterOptions, setPosterOptions] = useState([])
  const [isLoadingPosters, setIsLoadingPosters] = useState(false)

  const [posterSort, setPosterSort] = useState('japanese')
  const [selectedPosterPath, setSelectedPosterPath] = useState(null)

  const [isPosterModalOpen, setIsPosterModalOpen] = useState(false)

  /* ====================
     ポスター画像を選択
  ==================== */

  async function handleLoadPosters() {
  if (!selectedTmdbId) {
    window.alert('先にTMDbの作品候補を選んでください')
    return
  }

  setIsLoadingPosters(true)

  try {
    const posters = await fetchTmdbPosters(selectedTmdbId)

    const postersWithRandomOrder = posters
      .slice(0, 30)
      .map((poster) => ({
        ...poster,
        randomOrder: Math.random(),
      }))

    setPosterOptions(postersWithRandomOrder)
    setSelectedPosterPath(null)
    setIsPosterModalOpen(true)

  } catch (error) {
    console.error(error)
    window.alert('ポスター一覧の取得に失敗しました')
  } finally {
    setIsLoadingPosters(false)
  }
}

/* ====================
   ポスター候補の並び替え
==================== */

const sortedPosterOptions = [...posterOptions].sort((a, b) => {
  if (posterSort === 'japanese') {
    const aIsJapanese = a.iso_639_1 === 'ja' ? 1 : 0
    const bIsJapanese = b.iso_639_1 === 'ja' ? 1 : 0

    if (aIsJapanese !== bIsJapanese) {
      return bIsJapanese - aIsJapanese
    }

    return (b.vote_count || 0) - (a.vote_count || 0)
  }

  if (posterSort === 'rating') {
    if ((b.vote_average || 0) !== (a.vote_average || 0)) {
      return (b.vote_average || 0) - (a.vote_average || 0)
    }

    return (b.vote_count || 0) - (a.vote_count || 0)
  }

  if (posterSort === 'resolution') {
    return (
      (b.width || 0) * (b.height || 0) -
      (a.width || 0) * (a.height || 0)
    )
  }

  if (posterSort === 'random') {
    return a.randomOrder - b.randomOrder
  }

  return 0
})

  function handlePosterChange(event) {
    const file = event.target.files?.[0]

    if (!file) {
      setPosterUrl('')
      setPosterFileName('')
      return
    }

    if (!file.type.startsWith('image/')) {
      window.alert('画像ファイルを選択してください。')
      event.target.value = ''
      return
    }

    const temporaryUrl = URL.createObjectURL(file)

    setPosterUrl(temporaryUrl)
    setPosterFileName(file.name)
  }

  async function handleTitleChange(event) {
  const value = event.target.value

  setTitle(value)

  if (value.trim().length < 2) {
    setSearchResults([])
    return
  }

  setIsSearching(true)

  try {
    const results = await searchTmdbMovie(value)
    setSearchResults(results.slice(0, 5))
  } catch (error) {
    console.error(error)
  } finally {
    setIsSearching(false)
  }
}

  /* ====================
     映画を追加
  ==================== */

  async function handleSubmit(event) {
  event.preventDefault()

  const trimmedTitle = title.trim()
  const numericYear = Number(year)
  const numericRating = Number(rating)

  if (!trimmedTitle) {
    return
  }

 let originalTitle = ''
let director = ''
let productionCountries = []
let releaseDate = ''

if (selectedTmdbId) {
  try {
    const details = await fetchTmdbMovieDetails(selectedTmdbId)

    originalTitle = details.originalTitle
    director = details.director
    productionCountries = details.productionCountries
    releaseDate = details.releaseDate
  } catch (error) {
    console.error('TMDb詳細取得に失敗しました:', error)
  }
}

onAdd({
  id: crypto.randomUUID(),
  title: trimmedTitle,
  year: numericYear,
  rating: numericRating,
  posterUrl,
  tmdbId: selectedTmdbId,

  originalTitle,
  director,
  productionCountries,
  releaseDate,
})
}
  

  return (
    <div
      className="modalOverlay"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose()
        }
      }}
    >
      <section
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-movie-title"
      >
        {/* ====================
            追加画面ヘッダー
        ==================== */}

        <div className="modalHeader">
          <h2 id="add-movie-title">
            映画を追加
          </h2>

          <button
            className="closeButton"
            type="button"
            onClick={onClose}
            aria-label="閉じる"
          >
            ×
          </button>
        </div>

        {/* ====================
            入力フォーム
        ==================== */}

        <form
          className="movieForm"
          onSubmit={handleSubmit}
        >
          {/* ポスター画像 */}

          <div className="posterInputSection">
            <div className="posterPreview">
              {posterUrl ? (
                <img
                  src={posterUrl}
                  alt="選択したポスターのプレビュー"
                />
              ) : (
                <span>POSTER</span>
              )}
            </div>

            <div className="posterInputControls">
              <button
  type="button"
  className="posterPrimaryButton"
  onClick={handleLoadPosters}
  disabled={isLoadingPosters}
>
  {isLoadingPosters
    ? 'ポスターを読み込み中...'
    : 'ポスターを変更'}
</button>

<label
  className="posterFileButton posterPrimaryButton"
  htmlFor="poster-file"
>
  ポスター画像をアップロード
</label>

              <input
                id="poster-file"
                className="posterFileInput"
                type="file"
                accept="image/*"
                onChange={handlePosterChange}
              />

              {posterUrl && (
                <button
                  className="removePosterButton"
                  type="button"
                  onClick={() => {
                    setPosterUrl('')
                    setPosterFileName('')
                  }}
                >
                  画像を外す
                </button>
              )}
               <p className="posterFileName">
                {posterFileName || (posterUrl ? 'TMDbポスター選択中' : '画像は未選択です')}
              </p>
            </div>
          </div>

          {/* タイトル */}

          <label>
            <span>タイトル</span>

            <input
              type="text"
              value={title}
              onChange={handleTitleChange}
              placeholder="例：トイ・ストーリー"
              autoFocus
              required
            />
          </label>

          {isSearching && (
  <p>検索中...</p>
)}

{searchResults.length > 0 && (
  <div className="tmdbSearchResults">
    {searchResults.map((movie) => (
      <button
  key={movie.id}
  type="button"
  className="tmdbSearchResultCard"
  onClick={() => {
    setTitle(movie.title || '')
    setYear(movie.release_date?.slice(0, 4) || '')
    setSelectedTmdbId(movie.id)

    setPosterUrl(
      movie.poster_path
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        : ''
    )

    setSearchResults([])
  }}
>
  <div className="tmdbSearchResultPoster">
    {movie.poster_path ? (
      <img
        src={`https://image.tmdb.org/t/p/w185${movie.poster_path}`}
        alt={`${movie.title}のポスター`}
      />
    ) : (
      <span>NO IMAGE</span>
    )}
  </div>

  <div className="tmdbSearchResultInfo">
    <strong>{movie.title}</strong>

    {movie.original_title &&
      movie.original_title !== movie.title && (
        <span className="tmdbOriginalTitle">
          {movie.original_title}
        </span>
      )}

    <span className="tmdbReleaseYear">
      {movie.release_date
        ? movie.release_date.slice(0, 4)
        : '公開年不明'}
    </span>
  </div>
</button>
    ))}
  </div>
)}

<PosterPickerModal
  isOpen={isPosterModalOpen}
  onClose={() => {
    setIsPosterModalOpen(false)
    setSelectedPosterPath(null)
  }}
  posterSort={posterSort}
  setPosterSort={setPosterSort}
  sortedPosterOptions={sortedPosterOptions}
  selectedPosterPath={selectedPosterPath}
  setSelectedPosterPath={setSelectedPosterPath}
  setPosterUrl={setPosterUrl}
/>

          {/* 公開年 */}

          <label>
            <span>公開年</span>

            <input
              type="number"
              value={year}
              onChange={(event) => setYear(event.target.value)}
              placeholder="例：1995"
              min="1880"
              max="2100"
              required
            />
          </label>

          {/* 評価 */}

          <label>
            <span>自分の評価</span>

            <select
              value={rating}
              onChange={(event) => setRating(event.target.value)}
            >
              <option value="0">未評価</option>
              <option value="0.5">0.5</option>
              <option value="1">1.0</option>
              <option value="1.5">1.5</option>
              <option value="2">2.0</option>
              <option value="2.5">2.5</option>
              <option value="3">3.0</option>
              <option value="3.5">3.5</option>
              <option value="4">4.0</option>
              <option value="4.5">4.5</option>
              <option value="5">5.0</option>
            </select>
          </label>

          {/* 操作ボタン */}

   <div className="formActions">
  <button
    className="cancelButton"
    type="button"
    onClick={onCancel}
  >
    キャンセル
  </button>

  <button
    className="saveButton"
    type="submit"
  >
    追加する
  </button>
</div>
        </form>
      </section>
    </div>
  )
}

export default AddMovieModal