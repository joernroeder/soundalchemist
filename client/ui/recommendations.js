Template.recommendations.list = function () {
  var pointId = Session.get("point:id");
  var pointRec = _SA.PointRecs.findOne({pointId: pointId});
  if (!pointRec) return [];
  console.log('DEBUG: rendering pointRec for', pointId, pointRec);
  return pointRec.recommendations;
};

Template.recommendation.size = function () {
  // This maps ranks in (-inf, 100] to size [1,3]
  return Math.ceil(Math.max(this.intensity,0)/33.4);
};

Template.recommendation.trackId = function () {
  return this.trackId;
};

Template.recommendation.events = {
  'click': function () {
    setTrackId(this.trackId);
  }
};
