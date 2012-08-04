Points = new Meteor.Collection("points");
TrackRecs = new Meteor.Collection("trackRecs");

if (Meteor.is_server) {
  Meteor.publish("point", function (pointId) {
    return Points.find({pointId: pointId});
  });

  Meteor.publish("trackRec", function (trackId) {
    return TrackRecs.find({trackId: trackId});
  });

  var loadTrackRec = function(trackId) {
    // xcxc mark it as loading-in-progress immediately.
    var trackInfo = Meteor.http.get(
      "http://api.soundcloud.com/tracks/" + trackId +
        ".json?client_id=17a48e602c9a59c5a713b456b60fea68").data;

    // xcxc offsets
    var favoriters = Meteor.http.get(
      "http://api.soundcloud.com/tracks/" + trackId +
        "/favoriters.json" +
        "?limit=200" +
        "&client_id=17a48e602c9a59c5a713b456b60fea68").data;

    // xcxc better term?
    var influence = {};

    var futures = _.map(favoriters, function(favoriter) {
      //    console.log('parsing ' + favoriter.username);
      var favoriterId = favoriter.id;
      var future = new Future;

      Meteor.http.get(
        "http://api.soundcloud.com/users/" + favoriterId +
          "/favorites.json" +
          "?limit=200" +
          "&duration[from]=1200000" +
          "&client_id=17a48e602c9a59c5a713b456b60fea68", function(error, result) {
            var favoriteTracks = result.data;
            _.each(favoriteTracks, function(track) {
              if (!influence[track.id])
                influence[track.id] = 0;
              influence[track.id]++;
            });

            future.resolver()();
          });

      return future;
    });

    Future.wait(futures);
    TrackRecs.insert({trackId: trackId, influence: influence});
    console.log('track inserted');
  };

  Meteor.methods({
    loadTrackRec: function (trackId) {
      if (!TrackRecs.findOne({trackId: trackId}))
        loadTrackRec(trackId);
    }
  });
}

if (Meteor.is_client) {
  state = {
    recommendations: []
  };

  var computeRecommendations = function () {
    var results = {};
    var point = Points.findOne(Session.get("pointId"));
    if (!point)
      return;

    _.each(point.trail, function (trailPoint) {
      var weight = trailPoint.weight;
      var trackRec = TrackRecs.findOne({trackId: trailPoint.soundcloud.id});
      _.each(trackRec.influence, function(count, trackId) {
        if (!results[trackId])
          results[trackId] = {rank: 0, url: trackRec.soundcloud.url};
        results[trackId].rank += count * weight;
      });
    });

    var resultsArray = _.map(results, function(value, key) {
      return [key, value];
    });
    var sortedResultsArray = _.sortBy(resultsArray, function(kv) {
      return kv[1].rank * -1;
    });
    state.recommendations = _.map(sortedResultsArray, function(kv) {
      return {url: kv[1].url, rank: kv[1].rank};
    });
    Session.set('redraw-recommendations', (Session.get('redraw-recommendations') || 0) + 1);
  };

  Meteor.autosubscribe(function () {
    Meteor.subscribe("point", Session.get("pointId"));
  });

  Meteor.autosubscribe(function () {
    var point = Points.findOne(Session.get("pointId"));
    if (!point)
      return;

    var pending = 0;
    _.each(point.trail, function (trailPoint) {
      pending++
      Meteor.subscribe("trackRec", trailPoint.soundcloud.id, function () {
        pending--;
        if (!pending) {
          computeRecommendations();
        }
      });
    });
  });
}

/// ^^^ REPLACE ALL ABOVE WITH REALITY LATER ^^^

if (Meteor.is_client) {
  Template.trail.list = function () {
    var point = Points.findOne(Session.get("pointId"));
    if (!point)
      return [];
    else
      return point.trail;
  };

  Template.player.escapedUrl = function () {
    Meteor.call("prepareTrack", this.url); // xcxc should enable the buttons when done
    if (Session.get('player-trackId'))
      return escape('http://api.soundcloud.com/tracks/' + Session.get('player-trackId'));
    else
      return ''; // xcxc ???
  };

  // Super ghetto routing
  Template.main.isHome = function() {
    return Session.get('page') == SoundAlchemist.view.HOME;
  };
  Template.main.isPoint = function() {
    return Session.get('page') == SoundAlchemist.view.POINT;
  };

  Backbone.history.start({pushState: true});
}
