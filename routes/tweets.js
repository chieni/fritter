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

/*
  Require ownership whenever accessing a particular tweet
  This means that the client accessing the resource must be logged in
  as the user that originally created the tweet. Clients who are not owners 
  of this particular resource will receive a 404.
*/
var requireOwnership = function(req, res, next) {
  if (!(req.currentUser.username === req.tweet.creator)) {
    utils.sendErrResponse(res, 404, 'Resource not found.');
  } else {
    next();
  }
};

/*
  Grab a tweet from the store whenever one is referenced with an ID in the
  request path (any routes defined with :tweet as a paramter).
*/
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
/*
  At this point, all requests are authenticated and checked:
  1. Clients must be logged into some account
  2. If accessing or modifying a specific resource, the client must own that tweet
  3. Requests are well-formed
*/

/*
  GET /tweets
  No request parameters
  Response:
    - success: true if the server succeeded in getting the user's tweets
    - content: on success, an object with a single field 'tweets', which contains a list of the
    user's tweets
    - err: on failure, an error message
*/
router.get('/', function(req, res) {
  User.getAllTweets(req.currentUser.username, function(err, tweets) {
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
    - content: the content of the tweet
  Response:
    - success: true if the server succeeded in recording the user's tweets
    - err: on failure, an error message
*/
router.post('/', function(req, res) {
  User.addTweet(req.currentUser.username, {
    content: req.body.content,
    creator: req.currentUser.username
  }, function(err, tweet) {
    if (err) {
      utils.sendErrResponse(res, 500, err.msg);
    } else {
      utils.sendSuccessResponse(res);
    }
  });
});

/*
  DELETE /tweets/:tweet
  Request parameters:
    - tweet ID: the unique ID of the tweet within the logged in user's tweet collection
  Response:
    - success: true if the server succeeded in deleting the user's tweet
    - err: on failure, an error message
*/
router.delete('/:tweet', function(req, res) {
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
