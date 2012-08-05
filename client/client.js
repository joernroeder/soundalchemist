if (typeof _SA == "undefined") _SA = {};

_SA.PointRecs = new Meteor.Collection(null);
_SA.Tracks = new Meteor.Collection(null);


Meteor.autosubscribe(function () {
  Meteor.subscribe('point', Session.get("point:id"));
});

Meteor.autosubscribe(function () {
  Meteor.subscribe('pointByTrackId', Session.get("home:trackId"));
});

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
      if (!intensity[trackId])
        intensity[trackId] = 0;
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
    getTrackData(trackId); // head start
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
  Session.set('point:recommendationsOK+' + pointId, true);
  _pokeRecommendations();
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

var _pokeRecommendations = function() {
  var cur = Session.get('point:recommendations');
  Session.set('point:recommendations', cur ? cur+1 : 1);
};

var _registerTrackData = function(result, opt_callback) {
  var trackData = result.data;
  var id = trackData.id;
  trackData.lastUpdate = +new Date();

  // console.log("DEBUG: inserting track data for " + id, trackData);
  _SA.Tracks.insert(trackData);
  // TODO(gregp): why does ^^ not work?

  Session.set('tracks:imageUrl+' + id,
    trackData.artwork_url || Template.soundcloudImg.DEFAULT_URL);
  Session.set('tracks:url+' + id,
    trackData.permalink_url);

  opt_callback && opt_callback(id);
};

var _soundcloudApiUrl = function(meat) {
  return "http://api.soundcloud.com/" + meat +
    "&client_id=17a48e602c9a59c5a713b456b60fea68";
};

var getTrackData = function(soundcloudId, opt_callback) {
  Meteor.http.get(
    _soundcloudApiUrl("tracks/" + soundcloudId + ".json?"),
    function (error, result) {
      if (error) {
        throw error;
      } else {
        _registerTrackData(result, opt_callback);
      }
    });
};

var getTrackDataFromUrl = function(soundcloudUrl, opt_callback) {
  Meteor.http.get(
    _soundcloudApiUrl("resolve.json?url=" + soundcloudUrl),
    function (error, result) {
      if (error) {
        throw error;
      } else {
        _registerTrackData(result, opt_callback);
      }
    });
};
