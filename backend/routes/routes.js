import express from 'express';
import { 
  getMovies, 
  getMovieById, 
  searchMovies, 
  getMoviesByGenre
} from '../controllers/movieController.js';

const router = express.Router();

// Rotas para API de filmes
router.get('/api/movies', getMovies);
router.get('/api/movies/search', searchMovies);
router.get('/api/movies/genre/:genre', getMoviesByGenre);
router.get('/api/movies/:id', getMovieById);

// Rota para a página inicial
router.get('/', (req, res) => {
  res.json({ 
    message: 'API de Filmes MongoDB - Sample_mflix',
    endpoints: {
      getAllMovies: '/api/movies?page=1&limit=10',
      getMovieById: '/api/movies/:id',
      searchMovies: '/api/movies/search?query=star wars',
      getMoviesByGenre: '/api/movies/genre/action'
    }
  });
});

export default router;