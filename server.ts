import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- API Routes ---

  // Auth API
  app.post('/api/auth/send-otp', (req, res) => {
    const { phone } = req.body;
    console.log(`Sending OTP to ${phone}`);
    res.json({ success: true, message: 'OTP sent successfully' });
  });

  app.post('/api/auth/verify-otp', (req, res) => {
    const { phone, otp } = req.body;
    // Mock verification
    if (otp === '123456') {
      res.json({ 
        success: true, 
        token: 'mock-jwt-token',
        user: { id: 'user_1', phone, role: 'passenger' }
      });
    } else {
      res.status(400).json({ success: false, message: 'Invalid OTP' });
    }
  });

  // Ride API
  app.post('/api/rides/request', (req, res) => {
    const { pickup, destination, passengerId } = req.body;
    const rideId = `ride_${Date.now()}`;
    res.json({ success: true, rideId, status: 'searching' });
  });

  // Driver API
  app.post('/api/drivers/register', (req, res) => {
    const driverData = req.body;
    console.log('New driver registration:', driverData);
    res.json({ success: true, message: 'Registration submitted for approval' });
  });

  // Payment API (Mock)
  app.post('/api/payments/subscription', (req, res) => {
    const { driverId, amount } = req.body;
    res.json({ success: true, transactionId: `tx_${Date.now()}`, expiry: Date.now() + 30 * 24 * 60 * 60 * 1000 });
  });

  // --- Vite Middleware ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`RAHHARIDE Backend running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Error starting server:', err);
});
