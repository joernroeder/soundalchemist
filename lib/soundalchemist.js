if (typeof _SA == "undefined") _SA = {};
_SA.TrackRecs = _SA.TrackRecs || new Meteor.Collection("TrackRecs");

isProd = function () {
  return Meteor.absoluteUrl().indexOf('localhost') === -1;
};

//xcxcif (Meteor.isClient) {
  // don't use Meteor.subscribe to keep track of these, since
  // they never change and we might as well just cache any of these
  // as we touch them.
if (Meteor.isClient) {
  _SA.Points = new Meteor.Collection(null);
} else {
  _SA.Points = new Meteor.Collection("Points");
}
//}

// console.log('DEBUG: resetting Points db...');
// _SA.Points.remove({});

var makePoint = function(point, trackId, weight) {
  var trail = point.trail;

  var newPointId = trackId + '_' + weight + '___';
  newPointId += _.map(trail, function(trailPoint) {
    return trailPoint.trackId + '_' + trailPoint.weight;
  }).join('___');

  newPointId = Meteor._srp.SHA256(newPointId).substring(0, 16);
  var cachedPoint = _SA.Points.findOne(newPointId);
  if (cachedPoint)
    return cachedPoint;

  var newTrail = _.clone(point.trail);
  // The current trailPoint to prepend to the trail to make the new point
  var trailPoint = {
    pointId: point.pointId,
    trackId: trackId,
    weight: weight
  };
  newTrail.unshift(trailPoint); // anti-push

  var newPoint = {
    pointId: newPointId,
    trackId: trackId,
    trail: newTrail
  };
  // console.log('DEBUG: creating newPoint', newPointId, newPoint);
  // xcxc this is only on the client?
  _SA.Points.insert(newPoint);
  Meteor.call('addPoint', newPoint);
  return newPointId;
};
