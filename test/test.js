var assert = require("assert");
var User = require('../models/User')

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
});

// Tweet creation is a module under test. It tests everything in the User model that is related
// to the creation, lookup, and deletion of tweets.
describe('Tweet creation', function(){

  // This tests the addTweet function
  describe('#addTweet', function(){

    it('should callback an invalid msg if the user does not exist', function(){
      User.addTweet('FakeUser', {content: 'First tweet ever!', creator: 'FakeUser'}, function(err){
        assert.equal(err.msg, 'Invalid user.');
      });
    });

    it('should successfully create a tweet if the user does exist', function(){
      User.addTweet('NewUser', {content: 'First tweet ever!', creator: 'NewUser'}, function(err){
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
      User.addTweet('NewUser2', {content: 'First tweet ever!', creator: 'NewUser2'}, function(err){
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

});