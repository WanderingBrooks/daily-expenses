const fs         = require('fs');
const path       = require('path');
const { google } = require('googleapis');

const redirectIndex = process.env.NODE_ENV === 'dev' ? 1 : 0;

function loadToken() {
  const credsPath = path.join( __dirname, '../../credentials.json' );
  return fs.readFileSync( credsPath );
}

function getOAuth2Client( tokens ) {
  const token                                       = loadToken();
  const { client_id, client_secret, redirect_uris } = JSON.parse( token ).web;

  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[ redirectIndex ]
  );

  if ( tokens ) {
    oAuth2Client.setCredentials( tokens );
  };

  return oAuth2Client;
}

async function verifyUser( req, res, next ) {
  if ( req.cookies.DAILY_EXPENSES ) {
    return next();
  } else {
    res.clearCookie('DAILY_EXPENSES');
    return res.redirect('/auth');
  }
}

async function getTokens( code ) {
  const oAuth2Client = getOAuth2Client();
  const { tokens }   = await oAuth2Client.getToken( code );

  const toVerify = {
    idToken: tokens.id_token, audience: oAuth2Client._clientId
  };

  const ticket  = await oAuth2Client.verifyIdToken( toVerify );
  const { sub } = ticket.getPayload();

  return { tokens, sub };
}

function generateURL() {
  const oAuth2Client = getOAuth2Client();

  const scopes = [
    'https://www.googleapis.com/auth/spreadsheets',
    'profile'
  ];

  const url = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes
  });

  return url;
}

module.exports = {
  verifyUser,
  getOAuth2Client,
  generateURL,
  getTokens
};
