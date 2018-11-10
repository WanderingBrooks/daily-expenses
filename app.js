const express          = require('express');
const path             = require('path');
const cookieParser     = require('cookie-parser');
const logger           = require('morgan');

const setRoutes        = require('./lib/routes');

let port;
if ( process.env.PORT ) {
  port = process.env.PORT;
} else {
  port = process.env.NODE_ENV === 'dev' ? 3000 : 80;
}

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

setRoutes( app );

app.listen( port, () => console.log( `listening on port ${ port }!` ) );
