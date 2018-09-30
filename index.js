const fs         = require('fs');
const readline   = require('readline');
const { google } = require('googleapis');

const SCOPES = [ 'https://www.googleapis.com/auth/spreadsheets' ];
const TOKEN_PATH = 'token.json';
const monthNames = [ 'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

/**
 * create a gooogle sheets file
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
const addDay = async( auth, spreadsheetId ) => {
  const sheets = google.sheets({ version: 'v4', auth });
  const date   = new Date( Date.now() );

  const update = {
    spreadsheetId,
    valueInputOption: 'USER_ENTERED',
    range: 'Sheet1',
    resource: {
      values: [
        [
          `${ date.getMonth() + 1}/${ date.getDay()}`,
          'Weeding',
          'Brooks, 3',
          '6.5',
          '7',
          '40'
        ],
        []
      ]
    }
  };

  const appendRes = await sheets.spreadsheets.values.append( update );

  console.log( appendRes );
};

/**
 * create a gooogle sheets file
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
const createBaseFile = async( auth ) => {
  console.log( auth );
  const sheets = google.sheets({ version: 'v4', auth });
  const date   = new Date( Date.now() );
  const title  = (
    `${ monthNames[ date.getMonth() ] }_${ date.getFullYear() }_propertyname`
  );

  const payload = {
    resource: {
      properties: {
        title,
        defaultFormat: {
          textFormat: {
            fontSize: 12
          }
        }
      }
    }
  };

  const createRes = await sheets.spreadsheets.create( payload );

  const { data: { spreadsheetId } } = createRes;

  const basicSheet = {
    spreadsheetId,
    valueInputOption: 'USER_ENTERED',
    range: 'Sheet1',
    resource: {
      values: [
        [
          'Dwight Brooks Horticulture'
        ],
        [],
        [
          'property name',
          'Task',
          'People',
          'labor: $75/hr',
          'labor: $50/hr',
          'Materials: $',
          'Total: $'
        ]
      ]
    }
  };

  await sheets.spreadsheets.values.append( basicSheet );

  await addDay( auth, spreadsheetId );
};

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
const getAccessToken = ( oAuth2Client, callback ) => {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES
  });

  console.log( 'Authorize this app by visiting this url:', authUrl );
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question( 'Enter the code from that page here: ', ( code ) => {
    rl.close();
    oAuth2Client.getToken( code, ( err, token ) => {
      if ( err ) {
        return console.error( 'Error retrieving access token', err );
      }

      oAuth2Client.setCredentials( token );
      // Store the token to disk for later program executions
      fs.writeFile( TOKEN_PATH, JSON.stringify( token ), ( err ) => {
        if ( err ) {
          console.error( err );
        }

        console.log( 'Token stored to', TOKEN_PATH );
      });
      callback( oAuth2Client );
    });
  });
};

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
const authorize = ( credentials, callback ) => {
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
    client_id, client_secret, redirect_uris[ 0 ]
  );

  // Check if we have previously stored a token.
  fs.readFile( TOKEN_PATH, ( err, token ) => {
    if ( err ) {
      return getAccessToken( oAuth2Client, callback );
    }

    oAuth2Client.setCredentials( JSON.parse( token ) );
    callback( oAuth2Client );
  });
};


// Load client secrets from a local file.
fs.readFile( 'credentials.json', ( err, content ) => {
  if ( err ) {
    return console.log( 'Error loading client secret file:', err );
  }
  // Authorize a client with credentials, then call the Google Drive API.
  authorize( JSON.parse( content ), console.log );
});
