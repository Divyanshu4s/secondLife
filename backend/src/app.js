import express from 'express';
import cors from 'cors';
import { errorMiddleware } from './middleware/errorMiddleware.js';
import { authRouter } from './routes/authRoutes.js';
import { apiRouter } from './routes/apiRoutes.js';
import { userRouter } from './routes/userRoutes.js';
import { connectDB } from './config/db.js';

// Connect to MongoDB
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);

// Health check endpoint for AWS Load Balancer
app.get('/', (req, res) => {
  res.status(200).send('OK');
});

// New unified API Router for the MongoDB Migration
app.get('/', (req, res) => {
  res.status(200).send('OK');
});

// New unified API Router for the MongoDB Migration
import uploadRoutes from './routes/uploadRoutes.js';

app.use('/api/v2', apiRouter);
app.use('/api/v2', uploadRoutes);

// Global Error Handler
app.use(errorMiddleware);

export default app;
