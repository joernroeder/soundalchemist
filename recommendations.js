if (Meteor.is_client) {
  Template.recommendations.list = function () {
    var recs = state.recommendations;
    $.map(recs, function(rec) {
      // This maps ranks in (-inf, 100] to size [1,3]
      rec.size = Math.ceil(Math.sqrt(Math.max(rec.rank,0))/3.4);

      rec.width = rec.height = rec.size * 100;
      return rec;
    });
    return recs;
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
