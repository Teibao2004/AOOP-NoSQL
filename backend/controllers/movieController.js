import Movie from '../models/Movie.js';

// Obter filmes com paginação
export const getMovies = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const movies = await Movie.find()
      .select('title year poster imdb.rating genres')
      .sort({ 'movie.name': 1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Movie.countDocuments();
    
    res.json({
      movies,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obter filme por ID
export const getMovieById = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({ message: 'Filme não encontrado' });
    }
    res.json(movie);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Pesquisar filmes
export const searchMovies = async (req, res) => {
  try {
    const { query } = req.query;
    const movies = await Movie.find({ 
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { plot: { $regex: query, $options: 'i' } }
      ]
    })
    .select('title year poster imdb.rating genres')
    .sort({ 'imdb.votes': -1 }) 
    .limit(20);
    
    res.json(movies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obter filmes por gênero
export const getMoviesByGenre = async (req, res) => {
  try {
    const { genre } = req.params;
    const movies = await Movie.find({ 
      genres: { $regex: genre, $options: 'i' } 
    })
    .select('title year poster imdb.rating genres')
    .sort({ 'imdb.votes': -1 }) 
    .limit(20);
    
    res.json(movies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};