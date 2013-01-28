Template.player.escapedUrl = function () {
  var trackId = Session.get('player:trackId');
  return escape('http://api.soundcloud.com/tracks/' + trackId);
};

Template.player.imageUrl = function () {
	var trackId = Session.get('player:trackId'),
		url = Session.get('tracks:imageUrl+' + trackId) || Template.soundcloudImg.DEFAULT_URL;;

		console.log('Image Url: %s', url);

		return url;
};
