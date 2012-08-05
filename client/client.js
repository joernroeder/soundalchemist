var getInitialPointId = function(trackId, url) {
  // If this point already exists, find it
  var point = _SA.Points.findOne({trackId: trackId, trail: []});
  // TODO(gregp): how stable is this use of []?
  if (point) {
    return point._id;
  }

  // We need to store the point ID with each point in the trail data
  // because that's what we need to link back to in the trail ui

  // For the first page of recommendations, we can only store the head
  return _SA.Points.insert({
    trackId: trackId,
    head: {
        soundcloud: {
          id: trackId,
          url: url
        },
        weight: 1
      },
    trail: []
  });
};

var computeRecommendations = function () {
  console.log('Computing Recommendations...');
  var results = {};
  var point = _SA.Points.findOne(Session.get("point:id"));
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

  // TODO(gregp): get recommendations from PointRecs
  Session.set('point:recommendations', _.map(sortedResultsArray, function(kv) {
    return {url: kv[1].url, rank: kv[1].rank};
  }));
};

var getTrackData = function(soundcloudUrl, opt_callback) {
  Meteor.http.get(
    "http://api.soundcloud.com/resolve.json?url=" + soundcloudUrl + "&client_id=17a48e602c9a59c5a713b456b60fea68",
    function (error, result) {
      if (error) {
        throw error;
      } else {
        var trackData = result.data;
        var id = trackData.id;
        trackData.lastUpdate = +new Date();
        // console.log("DEBUG: inserting track data for " + id, trackData);
        _SA.Tracks.insert(trackData);
        opt_callback && opt_callback(id);
      }
    });
};
