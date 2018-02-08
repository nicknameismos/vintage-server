'use strict';

module.exports = function (app) {
  // User Routes
  var users = require('../controllers/users.server.controller'),
    core = require('../../../core/server/controllers/core.server.controller');

  // Setting up the users profile api
  app.route('/api/users/me').get(users.me);
  app.route('/api/users/me').post(users.me);
  app.route('/api/users').put(users.update);
  app.route('/api/users/accounts').delete(users.removeOAuthProvider);
  app.route('/api/users/password').post(core.jwtCheck, users.changePassword);
  app.route('/api/users/picture').post(users.changeProfilePicture);
  app.route('/api/usermanage/:userId').put(users.usermanage);

  // Finish by binding the user middleware
  app.param('userId', users.userByID);
};
