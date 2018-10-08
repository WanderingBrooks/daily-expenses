const router             = require('express').Router();
const { verifyUser }     = require('../util/auth');
const { loadProperties } = require('../util/properties-map');

router.get( '/', verifyUser, ( req, res ) => {
  const user = req.cookies.DAILY_EXPENSES.sub;
  const allProperties = loadProperties();
  const entries = Object.entries( allProperties[ user ] );
  const properties = [];

  for ( let [ key, { sheetid } ] of entries ) {
    properties.push({ name: key, sheetid });
  }

  res.render( 'see', { properties } );
});

module.exports = router;
