Template.soundcloudImg.imageUrl = function () {
  var self = this;
  var imageUrl = Session.get('image-url-' + this.url);
  if (imageUrl) {
    return imageUrl;
  } else {
    getTrackData(self.url, function(data) {
      Session.set('image-url-' + self.url, data.artwork_url);
      Session.set('trackId-' + self.url, data.id)
    });

    return 'http://pierre.chachatelier.fr/programmation/images/mozodojo-original-image.jpg';
  }
};

Template.soundcloudImg.events = {
  'click': function () {
    Session.set('player-trackId', Session.get('trackId-' + this.url));
  }
};
