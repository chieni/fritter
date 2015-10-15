var Tweet = (function Tweet(){
	
	var that = Object.create(Tweet.prototype);
	var mongoose = require('mongoose');
	var tweetSchema = mongoose.Schema({
		_id: String,
		content: String,
		creator: String,
		reblogger: String, 
		canDelete: Boolean
	});

	var TweetModel = mongoose.model("TweetModel", tweetSchema);
	var Counter = require('../models/Counter');

	that.addTweet = function(tweet, callback){
		Counter.getCount(function(err, count){
			if (!err){
				console.log("COUNT ", count);
				tweet._id = count;
				tweet.reblogger = "";
				tweet.canDelete = false;
				TweetModel.create(tweet, function(err, record){
					Counter.increment(function(err, doc){
						if (err) { callback(false); }
						else { 
							console.log(doc);
							callback(true); 
						}
					});
					
				});
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
				console.log(tweets);
				callback(tweets);
			}
		});
	};

	that.getAllTweets = function(username, callback){
		TweetModel.find({}, function(err, tweets){
			tweets.forEach(function(t){
			    if (t.creator === username){
                    t.canDelete = true;
                }
                else {
                    t.canDelete = false;
                }
			});
			console.log(tweets)
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

	Object.freeze(that);
	return that;
})();


module.exports = Tweet;