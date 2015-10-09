var express = require('express');
var router = express.Router();
var utils = require('../utils/utils');

var User = require('../models/User')

/*
  Require authentication on ALL access to /tweets/*
  Clients which are not logged in will receive a 403 error code.
*/
var requireAuthentication = function(req, res, next) {
  if (!req.currentUser) {
    utils.sendErrResponse(res, 403, 'Must be logged in to use this feature.');
  } else {
    next();
  }
};
/*
  For create and edit requests, require that the request body
  contains a 'content' field. Send error code 400 if not.
*/
var requireContent = function(req, res, next) {
  if (!req.body.content) {
    utils.sendErrResponse(res, 400, 'Content required in request.');
  } else {
    next();
  }
};

var requireOwnership = function(req, res, next) {
  console.log("THIS IS HAPPENING")
  if (!(req.currentUser.username === req.tweet.creator)) {
    utils.sendErrResponse(res, 404, 'Resource not found.');
  } else {
    next();
  }
};

router.param('tweet', function(req, res, next, tweetId) {
  User.getTweet(req.currentUser.username, tweetId, function(err, tweet) {
    if (tweet) {
      req.tweet = tweet;
      next();
    } else {
      utils.sendErrResponse(res, 404, 'Resource not found.');
    }
  });
});
// Register the middleware handlers above.
router.all('*', requireAuthentication);
router.all('/:tweet', requireOwnership);
router.post('*', requireContent);

router.get('/', function(req, res) {
  User.getTweets(req.currentUser.username, function(err, tweets) {
    if (err) {
      utils.sendErrResponse(res, 500, 'An unknown error occurred.');
    } else {
      utils.sendSuccessResponse(res, { tweets: tweets });
    }
  });
});

/*
  POST /tweets
  Request body:
    - content: the content of the note
  Response:
    - success: true if the server succeeded in recording the user's note
    - err: on failure, an error message
*/
router.post('/', function(req, res) {
  User.addTweet(req.currentUser.username, {
    content: req.body.content,
    creator: req.currentUser.username
  }, function(err, tweet) {
    if (err) {
      utils.sendErrResponse(res, 500, 'An unknown error occurred.');
    } else {
      utils.sendSuccessResponse(res);
    }
  });
});

router.delete('/:tweet', function(req, res) {
  console.log("KLDSJAFADKLSJFKLAS;JDFKLS;");
  User.removeTweet(
    req.currentUser.username, 
    req.tweet._id, 
    function(err) {
      if (err) {
        utils.sendErrResponse(res, 500, 'An unknown error occurred.');
      } else {
        utils.sendSuccessResponse(res);
      }
  });
});

module.exports = router;
