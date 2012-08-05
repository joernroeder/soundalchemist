if (typeof _SA == "undefined") _SA = {};

_SA.Points = new Meteor.Collection("Points");
// console.log('DEBUG: resetting Points db...');
// _SA.Points.remove({});

_SA.TrackRecs = new Meteor.Collection("TrackRecs");
// CAUTION: THIS IS EXPENSIVE TO REBUILD!
// /*
// console.log('DEBUG: resetting TrackRecs db...');
// _SA.TrackRecs.remove({});
// */

// TODO(gregp): put this better...
var goog_string_getRandomString = function() {
  var x = 2147483648;
  return Math.floor(Math.random() * x).toString(36) +
    Math.abs(Math.floor(Math.random() * x) ^ (+new Date())).toString(36);
};

if (Meteor.is_client) {
  _SA.PointRecs = new Meteor.Collection(null);
  _SA.Tracks = new Meteor.Collection(null);

  Meteor.autosubscribe(function () {
    var pointId = Session.get("point:id");
    var point = _SA.Points.findOne({pointId: pointId});
    if (!point) {
      // console.log('DEBUG: Couldn\'t find point page... still loading...?');
      return;
    }

    // Make sure we're not recomputing a recommendation we already have.
    var pointRec = _SA.PointRecs.findOne({pointId: pointId});
    if (pointRec) {
      // console.log('DEBUG: using cached recommendations for ', pointRec);
      return;
    }

    // Need to ensure we have TrackRec objects for each point in the trail
    // Only once we have all of them can we build the recommendations...
    var pending = 0;
    // console.log('DEBUG: getting trail recommendations for point', pointId, point);
    _.each(point.trail, function (trailPoint) {
      var trailPointId = trailPoint.trackId;

      var trackRecs = _SA.TrackRecs.findOne({trackId: trailPointId});
      if (trackRecs) {
        // console.log('DEBUG: using cached track recommendations for point', trackRecs, trailPoint);
        return;
      }

      pending++;
      // console.log('DEBUG: subscribing to trackRec for point', trailPoint);
      Meteor.subscribe("trackRec", trailPointId, function () {
        pending--;
        if (!pending) {
          computeRecommendations(pointId);
        }
      });
    });
  });
}
