Template.soundcloudImg.DEFAULT_URL = 'http://pierre.chachatelier.fr/programmation/images/mozodojo-original-image.jpg';

Template.soundcloudImg.imageUrl = function () {
  var url = this.url;
  // TODO(gregp): brittle, should be based on soundcloudId
  var track = _SA.Tracks.findOne({permalink_url: url});
  // console.log('DEBUG: translating img url for ' + url, track);
  if (track) {
    return track.artwork_url || Template.soundcloudImg.DEFAULT_URL;
  } else {
    getTrackData(url);
    return Template.soundcloudImg.DEFAULT_URL;
  }
};
