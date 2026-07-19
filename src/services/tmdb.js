const TMDB_TOKEN = import.meta.env.VITE_TMDB_TOKEN

export async function searchTmdbMovie(title) {
  const response = await fetch(
    `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(title)}&language=ja-JP`,
    {
      headers: {
        Authorization: `Bearer ${TMDB_TOKEN}`,
      },
    }
  )

  const data = await response.json()

  return data.results
}

export async function fetchTmdbPosters(movieId) {
  const response = await fetch(
    `https://api.themoviedb.org/3/movie/${movieId}/images?include_image_language=ja,en,null`,
    {
      headers: {
        Authorization: `Bearer ${TMDB_TOKEN}`,
      },
    }
  )

  const data = await response.json()

  return data.posters || []
}