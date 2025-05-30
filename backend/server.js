  import express from 'express';
  import cors from 'cors';
  import dotenv from 'dotenv';
  import routes from './routes/routes.js';
  import connectDB from './config/database.js';

  dotenv.config();
  connectDB();

  const app = express();
  const PORT = process.env.PORT || 3000;

  // Configuração do CORS
  app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  }));

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use('/', routes);

  app.listen(PORT, () => {
    console.log(`Servidor a rodar na porta ${PORT}`);
  });