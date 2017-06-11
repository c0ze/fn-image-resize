'use strict';

const Sharp = require('sharp');

var assert = require('assert');
var fs = require('fs');
var manta = require('manta');

var client = manta.createClient({
    sign: manta.privateKeySigner({
        key: fs.readFileSync(process.env.HOME + '/.ssh/arda_iron_joyent_id_rsa', 'utf8'),
        keyId: process.env.MANTA_KEY_ID,
        user: process.env.MANTA_USER
    }),
    user: process.env.MANTA_USER,
    url: process.env.MANTA_URL
});
console.log('manta ready: %s', client.toString());
var wstream = fs.createWriteStream('local_marble.jpg');
var crypto = require('crypto');
var MemoryStream = require('memorystream');

client.get('~~/stor/iron-fn-demo/The_Blue_Marble.jpg', function (err, stream) {
    assert.ifError(err);

//    stream.setEncoding('utf8');
    stream.on('data', function (chunk) {
	wstream.write(chunk);
    });

    var width = 300;
    var height = 300;

    stream.on('finish', () => {
	Sharp('local_marble.jpg')
	    .resize(width, height)
	    .toFormat('png')
//	    .toFile('local_marble_resized.png')
	    .toBuffer()
	    .then( data => {

		   var opts = {
		       headers: {
			   'access-control-allow-origin': '*',
			   'access-control-allow-methods': 'GET'
		       },
		       size: Buffer.byteLength(data)
		   };
		   var stream = new MemoryStream();

		   client.put('~~/stor/iron-fn-demo/The_Blue_Marble_resized.png', stream, opts, function (err) {
		       assert.ifError(err);
		   });

		   stream.end(data);
	    });
    });
});

