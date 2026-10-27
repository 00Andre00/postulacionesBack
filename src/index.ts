import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { testConnection } from './config/database';
import authRoutes from './routes/auth.routes';
import procesoRoutes from './routes/proceso.routes';


dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    message: 'Servidor de reclutamiento funcionando',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/auth', authRoutes);

const startServer = async (): Promise<void> => {
  await testConnection();
  app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    console.log(`📋 Health check: http://localhost:${PORT}/api/health`);
  });
};

app.use('/api/procesos', procesoRoutes);


startServer();