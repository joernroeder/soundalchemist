Template.trail.list = function () {
  var pointId = Session.get("point:id");
  var point = _SA.Points.findOne({_id: pointId});
  // TODO(gregp): map to ids
  return (point && point.trail) || [];
};
