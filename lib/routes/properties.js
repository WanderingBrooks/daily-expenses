const router         = require('express').Router();
const resource       = require('../resources/properties');
const { verifyUser } = require('../util/auth');

router.get( '/', verifyUser, ( req, res ) => {
  res.render('properties');
});

router.post( '/', verifyUser, ( req, res ) => {
  resource.addProperty( req.body, req.cookies.DAILY_EXPENSES )
  .then( () => {
    res.render( 'properties', { status: 'Added' } );
  })
  .catch( ( error ) => {
    res.render( 'properties', { error: error.message } );
  } );
});

module.exports = router;
