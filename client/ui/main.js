// Super ghetto routing
Template.main.isHome = function() {
  return Session.get('page') == SoundAlchemist.view.HOME;
};
Template.main.isPoint = function() {
  return Session.get('page') == SoundAlchemist.view.POINT;
};

var getTrackData = function(url, callback) {
  Meteor.http.get(
  "http://api.soundcloud.com/resolve.json?url=" +
    url +
    "&client_id=17a48e602c9a59c5a713b456b60fea68",
  function (error, result) {
    if (error)
      throw error;
    else
      callback(result.data);
  });
};

Backbone.history.start({pushState: true});
