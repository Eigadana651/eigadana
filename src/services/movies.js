import { supabase } from '../lib/supabase'

export async function fetchMovies() {
  const { data, error } = await supabase
    .from('movies')
    .select('*')
    .order('sort_order', { ascending: true })

  if (error) {
    throw error
  }

  return data.map((movie) => ({
  id: movie.id,
  title: movie.title,
  year: movie.year,
  rating: movie.rating,
  posterUrl: movie.poster_url || '',
  tmdbId: movie.tmdb_id,
  sortOrder: movie.sort_order,

  originalTitle: movie.original_title || '',
  director: movie.director || '',
  productionCountries: movie.production_countries || [],
}))
}

export async function addMovie(newMovie, sortOrder) {
  const { error } = await supabase
    .from('movies')
    .insert([
     {
  title: newMovie.title,
  year: newMovie.year,
  rating: newMovie.rating,
  poster_url: newMovie.posterUrl || '',
  tmdb_id: newMovie.tmdbId,
  sort_order: sortOrder,

  original_title: newMovie.originalTitle,
  director: newMovie.director,
  production_countries: newMovie.productionCountries,
}
    ])

  if (error) {
    throw error
  }
}

export async function deleteMovie(movieId) {
  const { error } = await supabase
    .from('movies')
    .delete()
    .eq('id', movieId)

  if (error) {
    throw error
  }
}

export async function updateMovie(updatedMovie) {
  const { error } = await supabase
    .from('movies')
    .update({
  title: updatedMovie.title,
  year: updatedMovie.year,
  rating: updatedMovie.rating,
  poster_url: updatedMovie.posterUrl || '',
  tmdb_id: updatedMovie.tmdbId,
  sort_order: updatedMovie.sortOrder,

  original_title: updatedMovie.originalTitle,
  director: updatedMovie.director,
  production_countries: updatedMovie.productionCountries,
})
    .eq('id', updatedMovie.id)

  if (error) {
    throw error
  }
}

export async function updateMovieOrder(movies) {
  const updates = movies.map((movie, index) => ({
    id: movie.id,
    sort_order: index + 1,
  }))

  const { error } = await supabase
    .from('movies')
    .upsert(updates)

  if (error) {
    throw error
  }
}