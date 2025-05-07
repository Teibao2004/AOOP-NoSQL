// Função para adicionar o botão de toggle do tema
function addThemeToggle() {
    const body = document.body;
    const themeToggle = document.createElement('button');
    themeToggle.className = 'theme-toggle';
    themeToggle.innerHTML = '<i class="fas fa-moon"></i><i class="fas fa-sun"></i>';
    body.appendChild(themeToggle);

    // Verificar se há preferência salva
    const darkMode = localStorage.getItem('darkMode') === 'true';
    if (darkMode) {
        body.classList.add('dark-mode');
    }

    // Adicionar evento de clique
    themeToggle.addEventListener('click', () => {
        // Adicionar classe para animação
        themeToggle.querySelector('i:not([style*="display: none"])').classList.add('theme-animate');
        
        // Alternar modo escuro
        body.classList.toggle('dark-mode');
        
        // Salvar preferência
        localStorage.setItem('darkMode', body.classList.contains('dark-mode'));
        
        // Remover classe de animação após completar
        setTimeout(() => {
            themeToggle.querySelector('i').classList.remove('theme-animate');
        }, 500);
    });
}

// Função corrigida para lidar com pesquisa e navegação
function fixSearchNavigation() {
    const searchForm = document.getElementById('search-form');
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const searchInput = document.getElementById('search-input');
            const searchTerm = searchInput.value.trim();
            
            // Adicionar termo de pesquisa à URL como parâmetro de consulta
            const currentUrl = new URL(window.location.href);
            
            // Antes de fazer qualquer coisa, vamos guardar o estado anterior
            const previousState = { 
                query: currentUrl.searchParams.get('search'),
                page: currentUrl.searchParams.get('page') || '1',
                filters: getActiveFiltersFromUI()
            };
            
            // Agora atualizar a URL com o termo de pesquisa
            if (searchTerm) {
                currentUrl.searchParams.set('search', searchTerm);
                // Reiniciar a página para 1 quando realizar uma nova pesquisa
                currentUrl.searchParams.set('page', '1');
                // Limpar outros filtros da URL quando pesquisando
                ['genre', 'year', 'minRating', 'maxRating', 'type', 'country'].forEach(filter => {
                    currentUrl.searchParams.delete(filter);
                });
            } else {
                currentUrl.searchParams.delete('search');
            }
            
            // Usar history.pushState para adicionar o estado anterior ao histórico
            history.pushState(previousState, '', currentUrl);
            
            // Executar a pesquisa
            if (typeof searchMovies === 'function') {
                searchMovies(searchTerm);
            } else if (typeof fetchMovies === 'function') {
                // Fallback para a função fetchMovies
                fetchMovies(1);
            }
        });
        
        // Verificar se há um termo de pesquisa na URL ao carregar a página
        window.addEventListener('load', function() {
            const urlParams = new URLSearchParams(window.location.search);
            const searchTerm = urlParams.get('search');
            
            if (searchTerm) {
                document.getElementById('search-input').value = searchTerm;
                // Executar pesquisa com o termo da URL
                if (typeof searchMovies === 'function') {
                    searchMovies(searchTerm);
                }
            }
        });
        
        // Suporte para botão voltar do navegador
        window.addEventListener('popstate', function(event) {
            const urlParams = new URLSearchParams(window.location.search);
            const searchTerm = urlParams.get('search');
            
            // Reconfigurar a UI com base no estado anterior
            if (event.state) {
                // Se temos um estado salvo, usamos ele
                restoreStateToUI(event.state);
            } else {
                // Caso contrário, apenas atualizamos o campo de pesquisa
                const searchInput = document.getElementById('search-input');
                if (searchInput) {
                    searchInput.value = searchTerm || '';
                }
                
                // Recarregar filmes baseado nos parâmetros atuais da URL
                const page = urlParams.get('page') || '1';
                
                if (searchTerm && typeof searchMovies === 'function') {
                    searchMovies(searchTerm);
                } else if (typeof fetchMovies === 'function') {
                    fetchMovies(parseInt(page));
                }
            }
        });
    }
}

