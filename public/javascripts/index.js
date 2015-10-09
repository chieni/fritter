// Registering a reusable partial for tweets.
Handlebars.registerPartial('tweet', Handlebars.templates['tweet']);

// Global variable that is set when a user is logged in.
currentUser = undefined;


/**
Global convenience methods for rendering HTML on the client. 
**/
var loadPage = function(template, data) {
	data = data || {};
	$('#main-container').html(Handlebars.templates[template](data));
};

// Loads the home page of a user based on whether they are logged in or not.
var loadHomePage = function() {
	if (currentUser) {
		loadTweetsPage();
	} else {
		loadPage('index');
	}
};

// Loads the home page of a logged in user, which displays all tweets.
var loadTweetsPage = function() {
	$.get('/tweets', function(response) {
		loadPage('tweets', { tweets: response.content.tweets, currentUser: currentUser });
	});
};

// Retrieves the current user if there is one
$(document).ready(function() {
	$.get('/users/current', function(response) {
		if (response.content.loggedIn) {
			currentUser = response.content.user;
		}
		loadHomePage();
	});
});

// When the home link is clicked, the home page is loaded
$(document).on('click', '#home-link', function(evt) {
	evt.preventDefault();
	loadHomePage();
});

// When the signin button is clicked, the signin page is loaded
$(document).on('click', '#signin-btn', function(evt) {
	loadPage('signin');
});

// When the register button is clicked, the register page is loaded
$(document).on('click', '#register-btn', function(evt) {
	loadPage('register');
});
