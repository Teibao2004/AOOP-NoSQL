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
  collection: 'movies',
  strict: false
});

const Movie = mongoose.model('Movie', movieSchema);

export default Movie;