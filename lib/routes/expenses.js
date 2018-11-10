const router         = require('express').Router();
const { verifyUser } = require('../util/auth');
const expenses       = require('../resources/expenses');
const properties     = require('../resources/properties');

router.get( '/', verifyUser, ( req, res ) => {
  const propertiesForUser = (
    properties.propertiesForUser( req.cookies.DAILY_EXPENSES.sub )
  );

  res.render( 'expenses', { properties: propertiesForUser } );
});

router.post( '/', verifyUser, async( req, res ) => {
  let result;
  const propertiesForUser = (
    properties.propertiesForUser( req.cookies.DAILY_EXPENSES.sub )
  );

  try {
    await expenses.addDay( req.body, req.cookies.DAILY_EXPENSES );
    result = { status: 'Added' };
  } catch ({ message }) {
    result = { error: message };
  } finally {
    res.render( 'expenses', {
      properties: propertiesForUser,
      ...result
    });
  }
});

module.exports = router;
