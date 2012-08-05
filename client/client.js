
var computeRecommendations = function () {
  var results = {};
  var point = _SA.Points.findOne(Session.get("pointId"));
  if (!point)
    return;

  _.each(point.trail, function (trailPoint) {
    var weight = trailPoint.weight;
    var trackRec = _SA.TrackRecs.findOne({trackId: trailPoint.soundcloud.id});
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
  Session.set('recommendations', _.map(sortedResultsArray, function(kv) {
    return {url: kv[1].url, rank: kv[1].rank};
  }));
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
