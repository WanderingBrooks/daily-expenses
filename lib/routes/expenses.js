const router         = require('express').Router();
const { verifyUser } = require('../util/auth');
const expenses       = require('../resources/expenses');
const properties     = require('../resources/properties');

router.get( '/', verifyUser, ( req, res, next ) => {
  const propertiesForUser = (
    properties.propertiesForUser( req.cookies.DAILY_EXPENSES.sub )
  );
  res.render( 'expenses', { properties: propertiesForUser } );
});

router.post( '/', verifyUser, ( req, res, next ) => {
  const propertiesForUser = (
    properties.propertiesForUser( req.cookies.DAILY_EXPENSES.sub )
  );

  expenses.addDay( req.body, req.cookies.DAILY_EXPENSES )
  .then( () => {
    res.render( 'expenses', {
      properties: propertiesForUser,
      status: 'Added'
    } );
  } )
  .catch( ( error ) => {
    res.render( 'expenses', {
      properties: propertiesForUser,
      error: error.message
    } );
  } );
});

module.exports = router;
