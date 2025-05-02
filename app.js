  import express from 'express';
  import cors from 'cors';
  import dotenv from 'dotenv';
  import routes from './backend/routes/routes.js';
  import connectDB from './backend/config/database.js';

  dotenv.config();
  connectDB();

  const app = express();
  const PORT = process.env.PORT || 3000;

  // Configuração do CORS
  app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
  }));

  app.use(express.static('public'));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use('/', routes);

  app.listen(PORT, () => {
    console.log(`Servidor a rodar na porta ${PORT}`);
  });