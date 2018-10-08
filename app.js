const express          = require('express');
const path             = require('path');
const cookieParser     = require('cookie-parser');
const logger           = require('morgan');

const expensesRouter   = require('./lib/routes/expenses');
const propertiesRouter = require('./lib/routes/properties');
const authRouter       = require('./lib/routes/auth');
const seeRouter        = require('./lib/routes/see');

const port = process.env.NODE_ENV === 'dev' ? 3000 : 80;

const app = express();

// view engine setup
app.set( 'views', path.join( __dirname, 'views' ) );
app.set( 'view engine', 'pug' );

app.use( logger('dev') );
app.use( express.json() );
app.use( express.urlencoded({ extended: false }) );
app.use( cookieParser() );
app.use( express.static( path.join( __dirname, 'public' ) ) );

if ( process.env.NODE_ENV !== 'dev' ) {
  app.all( '/*', ( req, res, next ) => {
    const xfp = req.headers['x-forwarded-proto']
      || req.headers['X-Forwarded-Proto'];

    if ( xfp && xfp !== 'https' ) {
      return res.redirect( `https://${ req.headers.host }${ req.url }` );
    }

    return next();
  });
}

app.use( '/expenses', expensesRouter );
app.use( '/properties', propertiesRouter );
app.use( '/auth', authRouter );
app.use( '/see', seeRouter );

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

app.listen( port, () => console.log( `listening on port ${ port }!` ) );
