var _store = {};

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

	that.findByUsername = function (username, callback) {
		if (userExists(username)) {
		  callback(null, getUser(username));
		} else {
		  callback({ msg : 'No such user!' });
		}
	}

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


	that.getTweets = function(username, callback) {
		if (userExists(username)) {
		  var user = getUser(username);
		  callback(null, user.tweets);
		} else {
		  callback({ msg : 'Invalid user.' });
		}
	}


	Object.freeze(that);
	return that;
})(_store);

module.exports = User;