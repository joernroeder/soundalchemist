Template.soundcloudImg.DEFAULT_URL = 'http://pierre.chachatelier.fr/programmation/images/mozodojo-original-image.jpg';

Template.soundcloudImg.imageUrl = function () {
  return Session.get('tracks:imageUrl+' + this.trackId) ||
    Template.soundcloudImg.DEFAULT_URL;

  // var track = _SA.Tracks.findOne({id: this.trackId});
  // console.log('got track for soundcloudImg', this.trackId, track);
  // if (track) {
  //   return track.artwork_url || Template.soundcloudImg.DEFAULT_URL;
  // }
};

Template.soundcloudImg.url = function() {
  return Session.get('tracks:url+' + this.trackId);
};
