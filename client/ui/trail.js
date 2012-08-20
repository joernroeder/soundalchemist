Template.trail.list = function () {
  var pointId = Session.get("point:id");
  var point = _SA.Points.findOne({pointId: pointId});
  var result = (point && point.trail) || [];
  return result;
};

Template.trail.events = {
  'click .trail-image': function () {
    setTrackId(this.trackId);
  }
};

Template.trail.outwards = function () {
  return this.weight < 0;
};

Template.trail.url = function () {
  return '/at/' + this.pointId;
};
