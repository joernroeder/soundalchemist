if (typeof _SA == "undefined") _SA = {};
_SA.PointRecs = _SA.PointRecs || new Meteor.Collection(null);

// TODO(gregp): infinite scroll..... ...
_SA.MAX_RECOMMENDATIONS = 30;

var computeRecommendations = function(pointId) {
  var point = _SA.Points.findOne({pointId: pointId});

  // console.log('DEBUG: computing recommendations for point', point);
  if (!point) {
    console.warn("There's no point!");
    return;
  }

  var intensity = {};
  _.each(point.trail, function (trailPoint) {
    var weight = trailPoint.weight;
    var trackRec = _SA.TrackRecs.findOne({trackId: trailPoint.trackId});
    // console.log('DEBUG: trackRec found', trackRec);
    _.each(trackRec.relativity, function(count, trackId) {
      if (count === 0) {
        debugger;
        return; // TODO(gregp): why's this happen?
      }
      if (typeof intensity[trackId] == "undefined") {
        intensity[trackId] = 0;
      }
      intensity[trackId] += count * weight;
    });
  });
  // console.log('DEBUG: recommendation intensity', intensity);

  // Need to squish the intensity map into an array so _ can sort it.
  var resultsArray = _.map(intensity, function(value, key) {
    return [key, value];
  });
  var sortedResultsArray = _.sortBy(resultsArray, function(kv) {
    // Descending, by intensity.
    return kv[1] * -1;
  });

  var results = [];
  var scaleFactor = _getScaleFactor(sortedResultsArray);
  // TODO(gregp): filter all tracks on the trail
  for (var i = 1;
        i <= _SA.MAX_RECOMMENDATIONS && i < sortedResultsArray.length;
        i++) {
    var trackId = sortedResultsArray[i][0];
    results.push({
      trackId: trackId, // keys in intensity map
      intensity: intensity[trackId] * scaleFactor
    });
  }

  // console.log('DEBUG: recommendation results', results);
  _SA.PointRecs.insert({
    pointId: pointId,
    recommendations: results
  });

  // TODO(gregp): react to the PointRecs Collection
  _pokeRecommendations(pointId);
};

// Generally, get 100.0 / the biggest relevant result
var _getScaleFactor = function(sortedResultsArray) {
  if (!sortedResultsArray.length) {
    return;
  }

  if (sortedResultsArray.length == 1) return 100.0 / sortedResultsArray[0][1];

  // if (sortedResultsArray.length < _SA.MAX_RECOMMENDATIONS) {
    return 100.0 / sortedResultsArray[1][1];
  // }
};

var _pokeRecommendations = function(pointId) {
  Session.set('point:recommendationsOK+' + pointId, true);

  var cur = Session.get('point:recommendations');
  Session.set('point:recommendations', cur ? cur+1 : 1);
};
