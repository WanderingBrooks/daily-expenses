const fs = require('fs');

function loadProperties() {
  try {
    const exists = fs.existsSync('properties.json');

    if ( exists ) {
      const content = fs.readFileSync('properties.json');

      return JSON.parse( content );
    } else {
      fs.writeFileSync( 'properties.json', '{}' );

      return {};
    }
  } catch ( err ) {
    console.error( err );
  }
}

function addProperty( user, name, sheetid, month ) {
  try {
    const properties = loadProperties();
    let update = { [ name ]: { sheetid, month } };

    if ( properties[ user ] ) {
      update = { ...properties[ user ], ...update };
    }

    properties[ user ] = update;
    fs.writeFileSync( 'properties.json', JSON.stringify( properties ) );
    return update;
  } catch ( err ) {
    console.error( err );
  }
}

module.exports = { loadProperties, addProperty };
