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
  async function loadMovies() {
    try {
      const movies = await fetchMovies()
      setMovies(movies)
    } catch (error) {
      console.error('映画の読み込みに失敗しました:', error)
    }
  }

  loadMovies()
}, [])

  const [movies, setMovies] = useState([])
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [ searchText, setSearchText ] = useState('')
  const [selectedMovie, setSelectedMovie] = useState(null)
  const [editingMovie, setEditingMovie] = useState(null)
  const [draggedMovieId, setDraggedMovieId] = useState(null)

    /* ====================
     映画を追加
  ==================== */

async function handleAddMovie(newMovie) {
  try {
    await addMovie(newMovie, movies.length + 1)

    const updatedMovies = await fetchMovies()
    setMovies(updatedMovies)

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

    setMovies((currentMovies) =>
      currentMovies.map((movie) =>
        movie.id === updatedMovie.id
          ? updatedMovie
          : movie
      )
    )

    setEditingMovie(null)
    setSelectedMovie(updatedMovie)
  } catch (error) {
    console.error('映画情報の更新に失敗しました:', error)
    alert('保存に失敗しました')
  }
}

async function handleDropMovie(dropTargetId) {
  if (
    draggedMovieId === null ||
    draggedMovieId === dropTargetId
  ) {
    setDraggedMovieId(null)
    return
  }

  const draggedIndex = movies.findIndex(
    (movie) => movie.id === draggedMovieId
  )

  const dropTargetIndex = movies.findIndex(
    (movie) => movie.id === dropTargetId
  )

  if (
    draggedIndex === -1 ||
    dropTargetIndex === -1
  ) {
    setDraggedMovieId(null)
    return
  }

  const previousMovies = movies

  const reorderedMovies = [...movies]

  const [draggedMovie] = reorderedMovies.splice(
    draggedIndex,
    1
  )

  reorderedMovies.splice(
    dropTargetIndex,
    0,
    draggedMovie
  )

  const moviesWithUpdatedOrder = reorderedMovies.map(
    (movie, index) => ({
      ...movie,
      sortOrder: index + 1,
    })
  )

  setMovies(moviesWithUpdatedOrder)
  setDraggedMovieId(null)

  try {
    await updateMovieOrder(moviesWithUpdatedOrder)
  } catch (error) {
    console.error('並び順の保存に失敗しました:', error)

    setMovies(previousMovies)

    window.alert(
      '並び順の保存に失敗したため、元の順番に戻しました'
    )
  }
}

    /* ====================
     検索結果
  ==================== */

  const filteredMovies = movies.filter((movie) => {
    const normalizedSearchText = searchText
      .trim()
      .toLocaleLowerCase('ja-JP')

    if (!normalizedSearchText) {
      return true
    }

    return movie.title
      .toLocaleLowerCase('ja-JP')
      .includes(normalizedSearchText)
  })

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
          placeholder="検索（タイトル / タグ...）"
          aria-label="映画を検索"
        />

        <button type="button">
          グループ：すべて
        </button>

        <button type="button">
          並べ替え：昇順（オリジナル）
        </button>

        <div className="viewButtons">
          <button type="button">
            ポスター
          </button>

          <button type="button">
            5列
          </button>
        </div>

        <button
          className="addButton"
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          aria-label="映画を追加"
          title="映画を追加"
        >
          ＋
        </button>
      </header>

            {/* ====================
          映画カード一覧
      ==================== */}

      <section className="movieGrid">
        {filteredMovies.map((movie) => (
          <article
  className="movieCard"
  key={movie.id}
  draggable
  onDragStart={() => {
    setDraggedMovieId(movie.id)
  }}
  onDragOver={(event) => {
    event.preventDefault()
  }}
  onDrop={() => {
  handleDropMovie(movie.id)
}}
onDragEnd={() => {
  setDraggedMovieId(null)
}}
>
            {/* 星評価タブ */}

            <div className="ratingTab">
              <StarRating rating={movie.rating} />
            </div>

            {/* カード本体 */}

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
        ))}
      </section>

      {/* ====================
          映画追加モーダル
      ==================== */}

      {isAddModalOpen && (
        <AddMovieModal
          onClose={() => setIsAddModalOpen(false)}
          onAdd={handleAddMovie}
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
         onDelete={handleDeleteMovie}
       />
     )}
    </main>
  )
}



export default App