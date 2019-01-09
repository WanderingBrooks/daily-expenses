const AWS = require('aws-sdk');

const S3  = new AWS.S3({ params: { Bucket: 'db73-properties-map' } });

const Key = process.env.NODE_ENV === 'dev'
  ? 'test-properties.json'
  : 'properties.json';

async function loadProperties() {
  const { Body } = await S3.getObject({ Key })
  .promise()
  .catch( console.error );

  return JSON.parse( Body );
}

async function addProperty( user, name, sheetid, month ) {
  const properties = await loadProperties();
  let update = { [ name ]: { sheetid, month } };

  if ( properties[ user ] ) {
    update = { ...properties[ user ], ...update };
  }

  properties[ user ] = update;

  const params = {
    Key,
    Body: JSON.stringify( properties )
  };

  await S3.putObject( params )
  .promise()
  .catch( console.error );

  return update;
}

module.exports = { loadProperties, addProperty };
