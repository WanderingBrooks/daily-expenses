const express                    = require('express');
const router                     = express.Router();
const { generateURL, getTokens } = require('../util/auth');

router.get( '/', async( req, res, next ) => {
  const { code } = req.query;

  if ( code ) {
    const cookieData = await getTokens( code );
    const config = {
      maxAge: cookieData.tokens.expiry_date,
      httpOnly: true
    };

    return res.cookie( 'DAILY_EXPENSES', cookieData, config )
    .redirect('/expenses');
  }

  const url = await generateURL();
  res.redirect( url );
});

module.exports = router;
