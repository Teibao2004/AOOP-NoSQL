// Configuração da API
const API_URL = 'https://aoop-nosql28991.onrender.com/api';

// Funções para operações de API comuns
const API = {
  getMovies: async (page = 1, limit = 12) => {
    const response = await fetch(`${API_URL}/movies?page=${page}&limit=${limit}`);
    return await response.json();
  },
  
  getMovieById: async (id) => {
    const response = await fetch(`${API_URL}/movies/${id}`);
    return await response.json();
  },
  
  searchMovies: async (query) => {
    const response = await fetch(`${API_URL}/movies/search?query=${encodeURIComponent(query)}`);
    return await response.json();
  },
  
  filterMovies: async (filters, page = 1) => {
    const params = new URLSearchParams({
      page,
      limit: filters.limit || 12
    });
    
    if (filters.genre) params.append('genre', filters.genre);
    if (filters.year) params.append('year', filters.year);
    if (filters.minRating > 0) params.append('min_rating', filters.minRating);
    if (filters.maxRating < 10) params.append('max_rating', filters.maxRating);
    if (filters.type) params.append('type', filters.type);
    if (filters.country) params.append('country', filters.country);
    
    if (filters.sort) {
      const [field, order] = filters.sort.split(':');
      params.append('sort_by', field);
      params.append('sort_order', order);
    }
    
    const response = await fetch(`${API_URL}/movies/filter?${params}`);
    return await response.json();
  },
  
  getAllGenres: async () => {
    const response = await fetch(`${API_URL}/movies/genres`);
    return await response.json();
  },
  
  getAllCountries: async () => {
    const response = await fetch(`${API_URL}/movies/countries`);
    return await response.json();
  },
 
  getComments: async (movieId = null) => {
    const url = movieId 
      ? `${API_URL}/movies/${movieId}/comments`
      : `${API_URL}/comments`;
      
    const response = await fetch(url);
    return await response.json();
  },
  
  getCommentById: async (id) => {
    const response = await fetch(`${API_URL}/comments/${id}`);
    return await response.json();
  },
  
  createComment: async (commentData) => {
    const response = await fetch(`${API_URL}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(commentData)
    });
    return await response.json();
  },
  
  updateComment: async (id, commentData) => {
    const response = await fetch(`${API_URL}/comments/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(commentData)
    });
    return await response.json();
  },
  
  deleteComment: async (id) => {
    const response = await fetch(`${API_URL}/comments/${id}`, {
      method: 'DELETE'
    });
    return await response.json();
  }
};

window.API = API;