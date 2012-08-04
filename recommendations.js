if (Meteor.is_client) {
  Template.recommendations.list = function () {
    return state.recommendations;
  };

  Template.recommendation.size = function () {
    // This maps ranks in (-inf, 100] to size [1,3]
    var size = Math.ceil(Math.sqrt(Math.max(this.rank,0))/3.4);
    return {width: size * 100, height: size * 100};
  };

//  Template.recommendation
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
