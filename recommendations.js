if (Meteor.is_client) {
  Template.recommendations.list = function () {
    Session.get("redraw-recommendations"); // to estabilsh a dependency
    return state.recommendations;
  };

  Template.recommendation.size = function () {
    // This maps ranks in (-inf, 100] to size [1,3]
    return Math.ceil(Math.max(this.rank,0)/33.4);
  };

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
}

if (typeof SoundAlchemist == "undefined") SoundAlchemist = {};
SoundAlchemist.onStartup = function() {
  $('.recommendations').isotope({
    animationOptions: {
      duration: 750,
      easing: 'linear',
      queue: false
    },
    masonry: {
      columnWidth: 110,
      gutterWidth: 10
    },
    animationEngine: 'jquery' // TODO(gregp): use css3 transitions
  });
};

if (Meteor.is_client) {
  Meteor.startup(SoundAlchemist.onStartup);
}
