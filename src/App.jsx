import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import './App.css'
import StarRating from './components/StarRating'
import MovieDetailModal from './components/MovieDetailModal'
import AddMovieModal from './components/AddMovieModal'
import {
  searchTmdbMovie,
  fetchTmdbPosters,
} from './services/tmdb'

import EditMovieModal from './components/EditMovieModal'

import {
  fetchMovies,
  addMovie,
  deleteMovie,
  updateMovie,
  updateMovieOrder,
} from './services/movies'

import { fetchTags, createTag, renameTag, deleteTag } from './services/tags'

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'

import {
  SortableContext,
  rectSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'

import SortableMovieCard from './components/SortableMovieCard'

import SectionCard from './components/SectionCard'
import PopCard from './components/PopCard'
import PopCreateModal from './components/PopCreateModal'
import AddItemModal from './components/AddItemModal'
import TagManagerModal from './components/TagManagerModal'


/* ====================
   最初から表示する仮データ
==================== */

const initialMovies = [
  {
    id: 1,
    title: 'ガーディアンズ・オブ・ギャラクシー',
    year: 2014,
    rating: 5,
    posterUrl: '',
  },
  {
    id: 2,
    title: 'スター・ウォーズ エピソード3／シスの復讐',
    year: 2005,
    rating: 4,
    posterUrl: '',
  },
  {
    id: 3,
    title: 'ウォーリー',
    year: 2008,
    rating: 5,
    posterUrl: '',
  },
  {
    id: 4,
    title: '南極料理人',
    year: 2009,
    rating: 4,
    posterUrl: '',
  },
  {
    id: 5,
    title: 'リンダ リンダ リンダ',
    year: 2005,
    rating: 4,
    posterUrl: '',
  },
]


/* ====================
   メイン画面
==================== */

function App() {

  /* ====================
     Supabaseから映画一覧を読み込む
  ==================== */

  useEffect(() => {
  async function loadData() {
    try {
      const [movies, tags] = await Promise.all([
        fetchMovies(),
        fetchTags(),
      ])

      setMovies(movies)
      setShelfItems(movies)
      setTagMaster(tags)
    } catch (error) {
      console.error('データの読み込みに失敗しました:', error)
    }
  }

  loadData()
}, [])

  const [movies, setMovies] = useState([])
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [ searchText, setSearchText ] = useState('')
  const [selectedMovie, setSelectedMovie] = useState(null)
  const [editingMovie, setEditingMovie] = useState(null)
  const [isPopModalOpen, setIsPopModalOpen] = useState(false)
  const [shelfItems, setShelfItems] = useState([])
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false)
  const [sortMode, setSortMode] = useState('original')
  const [selectedTags, setSelectedTags] = useState([])
  const [isTagMenuOpen, setIsTagMenuOpen] = useState(false)
  const [tagMaster, setTagMaster] = useState([])
  const [isTagManagerOpen, setIsTagManagerOpen] = useState(false)

  const sensors = useSensors(
  useSensor(PointerSensor, {
    activationConstraint: {
      distance: 8,
    },
  })
)

    /* ====================
     映画を追加
  ==================== */

async function handleAddMovie(newMovie) {
  try {
    await addMovie(newMovie, movies.length + 1)

    const updatedMovies = await fetchMovies()
setMovies(updatedMovies)

setShelfItems((currentItems) => {
  const newMovies = updatedMovies.filter(
    (movie) =>
      !currentItems.some((item) => item.id === movie.id)
  )

  return [
    ...currentItems,
    ...newMovies,
  ]
})

    setIsAddModalOpen(false)
  } catch (error) {
    console.error('映画の保存に失敗しました:', error)
    alert('保存に失敗しました')
  }
}

  /* ====================
     映画を削除
  ==================== */

async function handleDeleteMovie(movieId) {
  const shouldDelete = window.confirm(
    'この映画を削除しますか？'
  )

  if (!shouldDelete) {
    return
  }

  try {
    await deleteMovie(movieId)

    setMovies((currentMovies) =>
      currentMovies.filter((movie) => movie.id !== movieId)
    )

    setShelfItems((currentItems) =>
  currentItems.filter((item) => item.id !== movieId)
)
    setSelectedMovie(null)
    setEditingMovie(null)
  } catch (error) {
    console.error('映画の削除に失敗しました:', error)
    alert('削除に失敗しました')
  }
}

  /* ====================
   映画情報を更新
==================== */

async function handleUpdateMovie(updatedMovie) {
  try {
    await updateMovie(updatedMovie)

    const updatedMovies = await fetchMovies()

    setMovies(updatedMovies)
    setShelfItems(updatedMovies)

    setEditingMovie(null)
    setSelectedMovie(null)
  } catch (error) {
    console.error('映画情報の更新に失敗しました:', error)
    alert('保存に失敗しました')
  }
}async function handleSaveMovieTags(movieId, tags) {
  try {
    const targetMovie = movies.find(
      (movie) => movie.id === movieId
    )

    if (!targetMovie) {
      return
    }

    await updateMovie({
      ...targetMovie,
      tags,
    })

    const updatedMovies = await fetchMovies()

    setMovies(updatedMovies)
    setShelfItems(updatedMovies)

    const updatedEditingMovie = updatedMovies.find(
      (movie) => movie.id === movieId
    )

    if (updatedEditingMovie) {
      setEditingMovie(updatedEditingMovie)
    }
  } catch (error) {
    console.error('タグの保存に失敗しました:', error)
    alert('タグの保存に失敗しました')
    throw error
  }
}

async function handleCreateMasterTag(name) {
  try {
    if (tagMaster.some((tag) => tag.name === name)) {
      alert('同じ名前のタグがすでにあります')
      return
    }

    const createdTag = await createTag(name)

    setTagMaster((currentTags) => [
      ...currentTags,
      createdTag,
    ])
  } catch (error) {
    console.error('タグの追加に失敗しました:', error)
    alert('タグの追加に失敗しました')
    throw error
  }
}

async function handleRenameMasterTag(tagId, newName) {
  const targetTag = tagMaster.find(
    (tag) => tag.id === tagId
  )

  if (!targetTag) {
    return
  }

  if (targetTag.name === newName) {
    return
  }

  if (
    tagMaster.some(
      (tag) => tag.id !== tagId && tag.name === newName
    )
  ) {
    alert('同じ名前のタグがすでにあります')
    return
  }

  try {
    const renamedTag = await renameTag(tagId, newName)

    const affectedMovies = movies.filter((movie) =>
      (movie.tags || []).includes(targetTag.name)
    )

    const updatedMovies = affectedMovies.map((movie) => ({
      ...movie,
      tags: Array.from(
        new Set(
          (movie.tags || []).map((tag) =>
            tag === targetTag.name ? newName : tag
          )
        )
      ),
    }))

    await Promise.all(
      updatedMovies.map((movie) => updateMovie(movie))
    )

    const updatedMovieMap = new Map(
      updatedMovies.map((movie) => [movie.id, movie])
    )

    setTagMaster((currentTags) =>
      currentTags.map((tag) =>
        tag.id === tagId ? renamedTag : tag
      )
    )

    setMovies((currentMovies) =>
      currentMovies.map(
        (movie) => updatedMovieMap.get(movie.id) || movie
      )
    )

    setShelfItems((currentItems) =>
      currentItems.map(
        (item) => updatedMovieMap.get(item.id) || item
      )
    )

    setSelectedTags((currentTags) =>
      Array.from(
        new Set(
          currentTags.map((tag) =>
            tag === targetTag.name ? newName : tag
          )
        )
      )
    )
  } catch (error) {
    console.error('タグ名の変更に失敗しました:', error)
    alert('タグ名の変更に失敗しました')
    throw error
  }
}

async function handleDeleteMasterTag(tagId) {
  const targetTag = tagMaster.find(
    (tag) => tag.id === tagId
  )

  if (!targetTag) {
    return
  }

  try {
    await deleteTag(tagId)

    const affectedMovies = movies.filter((movie) =>
      (movie.tags || []).includes(targetTag.name)
    )

    const updatedMovies = affectedMovies.map((movie) => ({
      ...movie,
      tags: (movie.tags || []).filter(
        (tag) => tag !== targetTag.name
      ),
    }))

    await Promise.all(
      updatedMovies.map((movie) => updateMovie(movie))
    )

    const updatedMovieMap = new Map(
      updatedMovies.map((movie) => [movie.id, movie])
    )

    setTagMaster((currentTags) =>
      currentTags.filter((tag) => tag.id !== tagId)
    )

    setMovies((currentMovies) =>
      currentMovies.map(
        (movie) => updatedMovieMap.get(movie.id) || movie
      )
    )

    setShelfItems((currentItems) =>
      currentItems.map(
        (item) => updatedMovieMap.get(item.id) || item
      )
    )

    setSelectedTags((currentTags) =>
      currentTags.filter(
        (tag) => tag !== targetTag.name
      )
    )
  } catch (error) {
    console.error('タグの削除に失敗しました:', error)
    alert('タグの削除に失敗しました')
    throw error
  }
}

function handleAddPop(text) {
  const newPop = {
    id: `pop-${Date.now()}`,
    type: 'pop',
    text,
  }

  setShelfItems((currentItems) => [
    ...currentItems,
    newPop,
  ])

  setIsPopModalOpen(false)
}


async function handleDragEnd(event) {
  const { active, over } = event

  if (!over || active.id === over.id) {
    return
  }

  const oldIndex = shelfItems.findIndex(
    (item) => item.id === active.id
  )

  const newIndex = shelfItems.findIndex(
    (item) => item.id === over.id
  )

  if (oldIndex === -1 || newIndex === -1) {
    return
  }

  const reorderedItems = arrayMove(
    shelfItems,
    oldIndex,
    newIndex
  )

  setShelfItems(reorderedItems)
  const reorderedMovies = reorderedItems.filter(
  (item) => item.type !== 'pop' && item.type !== 'section'
)

setMovies(reorderedMovies)

try {
  await updateMovieOrder(reorderedMovies)
} catch (error) {
  console.error('映画の並び順の保存に失敗しました:', error)
  alert('並び順の保存に失敗しました')
}
}
const tagUsageCounts = movies.reduce((counts, movie) => {
  ;(movie.tags || []).forEach((tag) => {
    counts[tag] = (counts[tag] || 0) + 1
  })

  return counts
}, {})

const allTags = tagMaster
  .map((tag) => tag.name)
  .sort((a, b) => {
    const countDifference =
      (tagUsageCounts[b] || 0) - (tagUsageCounts[a] || 0)

    if (countDifference !== 0) {
      return countDifference
    }

    return a.localeCompare(b, 'ja')
  })
 const displayedShelfItems = (() => {
  const normalizedSearchText = searchText
    .trim()
    .toLocaleLowerCase('ja-JP')

  const filteredItems = shelfItems.filter((item) => {
  if (item.type === 'pop' || item.type === 'section') {
    return !normalizedSearchText && selectedTags.length === 0
  }

  const matchesSearch =
    !normalizedSearchText ||
    item.title
      .toLocaleLowerCase('ja-JP')
      .includes(normalizedSearchText)

  const movieTags = item.tags || []

  const matchesTags =
    selectedTags.length === 0 ||
    selectedTags.every((tag) => movieTags.includes(tag))

  return matchesSearch && matchesTags
})

  if (sortMode === 'original') {
    return filteredItems
  }

  const movieItems = filteredItems.filter(
    (item) => item.type !== 'pop' && item.type !== 'section'
  )

  const sortedMovies = [...movieItems].sort((a, b) => {
  if (sortMode === 'year-asc') {
    const aDate = a.releaseDate || `${a.year}-01-01`
    const bDate = b.releaseDate || `${b.year}-01-01`

    return aDate.localeCompare(bDate)
  }

  if (sortMode === 'year-desc') {
    const aDate = a.releaseDate || `${a.year}-01-01`
    const bDate = b.releaseDate || `${b.year}-01-01`

    return bDate.localeCompare(aDate)
  }

  if (sortMode === 'rating-desc') {
    return b.rating - a.rating
  }

  if (sortMode === 'rating-asc') {
    return a.rating - b.rating
  }

  return 0
})

  let movieIndex = 0

  return filteredItems.map((item) => {
    if (item.type === 'pop' || item.type === 'section') {
      return item
    }

    const movie = sortedMovies[movieIndex]
    movieIndex += 1

    return movie
  })
})()

  return (
    <main className="app">
      {/* ====================
          上部操作バー
      ==================== */}

      <header className="toolbar">
       <input
          className="search"
          type="search"
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
          placeholder="検索（タイトル）"
          aria-label="映画を検索"
        />

        <div className="tagFilter">
  <button
    type="button"
    onClick={() => setIsTagMenuOpen((current) => !current)}
  >
    {selectedTags.length === 0
      ? 'タグ：すべて'
      : `タグ：${selectedTags.length}件`}
  </button>

  {isTagMenuOpen && (
    <div className="tagFilterMenu">
      {allTags.length > 0 ? (
        <>
         {allTags.map((tag) => {
  const isSelected = selectedTags.includes(tag)

  return (
    <button
      key={tag}
      type="button"
      className={isSelected ? 'tagChip isSelected' : 'tagChip'}
      onClick={() => {
        setSelectedTags((currentTags) => {
          if (currentTags.includes(tag)) {
            return currentTags.filter(
              (currentTag) => currentTag !== tag
            )
          }

          return [...currentTags, tag]
        })
      }}
    >
      {isSelected ? `× ${tag}` : tag}
    </button>
  )
})}

          {selectedTags.length > 0 && (
           <button
  className="tagFilterClear"
  type="button"
  onClick={() => setSelectedTags([])}
>
  すべて解除
</button>
          )}
        </>
      ) : (
        <span>タグがありません</span>
      )}
            <button
        className="tagManageButton"
        type="button"
        onClick={() => {
          setIsTagManagerOpen(true)
          setIsTagMenuOpen(false)
        }}
      >
        タグを管理
      </button>
    </div>
  )}
</div>

        <select
  value={sortMode}
  onChange={(event) => setSortMode(event.target.value)}
  aria-label="並べ替え"
>
  <option value="original">
    並べ替え：オリジナル
  </option>

  <option value="year-asc">
    公開順：昇順
  </option>

  <option value="year-desc">
    公開順：降順
  </option>

  <option value="rating-desc">
    評価順：高い順
  </option>

  <option value="rating-asc">
    評価順：低い順
  </option>
</select>

      </header>

            {/* ====================
          映画カード一覧
      ==================== */}
  <DndContext
  sensors={
  sortMode === 'original' &&
  !searchText.trim() &&
  selectedTags.length === 0
    ? sensors
    : []
}
  collisionDetection={closestCenter}
  onDragEnd={handleDragEnd}
>
  <SortableContext
    items={displayedShelfItems.map((item) => item.id)}
    strategy={rectSortingStrategy}
  >
    <section className="movieGrid">
      {displayedShelfItems.map((item) => {

if (item.type === 'section') {
  return (
    <SectionCard
      key={item.id}
      text={item.text}
    />
  )
}

if (item.type === 'pop') {
  return (
    <SortableMovieCard
      id={item.id}
      key={item.id}
    >
      <PopCard text={item.text} />
    </SortableMovieCard>
  )
}

  const movie = item

  return (
    <SortableMovieCard
      id={movie.id}
      key={movie.id}
    >
      <article className="movieCard">
        <div className="ratingTab">
          <StarRating rating={movie.rating} />
        </div>

        <div className="cardFrame">
          <div
            className="poster"
            onClick={() => setSelectedMovie(movie)}
          >
            {movie.posterUrl ? (
              <img
                src={movie.posterUrl}
                alt={`${movie.title}のポスター`}
              />
            ) : (
              <span>POSTER</span>
            )}
          </div>

          <div className="movieInfo">
            <div className="titleBlock">
              <h3>{movie.title}</h3>
              <p>（{movie.year}）</p>
            </div>
          </div>
        </div>
      </article>
    </SortableMovieCard>
  )
})}
      
    </section>
  </SortableContext>
</DndContext>
<button
  className="addButton"
  type="button"
  onClick={() => setIsAddModalOpen(true)}
  aria-label="映画を追加"
  title="映画を追加"
>
  ＋
</button>

{isAddItemModalOpen && (
  <AddItemModal
    onClose={() => setIsAddItemModalOpen(false)}
    onAddMovie={() => {
      setIsAddItemModalOpen(false)
      setIsAddModalOpen(true)
    }}
    onAddPop={() => {
      setIsAddItemModalOpen(false)
      setIsPopModalOpen(true)
    }}
  />
)}

      {/* ====================
          映画追加モーダル
      ==================== */}

      {isAddModalOpen && (
  <AddMovieModal
    onClose={() => setIsAddModalOpen(false)}
    onCancel={() => setIsAddModalOpen(false)}
    onAdd={handleAddMovie}
  />
)}

  {isPopModalOpen && (
  <PopCreateModal
    onClose={() => setIsPopModalOpen(false)}
    onAdd={handleAddPop}
  />
)}
{isTagManagerOpen && (
  <TagManagerModal
    tagMaster={tagMaster}
    onClose={() => setIsTagManagerOpen(false)}
    onCreateTag={handleCreateMasterTag}
    onRenameTag={handleRenameMasterTag}
    onDeleteTag={handleDeleteMasterTag}
  />
)}

      {/* ====================
          映画詳細モーダル
      ==================== */}

      {selectedMovie && (
        <MovieDetailModal
          movie={selectedMovie}
          onClose={() => setSelectedMovie(null)}
          onEdit={(movie) => {
            setSelectedMovie(null)
            setEditingMovie(movie)
          }}
        />
      )}

      {/* ====================
    映画編集モーダル
==================== */}

  {editingMovie && (
  <EditMovieModal
    movie={editingMovie}
    onClose={() => setEditingMovie(null)}
    onSave={handleUpdateMovie}
    onSaveTags={handleSaveMovieTags}
    onDelete={handleDeleteMovie}
    allTags={allTags}
    onCreateMasterTag={handleCreateMasterTag}
  />
)}
    </main>
  )
}
export default App