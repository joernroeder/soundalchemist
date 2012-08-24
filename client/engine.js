if (typeof _SA == "undefined") _SA = {};
_SA.PointRecs = _SA.PointRecs || new Meteor.Collection(null);
_SA.Tracks = _SA.Tracks || new Meteor.Collection(null);
_SA.Points = _SA.Points || new Meteor.Collection("Points");
_SA.TrackRecs = _SA.TrackRecs || new Meteor.Collection("TrackRecs");

// TODO(gregp): infinite scroll..... ...
_SA.MAX_RECOMMENDATIONS = 50;

_SA.getPointRec = function (callback) {
  var pointId = Session.get("point:id");
  var point = _SA.Points.findOne({pointId: pointId});
  console.log('DEBUG: getting pointRec', pointId, point);

  // Make sure we're not recomputing a recommendation we already have.
  var pointRec = _SA.PointRecs.findOne({pointId: pointId});
  if (pointRec) {
    console.log('DEBUG: using cached pointRec', pointRec);
    callback();
    return;
  }

  // Need to ensure we have TrackRec objects for each point in the trail
  // Only once we have all of them can we build the recommendations...
  var pending = 0;
  console.log('DEBUG: getting trackRecs for trail points', pointId, point);
  _.each(point.trail, function (trailPoint) {
    var trailPointId = trailPoint.trackId;

    var trackRecs = _SA.TrackRecs.findOne({trackId: trailPointId});
    if (trackRecs) {
      console.log('DEBUG: using cached trackRecs for point', trackRecs, trailPoint);
      return;
    }

    // This block is only used by page load
    // ...
    // TODO(gregp): other than this bug: we should know that the result of the
    //  server Meteor.call (which we subscribed to) will be returned to us
    //    *before*
    //  the callback for that Meteor.call is called
    pending++;
    console.log('DEBUG: subscribing to trackRec', trailPointId);
    Meteor.subscribe("trackRec", trailPointId, function () {
      console.log('DEBUG: got trackRec', trailPointId);
      pending--;
      if (!pending) {
        console.log('DEBUG: got all trail trackRecs for', pointId);
        computePointRec(pointId);
        callback();
      }
    });
  });

  if(pending === 0) {
    console.log('DEBUG: had all trail trackRecs cached for', pointId);
    computePointRec(pointId);
    callback();
  }
};

Meteor.autosubscribe(function () {
  var pointId = Session.get("point:id");
  if (pointId) {
    console.log('DEBUG: subscribing to point id', pointId);
    Meteor.subscribe('point', pointId, function() {
      _SA.getPointRec(function () {
        if (!Session.get('player:trackId')) {
          doAutoPlay();
        }
        SoundAlchemist.view.point.isotopeInit();
      });
    });
  }
});

/**
 * This function should be autosubscribed in such a way that it is called when
 *  all the trackRecs for the trail of the given point are available. (IE:they
 *  have been calculated on the server).
 * It inserts a pointRec into the (local) database with recommendations for the
 *  given point.
 * This can cause the recommendations UI to update with the new pointRec.
 */
var computePointRec = function(pointId) {
  var point = _SA.Points.findOne({pointId: pointId});

  console.log('DEBUG: computing pointRecs for', pointId, point);
  if (!point) {
    console.warn("There's no point!");
    return;
  }

  // The intensity object maps track IDs to the the cumulative affinity
  //  at the given point, calculated by adding the number of shared favoriters
  //  of the current and trail tracks, multiplied by the weight of the trail //  track.
  var intensity = {};
  _.each(point.trail, function (trailPoint, index) {
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
      intensity[trackId] += count * weight * Math.pow(0.9, index);
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
