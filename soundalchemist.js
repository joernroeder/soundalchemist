if (typeof _SA == "undefined") _SA = {};

_SA.Points = new Meteor.Collection("Points");
// console.log('DEBUG: resetting Points db...');
// _SA.Points.remove({});

_SA.TrackRecs = new Meteor.Collection("TrackRecs");
// console.log('DEBUG: resetting TrackRecs db...');
// _SA.TrackRecs.remove({});

if (Meteor.is_client) {
  _SA.PointRecs = new Meteor.Collection(null);
  _SA.Tracks = new Meteor.Collection(null);

  Meteor.autosubscribe(function () {
    Meteor.subscribe("point", Session.get("point:id"));
  });

  Meteor.autosubscribe(function () {
    var point = _SA.Points.findOne(Session.get("point:id"));
    if (!point)
      return;

    console.log('Subscription got a point!', point);
    // Need to ensure we have TrackRec objects for each point in the trail
    // Only once we have all of them can we build the recommendations...
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
