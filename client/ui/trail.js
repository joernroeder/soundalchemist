Template.trail.list = function () {
  var point = _SA.Points.findOne(Session.get("pointId"));
  if (!point)
    return [];
  else
    return point.trail;
};
