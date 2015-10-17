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

	that.addTweet = function(tweet, callback){
		tweet.canDelete = false;
		console.log(tweet);
		TweetModel.create(tweet, function(err, record){
			console.log(err);
			if (err){
				callback(false);
			} else {
				callback(true);
			}
			
		});
	};

	that.getTweet = function(tweetId, callback){
		TweetModel.findById(tweetId, function(err, doc){
			if (err) {
				callback(false);
			} else {
				callback(doc);
			}
		});
	};

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
			    console.log(t);
			});
			callback(tweets);
		});
	}

	that.removeTweet = function(tweetId, callback){
		TweetModel.remove({_id: tweetId}, function(err, result){
			if (err) {
				callback(false);
			} else {
				callback(true);
			}
		});
	};

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