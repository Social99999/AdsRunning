  var createError = require('http-errors');
  var express = require('express');
  var path = require('path');
  var cookieParser = require('cookie-parser');
  var logger = require('morgan');
  var cors = require('cors');

  var indexRouter = require('./routes/index');
  var usersRouter = require('./routes/users');

  var app = express();

  // Create HTTP server
  var server = require('http').createServer(app);

  // Add Socket.IO setup
  var io = require('socket.io')(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  // Socket.IO connection handling
  io.on('connection', (socket) => { 
    console.log('User connected:', socket.id);

    // Store token when user authenticates
    socket.on('authenticate', (token) => {
      socket.userToken = token;
      console.log('User authenticated:', socket.id);
    });

    // Handle disconnection
    socket.on('disconnect', async () => {
      console.log('User disconnected:', socket.id);
      console.log('User token:', socket.userToken);

      if (socket.userToken) {
        try {
          // Call the logout endpoint
          const userController = require('./controller/user.controller');
          await userController.handleSocketLogout(socket.userToken);
        } catch (error) {
          console.error('Error during socket logout:', error);
        }
      }
    });
  });

  // Make io accessible to our router
  app.set('io', io);

  var dotenv = require('dotenv');
  dotenv.config();

  // view engine setup
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'ejs');

  app.use(logger('dev'));
  app.use(cors({
    origin: "https://ads-runningontv.vercel.app", // Replace with your frontend URL
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
  }));
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));
  app.use(cookieParser());
  app.use(express.static(path.join(__dirname, 'public')));

  app.use('/', indexRouter);
  app.use('/users', usersRouter);

  // catch 404 and forward to error handler
  app.use(function(req, res, next) {
    next(createError(404));
  });

  // error handler
  app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
  });

  module.exports = { app, server };
