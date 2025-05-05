// Configuração da API
const API_URL = 'http://localhost:3000/api';
let movieId = null;

// Elementos DOM
const loadingElement = document.getElementById('loading');
const movieDetailsContainer = document.getElementById('movie-details');
const commentsSection = document.getElementById('comments-section');
const commentsContainer = document.getElementById('comments-container');
const commentForm = document.getElementById('comment-form');

// Modais
const editCommentModal = new bootstrap.Modal(document.getElementById('editCommentModal'));
const deleteCommentModal = new bootstrap.Modal(document.getElementById('deleteCommentModal'));

// Carregar página
document.addEventListener('DOMContentLoaded', () => {
    // Obter ID do filme da URL
    const urlParams = new URLSearchParams(window.location.search);
    movieId = urlParams.get('id');
    
    if (!movieId) {
        window.location.href = 'index.html';
        return;
    }
    
    // Carregar detalhes do filme e comentários
    fetchMovieDetails(movieId);
    fetchComments(movieId);
    
    // Configurar event listener para salvar edição
    document.getElementById('save-comment-edit').addEventListener('click', saveCommentEdit);
    
    // Configurar event listener para confirmar exclusão
    document.getElementById('confirm-delete').addEventListener('click', confirmDeleteComment);
});

// Event listener para o formulário de comentários
commentForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const commentInput = document.getElementById('comment');
    
    const commentData = {
        name: nameInput.value,
        email: emailInput.value,
        movie_id: movieId,
        text: commentInput.value
    };
    
    try {
        showLoading();
        const response = await fetch(`${API_URL}/comments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(commentData)
        });
        
        if (!response.ok) {
            throw new Error('Erro ao enviar comentário');
        }
        
        // Limpar formulário e recarregar comentários
        nameInput.value = '';
        emailInput.value = '';
        commentInput.value = '';
        fetchComments(movieId);
        
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao enviar comentário. Tente novamente.');
    } finally {
        hideLoading();
    }
});

// Funções para editar comentários
function openEditModal(commentId, name, email, text) {
    document.getElementById('edit-comment-id').value = commentId;
    document.getElementById('edit-name').value = name;
    document.getElementById('edit-email').value = email;
    document.getElementById('edit-comment-text').value = text;
    
    editCommentModal.show();
}

async function saveCommentEdit() {
    const commentId = document.getElementById('edit-comment-id').value;
    const name = document.getElementById('edit-name').value;
    const email = document.getElementById('edit-email').value;
    const text = document.getElementById('edit-comment-text').value;
    
    if (!name || !email || !text) {
        alert('Todos os campos são obrigatórios!');
        return;
    }
    
    try {
        showLoading();
        const response = await fetch(`${API_URL}/comments/${commentId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, text })
        });
        
        if (!response.ok) {
            throw new Error('Erro ao atualizar comentário');
        }
        
        editCommentModal.hide();
        fetchComments(movieId);
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao atualizar comentário. Tente novamente.');
    } finally {
        hideLoading();
    }
}

// Funções para apagar comentários
function openDeleteModal(commentId) {
    document.getElementById('delete-comment-id').value = commentId;
    deleteCommentModal.show();
}

