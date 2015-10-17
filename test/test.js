var assert = require("assert");
var User = require('../models/User');
var Tweet = require('../models/Tweet');
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function (callback) {
  mongoose.connection.db.dropDatabase(
    function (err, result) {
      if(err){ console.log(err); }
      else {
        console.log('database connected');
      }
    }
  );
});

// global variables needed in order to retrieve Mongo Id's of tweets for testing purposes.
var tweetId;
var tweetIdOwn;
// User creation is the module under test. This tests all of the functionality related
// to the creation and lookup of users.
describe('User creation', function(){

  // This tests the createNewUser function
  describe('#createNewUser', function(){

    it('should callback null if username does not exist, and create the user', function(){
      User.createNewUser('NewUser', 'password', 
        function(err) {
          assert.equal(err, null);
      });
    });

    it('should callback taken if username exists', function(){
      User.createNewUser('NewUser', 'password', 
        function(err) {
          assert.equal(err.taken, true);
      });
    });

  });

  // This tests the findByUsername function  
  describe('#findByUsername', function(){

    it ('should callback a user if the user exists', function(){
      User.findByUsername('NewUser', function(err, user){
        assert.equal(user.username, 'NewUser');
      });
    });

    it('should callback null if the user does not exist', function(){
      User.findByUsername('FakeUser', function(err, user){
        assert.equal(err.msg, 'No such user!');
      });
    });

  });

  // This tests the verifyPassword function
  describe('#verifyPassword', function(){

    it('should callback(null, true) if the user exists and the password is corect', function(){
      User.verifyPassword('NewUser', 'password', function(err, user){
        assert.equal(err, null);
        assert.equal(user, true);
      });
    });

    it('should callback(null, false) if the user exists but the pw is wrong', function(){
      User.verifyPassword('NewUser', 'wrong', function(err, user){
        assert.equal(err, null);
        assert.equal(user, false);
      });
    });

    it('should rcallback(null, false), if the user does not exist', function(){
      User.verifyPassword('FakeUser', 'password', function(err, user){
        assert.equal(err, null);
        assert.equal(user, false);
      });
    });

  });


  // This tests the followUser function
  describe('#followUser', function(){
    it ('should callback(null) when an existing user is followed successfully', function(){
      User.createNewUser('NewUser2', 'password', 
        function(err) {
          assert.equal(err.taken, true);
      });

      User.followUser('NewUser', 'NewUser2', function(err, doc){
        assert.equal(err, null);
        assert.equal(doc.follows.indexOf('NewUser2') == 0);
      })
    });

    it('should callback({msg: "User does not exist."}) when a user that does not existed is attempted to be followed', function(){
      User.followUser('NewUser', 'FakeUser', function(err, doc){
        assert.equal(err.msg, 'User does not exist.');
      })
    });

  });

});

// Tweet creation is a module under test. It tests everything in the User model that is related
// to the creation, lookup, and deletion of tweets. Every method in the Tweet model is only accessed
// via the User model, so the Tweet model is tested implicitly in the following tests.
describe('Tweet creation', function(){

  // This tests the addTweet function
  describe('#addTweet', function(){

    it('should callback an invalid msg if the user does not exist', function(){
      User.addTweet('FakeUser', {content: 'First tweet ever!', creator: 'FakeUser'}, function(err){
        assert.equal(err.msg, 'Invalid user.');
      });
    });

    it('should successfully create a tweet if the user does exist', function(){
      User.addTweet('NewUser', {content: 'First tweet ever!', creator: 'NewUser'}, function(err, record){
        tweetIdOwn = record._id;
        assert.equal(err, null);
      });

      User.getTweet('NewUser', 0, function(err, tweet){
        assert.equal(err, null);
        assert.equal(tweet.creator, 'NewUser');
      });

    });

  });

  // This tests the getTweet function
  describe('#getTweet', function(){

    it('should callback(null, tweet) if user and tweet exist', function(){
      User.getTweet('NewUser', 0, function(err, tweet){
        assert.equal(err, null);
        assert.equal(tweet.creator, 'NewUser');
      });

    });

    it('should callback with an invalid tweet msg if user exists but the tweet does not', function(){
      User.getTweet('NewUser', 2, function(err, tweet){
        assert.equal(err.msg, 'Invalid tweet.');
      });
    });

    it('should callback with an invalid user msg if user does not exist', function(){
      User.getTweet('FakeUser', 2, function(err, tweet){
        assert.equal(err.msg, 'Invalid user.');
      });
    });

  });

   // This tests the getTweets function
  describe('#getTweets', function(){

    it('should callback with a list of tweets from the existing user', function(){
      User.getTweets('NewUser', function(err, tweets){
        assert.equal(err, null);
        assert.equal(tweets.length, 1);
      });
    });

    it('should callback with an error msg if the user does not exist', function(){
      User.getTweets('FakeUser', function(err, tweets){
        assert.equal(err.msg, 'Invalid user.');
      });
    });

  });

   // This tests the getAllTweets function
  describe('#getAllTweets', function(){

    it('should get all tweets if the current user exists', function(){
      User.createNewUser('NewUser2', 'password', 
        function(err) {
      });
      User.addTweet('NewUser2', {content: 'First tweet ever!', creator: 'NewUser2'}, function(err, record){
        tweetId = record._id;
      });
      User.getAllTweets('NewUser', function(err, tweets){
        assert.equal(tweets.length, 2);
        assert.equal(err, null);
      });

    });

    it('should callback with an error msg if the user does not exist', function(){
      User.getAllTweets('FakeUser', function(err, tweets){
        assert.equal(err.msg, 'Invalid user.');
      });
    });

  });

  // This tests the removeTweet function
  describe('#removeTweet', function(){

    it('should callback with null if the tweet id and user both exist', function(){
      User.removeTweet('NewUser', 0, function(err){
        assert.equal(err, null);
      });
    });

    it('should callback with an invalid tweet msg if the tweet does not exist', function(){
      User.removeTweet('NewUser', 4, function(err){
        assert.equal(err.msg, 'Invalid tweet.');
      });
    });

    it('should callback with an invalid user msg if the user does not exist', function(){
      User.removeTweet('FakeUser',0, function(err){
        assert.equal(err.msg, 'Invalid user.');
      });
    });

  });

  describe('#getFollowingTweets', function(){
    it('should retrieve all the tweets for those a user is following', function(){
      User.getFollowingTweets('NewUser', function(err, tweets){
        assert(err, null);
        assert(tweets[0].creator, 'NewUser2');
        assert(tweets.length, 1);
      })
    });
    it('should retrieve no tweets if the user isn\'t following anyone', function(){
      User.getFollowingTweets('NewUser2', function(err, tweets){
        assert(err, null);
        assert(tweets.length, 0);
      })
    });
  });

  describe('#retweet', function(){
    it('should retweet another user\'s tweet successfully', function(){
      User.retweet('NewUser', tweetId, function(err, doc){
        assert(err, null);
        assert(doc.creator, 'NewUser2');
        assert(doc.content, 'First tweet ever!');
        assert(doc.reblogger, 'NewUser');
        assert(doc.canFollow, false);
        assert(doc.isRetweet, true);
      })
    });

    it('should retweet a user\'s own tweet successfully', function(){
      User.retweet('NewUser', tweetIdOwn, function(err, doc){
        assert(err, null);
        assert(doc.creator, 'NewUser2');
        assert(doc.content, 'First tweet ever!');
        assert(doc.reblogger, 'NewUser');
        assert(doc.canFollow, false);
        assert(doc.isRetweet, true);
      })
    });

  });

});