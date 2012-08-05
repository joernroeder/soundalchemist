Template.soundcloudImg.DEFAULT_URL = 'http://pierre.chachatelier.fr/programmation/images/mozodojo-original-image.jpg';

Template.soundcloudImg.imageUrl = function () {
  var url = this.url;
  var imageUrl = Session.get('image-url-' + url);
  if (imageUrl) {
    return imageUrl;
  } else {
    getTrackData(url, function(data) {
      Session.set('image-url-' + url, data.artwork_url);
      Session.set('trackId-' + url, data.id);
    });

    return Template.soundcloudImg.DEFAULT_URL;
  }
};

Template.soundcloudImg.events = {
  'click': function () {
    Session.set('player-trackId', Session.get('trackId-' + this.url));
  }
};
