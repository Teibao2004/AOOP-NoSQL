import express from 'express';
import { 
  getMovies, 
  getMovieById, 
  searchMovies, 
  filterMovies,
  getAllGenres,
  getAllCountries
} from '../controllers/movieController.js';
import {
  getComments,
  getCommentById,
  getCommentsByMovieId,
  createComment,
  updateComment,
  deleteComment
} from '../controllers/commentController.js';

const router = express.Router();

router.get('/api/movies', getMovies);
router.get('/api/movies/search', searchMovies);
router.get('/api/movies/filter', filterMovies); 
router.get('/api/movies/genres', getAllGenres); 
router.get('/api/movies/countries', getAllCountries); 
router.get('/api/movies/:id', getMovieById);

router.get('/api/comments', getComments);
router.get('/api/comments/:id', getCommentById);
router.get('/api/movies/:movie_id/comments', getCommentsByMovieId);
router.post('/api/comments', createComment);
router.put('/api/comments/:id', updateComment);
router.delete('/api/comments/:id', deleteComment);

router.get('/', (req, res) => {
  res.json({ 
    message: 'API de Filmes MongoDB - Sample_mflix',
    endpoints: {
      movies: {
        getAllMovies: '/api/movies?page=1&limit=10',
        getMovieById: '/api/movies/:id',
        searchMovies: '/api/movies/search?query=star wars',
        filterMovies: '/api/movies/filter?genre=action&year=2000&min_rating=7',
        getAllGenres: '/api/movies/genres',
        getAllCountries: '/api/movies/countries'
      },
      comments: {
        getAllComments: '/api/comments',
        getCommentById: '/api/comments/:id',
        getCommentsByMovieId: '/api/movies/:movie_id/comments',
        createComment: '/api/comments (POST)',
        updateComment: '/api/comments/:id (PUT)',
        deleteComment: '/api/comments/:id (DELETE)'
      }
    }
  });
});

export default router;