'use strict';

/**
 * Module dependencies
 */
var reviewsPolicy = require('../policies/reviews.server.policy'),
  core = require('../../../core/server/controllers/core.server.controller'),
  reviews = require('../controllers/reviews.server.controller');

module.exports = function (app) {
  // Reviews Routes
  app.route('/api/reviews').all(core.jwtCheck, reviewsPolicy.isAllowed)
    .get(reviews.list)
    .post(reviews.create);

  app.route('/api/reviews/:reviewId').all(core.jwtCheck, reviewsPolicy.isAllowed)
    .get(reviews.read)
    .put(reviews.update)
    .delete(reviews.delete);

  app.route('/api/islike/:reviewId').all(core.jwtCheck, reviewsPolicy.isAllowed)
    .put(reviews.updateIslikes);

  app.route('/api/getlistreview').all(core.jwtCheck, reviewsPolicy.isAllowed)
    .get(reviews.getListReview, reviews.cookingListReview, reviews.listReview);


  // Finish by binding the Review middleware
  app.param('reviewId', reviews.reviewByID);
};
