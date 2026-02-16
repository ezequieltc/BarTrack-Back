import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import prisma from './lib/prisma';

dotenv.config();

const app = express();
// const prisma = new PrismaClient(); // Removed
const PORT = process.env.PORT || 3000;

import productRoutes from './routes/productRoutes';
import tableRoutes from './routes/tableRoutes';
import orderRoutes from './routes/orderRoutes';
import invoiceRoutes from './routes/invoiceRoutes';

app.use(cors());
app.use(express.json());

// Debug middleware
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
});

app.use('/api/products', productRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/invoices', invoiceRoutes);

// Basic Health Check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Error handling
server.on('error', (error: any) => {
    console.error('Server error:', error);
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
