if (typeof _SA == "undefined") _SA = {};

_SA.Points = new Meteor.Collection("Points");

_SA.TrackRecs = new Meteor.Collection("TrackRecs");

// console.log('DEBUG: resetting TrackRecs db...');
// _SA.TrackRecs.remove({});

if (Meteor.is_client) {
  Meteor.autosubscribe(function () {
    Meteor.subscribe("point", Session.get("pointId"));
  });

  Meteor.autosubscribe(function () {
    var point = _SA.Points.findOne(Session.get("pointId"));
    if (!point)
      return;

    console.log(point);
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
