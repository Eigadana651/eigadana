import PosterPickerModal from './PosterPickerModal'
import { useState } from 'react'
import '../App.css'

import {
  searchTmdbMovie,
  fetchTmdbPosters,
} from '../services/tmdb'

function EditMovieModal({
  movie,
  onClose,
  onSave,
  onSaveTags,
  onDelete,
  allTags = [],
}) {
 const [title, setTitle] = useState(movie.title)
const [year, setYear] = useState(String(movie.year))
const [releaseDate, setReleaseDate] = useState(movie.releaseDate || '')
const [rating, setRating] = useState(String(movie.rating))
const [posterUrl, setPosterUrl] = useState(movie.posterUrl || '')

  const [searchResults, setSearchResults] = useState([])
const [isSearching, setIsSearching] = useState(false)
const [selectedTmdbId, setSelectedTmdbId] = useState(
  movie.tmdbId ?? null
)

const [posterOptions, setPosterOptions] = useState([])
const [isLoadingPosters, setIsLoadingPosters] = useState(false)

const [posterSort, setPosterSort] = useState('japanese')
const [selectedPosterPath, setSelectedPosterPath] = useState(null)

const [isPosterModalOpen, setIsPosterModalOpen] = useState(false)
const [selectedTags, setSelectedTags] = useState(movie.tags || [])
const [newTag, setNewTag] = useState('')
const [isTagCreateModalOpen, setIsTagCreateModalOpen] = useState(false)
const [isTagSelectModalOpen, setIsTagSelectModalOpen] = useState(false)
const [draftTags, setDraftTags] = useState(movie.tags || [])

const tagOptions = Array.from(
  new Set([
    ...(allTags || []),
    ...selectedTags,
    ...draftTags,
  ])
)

async function handleLoadPosters() {
  if (!selectedTmdbId) {
    window.alert(
      'この作品にはTMDb情報が保存されていません。'
    )
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

  /* ====================
     新しいポスター画像を選択
  ==================== */

  function handlePosterChange(event) {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    if (!file.type.startsWith('image/')) {
      window.alert('画像ファイルを選択してください。')
      event.target.value = ''
      return
    }

    const temporaryUrl = URL.createObjectURL(file)
    setPosterUrl(temporaryUrl)
  }
  function toggleTag(tag) {
  setSelectedTags((currentTags) => {
    if (currentTags.includes(tag)) {
      return currentTags.filter(
        (currentTag) => currentTag !== tag
      )
    }

    return [...currentTags, tag]
  })
}
function toggleDraftTag(tag) {
  setDraftTags((currentTags) => {
    if (currentTags.includes(tag)) {
      return currentTags.filter(
        (currentTag) => currentTag !== tag
      )
    }

    return [...currentTags, tag]
  })
}

function handleCreateTag() {
  const trimmedTag = newTag.trim()

  if (!trimmedTag) {
    return
  }

  setDraftTags((currentTags) => {
    if (currentTags.includes(trimmedTag)) {
      return currentTags
    }

    return [...currentTags, trimmedTag]
  })

  setNewTag('')
  setIsTagCreateModalOpen(false)
  setIsTagSelectModalOpen(true)
}

  /* ====================
     編集内容を保存
  ==================== */

  function handleSubmit(event) {
    event.preventDefault()

    const trimmedTitle = title.trim()

    if (!trimmedTitle) {
      return
    }

   onSave({
  ...movie,
  title: trimmedTitle,
  year: releaseDate
    ? Number(releaseDate.slice(0, 4))
    : Number(year),
  releaseDate,
  rating: Number(rating),
  posterUrl,
  tmdbId: selectedTmdbId,
  tags: selectedTags,
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
        aria-labelledby="edit-movie-title"
      >
        {/* ====================
            編集画面ヘッダー
        ==================== */}

        <div className="modalHeader">
          <h2 id="edit-movie-title">
            映画を編集
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
            編集フォーム
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
                  alt="ポスターのプレビュー"
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
                className="posterFileButton"
                htmlFor="edit-poster-file"
              >
                ポスター画像をアップロード
              </label>

              <input
                id="edit-poster-file"
                className="posterFileInput"
                type="file"
                accept="image/*"
                onChange={handlePosterChange}
              />

              {posterUrl && (
                <button
                  className="removePosterButton"
                  type="button"
                  onClick={() => setPosterUrl('')}
                >
                  画像を外す
                </button>
              )}
            </div>
          </div>

          {/* タイトル */}

          <label>
            <span>タイトル</span>

            <input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
              autoFocus
            />
          </label>

         {/* 公開日 */}

<label>
  <span>公開日</span>

  <input
    type="date"
    value={releaseDate}
    onChange={(event) => setReleaseDate(event.target.value)}
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
         <div className="tagEditor">
  <span>タグ</span>

  <div className="tagOptions">
    {selectedTags.map((tag) => (
  <button
    key={tag}
    type="button"
    className="tagChip isSelected"
    onClick={() => toggleTag(tag)}
  >
    × {tag}
  </button>
))}

    <button
  type="button"
  className="tagChip"
  onClick={() => {
    setDraftTags([...selectedTags])
    setIsTagSelectModalOpen(true)
  }}
>
  タグを追加
</button>
  </div>
</div>

          {/* 保存・キャンセル */}

          <div className="formActions">
            <button
              className="cancelButton"
              type="button"
              onClick={onClose}
            >
              キャンセル
            </button>

            <button
              className="saveButton"
              type="submit"
            >
              保存する
            </button>
          </div>

          {/* ====================
              削除エリア
          ==================== */}

          <div className="deleteSection">
            <p>
              この作品を映画棚から削除します。
            </p>

            <button
              className="deleteMovieButton"
              type="button"
              onClick={() => onDelete(movie.id)}
            >
              映画を削除
            </button>
          </div>
        </form>
      </section>
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
{isTagSelectModalOpen && (
  <div
    className="tagSelectOverlay"
    onMouseDown={(event) => {
      if (event.target === event.currentTarget) {
        setDraftTags([...selectedTags])
        setIsTagSelectModalOpen(false)
      }
    }}
  >
    <section
      className="tagSelectModal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tag-select-title"
    >
      <div className="tagSelectHeader">
        <h3 id="tag-select-title">
          タグを選択
        </h3>

        <button
  type="button"
  className="closeButton"
  onClick={() => {
  setDraftTags([...selectedTags])
  setIsTagSelectModalOpen(false)
}}
          aria-label="閉じる"
        >
          ×
        </button>
      </div>

      <div className="tagSelectCurrent">
  <span>選択中</span>

  <div className="tagOptions">
    {draftTags.length > 0 ? (
      draftTags.map((tag) => (
        <button
          key={tag}
          type="button"
          className="tagChip isSelected"
          onClick={() => toggleDraftTag(tag)}
        >
          × {tag}
        </button>
      ))
    ) : (
      <span className="tagSelectEmpty">
        タグなし
      </span>
    )}
  </div>
</div>

<div className="tagSelectAll">
  <span>タグ一覧</span>

  <div className="tagOptions">
    {tagOptions.length > 0 ? (
      tagOptions.map((tag) => {
        const isSelected = draftTags.includes(tag)

        return (
          <button
            key={tag}
            type="button"
            className={
              isSelected
                ? 'tagChip isSelected'
                : 'tagChip'
            }
            onClick={() => toggleDraftTag(tag)}
          >
            {isSelected ? `× ${tag}` : tag}
          </button>
        )
      })
    ) : (
      <span className="tagSelectEmpty">
        まだタグがありません
      </span>
    )}
  </div>
</div>

      <div className="tagSelectActions">
  <button
    type="button"
    className="tagCreateOpenButton"
    onClick={() => {
      setIsTagSelectModalOpen(false)
      setIsTagCreateModalOpen(true)
    }}
  >
    新しいタグを作成
  </button>

 <button
  type="button"
  className="saveButton"
  onClick={async () => {
    try {
      await onSaveTags(movie.id, draftTags)

      setSelectedTags([...draftTags])
      setIsTagSelectModalOpen(false)
    } catch (error) {
      console.error('タグの保存に失敗しました:', error)
    }
  }}
>
  保存
</button>
</div>
    </section>
  </div>
)}
{isTagCreateModalOpen && (
  <div
    className="tagCreateOverlay"
    onMouseDown={(event) => {
      if (event.target === event.currentTarget) {
  setIsTagCreateModalOpen(false)
  setIsTagSelectModalOpen(true)
  setNewTag('')
}
    }}
  >
    <section
      className="tagCreateModal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tag-create-title"
    >
      <h3 id="tag-create-title">
        新しいタグを作成
      </h3>

      <input
        type="text"
        value={newTag}
        onChange={(event) => setNewTag(event.target.value)}
        placeholder="タグ名を入力"
        autoFocus
      />

      <div className="tagCreateActions">
        <button
          type="button"
          className="cancelButton"
          onClick={() => {
  setIsTagCreateModalOpen(false)
  setIsTagSelectModalOpen(true)
  setNewTag('')
}}
        >
          キャンセル
        </button>

        <button
          type="button"
          className="saveButton"
          onClick={handleCreateTag}
        >
          作成
        </button>
      </div>
    </section>
  </div>
)}
    </div>
  )
}

export default EditMovieModal