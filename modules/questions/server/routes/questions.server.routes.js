'use strict';

/**
 * Module dependencies
 */
var questionsPolicy = require('../policies/questions.server.policy'),
  core = require('../../../core/server/controllers/core.server.controller'),
  questions = require('../controllers/questions.server.controller');

module.exports = function (app) {
  // Questions Routes
  app.route('/api/questions').all(core.jwtCheck, questionsPolicy.isAllowed)
    .get(questions.list)
    .post(questions.create);

  app.route('/api/questions/:questionId').all(core.jwtCheck, questionsPolicy.isAllowed)
    .get(questions.read)
    .put(questions.update)
    .delete(questions.delete);

  // Finish by binding the Question middleware
  app.param('questionId', questions.questionByID);
};
