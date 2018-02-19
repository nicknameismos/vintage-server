'use strict';
var path = require('path'),
    mongoose = require('mongoose'),
    Bid = mongoose.model('Bid'),
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
    _ = require('lodash');

var schedule = require('node-schedule');
// Create the chat configuration
module.exports = function (io, socket) {

    // Send a chat messages to all connected sockets when a message is received
    socket.on('_bid', function (data) {

        var startTime = new Date(new Date + 5000);
        var endTime = new Date(startTime.getTime() + 5000);
        var j = schedule.scheduleJob({
            start: startTime,
            end: endTime,
            rule: '*/1 * * * * *'
        }, function () {
            console.log('Time for tea!');
        });

        var _item = data;
        var enddate = new Date(_item.item.dateend);
        var current = new Date();
        if (enddate > current) {

            if (!mongoose.Types.ObjectId.isValid(_item.item._id)) {
                io.emit(_item.item._id, {
                    status: 400,
                    message: "_id is invalid.(400)"
                });
            }
            // get bid item
            Bid.findById(_item.item._id).exec(function (err, bid) {
                if (err) {
                    io.emit(_item.item._id, {
                        status: 401,
                        message: "find by id fail.(401)",
                        user_id: _item.user._id
                    });
                } else if (!bid) {
                    io.emit(_item.item._id, {
                        status: 404,
                        message: 'No Bid with that identifier has been found.(404)',
                        user_id: _item.user._id
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

                bid.save(function (err, bidRes) {
                    if (err) {
                        io.emit(_item.item._id, {
                            status: 400,
                            message: 'save bid item error.(400)',
                            user_id: _item.user._id
                        });
                    } else {
                        _item.item.price = bidRes.price;
                        io.emit(_item.item._id, {
                            status: 200,
                            response: _item
                        });
                    }
                });
            });
        } else {
            io.emit(_item.item._id, {
                status: 402,
                message: "Time out.",
                user_id: _item.user._id
            });
        }
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
