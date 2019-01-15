const { google }          = require('googleapis');
const { getOAuth2Client } = require('../util/auth');
const monthNames          = require('../util/months');
const propertiesMap       = require('../util/properties-map');

const propertyExists = async( user, property ) => {
  const properties = await propertiesMap.loadProperties();
  return properties[ user ] && properties[ user ][ property ];
};

module.exports = {

  async propertiesForUser( user ) {
    const properties = await propertiesMap.loadProperties();
    return Object.keys( properties[ user ] || {} );
  },

  async addProperty( { name }, auth, { skipCheck = false } = {} ) {
    const exists = await propertyExists( auth.sub, name );

    if ( !skipCheck && exists ) {
      throw new Error('Property already exists');
    }

    const oauth  = await getOAuth2Client( auth.tokens );
    const sheets = google.sheets({ version: 'v4', auth: oauth });


    const date   = new Date();
    const month  = monthNames[ date.getMonth() ];
    const title  = `${ name } ${ month } ${ date.getFullYear() }`;

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
    const companyName = process.env.COMPANY || '';

    const basicSheet = {
      spreadsheetId,
      valueInputOption: 'USER_ENTERED',
      range: 'Sheet1',
      resource: {
        values: [
          [ companyName ],
          [],
          [
            name,
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
    return propertiesMap.addProperty( auth.sub, name, spreadsheetId, month );
  }

};
