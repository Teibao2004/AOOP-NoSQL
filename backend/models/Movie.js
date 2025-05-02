import mongoose from 'mongoose';

const movieSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  year: Number,
  runtime: Number,
  plot: String,
  poster: String,
  genres: [String],
  directors: [String],
  cast: [String],
  countries: [String],
  type: String,
  rated: String,
  imdb: {
    rating: Number,
    votes: Number,
    id: Number
  }
}, {
  // Para manter a compatibilidade com o nome da coleção no MongoDB
  collection: 'movies',
  // Para permitir campos adicionais que podem existir nos documentos
  strict: false
});

const Movie = mongoose.model('Movie', movieSchema);

export default Movie;