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

// Função para corrigir o comportamento de navegação após pesquisa
function fixSearchNavigation() {
    const searchForm = document.getElementById('search-form');
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const searchInput = document.getElementById('search-input');
            const searchTerm = searchInput.value.trim();
            
            // Adicionar termo de pesquisa à URL como parâmetro de consulta
            const currentUrl = new URL(window.location.href);
            if (searchTerm) {
                currentUrl.searchParams.set('search', searchTerm);
            } else {
                currentUrl.searchParams.delete('search');
            }
            
            // Usar history.pushState para atualizar a URL sem recarregar a página
            history.pushState({}, '', currentUrl);
            
            // Executar a pesquisa (chame a função apropriada aqui)
            loadMovies(1); // Assumindo que você tem uma função loadMovies
        });
        
        // Verificar se há um termo de pesquisa na URL ao carregar a página
        window.addEventListener('load', function() {
            const urlParams = new URLSearchParams(window.location.search);
            const searchTerm = urlParams.get('search');
            
            if (searchTerm) {
                document.getElementById('search-input').value = searchTerm;
                // Executar pesquisa com o termo da URL
                loadMovies(1);
            }
        });
        
        // Suporte para botão voltar do navegador
        window.addEventListener('popstate', function() {
            const urlParams = new URLSearchParams(window.location.search);
            const searchTerm = urlParams.get('search');
            
            if (searchTerm) {
                document.getElementById('search-input').value = searchTerm;
            } else {
                document.getElementById('search-input').value = '';
            }
            
            // Recarregar filmes baseado no estado atual da URL
            loadMovies(1);
        });
    }
}

// Inicializar os recursos quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    addThemeToggle();
    fixSearchNavigation();
});