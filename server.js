const path = require('path');
const express = require('express'); // Helps to write syntax in node.js
const dotenv = require('dotenv'); // Dotenv is a zero-dependency module that loads environment variables from a .env file
const morgan = require('morgan'); // logger middleware function using the given format and options
const colors = require('colors'); // This helps color concole.log messages
const fileupload = require('express-fileupload'); // Useed to enable Image upload
const cookieParser = require('cookie-parser'); // Used to hold login details
const mongoSanitize = require('express-mongo-sanitize'); // Used to help prevent hacking via login
const helmet = require('helmet'); // helps prevent hacking via the headers
const xss = require('xss-clean'); // helps prevent hacking via inserton of injection i.e. <script> tags
const rateLimit = require('express-rate-limit'); // Prevents over requesting from the site
const hpp = require('hpp'); // Prevents injection to the http requests
const cors = require('cors'); // prevents other domains communicate with ours
const errorHandler = require('./middleware/error'); // Mongoose bespoke error handling
const connectDB = require('./config/db');

// Load env vars
dotenv.config({ path: './config/config.env' });

// Connect to database
connectDB();

// Route files
const bootcamps = require('./routes/bootcamps');
const courses = require('./routes/courses');
const auth = require('./routes/auth');
const users = require('./routes/users');
const reviews = require('./routes/reviews');

const app = express();

// Body parser
app.use(express.json());

// Cookie parser
app.use(cookieParser());

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// File uploading
app.use(fileupload());

// Sanitize data
app.use(mongoSanitize());

// Set security headers
app.use(helmet());

// Prevent XSS attacks
app.use(xss());

// Rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 mins
  max: 100
});
app.use(limiter);

// Prevent http param pollution
app.use(hpp());

// Enable CORS
app.use(cors());

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

// Mount routers
app.use('/api/v1/bootcamps', bootcamps);
app.use('/api/v1/courses', courses);
app.use('/api/v1/auth', auth);
app.use('/api/v1/users', users);
app.use('/api/v1/reviews', reviews);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(
  PORT,
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
  )
);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`.red);
  // Close server & exit process
  // server.close(() => process.exit(1));
});
