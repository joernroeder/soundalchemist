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

Template.main.events = {
  'click #start-journey': function () {
    var url = document.getElementById('soundcloud-url').value;
    getTrackData(url, function(data) {
      Meteor.call("loadTrackRec", data.id, function () {
        var pointId = Points.insert({trail: [{soundcloud: {id: data.id, url: url}}]});
        Session.set('pointId', pointId);
        Session.set('page', SoundAlchemist.view.POINT);
      });
    });
  }
}

Backbone.history.start({pushState: true});
