const TMDB_TOKEN = import.meta.env.VITE_TMDB_TOKEN

const COUNTRY_NAMES = {
  US: 'アメリカ',
  JP: '日本',
  GB: 'イギリス',
  KR: '韓国',
  FR: 'フランス',
  DE: 'ドイツ',
  IT: 'イタリア',
  ES: 'スペイン',
  CN: '中国',
  TW: '台湾',
  HK: '香港',
  CA: 'カナダ',
  AU: 'オーストラリア',
  IN: 'インド',
  BR: 'ブラジル',
  MX: 'メキシコ',
  RU: 'ロシア',
}

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

export async function fetchTmdbMovieDetails(movieId) {
  const [movieResponse, creditsResponse] = await Promise.all([
    fetch(
      `https://api.themoviedb.org/3/movie/${movieId}?language=ja-JP`,
      {
        headers: {
          Authorization: `Bearer ${TMDB_TOKEN}`,
        },
      }
    ),
    fetch(
      `https://api.themoviedb.org/3/movie/${movieId}/credits?language=ja-JP`,
      {
        headers: {
          Authorization: `Bearer ${TMDB_TOKEN}`,
        },
      }
    ),
  ])

  const movie = await movieResponse.json()
  const credits = await creditsResponse.json()

  const director = credits.crew?.find(
    (person) => person.job === 'Director'
  )

  return {
  originalTitle: movie.original_title,
  productionCountries:
movie.production_countries?.map(
  (country) =>
    COUNTRY_NAMES[country.iso_3166_1] || country.name
) ?? [],
  director: director?.name ?? '',
  releaseDate: movie.release_date || '',
}
}