// Função para obter os filtros ativos da interface
function getActiveFiltersFromUI() {
    const filters = {};
    
    // Obter filtros básicos
    const genreElement = document.getElementById('genreDropdown');
    if (genreElement && genreElement.textContent !== 'Selecionar género') {
        filters.genre = genreElement.textContent.trim();
    }
    
    const yearElement = document.getElementById('year-filter');
    if (yearElement && yearElement.value) {
        filters.year = yearElement.value;
    }
    
    const typeElement = document.getElementById('type-filter');
    if (typeElement && typeElement.value) {
        filters.type = typeElement.value;
    }
    
    const countryElement = document.getElementById('country-filter');
    if (countryElement && countryElement.value) {
        filters.country = countryElement.value;
    }
    
    // Obter classificações
    const minRatingElement = document.getElementById('rating-min-value');
    const maxRatingElement = document.getElementById('rating-max-value');
    if (minRatingElement && maxRatingElement) {
        filters.minRating = minRatingElement.value;
        filters.maxRating = maxRatingElement.value;
    }
    
    // Ordenação
    const sortElement = document.getElementById('sort-by');
    if (sortElement) {
        filters.sort = sortElement.value;
    }
    
    return filters;
}

// Função para restaurar o estado da UI a partir de um estado salvo
function restoreStateToUI(state) {
    // Restaurar campo de pesquisa
    const searchInput = document.getElementById('search-input');
    if (searchInput && state.query) {
        searchInput.value = state.query;
    }
    
    // Restaurar filtros se disponíveis no estado
    if (state.filters) {
        // Restaurar gênero
        if (state.filters.genre) {
            const genreElement = document.getElementById('genreDropdown');
            if (genreElement) {
                genreElement.textContent = state.filters.genre;
                
                // Atualizar também o item ativo no dropdown
                const genreItems = document.querySelectorAll('#genres-container .dropdown-item');
                genreItems.forEach(item => {
                    item.classList.toggle('active', item.dataset.genre === state.filters.genre);
                });
            }
        }
        
        // Restaurar ano
        if (state.filters.year) {
            const yearElement = document.getElementById('year-filter');
            if (yearElement) {
                yearElement.value = state.filters.year;
            }
        }
        
        // Restaurar tipo
        if (state.filters.type) {
            const typeElement = document.getElementById('type-filter');
            if (typeElement) {
                typeElement.value = state.filters.type;
            }
        }
        
        // Restaurar país
        if (state.filters.country) {
            const countryElement = document.getElementById('country-filter');
            if (countryElement) {
                countryElement.value = state.filters.country;
            }
        }
        
        // Restaurar classificações
        if (state.filters.minRating && state.filters.maxRating) {
            const ratingSlider = document.getElementById('rating-slider');
            if (ratingSlider && ratingSlider.noUiSlider) {
                ratingSlider.noUiSlider.set([
                    parseFloat(state.filters.minRating),
                    parseFloat(state.filters.maxRating)
                ]);
            }
        }
        
        // Restaurar ordenação
        if (state.filters.sort) {
            const sortElement = document.getElementById('sort-by');
            if (sortElement) {
                sortElement.value = state.filters.sort;
            }
        }
    }
    
    // Recarregar filmes com os filtros restaurados
    if (state.query && typeof searchMovies === 'function') {
        searchMovies(state.query);
    } else if (typeof fetchMovies === 'function') {
        fetchMovies(parseInt(state.page || '1'));
    } else if (typeof fetchMoviesWithFilters === 'function') {
        fetchMoviesWithFilters(parseInt(state.page || '1'));
    }
}

// Inicializar os recursos quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    addThemeToggle();
    fixSearchNavigation();
});