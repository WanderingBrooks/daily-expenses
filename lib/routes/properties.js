const router         = require('express').Router();
const resource       = require('../resources/properties');
const { verifyUser } = require('../util/auth');

router.get( '/', verifyUser, ( req, res ) => {
  res.render('properties');
});

router.post( '/', verifyUser, async( req, res ) => {
  let result;

  try {
    await resource.addProperty( req.body, req.cookies.DAILY_EXPENSES );
    result = { status: 'Added' };
  } catch ({ message }) {
    result = { error: message };
  } finally {
    res.render( 'properties', { ...result });
  }
});

module.exports = router;
