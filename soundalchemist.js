Points = new Meteor.Collection("points");
TrackRecs = new Meteor.Collection("trackRecs");

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
      _.each(trackRec.relativity, function(count, trackId) {
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
      pending++;
      Meteor.subscribe("trackRec", trailPoint.soundcloud.id, function () {
        pending--;
        if (!pending) {
          computeRecommendations();
        }
      });
    });
  });
}

