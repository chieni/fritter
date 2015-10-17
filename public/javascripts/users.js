// Wrap in an immediately invoked function expression.
(function() {

  // Submits the sign in form by making a post request when
  // the submit button is clicked
  $(document).on('submit', '#signin-form', function(evt) {
      evt.preventDefault();
      $.post(
          '/users/login',
          helpers.getFormData(this)
      ).done(function(response) {
          currentUser = response.content.user;
          loadHomePage();
      }).fail(function(responseObject) {
          var response = $.parseJSON(responseObject.responseText);
          $('.error').text(response.err);
      });
  });

  // Submits the register form by making a post request when
  // the submit button is clicked
  $(document).on('submit', '#register-form', function(evt) {
      evt.preventDefault();
      var formData = helpers.getFormData(this);
      console.log(formData);
      if (formData.password !== formData.confirm) {
          $('.error').text('Password and confirmation do not match!');
          return;
      }
      delete formData['confirm'];
      $.post(
          '/users',
          formData
      ).done(function(response) {
          loadHomePage();
      }).fail(function(responseObject) {
          var response = $.parseJSON(responseObject.responseText);
          $('.error').text(response.err);
      });
  });


  // Logs the user out by making a post request when the
  // log out link is clicked.
  $(document).on('click', '#logout-link', function(evt) {
      evt.preventDefault();
      $.post(
          '/users/logout'
      ).done(function(response) {
          currentUser = undefined;
          loadHomePage();
      }).fail(function(responseObject) {
          var response = $.parseJSON(responseObject.responseText);
          $('.error').text(response.err);
      });
  });

  // Follows the creator of the tweet, or the reblogger if one exists once
  // the follow link is clicked.
  $(document).on('click', '.follow-tweet', function(evt){
    evt.preventDefault();
    var item = $(this).parent();
    var creator = item.data('tweet-creator');
    var reblogger = item.data('tweet-reblogger');
    var toFollow = creator;
    if (reblogger.length > 0){
      toFollow = reblogger;
    }
    $.post(
        '/users/follow',
        { toFollow: toFollow }
    ).done(function(response) {
        loadHomePage();
    }).fail(function(responseObject) {
        var response = $.parseJSON(responseObject.responseText);
        $('.error').text(response.err);
    });
  });

  // Follows the user based on the username given in the input field,
  // if this user exists.
  $(document).on('click', '#submit-follow', function(evt) {
      var content = $('#follow-user-input').val();
      if (content.trim().length === 0) {
          alert('Input must not be empty');
          return;
      }

      $.post(
          '/users/follow',
          { toFollow: content }
      ).done(function(response) {
          loadHomePage();
      }).fail(function(responseObject) {
          var response = $.parseJSON(responseObject.responseText);
          $('.error').text(response.err);
      });
  });

})();
