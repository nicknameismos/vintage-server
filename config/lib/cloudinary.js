'use strict';
var cloudinary = require('cloudinary');

// cloudinary purchasetest
cloudinary.config({
    cloud_name: 'huq7thcvh',
    api_key: '232175733478437',
    api_secret: 'v-gBzmFg3CMYFIGv4NUiX3AQH4Q'
});

module.exports.cloudinary = cloudinary;
