import 'dotenv/config';
import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import hotelRoutes from './routes/hotel.routes';
import vehicleRoutes from './routes/vehicle.routes';
import guideRoutes from './routes/guide.routes';
import supplierRoutes from './routes/supplier.routes';
import vehicleSupplierRoutes from './routes/vehicleSupplier.routes';
import entranceFeeRoutes from './routes/entranceFee.routes';
import agentRoutes from './routes/agent.routes';
import customerRoutes from './routes/customer.routes';

const app: Application = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Tour Operator CRM API',
    version: '1.0.0',
    status: 'running',
  });
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/hotels', hotelRoutes);
app.use('/api/v1/vehicles', vehicleRoutes);
app.use('/api/v1/guides', guideRoutes);
app.use('/api/v1/suppliers', supplierRoutes);
app.use('/api/v1/vehicle-suppliers', vehicleSupplierRoutes);
app.use('/api/v1/entrance-fees', entranceFeeRoutes);
app.use('/api/v1/agents', agentRoutes);
app.use('/api/v1/customers', customerRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Endpoint bulunamadı' });
});

// Error handler
app.use((err: Error, req: Request, res: Response) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Sunucu hatası', message: err.message });
});

// Server başlat
app.listen(PORT, () => {
  console.log(`🚀 Server ${PORT} portunda çalışıyor`);
  console.log(`📍 http://localhost:${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});
