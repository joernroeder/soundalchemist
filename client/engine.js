if (typeof _SA == "undefined") _SA = {};
_SA.PointRecs = _SA.PointRecs || new Meteor.Collection(null);

// TODO(gregp): infinite scroll..... ...
_SA.MAX_RECOMMENDATIONS = 30;

/**
 * This function should be autosubscribed in such a way that it is called when
 *  all the trackRecs for the trail of the given point are available. (IE:they
 *  have been calculated on the server).
 * It inserts a pointRec into the (local) database with recommendations for the
 *  given point.
 * This can cause the recommendations UI to update with the new pointRec.
 */
var computeRecommendations = function(pointId) {
  var point = _SA.Points.findOne({pointId: pointId});

  // console.log('DEBUG: computing recommendations for point', point);
  if (!point) {
    console.warn("There's no point!");
    return;
  }

  // The intensity object maps track IDs to the the cumulative affinity
  //  at the given point, calculated by adding the number of shared favoriters
  //  of the current and trail tracks, multiplied by the weight of the trail //  track.
  var intensity = {};
  _.each(point.trail, function (trailPoint) {
    var weight = trailPoint.weight;
    var trackRec = _SA.TrackRecs.findOne({trackId: trailPoint.trackId});
    // console.log('DEBUG: trackRec found', trackRec);
    _.each(trackRec.relativity, function(count, trackId) {
      if (count === 0) {
        // console.log('ERROR: zero count relativity!');
        return; // TODO(gregp): why's this happen?
      }
      if (typeof intensity[trackId] == "undefined") {
        // We have not seen this point before
        intensity[trackId] = 0;
      }
      intensity[trackId] += count * weight;
    });
  });

  // We need to remove all the points on the trail, since we've already been
  _.each(point.trail, function (trailPoint) {
    var trackId = trailPoint.trackId;
    delete intensity[trackId];
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

/**
 * Gets a new track randomly from the recs for the given point, deftly avoiding
 *  the given trackId.
 */
var getNextTrack = function(pointRec, trackId) {
  var recs = pointRec.recommendations;
  var totalWeight = _.reduce(recs, function(memo,val) {
    if (val.trackId == trackId) return memo;
    return memo + val.intensity;
  }, 0);

  var remainingRand = Math.random() * totalWeight;
  var result = _.find(recs, function(rec) {
    if (rec.trackId == trackId) return false;

    remainingRand -= rec.intensity;
    if (remainingRand <= 0) return true;
    return false;
  });

  return result.trackId;
};
