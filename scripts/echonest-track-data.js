var echojs = require('echojs')
  , fs = require('fs')
  , path = require('path');

var echo = echojs({
  key: process.env.ECHONEST_KEY
});

// http://developer.echonest.com/docs/v4/song.html#search
var location = __dirname + '/assets/audio/glasstress.mp3';

console.log('- Reading track file: ', location)

fs.readFile(location, function (err, buffer) {


  console.log('- Uploading file')

  echo('track/upload').post({
    filetype: path.extname(location).substr(1)
  }, 'application/octet-stream', buffer, function (err, json) {

    console.log('- Upload complete, saving to file')

    fs.writeFile('track-metadata.json', function() {
      console.log('+ written to file')
    })
  });
});