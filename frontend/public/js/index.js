// URL base da API
const API_URL = 'https://aoop-nosql28991-backend.onrender.com/api';

// Estado de paginação e filtros ativos
let currentPage = 1;
let totalPages = 1;
let allGenres = [];
let allCountries = [];

// Definição inicial dos filtros ativos
let activeFilters = {
    genre: null,
    year: null,
    minRating: 0,
    maxRating: 10,
    type: null,
    country: null,
    sort: "imdb.rating:-1",
    limit: 12
};

// Referências a elementos do DOM
const moviesContainer = document.getElementById('movies-container');
const noResultsElement = document.getElementById('no-results');
const paginationContainer = document.getElementById('pagination');
const loadingElement = document.getElementById('loading');
const pageTitle = document.getElementById('page-title');
const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const genresContainer = document.getElementById('genres-container');
const genreDropdown = document.getElementById('genreDropdown');
const yearFilter = document.getElementById('year-filter');
const countryFilter = document.getElementById('country-filter');
const typeFilter = document.getElementById('type-filter');
const sortByFilter = document.getElementById('sort-by');
const ratingMinValue = document.getElementById('rating-min-value');
const ratingMaxValue = document.getElementById('rating-max-value');
const applyFiltersBtn = document.getElementById('apply-filters');
const clearFiltersBtn = document.getElementById('clear-filters');
const activeFiltersContainer = document.getElementById('active-filters');
const resultsPerPageBtns = document.querySelectorAll('.results-per-page-btn');

// Ações após o carregamento do DOM
document.addEventListener('DOMContentLoaded', async () => {
    // Inicializa o slider de classificação (rating)
    const ratingSlider = document.getElementById('rating-slider');
    if (ratingSlider) {
        noUiSlider.create(ratingSlider, {
            start: [0, 10],
            connect: true,
            step: 0.5,
            range: { min: 0, max: 10 },
            format: {
                to: value => value.toFixed(1),
                from: value => parseFloat(value)
            }
        });

        ratingSlider.noUiSlider.on('update', (values) => {
            document.getElementById('rating-min').textContent = values[0];
            document.getElementById('rating-max').textContent = values[1];
            ratingMinValue.value = values[0];
            ratingMaxValue.value = values[1];
        });
    }

    await loadFilterOptions(); // Carrega géneros, países e anos

    // Aplica filtro via URL, se houver
    const urlParams = new URLSearchParams(window.location.search);
    const genreParam = urlParams.get('genre');

    if (genreParam) {
        activeFilters.genre = genreParam;
        pageTitle.textContent = `Filmes do género: ${genreParam}`;
        updateGenreDropdownText(genreParam);
        clearFiltersBtn.style.display = 'inline-block';
        fetchMoviesWithFilters();
    } else {
        fetchMovies();
    }

    // Botões de número de resultados por página
    resultsPerPageBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            resultsPerPageBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeFilters.limit = parseInt(btn.dataset.value);
        });
    });
});

// Pesquisa por texto
searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const query = searchInput.value.trim();
    if (query) {
        pageTitle.textContent = `Resultados para: "${query}"`;
        searchMovies(query);
        clearActiveFilters();
    }
});

// Aplica os filtros
applyFiltersBtn.addEventListener('click', () => {
    currentPage = 1;
    activeFilters.minRating = parseFloat(ratingMinValue.value);
    activeFilters.maxRating = parseFloat(ratingMaxValue.value);
    fetchMoviesWithFilters();
});

// Limpa filtros
clearFiltersBtn.addEventListener('click', () => {
    clearAllFilters();
    fetchMovies();
});

// Outros filtros dinâmicos
sortByFilter.addEventListener('change', () => {
    activeFilters.sort = sortByFilter.value;
});

yearFilter.addEventListener('change', () => {
    activeFilters.year = yearFilter.value ? parseInt(yearFilter.value) : null;
});

typeFilter.addEventListener('change', () => {
    activeFilters.type = typeFilter.value || null;
});

countryFilter.addEventListener('change', () => {
    activeFilters.country = countryFilter.value || null;
});

