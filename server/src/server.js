require('dotenv').config();
const app = require('./app');
const { connectDB } = require('./config/db');

const PORT = process.env.PORT || 5000;

async function startServer() {
  // Initialize Database connection (falls back to in-memory if MONGO_URI is missing or fails)
  await connectDB();

  app.listen(PORT, () => {
    console.log(`FitNova server running on port ${PORT}`);
    console.log(`Allowed CORS Client: ${process.env.CLIENT_URL || 'http://localhost:5173'}`);
  });
}

startServer();
 // restart trigger
