Template.trail.list = function () {
  var point = Points.findOne(Session.get("pointId"));
  if (!point)
    return [];
  else
    return point.trail;
};
