Template.soundcloudImg.imageUrl = function () {
  var self = this;
  var imageUrl = Session.get('image-url-' + this.url);
  if (imageUrl) {
    return imageUrl;
  } else {
    Meteor.http.get(
      "http://api.soundcloud.com/resolve.json?url=" +
        this.url +
        "&client_id=17a48e602c9a59c5a713b456b60fea68",
      function (error, result) {
        Session.set('image-url-' + self.url, result.data.artwork_url);
        Session.set('trackId-' + self.url, result.data.id);
      });

    return 'http://pierre.chachatelier.fr/programmation/images/mozodojo-original-image.jpg';
  }
};

Template.soundcloudImg.events = {
  'click': function () {
    Session.set('player-trackId', Session.get('trackId-' + this.url));
  }
};
