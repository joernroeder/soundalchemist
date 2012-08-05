Template.soundcloudImg.DEFAULT_URL = 'http://pierre.chachatelier.fr/programmation/images/mozodojo-original-image.jpg';

Template.soundcloudImg.imageUrl = function () {
  var url = this.url; // TODO(gregp): brittle, should be based on soundcloudId
  // var track = _SA.Tracks.findOne({permalink_url: url});
  var track = null;
  var imageUrl = Session.get('image-url-' + url);
  console.log('doing things for ' + url, track, imageUrl);
  if (imageUrl) {
    return imageUrl;
  } else {
    getTrackData(url, function(soundcloudId) {
      data = _SA.Tracks.findOne({id: soundcloudId});
      Session.set('image-url-' + url, data.artwork_url);
      Session.set('trackId-' + url, data.id);
    });

    return Template.soundcloudImg.DEFAULT_URL;
  }
};

Template.soundcloudImg.events = {
  'click': function () {
    Session.set('player:trackId', Session.get('trackId-' + this.url));
  }
};
