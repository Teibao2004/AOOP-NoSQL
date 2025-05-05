import Movie from '../models/Movie.js';
import mongoose from 'mongoose';

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

export const filterMovies = async (req, res) => {
  try {
    const { 
      genre, 
      year, 
      min_rating, 
      type, 
      country, 
      sort_by = 'imdb.rating', 
      sort_order = '-1',
      page = 1,
      limit = 12
    } = req.query;
    
    const query = {};
    
    if (genre) {
      query.genres = { $regex: genre, $options: 'i' };
    }
    
    if (year) {
      query.year = parseInt(year);
    }
    
    if (min_rating) {
      query['imdb.rating'] = { $gte: parseFloat(min_rating) };
    }
    
    if (type) {
      query.type = { $regex: type, $options: 'i' };
    }
    
    if (country) {
      query.countries = { $regex: country, $options: 'i' };
    }
    
    const sortDirection = sort_order === '1' ? 1 : -1;
    const sortObject = {};
    sortObject[sort_by] = sortDirection;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const movies = await Movie.find(query)
      .select('title year poster imdb.rating genres')
      .sort(sortObject)
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Movie.countDocuments(query);
    
    res.json({
      movies,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllGenres = async (req, res) => {
  try {
    const genres = await Movie.distinct('genres');
    
    const filteredGenres = genres
      .filter(genre => genre && genre.trim() !== '')
      .sort((a, b) => a.localeCompare(b));
    
    res.json(filteredGenres);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllCountries = async (req, res) => {
  try {
    const countries = await Movie.distinct('countries');
    
    const filteredCountries = countries
      .filter(country => country && country.trim() !== '')
      .sort((a, b) => a.localeCompare(b));
    
    res.json(filteredCountries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};