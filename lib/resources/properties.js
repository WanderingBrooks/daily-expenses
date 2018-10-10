const { google }          = require('googleapis');
const { getOAuth2Client } = require('../util/auth');
const monthNames          = require('../util/months');
const propertiesMap       = require('../util/properties-map');

module.exports = {

  propertyExists( user, property ) {
    const properties = propertiesMap.loadProperties();
    return properties[ user ] && properties[ user ][ property ];
  },


  propertiesForUser( user ) {
    const properties = propertiesMap.loadProperties();
    return Object.keys( properties[ user ] || {} );
  },

  async publishSheet( fileId, auth ) {
    const oauth  = await getOAuth2Client( auth.tokens );
    const drive  = google.drive({ version: 'v3', auth: oauth });

    const params = {
      fileId,
      revisionId: '1',
      resource: {
        published: true,
        publishAuto: true
      }
    };

    return drive.revisions.update( params );
  },

  /**
   * create a gooogle sheets file
   * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
   */
  async addProperty( { name }, auth, { skipCheck = false } = {} ) {
    if ( !skipCheck && this.propertyExists( auth.sub, name ) ) {
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

    await this.publishSheet( spreadsheetId, auth );

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