// Pesqsuisa filmes sem filtros
async function fetchMovies(page = 1, limit = 12) {
    showLoading();
    try {
        const response = await fetch(`${API_URL}/movies?page=${page}&limit=${limit}`);
        const data = await response.json();
        renderMovies(data.movies);
        currentPage = data.currentPage;
        totalPages = data.totalPages;
        renderPagination();
    } catch (error) {
        console.error('Erro ao carregar filmes:', error);
        showNoResults('Erro ao carregar filmes. Tente novamente.');
    } finally {
        hideLoading();
    }
}

// Pesquisa com filtros
async function fetchMoviesWithFilters(page = 1) {
    showLoading();
    updateActiveFiltersDisplay();
    clearFiltersBtn.style.display = 'inline-block';

    const params = new URLSearchParams({
        page,
        limit: activeFilters.limit
    });

    if (activeFilters.genre) params.append('genre', activeFilters.genre);
    if (activeFilters.year) params.append('year', activeFilters.year);
    if (activeFilters.minRating > 0) params.append('min_rating', activeFilters.minRating);
    if (activeFilters.maxRating < 10) params.append('max_rating', activeFilters.maxRating);
    if (activeFilters.type) params.append('type', activeFilters.type);
    if (activeFilters.country) params.append('country', activeFilters.country);

    if (activeFilters.sort) {
        const [field, order] = activeFilters.sort.split(':');
        params.append('sort_by', field);
        params.append('sort_order', order);
    }

    try {
        const response = await fetch(`${API_URL}/movies/filter?${params}`);
        const data = await response.json();

        if (data.movies?.length > 0) {
            renderMovies(data.movies);
            currentPage = data.currentPage || 1;
            totalPages = data.totalPages || 1;
            renderPagination();
        } else {
            showNoResults();
        }
    } catch (error) {
        console.error('Erro ao aplicar filtros:', error);
        showNoResults('Erro ao aplicar filtros. Tente novamente.');
    } finally {
        hideLoading();
    }
}

// Pesquisa por texto livre
async function searchMovies(query) {
    showLoading();
    try {
        const response = await fetch(`${API_URL}/movies/search?query=${encodeURIComponent(query)}`);
        const movies = await response.json();

        if (movies?.length > 0) {
            renderMovies(movies);
            paginationContainer.innerHTML = '';
        } else {
            showNoResults();
        }
    } catch (error) {
        console.error('Erro na busca:', error);
        showNoResults('Erro ao buscar filmes. Tente novamente.');
    } finally {
        hideLoading();
    }
}

// Carrega géneros, países e anos disponíveis
async function loadFilterOptions() {
    try {
        const genresResponse = await fetch(`${API_URL}/movies/genres`);
        allGenres = await genresResponse.json();
        renderGenresDropdown(allGenres);

        const countriesResponse = await fetch(`${API_URL}/movies/countries`);
        allCountries = await countriesResponse.json();
        renderCountriesFilter(allCountries);

        renderYearsFilter();
    } catch (error) {
        console.error('Erro ao carregar opções de filtro:', error);
    }
}

// Renderiza os filmes no ecrã 
function renderMovies(movies) {
    if (!movies || movies.length === 0) {
        showNoResults();
        return;
    }

    noResultsElement.style.display = 'none';
    moviesContainer.style.display = 'flex';
    moviesContainer.innerHTML = '';
    
    movies.forEach(movie => {
        const posterUrl = movie.poster && movie.poster !== '' ? movie.poster : 'assets/sem-poster.gif';
        const rating = movie.imdb?.rating ? movie.imdb.rating.toFixed(1) : 'N/A';
        
        const movieElement = document.createElement('div');
        movieElement.className = 'col';
        movieElement.innerHTML = `
            <div class="card movie-card">
                <img src="${posterUrl}" class="card-img-top movie-poster" alt="${movie.title}" onerror="this.onerror=null; this.src='assets/sem-poster.gif';">
                <div class="card-body">
                    <h5 class="card-title nowrap">${movie.title}</h5>
                    <p class="card-text text-muted">${movie.year || 'Ano desconhecido'}</p>
                    <div class="d-flex justify-content-between align-items-center">
                        <span class="badge bg-warning text-dark">⭐ ${rating}</span>
                        <a href="movie-details.html?id=${movie._id}" class="btn btn-sm btn-primary">Ver detalhes</a>
                    </div>
                </div>
            </div>
        `;
        
        moviesContainer.appendChild(movieElement);
    });
}

