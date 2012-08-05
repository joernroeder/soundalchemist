if (typeof _SA == "undefined") _SA = {};

console.log('restarting server...');

_SA.UserFavorites = new Meteor.Collection("UserFavorites");

Meteor.publish("point", function (pointId) {
  return _SA.Points.find({pointId: pointId});
});

Meteor.publish("pointByTrackId", function (trackId) {
  return _SA.Points.find({trackId: trackId});
});

Meteor.publish("trackRec", function (trackId) {
  // console.log('DEBUG: looking for trackRec for ', trackId);
  return _SA.TrackRecs.find({trackId: trackId});
});

Meteor.methods({
  makeInitialPoint: function(trackId) {
    // Get the TrackRec going since we're probably going to need it
    //  (and it's expensive as hell)
    Meteor.call('makeTrackRec', trackId);

    var point = _SA.Points.findOne({trackId: trackId, trailhead: true});
    if (point) {
      var pointId = point.pointId;
      // console.log('DEBUG: cached initialPoint', pointId, point);
      return pointId;
    }

    var pointId = goog_string_getRandomString();
    var initialPoint = {
      pointId: pointId,
      trackId: trackId,
      trailhead: true,
      trail: [{
          pointId: null,
          trackId: trackId,
          weight: 1
        }]
    };
    _SA.Points.insert(initialPoint);
    // console.log('DEBUG: creating initialPoint', pointId, initialPoint);
    return pointId;
  },

  makeTrackRec: function (trackId) {
    if (!_SA.TrackRecs.findOne({trackId: trackId})){
      // xcxc mark it as loading-in-progress immediately.
      // xcxc offsets
      var trackRec = {trackId: trackId};

      // TODO(gregp): get *all* favoriters for a track in background thread...
      // console.log('DEBUG: Making request for favoriters of %s', trackId);
      var favoriters = trackRec.favoriters = Meteor.http.get(
        "http://api.soundcloud.com/tracks/" + trackId +
          "/favoriters.json" +
          "?limit=200" +
          "&client_id=17a48e602c9a59c5a713b456b60fea68").data;
      // console.log('DEBUG: Got response for favoriters of %s', trackId);


      var relativity = trackRec.relativity = {};
      var futures = _.map(favoriters, function(favoriter) {
        var favoriterId = favoriter.id;
        var future = new Future();
        var finished = future.resolver();

        var relativityFromFavorites = function(userFavorites) {
          var favoriteTrackIds = userFavorites.trackIds;
          _.each(favoriteTrackIds, function(id) {
            if (!relativity[id]) {
              relativity[id] = 0;
            }
            relativity[id]++;
          });
          finished();
        };

        var userFavoritesReceived = function(error, result) {
          if (error) {
            // console.warn("Error in getting user %d's favorites: %s", favoriterId, error);
            finished();
          }

          // console.log('DEBUG: Got response for %d\'s favorites...', favoriterId);

          var userFavorites = {userId: favoriterId};
          userFavorites.trackIds = _.map(result.data,
            function(track) {
              return track.id;
            });
          _SA.UserFavorites.insert(userFavorites);
          relativityFromFavorites(userFavorites);
        };

        var userFavorites = _SA.UserFavorites.findOne({userId: favoriterId});
        if(!userFavorites) {
          // console.log('DEBUG: Making request for %d\'s favorites...', favoriterId);
          Meteor.http.get(
            "http://api.soundcloud.com/users/" + favoriterId +
              "/favorites.json" +
              "?limit=200" +
              "&duration[from]=1200000" +
              "&client_id=17a48e602c9a59c5a713b456b60fea68",
            userFavoritesReceived);
        } else {
          // console.log('DEBUG: Cached %d\'s favorites...', favoriterId);
          relativityFromFavorites(userFavorites);
        }
        return future;
      });

      Future.wait(futures);
      trackRec.lastUpdate = +new Date();
      _SA.TrackRecs.insert(trackRec);

      // Just show that we got some data
      var totalRelativity = _.reduce(_.values(trackRec.relativity),
        function(memo, num){ return memo + num; }, 0);
      // console.log('DEBUG: TrackRec generated for %s, relativity count = %d.',
        trackRec.trackId, totalRelativity);
    } else {
      // console.log('DEBUG: TrackRec cached for %s.', trackId);
    }
  },

  blazePoint: function(curPointId, trackId, weight) {
    // TODO(gregp): Probably the worst thing ever!
    var potentials = _SA.Points.find({trackId: trackId}).fetch();
    var found = _.find(potentials, function(point) {
      if (!point.trail || !point.trail.length) return false;
      var recent = point.trail[0];
      return recent.pointId == curPointId && recent.weight == weight;
    });
    if(found) {
      // console.log('DEBUG: cached blazePoint %s from %s to %s, %j',
        weight, curPointId, trackId, found);
      return;
    }

    // Couldn't find it yet... continue.
    // console.log('DEBUG: blazing ', curPointId, trackId, weight);
    Meteor.call('makeTrackRec', trackId);
    // TODO(gregp): non-block here?

    var newPointId = goog_string_getRandomString();
    var curPoint = _SA.Points.findOne({pointId: curPointId});

    var trail = curPoint.trail;
    var trailPoint = {
      pointId: curPointId,
      trackId: trackId,
      weight: weight
    };
    trail.unshift(trailPoint);

    var newPoint = {
      pointId: newPointId,
      trackId: trackId,
      trail: trail
    };
    // console.log('DEBUG: creating newPoint', newPointId, newPoint);
    _SA.Points.insert(newPoint);
    return newPointId;
  }
});
