Template.player.escapedUrl = function () {
  var trackId = Session.get('player:trackId');
  if (trackId) {
    return escape('http://api.soundcloud.com/tracks/' + trackId);
  } else {
    return null;
  }
};
