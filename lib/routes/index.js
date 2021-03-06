'use strict';

module.exports = ( app ) => {
  app.use( '/expenses',     require('./expenses') );
  app.use( '/properties',   require('./properties') );
  app.use( '/auth',         require('./auth') );
  app.use( '/see',          require('./see') );

  // send away the bots
  app.get( '/robots.txt', ( req, res ) => {
    res.type('text/plain');
    res.send('User-agent: *\nDisallow: /');
  });

  // Appease the google gods
  app.get( '/privacy', ( req, res ) => {
    res.render('privacy');
  });

  // If authentication fails
  app.get( '/unauthorized', ( req, res ) => {
    res.type('text/plain');
    res.send('Unauthorized');
  });

  // catch 404 and forward to error handler
  app.use( ( req, res ) => {
    res.redirect('/expenses');
  });
};
