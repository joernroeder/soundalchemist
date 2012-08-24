Template.player.escapedUrl = function () {
  var trackId = Session.get('player:trackId');
  return escape('http://api.soundcloud.com/tracks/' + trackId);
};
