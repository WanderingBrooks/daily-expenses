const fs         = require('fs');
const { google } = require('googleapis');

function loadToken( callback ) {
  fs.readFile( 'credentials.json', callback );
}

function getOAuth2Client( tokens ) {
  return new Promise( ( resolve, reject ) => {
    loadToken( ( err, content ) => {
      if ( err ) {
        reject( err );
      }

      const { client_id, client_secret, redirect_uris }
        = JSON.parse( content ).installed;

      const oAuth2Client = new google.auth.OAuth2(
        client_id,
        client_secret,
        redirect_uris[ 1 ]
      );

      oAuth2Client.setCredentials( tokens );

      resolve( oAuth2Client );
    });
  });
};


async function verifyUser( req, res, next ) {
  if ( req.cookies.DAILY_EXPENSES ) {
    next();
  } else {
    res.clearCookie('DAILY_EXPENSES');
    res.redirect('/auth');
  }
};

async function getTokens( code ) {
  return new Promise( ( resolve, reject ) => {
    loadToken( async( err, content ) => {
      if ( err ) {
        console.log('there was an error');
        reject( err );
      }

      const { client_id, client_secret, redirect_uris }
        = JSON.parse( content ).installed;

      const oauth2Client = new google.auth.OAuth2(
        client_id,
        client_secret,
        redirect_uris[ 1 ]
      );

      const { tokens } = await oauth2Client.getToken( code );

      const ticket = await oauth2Client.verifyIdToken({
        idToken:  tokens.id_token,
        audience: client_id
      });

      const { sub } = ticket.getPayload();

      resolve({ tokens, sub });
    });
  });
}

async function generateURL() {
  return new Promise( ( resolve, reject ) => {
    loadToken( async( err, content ) => {
      const { client_id, client_secret, redirect_uris }
        = JSON.parse( content ).installed;

      console.log( client_id, client_secret, redirect_uris[ 1 ] );

      const oauth2Client = new google.auth.OAuth2(
        client_id,
        client_secret,
        redirect_uris[ 1 ]
      );

      const scopes = [
        'https://www.googleapis.com/auth/spreadsheets',
        'profile'
      ];

      const url = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes
      });

      resolve( url );
    });
  });
}

module.exports = {
  verifyUser,
  getOAuth2Client,
  generateURL,
  getTokens
};
