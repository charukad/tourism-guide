const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoose = require('mongoose');
const http = require('http');
const path = require('path');
const fileUpload = require('express-fileupload');

// Load environment variables with an absolute path
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Import custom middleware
const errorMiddleware = require('./middleware/error');

// Import routes
const routes = require('./routes');

// Import Swagger config
const { swaggerUi, swaggerDocs } = require('./config/swagger');

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Initialize Socket.io
const socketIO = require('./sockets/io');
const io = socketIO.init(server);
const socketHandler = require('./sockets');

// Log environment variables for debugging
console.log('Environment variables:');
console.log('- PORT:', process.env.PORT);
console.log('- NODE_ENV:', process.env.NODE_ENV);
console.log('- MONGODB_URI:', process.env.MONGODB_URI ? '[DEFINED]' : '[UNDEFINED]');

// Use a fallback if MONGODB_URI is not defined
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sri-lanka-tourism';
console.log('Using MongoDB URI:', mongoURI);

// Connect to MongoDB
mongoose.connect(mongoURI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON request body
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request body
app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: '/tmp/',
}));

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Swagger API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// API routes
app.use('/api', routes);
app.use('/api/profile', require('./routes/profileImageRoutes'));

// Error handling middleware
app.use(errorMiddleware);

// Initialize socket event handlers
socketHandler(io);

// Set port
const PORT = process.env.PORT || 5008;

// Start server
server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  console.log(`API Documentation available at http://localhost:${PORT}/api-docs`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  
  // In production, we might want to exit the process and let the process manager restart it
  if (process.env.NODE_ENV === 'production') {
    server.close(() => process.exit(1));
  }
});

module.exports = { app, server };