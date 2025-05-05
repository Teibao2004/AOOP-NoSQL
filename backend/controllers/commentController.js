import Comment from '../models/Comment.js';
import mongoose from 'mongoose';

// Obter todos os comentários (com opção de filtragem por filme)
export const getComments = async (req, res) => {
  try {
    const { movie_id } = req.query;
    let query = {};
    
    // Se um movie_id foi fornecido, filtra por esse filme
    if (movie_id) {
      query.movie_id = movie_id;
    }
    
    const comments = await Comment.find(query).sort({ date: -1 });
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obter comentário por ID
export const getCommentById = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ message: 'Comentário não encontrado' });
    }
    res.json(comment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obter comentários por ID do filme
export const getCommentsByMovieId = async (req, res) => {
  try {
    const { movie_id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(movie_id)) {
      return res.status(400).json({ message: 'ID de filme inválido' });
    }
    
    const comments = await Comment.find({ movie_id }).sort({ date: -1 });
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Criar um novo comentário
export const createComment = async (req, res) => {
  try {
    const { name, email, movie_id, text } = req.body;
    
    // Validações básicas
    if (!name || !email || !movie_id || !text) {
      return res.status(400).json({ message: 'Todos os campos são obrigatórios' });
    }
    
    if (!mongoose.Types.ObjectId.isValid(movie_id)) {
      return res.status(400).json({ message: 'ID de filme inválido' });
    }

    const newComment = new Comment({
      name,
      email,
      movie_id,
      text,
      date: new Date()
    });

    const savedComment = await newComment.save();
    res.status(201).json(savedComment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Atualizar um comentário
export const updateComment = async (req, res) => {
  try {
    const { name, email, text } = req.body;
    const commentId = req.params.id;
    
    if (!mongoose.Types.ObjectId.isValid(commentId)) {
      return res.status(400).json({ message: 'ID de comentário inválido' });
    }

    const updatedComment = await Comment.findByIdAndUpdate(
      commentId,
      { name, email, text, date: new Date() },
      { new: true, runValidators: true }
    );

    if (!updatedComment) {
      return res.status(404).json({ message: 'Comentário não encontrado' });
    }

    res.json(updatedComment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Excluir um comentário
export const deleteComment = async (req, res) => {
  try {
    const commentId = req.params.id;
    
    if (!mongoose.Types.ObjectId.isValid(commentId)) {
      return res.status(400).json({ message: 'ID de comentário inválido' });
    }

    const deletedComment = await Comment.findByIdAndDelete(commentId);

    if (!deletedComment) {
      return res.status(404).json({ message: 'Comentário não encontrado' });
    }

    res.json({ message: 'Comentário removido com sucesso', id: commentId });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};