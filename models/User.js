/**
	Create a User object. A User contains information about each user
	for my Fritter application. It keeps track of what the username,
	password, tweets, and users that they follow (not used in part 1).
	@constructor
**/
var User = (function User() {
	var that = Object.create(User.prototype);
	var mongoose = require('mongoose');
	var Tweet = require('../models/Tweet');

	var userSchema = mongoose.Schema({
		username: String,
		password: String,
		follows: [String]

	});

	var UserModel = mongoose.model("UserModel", userSchema);

	var userExists = function(username, callback) {
		UserModel.findOne({username: username}, function(err, doc){
			if (doc){
				callback(true);
			} else {
				callback(false);
			}
		});
	}

	var getUser = function(username, callback) {
		userExists(username, function(exists){
			if (exists){
				UserModel.findOne({username: username}, function(err, doc){
					callback(doc);
				});
			}
		});
	}

	/**
		Creates a new user object, adding it to the user store.
		@param {string} username the username of the user
		@param {string} password the password of the user
		@param callback
	**/
	that.createNewUser = function (username, password, callback) {
		userExists(username, function(exists){
			if (exists){
				callback({ taken: true });
			} else {
				UserModel.count({}, function(err, count){
					UserModel.create({
						username: username,
						password: password,
						follows: []
					}, function(err, record){
						if (err) {
							console.log(err);
						} else {
							callback(null);
						}
					});
				});
			}
		});
	};
	/**
		Finds a user based on the given username, then returns the
		user object within the callback.
		@param {string} username the username to be searched for
	**/
	that.findByUsername = function (username, callback) {
		getUser(username, function(user){
			if (user){
				callback(null, user);
			} else {
				callback({ msg : 'No such user!' });
			}
		});
	}

	/**
		Verifies that the given password matches the user's actual password
		@param {string} username the username of the user
		@param {string} candidatepw the password that is being verified
		@param callback
	**/
	that.verifyPassword = function(username, candidatepw, callback) {
		getUser(username, function(user){
		  if (candidatepw === user.password) {
		    callback(null, true);
		  } else {
		    callback(null, false);
		  }
		});
	};

	/**
		Follows a user.
		@param {string} username the username of the user
		@param {string} followUser the username of the user that is to be followed
	**/
	that.followUser = function(username, followUser, callback){
		if (username === followUser){
			callback({msg: 'You cannot follow yourself.'});
		} else {
			userExists(followUser, function(exists){
				if (exists){
					getUser(username, function(doc){
						// If not already being followed
						if (doc.follows.indexOf(followUser) < 0){
							UserModel.findOneAndUpdate({username:username},
								{$push: {follows: followUser}}, 
								{safe: true, upsert: true}, 
									function(err, doc){
									if (doc){
										callback(null, doc);
									} else {
										callback({msg: 'Failed.'});
									}
							});	
						}
					});
				} else {
					callback({msg: 'User does not exist.'});
				}
			});
		}

	};

	/**
		Adds a tweet for a given user.
		@param {string} username the username of the user
		@param {object} tweet, the tweet object containing tweet informatino
		@param callback
	**/
	that.addTweet = function(username, tweet, callback) {
		getUser(username, function(user){
			tweet.reblogger = "";
			tweet.isRetweet = false;
			Tweet.addTweet(tweet, function(success, record){
				if (success){
					callback(null, record);
				} else {
					callback({msg: 'Failed.'});
				}
			});
		});
	};

	/**
		Retrieves a tweet based on the username and tweet id.
		@param {string} username the username of the user
		@param {ObjectID} id of the tweet being searched for
		@param callback
	**/
	that.getTweet = function(username, tweetId, callback) {
		userExists(username, function(exists){
			if (exists) {
			  Tweet.getTweet(tweetId, function(tweet){
			  	if (tweet) {
			  		callback(null, tweet);
			  	} else {
			  		callback( {msg: 'Invalid tweet.'});
			  	}
			  });
			} else {
			  callback({ msg : 'Invalid user.'});
			}
		});

	};

	/**
		Retrieves all tweets for a user based on the username
		@param {string} username the username of the user
		@param callback
	**/
	that.getTweets = function(username, callback) {
		userExists(username, function(exists){
			if (exists) {
				Tweet.getUserTweets(username, function(tweets){
					if (tweets){
						callback(null, tweets);
					} else {
						callback({ msg : 'Invalid user.' });
					}
				});
					
			} else {
			  callback({ msg : 'Invalid user.' });
			}
		});
	}

	/**
		Retrieves all tweets for all users, also populating the
		canDelete field for each tweet.
		@param {string} username the username of the user
		@param callback
	**/
	that.getAllTweets = function(username, callback) {
		getUser(username, function(user){
			Tweet.getAllTweets(username, user.follows, function(err, tweets){
				if (err){
					callback({msg: 'Failed to retrieve all tweets.'})
				} else {
					Tweet.getFollowingTweets(user.follows, function(err, followingTweets){
						if (err){
							callback(err);
						} else {
							callback(false, tweets, followingTweets);
						}
					});
				}
			});
		});
	};

	/**
		Removes a tweet for a user.
		@param {string} username the username of the user
		@param {ObjectID} tweetId the id of the tweet being removed
	**/
	that.removeTweet = function(username, tweetId, callback) {
		userExists(username, function(exists){
			if (exists) {
				Tweet.removeTweet(tweetId, function(success){
					if (success){
						callback(null);
					} else {
						callback({ msg : 'Invalid tweet.' });
					}
				})
			} else {
				callback({ msg : 'Invalid user.' });
			}
		});
	};


	/**
		Retrieves the tweets from the users that the provided user is following.
		@param{string} username the username of the user
	**/
	that.getFollowingTweets = function(username, callback){
		getUser(username, function(user){
			Tweet.getFollowingTweets(username, user.follows, function(err, tweets){
				if (err){
					callback({msg: 'Failed to retrieve tweets'});
				} else {
					callback(null, tweets);
				}
				
			});
		});
	};

	/**
		Retweets the tweet indicated by the tweet id
		@param {string} username the username of the user
		@param {ObjectID} tweetId the Mongo-provided id of the tweet to be retweeted
	**/
	that.retweet = function(username, tweetId, callback){
		userExists(username, function(exists){
			if (exists) {
			  Tweet.getTweet(tweetId, function(tweet){
			  	if (tweet) {
			  		newTweet = {
						content: tweet.content,
						creator: tweet.creator,
						reblogger: username, 
						canDelete: true,
						canFollow: false,
						isRetweet: true
			  		}
					Tweet.addTweet(newTweet, function(success, record){
						if (success){
							callback(null, record);
						} else {
							callback({msg: 'Failed to retweet.'});
						}
					});
			  	} else {
			  		callback( {msg: 'Invalid tweet.'});
			  	}
			  });
			} else {
			  callback({ msg : 'Invalid user.'});
			}
		});
	};


	Object.freeze(that);
	return that;
})();

module.exports = User;