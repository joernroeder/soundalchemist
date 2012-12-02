Template.trail.list = function () {
  var pointId = Session.get("point:id");
  var point = _SA.Points.findOne({pointId: pointId});
  var result = (point && point.trail) || [];
  return result;
};

Template.trail.events = {
  'click .trail-image': function () {
    setTrackId(this.trackId);
  },

  'click .trail-vote': function () {
    var self = this;
    var i = -1;
    // xcxc why do we need this work?
    _.find(Template.trail.list(), function (trailItem, index) {
      if (trailItem.pointId === self.pointId) {
        i = index - 1;
        return true;
      } else {
        return false;
      }
    });
    setPointId(Template.trail.list()[i].pointId);
  }
};

Template.trail.outwards = function () {
  return this.weight < 0;
};

Template.trail.url = function () {
  return '/at/' + this.pointId;
};
