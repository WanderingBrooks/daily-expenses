const fs = require('fs');

function loadProperties() {
  try {
    const exists = fs.existsSync('properties.json');

    if ( exists ) {
      const content = fs.readFileSync('properties.json');

      return JSON.parse( content );
    } else {
      fs.writeFile( 'properties.json', '{}', ( err ) => {
        if ( err ) {
          return console.log( err );
        }

        return {};
      });
    }
  } catch ( err ) {
    console.error( err );
  }
}

function addProperty( user, name, sheetid ) {
  try {
    const properties = loadProperties();
    let update = { [ name ]: sheetid };
    if ( properties[ user ] ) {
      update = Object.assign( properties[ user ], update );
    }

    properties[ user ] = update;
    return fs.writeFileSync( 'properties.json', JSON.stringify( properties ) );
  } catch ( err ) {
    console.error( err );
  }
}

module.exports = { loadProperties, addProperty };
