Template.trail.list = function () {
  var pointId = Session.get("point:id");
  var point = _SA.Points.findOne({_id: pointId});
  return (point && point.trail) || [];
};
