if (Meteor.is_client) {
  Template.recommendations.list = function () {
    return state.recommendations;
  };

  Template.recommendation.size = function () {
    // This maps ranks in (-inf, 100] to size [1,3]
    var size = Math.ceil(Math.sqrt(Math.max(this.rank,0))/3.4);
    return {width: size * 100, height: size * 100};
  };

  Template.recommendation.imageUrl = function () {
    var self = this;
    var imageUrl = Session.get('image-url-' + this.url);
    if (imageUrl) {
      return imageUrl;
    } else {
      Meteor.http.get(
        "http://api.soundcloud.com/resolve.json?url="
          + this.url
          + "&client_id=17a48e602c9a59c5a713b456b60fea68",
        function (error, result) {
          Session.set('image-url-' + self.url, result.data.artwork_url);
        });

      return 'http://pierre.chachatelier.fr/programmation/images/mozodojo-original-image.jpg';
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
    }
  });
};

if (Meteor.is_client) {
  Meteor.startup(SoundAlchemist.onStartup);
}
