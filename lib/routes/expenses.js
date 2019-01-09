const router         = require('express').Router();
const { verifyUser } = require('../util/auth');
const expenses       = require('../resources/expenses');
const properties     = require('../resources/properties');

router.get( '/', verifyUser, async( req, res ) => {
  const propertiesForUser = await properties
  .propertiesForUser( req.cookies.DAILY_EXPENSES.sub );

  res.render( 'expenses', { properties: propertiesForUser } );
});

router.post( '/', verifyUser, async( req, res ) => {
  let result;
  const cookie = req.cookies.DAILY_EXPENSES;
  const propertiesForUser = (
    properties.propertiesForUser( cookie.sub )
  );

  try {
    await expenses.addDay( req.body, cookie );
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
