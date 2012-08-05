Template.recommendations.list = function () {
  return Session.get("point:recommendations");
};

Template.recommendation.size = function () {
  // This maps ranks in (-inf, 100] to size [1,3]
  return Math.ceil(Math.max(this.rank,0)/33.4);
};

// TODO(gregp): remove
var getSoundcloudIdFromUrl = function(url) {
  var track = _SA.Tracks.findOne({permalink_url: url});
  return track.id;
};

Template.recommendation.events = {
  'click': function () {
    var soundcloudId = getSoundcloudIdFromUrl(this.url);
    if (soundcloudId) {
      Session.set('player:trackId', soundcloudId);
    } else {
      throw ("Couldn't find soundcloudId for " + this.url);
    }
  }
};
