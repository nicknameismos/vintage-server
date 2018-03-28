'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

/**
 * Show the current user
 */
exports.read = function (req, res) {
  res.json(req.model);
};

/**
 * Update a User
 */
exports.update = function (req, res) {
  var user = req.model;

  //For security purposes only merge these parameters
  user.firstName = req.body.firstName;
  user.lastName = req.body.lastName;
  user.mobile = req.body.mobile;
  user.displayName = user.firstName + ' ' + user.lastName;
  user.roles = req.body.roles;

  user.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    }

    res.json(user);
  });
};

/**
 * Delete a user
 */
exports.delete = function (req, res) {
  var user = req.model;

  user.remove(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    }

    res.json(user);
  });
};

/**
 * List of Users
 */
exports.list = function (req, res) {
  User.find({}, '-salt -password').sort('-created').populate('user', 'displayName').exec(function (err, users) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    }

    res.json(users);
  });
};

/**
 * User(s) Management
 */
exports.initlist = function (req, res, next) {
  req.usersofrole = [{
      name: "customer",
      users: []
    },
    {
      name: "shopowner",
      users: []
    },
    {
      name: "admin",
      users: []
    },
    {
      name: "biker",
      users: []
    }
  ];

  next();
};

exports.customer = function (req, res, next) {
  User.find({
    roles: 'user'
  }, '-salt -password -loginToken -loginExpires').exec(function (err, users) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    }
    users.forEach(function (user) {
      req.usersofrole[0].users.push(user);
    });
    next();
  });

};

exports.shopowner = function (req, res, next) {
  User.find({
    roles: 'shop'
  }, '-salt -password -loginToken -loginExpires').exec(function (err, users) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    }
    users.forEach(function (user) {
      req.usersofrole[1].users.push(user);
    });
    next();
  });

};
exports.admins = function (req, res, next) {
  User.find({
    roles: 'admin'
  }, '-salt -password -loginToken -loginExpires').exec(function (err, users) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    }
    users.forEach(function (user) {
      req.usersofrole[2].users.push(user);
    });
    next();
  });

};

exports.biker = function (req, res, next) {
  User.find({
    roles: 'biker'
  }, '-salt -password -loginToken -loginExpires').exec(function (err, users) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    }
    users.forEach(function (user) {
      req.usersofrole[3].users.push(user);
    });
    next();
  });

};

exports.managelist = function (req, res) {
  res.json({
    filterrole: req.usersofrole
  });
};

exports.setinitpage = function (req, res, next) {
  req.items = [];
  req.pagings = [1];
  next();
};
exports.tabcustomer = function (req, res, next) {
  if (req.body.role !== 'user') {
    next();
  }
  User.find({
    roles: 'user'
  }, '-salt -password -loginToken -loginExpires').exec(function (err, users) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    }
    users.forEach(function (user) {
      req.items.push(user);
    });
    next();
  });

};

exports.tabshopowner = function (req, res, next) {
  if (req.body.role !== 'shop') next();

  User.find({
    roles: 'shop'
  }, '-salt -password -loginToken -loginExpires').exec(function (err, users) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    }
    users.forEach(function (user) {
      req.items.push(user);
    });
    next();
  });

};
exports.tabadmins = function (req, res, next) {
  if (req.body.role !== 'admin') next();

  User.find({
    roles: 'admin'
  }, '-salt -password -loginToken -loginExpires').exec(function (err, users) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    }
    users.forEach(function (user) {
      req.items.push(user);
    });
    next();
  });

};

exports.tabbiker = function (req, res, next) {
  if (req.role !== 'biker') next();

  User.find({
    roles: 'biker'
  }, '-salt -password -loginToken -loginExpires').exec(function (err, users) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    }
    users.forEach(function (user) {
      req.items.push(user);
    });
    next();
  });

};

exports.managelistpage = function (req, res) {
  res.jsonp({
    items: req.items,
    pagings: req.pagings
  });
};

/**
 * User middleware
 */
exports.userByID = function (req, res, next, id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'User is invalid'
    });
  }

  User.findById(id, '-salt -password').exec(function (err, user) {
    if (err) {
      return next(err);
    } else if (!user) {
      return next(new Error('Failed to load user ' + id));
    }

    req.model = user;
    next();
  });
};

exports.getUsersByAdmin = function (req, res, next) {
  var firstIndex = 0;
  var lastIndex = 10;
  var rolesTH = ['ลูกค้า', 'เจ้าของร้าน', 'แอดมิน'];
  var rolesEN = ['user', 'shop', 'admin'];
  if (req.body.currentpage > 1) {
    firstIndex = ((req.body.currentpage - 1) * 10);
    lastIndex = (req.body.currentpage * 10);
  }
  var role = 'user';
  var filter = {
    roles: role
  };

  if (req.body.title && req.body.title !== '') {
    if (rolesTH.indexOf(req.body.title) !== -1) {
      role = rolesEN[rolesTH.indexOf(req.body.title)];
      filter = {
        roles: role
      };
    }
  }
  if (req.body.keyword && req.body.keyword !== '') {
    filter = searchName(req.body.keyword, role);
  }
  // console.log(filter);
  User.find(filter, '-salt -password -loginToken -loginExpires').exec(function (err, users) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    }
    // console.log(users);
    req.pagings = countPage(users);
    req.resUser = users.slice(firstIndex, lastIndex);
    req.allUsers = users;
    next();
  });
};

exports.getCountUsersByAdmin = function (req, res, next) {
  var user = 0;
  var shop = 0;
  var admin = 0;
  req.allUsers.forEach(function (user) {
    if (user.roles[0] === 'user') {
      user++;
    } else if (user.roles[0] === 'shop') {
      shop++;
    } else if (user.roles[0] === 'admin') {
      admin++;
    }
  });
  req.count = [user, shop, admin];
  next();
};

exports.resUsers = function (req, res) {
  res.jsonp({
    titles: ['ลูกค้า', 'เจ้าของร้าน', 'แอดมิน'],
    items: req.resUser || [],
    paging: req.pagings || [],
    count: req.count
  });
};

function searchName(keyWordName, role) {
  var keywordname = {
    roles: role,
    $or: [{
      'firstName': {
        '$regex': keyWordName,
        '$options': 'i'
      }
    }, {
      'lastName': {
        '$regex': keyWordName,
        '$options': 'i'
      }
    }, {
      'displayName': {
        '$regex': keyWordName,
        '$options': 'i'
      }
    }],

  };
  return keywordname;
}

function countPage(items) {
  var numpage = [];
  if (items && items.length > 0) {
    var pages = items.length / 10;
    var pagings = Math.ceil(pages);
    for (var i = 0; i < pagings; i++) {
      numpage.push(i + 1);
    }

  }
  return numpage;
}
