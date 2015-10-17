/**
	Create a Tweet object. A Tweet contains information about each tweet
	for my Fritter application. It keeps track of the content, creator, 
	reblogger (if there is one), and booleans that are related to 
	available functionalities on the tweet. 
	@constructor
**/
var Tweet = (function Tweet(){
	var that = Object.create(Tweet.prototype);

	var mongoose = require('mongoose');
	var tweetSchema = mongoose.Schema({
		content: String,
		creator: String,
		reblogger: String, 
		canDelete: Boolean,
		canFollow: Boolean,
		isRetweet: Boolean
	});

	var TweetModel = mongoose.model("TweetModel", tweetSchema);
	var Counter = require('../models/Counter');

	/**
		Adds the tweet to the database collection of tweets.
		@param {Object} the tweet to be added
	**/
	that.addTweet = function(tweet, callback){
		tweet.canDelete = false;	
		TweetModel.create(tweet, function(err, record){
			console.log(err);
			if (err){
				callback(false);
			} else {
				callback(true);
			}
			
		});
	};

	/**
		Retrieves a tweet based on the id.
		@param {ObjectID} tweetId the Mongo-provided id of the tweet
	**/
	that.getTweet = function(tweetId, callback){
		TweetModel.findById(tweetId, function(err, doc){
			if (err) {
				callback(false);
			} else {
				callback(doc);
			}
		});
	};

	/**
		Retrieves the tweets for a certain user.
		@param {string} username the username of the user
	**/
	that.getUserTweets = function(username, callback){
		TweetModel.find({creator: username}, function(err, tweets){
			if (err) {
				callback(false);
			} else {
				tweets.forEach(function(t){
	                t.canDelete = true;
				});
				callback(tweets);
			}
		});
	};

	/**
		Retrieves all the tweets in the database.
		@param {string} username the username of the user
		@param {[string]} follows the usernames of the users that the current user follows
 	**/
	that.getAllTweets = function(username, follows, callback){
		TweetModel.find({}, function(err, tweets){
			tweets.forEach(function(t){
				// if tweet creator (or reblogger if there is one) is not in follows already, show follow button
			    if (t.isRetweet){
			    	// reblogged tweet
				    if (t.reblogger === username){
	                    t.canDelete = true;
	                }
	                else {
	                    t.canDelete = false;
	                    // If it was rebloggged by someone other than you, you can follow the reblogger
		                if (follows.indexOf(t.reblogger) > -1){
		                	t.canFollow = false;
		                } else {
		                	t.canFollow = true;
		                }
	                }

			    } else {
			    	// normal tweet
				    if (t.creator === username){
	                    t.canDelete = true;
	                }
	                else {
	                	 t.canDelete = false;
	                	// If it was created by someone other than you, you can follow the creator
	                	if (follows.indexOf(t.creator) > -1){
		                	t.canFollow = false;
		                } else {
		                	t.canFollow = true;
		                }	
	                }
			    }
			});
			callback(tweets);
		});
	}

	/**
		Deletes a tweet.
		@param {ObjectID} tweetId the Mongo-provided id of the tweet
	**/
	that.removeTweet = function(tweetId, callback){
		TweetModel.remove({_id: tweetId}, function(err, result){
			if (err) {
				callback(false);
			} else {
				callback(true);
			}
		});
	};

	/**
		Retrieves the tweets of the given followed users.
		@param {[string]} follows the usernames of the users that the current user follows
	**/
	that.getFollowingTweets = function(follows, callback){
		queryArray = [];
		follows.forEach(function(followUsername){
			queryArray.push({$and: [{creator: followUsername}, {isRetweet: false}]});
			queryArray.push({reblogger:followUsername});
		});

		TweetModel.find({$or : queryArray }, function(err, tweets){
			callback(tweets);
		});
	};

	Object.freeze(that);
	return that;
})();


module.exports = Tweet;