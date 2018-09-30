const { google }          = require('googleapis');
const { getOAuth2Client } = require('../util/auth');
const propertiesMap       = require('../util/properties-map');

module.exports = {

  getSheetId( user, propertyName ) {
    const properties = propertiesMap.loadProperties();
    return properties[ user ] && properties[ user ][ propertyName ];
  },

  formatFields( fields ) {
    const date  = new Date( Date.now() );
    let values  = [ [ `${ date.getMonth() + 1}/${ date.getDay()}` ] ];

    values.length = Array.isArray( fields.task )
      ? fields.task.length
      : values.length;

    values.fill( [ '' ], 1 );

    for ( let key of Object.keys( fields ) ) {
      if ( Array.isArray( fields[ key ] ) ) {
        for ( let j = 0; j < fields[ key ].length; j++ ) {
          values[ j ].push( fields[ key ][ j ] || '-' );
        }
      } else {
        values[ 0 ].push( fields[ key ] || '-' );
      }
    }

    for ( let row of values ) {
      const totalCost = [
        `=SUM( INDIRECT("R[0]C[-1]", false), `,
        `IF( INDIRECT("R[0]C[-2]", false) = "-", `,
        `0, INDIRECT("R[0]C[-2]", false) ) * 50,`,
        `IF( INDIRECT("R[0]C[-3]", false) = "-", `,
        `0, INDIRECT("R[0]C[-3]", false) ) * 75 )` ].join('');

      row.push( totalCost );
    }

    values = [ [] ].concat( values );

    return values;
  },

  async addDay( { property, ...rest }, auth ) {
    const spreadsheetId = this.getSheetId( auth.sub, property );
    const oauth         = await getOAuth2Client( auth.tokens );
    const sheets        = google.sheets({ version: 'v4', auth: oauth });

    if ( !spreadsheetId ) {
      throw new Error( `Missing spreadsheet id for ${ property }` );
    }

    const values = this.formatFields( rest );

    const update = {
      spreadsheetId,
      valueInputOption: 'USER_ENTERED',
      range: 'Sheet1',
      resource: {
        values
      }
    };

    return sheets.spreadsheets.values.append( update );
  }

};