// Renderiza o dropdown de géneros
function renderGenresDropdown(genres) {
    genresContainer.innerHTML = '';
    
    const allGenresItem = document.createElement('li');
    const allGenresLink = document.createElement('a');
    allGenresLink.className = 'dropdown-item';
    allGenresLink.href = '#';
    allGenresLink.textContent = 'Todos os gêneros';
    allGenresLink.dataset.genre = '';
    
    allGenresLink.addEventListener('click', (e) => {
        e.preventDefault();
        
        document.querySelectorAll('#genres-container .dropdown-item').forEach(item => {
            item.classList.remove('active');
        });
        
        allGenresLink.classList.add('active');
        activeFilters.genre = null;
        genreDropdown.textContent = 'Selecionar gênero';
    });
    
    allGenresItem.appendChild(allGenresLink);
    genresContainer.appendChild(allGenresItem);
    
    genres.forEach(genre => {
        const listItem = document.createElement('li');
        const link = document.createElement('a');
        link.className = 'dropdown-item';
        link.href = '#';
        link.textContent = genre;
        link.dataset.genre = genre;
        
        link.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelectorAll('#genres-container .dropdown-item').forEach(item => {
                item.classList.remove('active');
            });
            
            if (activeFilters.genre === genre) {
                activeFilters.genre = null;
                genreDropdown.textContent = 'Selecionar gênero';
            } else {
                link.classList.add('active');
                activeFilters.genre = genre;
                genreDropdown.textContent = genre;
            }
        });
        
        listItem.appendChild(link);
        genresContainer.appendChild(listItem);
    });
    
    if (activeFilters.genre) {
        const activeGenreItem = genresContainer.querySelector(`[data-genre="${activeFilters.genre}"]`);
        if (activeGenreItem) {
            activeGenreItem.classList.add('active');
        }
    } else {
        allGenresLink.classList.add('active');
    }
}

function updateGenreDropdownText(genre) {
    if (genre) {
        genreDropdown.textContent = genre;
        document.querySelectorAll('#genres-container .dropdown-item').forEach(item => {
            if (item.dataset.genre === genre) {
                item.classList.add('active');
            }
        });
    } else {
        genreDropdown.textContent = 'Selecionar gênero';
    }
}

function renderCountriesFilter(countries) {
    countryFilter.innerHTML = '<option value="">Todos os países</option>';
    
    countries.forEach(country => {
        const option = document.createElement('option');
        option.value = country;
        option.textContent = country;
        countryFilter.appendChild(option);
    });
}

function renderYearsFilter() {
    yearFilter.innerHTML = '<option value="">Todos os anos</option>';
    
    const currentYear = new Date().getFullYear();
    for (let year = currentYear; year >= 1900; year--) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearFilter.appendChild(option);
    }
}

function renderPagination() {
    paginationContainer.innerHTML = '';
    
    if (totalPages <= 1) return;
    
    const createPageButton = (page, text, isActive = false) => {
        const li = document.createElement('li');
        li.className = `page-item ${isActive ? 'active' : ''}`;
        
        const a = document.createElement('a');
        a.className = 'page-link';
        a.href = '#';
        a.textContent = text;
        
        if (page) {
            a.addEventListener('click', (e) => {
                e.preventDefault();
                if (Object.values(activeFilters).some(val => val !== null && val !== 0 && val !== 10)) {
                    fetchMoviesWithFilters(page);
                } else {
                    fetchMovies(page, activeFilters.limit);
                }
            });
        }
        
        li.appendChild(a);
        return li;
    };
    
    const ul = document.createElement('ul');
    ul.className = 'pagination';
    
    ul.appendChild(createPageButton(currentPage > 1 ? currentPage - 1 : null, 'Anterior', false));
    
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);
    
    for (let i = startPage; i <= endPage; i++) {
        ul.appendChild(createPageButton(i, i.toString(), i === currentPage));
    }
    
    ul.appendChild(createPageButton(currentPage < totalPages ? currentPage + 1 : null, 'Próximo', false));
    
    paginationContainer.appendChild(ul);
}

