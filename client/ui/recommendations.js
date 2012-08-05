Template.recommendations.list = function () {
  return Session.get("point:recommendations");
};

Template.recommendation.size = function () {
  // This maps ranks in (-inf, 100] to size [1,3]
  return Math.ceil(Math.max(this.rank,0)/33.4);
};
