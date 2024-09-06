const express = require('express');
const connectDb = require('./config/db');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const passport = require('./config/passport-jwt-strategy.js');
const userRoutes = require('./routes/userRoutes');
const blogRoutes = require('./routes/blogRoutes');
const contactInfoRoutes = require('./routes/contactInfoRoutes');
const tripRoutes = require('./routes/tripRoutes');

require('dotenv').config();
const app = express();

// Connect to the database
connectDb();

const corsOptions = {
  origin: 'http://localhost:5173',
  credentials: true,
};

// Middleware
app.use(helmet());
app.use(morgan('combined')); // Logging middleware
app.use(cookieParser());
app.use(express.json());
app.use(passport.initialize());
app.use(cors(corsOptions));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Routes
app.use('/api/user', userRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/trip', tripRoutes);
app.use('/api/contact', contactInfoRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err.message);
  res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
});

// Start Server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// Graceful Shutdown
process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  app.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  app.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});
