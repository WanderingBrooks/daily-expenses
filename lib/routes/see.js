const router             = require('express').Router();
const { verifyUser }     = require('../util/auth');
const { loadProperties } = require('../util/properties-map');

router.get( '/', verifyUser, ( req, res ) => {
  const user          = req.cookies.DAILY_EXPENSES.sub;
  const allProperties = loadProperties();

  const sheets = Object
  .entries( allProperties[ user ] || {} )
  .map( ([ name, value ]) => ({ name, ...value }) );

  res.render( 'see', { sheets } );
});

module.exports = router;