async function confirmDeleteComment() {
    const commentId = document.getElementById('delete-comment-id').value;
    
    try {
        showLoading();
        const response = await fetch(`${API_URL}/comments/${commentId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error('Erro ao excluir comentário');
        }
        
        deleteCommentModal.hide();
        fetchComments(movieId);
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao excluir comentário. Tente novamente.');
    } finally {
        hideLoading();
    }
}

// Funções de API
async function fetchMovieDetails(id) {
    showLoading();
    try {
        const response = await fetch(`${API_URL}/movies/${id}`);
        if (!response.ok) {
            throw new Error('Filme não encontrado');
        }
        
        const movie = await response.json();
        renderMovieDetails(movie);
        document.title = `${movie.title} | Filmes MongoDB`;
    } catch (error) {
        console.error('Erro ao carregar detalhes do filme:', error);
        movieDetailsContainer.innerHTML = `
            <div class="col-12 text-center">
                <h3>Erro ao carregar detalhes do filme.</h3>
                <p>Verifique se o filme existe ou tente novamente mais tarde.</p>
                <a href="index.html" class="btn btn-primary mt-3">Voltar à página inicial</a>
            </div>
        `;
        movieDetailsContainer.style.display = 'flex';
    } finally {
        hideLoading();
    }
}

async function fetchComments(movieId) {
    showLoading();
    try {
        const response = await fetch(`${API_URL}/movies/${movieId}/comments`);
        const comments = await response.json();
        
        renderComments(comments);
    } catch (error) {
        console.error('Erro ao carregar comentários:', error);
        commentsContainer.innerHTML = '<div class="alert alert-danger">Erro ao carregar comentários. Tente novamente mais tarde.</div>';
    } finally {
        hideLoading();
        commentsSection.style.display = 'block';
    }
}

function renderMovieDetails(movie) {
    const posterUrl = movie.poster && movie.poster !== '' ? movie.poster : 'assets/sem-poster.jpg';
    const rating = movie.imdb?.rating ? movie.imdb.rating.toFixed(1) : 'N/A';
    const plot = movie.plot || 'Sinopse não disponível.';
    const runtime = movie.runtime ? `${movie.runtime} min` : 'Duração desconhecida';
    
    const genresBadges = movie.genres?.map(genre => 
        `<span class="badge bg-secondary genre-badge" onclick="window.location.href='index.html?genre=${encodeURIComponent(genre)}'">${genre}</span>`
    ).join('') || 'N/A';
    
    movieDetailsContainer.innerHTML = `
        <div class="col-md-4 text-center mb-4">
            <img src="${posterUrl}" class="img-fluid rounded movie-poster" alt="${movie.title}" 
                onerror="this.onerror=null; this.src='assets/sem-poster.jpg';">
            <div class="mt-3">
                <h4 class="badge bg-warning text-dark rating-badge">
                    ⭐ ${rating}/10
                    <span class="text-muted">${movie.imdb?.votes ? `(${movie.imdb.votes.toLocaleString()} votos)` : ''}</span>
                </h4>
            </div>
        </div>
        <div class="col-md-8">
            <h1>${movie.title} <small class="text-muted">(${movie.year || 'N/A'})</small></h1>
            
            <div class="mb-3">
                ${genresBadges}
            </div>
            
            <div class="row mb-3">
                <div class="col-md-6">
                    <p><strong>Duração:</strong> ${runtime}</p>
                    <p><strong>Classificação:</strong> ${movie.rated || 'N/A'}</p>
                    <p><strong>País:</strong> ${movie.countries?.join(', ') || 'N/A'}</p>
                </div>
                <div class="col-md-6">
                    <p><strong>Tipo:</strong> ${movie.type || 'N/A'}</p>
                    <p><strong>Diretores:</strong> ${movie.directors?.join(', ') || 'N/A'}</p>
                </div>
            </div>
            
            <h4>Sinopse</h4>
            <p>${plot}</p>
            
            <h4>Elenco</h4>
            <p>${movie.cast?.join(', ') || 'Informação não disponível'}</p>
        </div>
    `;
    
    movieDetailsContainer.style.display = 'flex';
}

function renderComments(comments) {
    if (!comments || comments.length === 0) {
        commentsContainer.innerHTML = `
            <div class="alert alert-info">
                Seja o primeiro a comentar sobre este filme!
            </div>
        `;
        return;
    }
    
    commentsContainer.innerHTML = '';
    
    comments.forEach(comment => {
        const date = new Date(comment.date);
        const formattedDate = date.toLocaleDateString('pt-PT', { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const commentElement = document.createElement('div');
        commentElement.className = 'card comment-card p-3';
        commentElement.innerHTML = `
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <h5 class="card-title">${comment.name}</h5>
                    <span class="comment-date">${formattedDate}</span>
                </div>
                <div class="comment-actions">
                    <button class="btn btn-outline-primary btn-sm" onclick="openEditModal('${comment._id}', '${comment.name}', '${comment.email}', '${comment.text.replace(/'/g, "\\'")}')">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="btn btn-outline-danger btn-sm" onclick="openDeleteModal('${comment._id}')">
                        <i class="fas fa-trash"></i> Apagar
                    </button>
                </div>
            </div>
            <p class="card-text mt-2">${comment.text}</p>
        `;
        
        commentsContainer.appendChild(commentElement);
    });
}

// Funções auxiliares
function showLoading() {
    loadingElement.style.display = 'block';
}

function hideLoading() {
    loadingElement.style.display = 'none';
}