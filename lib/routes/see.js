const router             = require('express').Router();
const { verifyUser }     = require('../util/auth');
const { loadProperties } = require('../util/properties-map');

router.get( '/', verifyUser, ( req, res ) => {
  const user          = req.signedCookies.DAILY_EXPENSES.sub;
  const allProperties = loadProperties();
  const sheetids      = Object.values( allProperties[ user ] )
  .map( property => property.sheetid );

  res.render( 'see', { sheetids } );
});

module.exports = router;
