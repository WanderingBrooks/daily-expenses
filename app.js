const express          = require('express');
const path             = require('path');
const cookieParser     = require('cookie-parser');
const logger           = require('morgan');

const expensesRouter   = require('./lib/routes/expenses');
const propertiesRouter = require('./lib/routes/properties');
const authRouter       = require('./lib/routes/auth');

const app = express();

// view engine setup
app.set( 'views', path.join( __dirname, 'views' ) );
app.set( 'view engine', 'pug' );

app.use( logger('dev') );
app.use( express.json() );
app.use( express.urlencoded({ extended: false }) );
app.use( cookieParser() );
app.use( express.static( path.join( __dirname, 'public' ) ) );

app.use( '/expenses', expensesRouter );
app.use( '/properties', propertiesRouter );
app.use( '/auth', authRouter );

// send away the bots
app.get( '/robots.txt', ( req, res ) => {
  res.type('text/plain');
  res.send('User-agent: *\nDisallow: /');
});

// Appease the google gods
app.get( '/privacy', ( req, res ) => {
  res.render('privacy');
});

// catch 404 and forward to error handler
app.use( ( req, res, next ) => {
  res.redirect('/expenses');
});

// error handler
app.use( ( err, req, res, next ) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status( err.status || 500 );
  res.render('error');
});

app.listen( 3000, () => console.log('Example app listening on port 3000!') );
