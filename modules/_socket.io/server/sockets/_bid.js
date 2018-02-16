'use strict';
var path = require('path'),
    mongoose = require('mongoose'),
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
    _ = require('lodash');

// Create the chat configuration
module.exports = function (io, socket) {

    // Send a chat messages to all connected sockets when a message is received
    socket.on('_bid', function (data) {

        var _item = data;

        _item.item.currentuser = {
            name: _item.user.displayName,
            profileImageURL: _item.user.profileImageURL,
            _id: _item.user._id
        };

        _item.item.price += _item.item.pricebid;

        io.emit(_item.item._id, _item);
    });

    // Emit the status event when a socket client is disconnected
    // socket.on('disconnect', function() {
    //     io.emit('chatMessage', {
    //         type: 'status',
    //         text: 'disconnected',
    //         created: Date.now(),
    //         username: socket.request.user.username
    //     });
    // });
};
