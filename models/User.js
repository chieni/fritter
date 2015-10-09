/*
Data for each user is stored in memory instead of a database for part 1.
*/
var _store = {};

/**
	Create a User object. A User contains information about each user
	for my Fritter application. It keeps track of what the username,
	password, tweets, and users that they follow (not used in part 1).
	@constructor
**/
var User = (function User(_store) {
	var that = Object.create(User.prototype);

	var userExists = function(username) {
		return _store[username] !== undefined;
	}

	var getUser = function(username) {
		if (userExists(username)) {
		  return _store[username];
		}
	}

	/**
		Creates a new user object, adding it to the user store.
		@param {string} username the username of the user
		@param {string} password the password of the user
		@param callback
	**/
	that.createNewUser = function (username, password, callback) {
		if (userExists(username)) {
		  callback({ taken: true });
		} else {
		  _store[username] = { 'username' : username,
		             'password' : password,
		             'tweets' : [],
		             'following' : [] };
		  callback(null);
		}
	};

	/**
		Finds a user based on the given username, then returns the
		user object within the callback.
		@param {string} username the username to be searched for
	**/
	that.findByUsername = function (username, callback) {
		if (userExists(username)) {
		  callback(null, getUser(username));
		} else {
		  callback({ msg : 'No such user!' });
		}
	}

	/**
		Verifies that the given password matches the user's actual password
		@param {string} username the username of the user
		@param {string} candidatepw the password that is being verified
		@param callback
	**/
	that.verifyPassword = function(username, candidatepw, callback) {
		if (userExists(username)) {
		  var user = getUser(username);
		  if (candidatepw === user.password) {
		    callback(null, true);
		  } else {
		    callback(null, false);
		  }
		} else {
		  callback(null, false);
		}
	}

	/**
		Adds a tweet for a given user.
		@param {string} username the username of the user
		@param {object} tweet, the tweet object containing tweet informatino
		@param callback
	**/
	that.addTweet = function(username, tweet, callback) {
		if (userExists(username)) {
		  var user = getUser(username);
		  tweet._id = user.tweets.length;
		  user.tweets.push(tweet);
		  callback(null);
		} else {
		  callback({ msg : 'Invalid user.' });
		}
	};

	/**
		Retrieves a tweet based on the username and tweet id.
		@param {string} username the username of the user
		@param {int} id of the tweet being searched for
		@param callback
	**/
	that.getTweet = function(username, tweetId, callback) {
		if (userExists(username)) {
		  var user = getUser(username);
		  if (user.tweets[tweetId]) {
		    var tweet = user.tweets[tweetId];
		    callback(null, tweet);
		  } else {
		    callback({ msg : 'Invalid tweet.'});
		  }
		} else {
		  callback({ msg : 'Invalid user.'});
		}
	};

	/**
		Retrieves all tweets for a user based on the username
		@param {string} username the username of the user
		@param callback
	**/
	that.getTweets = function(username, callback) {
		if (userExists(username)) {
		  var user = getUser(username);
		  callback(null, user.tweets);
		} else {
		  callback({ msg : 'Invalid user.' });
		}
	}

	/**
		Retrieves all tweets for all users, also populating the
		canDelete field for each tweet.
		@param {string} username the username of the user
		@param callback
	**/
	that.getAllTweets = function(username, callback) {
		if (userExists(username)) {
            var allTweets = [];
            for (var key in _store){
                var user = getUser(key);
                user.tweets.forEach(function(t){
                    if (t.creator === username){
                        t.canDelete = true;
                    }
                    else {
                        t.canDelete = false;
                    }
                    console.log(t);
                    allTweets.push(t);
                });
            }
            callback(null, allTweets);
		} else {
		    callback({ msg : 'Invalid user.' });
		}
	}

	/**
		Removes a tweet for a user.
		@param {string} username the username of the uesr
		@param {int} tweetId the id of the tweet being removed
	**/
	that.removeTweet = function(username, tweetId, callback) {
		if (userExists(username)) {
		  var tweets = getUser(username).tweets;
		  if (tweets[tweetId]) {
		    delete tweets[tweetId];
		    callback(null);
		  } else {
		    callback({ msg : 'Invalid tweet.' });
		  }
		} else {
		  callback({ msg : 'Invalid user.' });
		}
	}


	Object.freeze(that);
	return that;
})(_store);

module.exports = User;