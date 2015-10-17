// Wrapped in an immediately invoked function expression.
(function() {

  // When the submit new tweet button is clicked, if the field has
  // any input in it, a post request is made to create a new tweet.
  $(document).on('click', '#submit-new-tweet', function(evt) {
      var content = $('#new-tweet-input').val();
      if (content.trim().length === 0) {
          alert('Input must not be empty');
          return;
      }
      $.post(
          '/tweets',
          { content: content }
      ).done(function(response) {
          loadHomePage();
      }).fail(function(responseObject) {
          var response = $.parseJSON(responseObject.responseText);
          $('.error').text(response.err);
      });
  });

  // When the delete link is clicked (it is only displayed on tweets that the
  // current user wrote), a delete request is made to delete the tweet.
  $(document).on('click', '.delete-tweet', function(evt) {
    var item = $(this).parent();
    var id = item.data('tweet-id');
    $.ajax({
        url: '/tweets/' + id,
        type: 'DELETE'
    }).done(function(response) {
        item.remove();
    }).fail(function(responseObject) {
        var response = $.parseJSON(responseObject.responseText);
        $('.error').text(response.err);
    });
  });

  // When the retweet link is clicked, the tweet is retweeted in the format
  // retweeter: @original-poster tweet content
  $(document).on('click', '.retweet', function(evt){
    evt.preventDefault();
    var item = $(this).parent();
    var id = item.data('tweet-id');
    $.post(
        '/tweets/retweet',
        { content: id }
    ).done(function(response) {
        loadHomePage();
    }).fail(function(responseObject) {
        var response = $.parseJSON(responseObject.responseText);
        $('.error').text(response.err);
    });
  });

})();