function updateActiveFiltersDisplay() {
    activeFiltersContainer.innerHTML = '';
    let hasActiveFilters = false;
    
    if (activeFilters.genre) {
        createFilterBadge('Gênero', activeFilters.genre, () => {
            activeFilters.genre = null;
            updateGenreDropdownText(null);
            fetchMoviesWithFilters();
        });
        hasActiveFilters = true;
    }
    
    if (activeFilters.year) {
        createFilterBadge('Ano', activeFilters.year, () => {
            activeFilters.year = null;
            yearFilter.value = '';
            fetchMoviesWithFilters();
        });
        hasActiveFilters = true;
    }
    
    if (activeFilters.minRating > 0 || activeFilters.maxRating < 10) {
        createFilterBadge('Classificação', `${activeFilters.minRating} - ${activeFilters.maxRating} ⭐`, () => {
            const ratingSlider = document.getElementById('rating-slider');
            ratingSlider.noUiSlider.set([0, 10]);
            activeFilters.minRating = 0;
            activeFilters.maxRating = 10;
            fetchMoviesWithFilters();
        });
        hasActiveFilters = true;
    }
    
    if (activeFilters.type) {
        const typeText = {
            'movie': 'Filmes',
            'series': 'Séries',
            'documentary': 'Documentários'
        }[activeFilters.type] || activeFilters.type;
        
        createFilterBadge('Tipo', typeText, () => {
            activeFilters.type = null;
            typeFilter.value = '';
            fetchMoviesWithFilters();
        });
        hasActiveFilters = true;
    }
    
    if (activeFilters.country) {
        createFilterBadge('País', activeFilters.country, () => {
            activeFilters.country = null;
            countryFilter.value = '';
            fetchMoviesWithFilters();
        });
        hasActiveFilters = true;
    }
    
    if (hasActiveFilters) {
        clearFiltersBtn.style.display = 'inline-block';
    } else {
        clearFiltersBtn.style.display = 'none';
    }
}

function createFilterBadge(label, value, removeCallback) {
    const badge = document.createElement('span');
    badge.className = 'badge bg-primary me-2 mb-2';
    badge.innerHTML = `${label}: ${value} <i class="fas fa-times ms-1" style="cursor: pointer;"></i>`;
    
    badge.querySelector('i').addEventListener('click', removeCallback);
    activeFiltersContainer.appendChild(badge);
}

function clearActiveFilters() {
    activeFiltersContainer.innerHTML = '';
    updateGenreDropdownText(null);
    
    const ratingSlider = document.getElementById('rating-slider');
    if (ratingSlider && ratingSlider.noUiSlider) {
        ratingSlider.noUiSlider.set([0, 10]);
    }
    
    yearFilter.value = '';
    typeFilter.value = '';
    countryFilter.value = '';
    
    document.querySelectorAll('.results-per-page-btn').forEach((btn, index) => {
        btn.classList.toggle('active', index === 0);
    });
    
    clearFiltersBtn.style.display = 'none';
}

function clearAllFilters() {
    clearActiveFilters();
    
    activeFilters = {
        genre: null,
        year: null,
        minRating: 0,
        maxRating: 10,
        type: null,
        country: null,
        sort: "imdb.rating:-1",
        limit: 12
    };
    
    sortByFilter.value = "imdb.rating:-1";
    pageTitle.textContent = "Filmes";
}

function showLoading() {
    loadingElement.style.display = 'block';
    moviesContainer.style.display = 'none';
    noResultsElement.style.display = 'none';
}

function hideLoading() {
    loadingElement.style.display = 'none';
}

function showNoResults(message = null) {
    moviesContainer.style.display = 'none';
    noResultsElement.style.display = 'block';
    
    if (message) {
        noResultsElement.querySelector('p').textContent = message;
    } else {
        noResultsElement.querySelector('p').textContent = 'Tente ajustar seus filtros ou fazer uma nova busca.';
    }
    
    paginationContainer.innerHTML = '';
}