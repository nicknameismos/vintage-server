'use strict';
var path = require('path'),
    mongoose = require('mongoose'),
    Bid = mongoose.model('Bid'),
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
    _ = require('lodash');

// Create the chat configuration
module.exports = function (io, socket) {

    // Send a chat messages to all connected sockets when a message is received
    socket.on('_bid', function (data) {

        var _item = data;
        // console.log(_item.item);
        if (!mongoose.Types.ObjectId.isValid(_item.item._id)) {
            io.emit(_item.item._id, {
                status: 400,
                message: "_id is invalid."
            });
        }
        // get bid item
        Bid.findById(_item.item._id).exec(function (err, bid) {
            if (err) {
                io.emit(_item.item._id, {
                    status: 400,
                    message: "find by id fail."
                });
            } else if (!bid) {
                io.emit(_item.item._id, {
                    status: 404,
                    message: 'No Bid with that identifier has been found'
                });
            }
            var bid = bid;

            _item.item.currentuser = {
                name: _item.user.displayName,
                profileImageURL: _item.user.profileImageURL,
                _id: _item.user._id
            };

            _item.item.price += _item.item.pricebid;

            bid.price = _item.item.price;
            bid.userbid.push({
                user: _item.user,
                bidprice: _item.item.price,
                created: new Date()
            });

            // update bid item

            bid.save(function (err) {
                if (err) {
                    io.emit(_item.item._id, {
                        status: 400,
                        message: 'save bid item error.'
                    });
                } else {
                    io.emit(_item.item._id, {
                        status: 200,
                        response: _item
                    });
                }
            });
        });
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
