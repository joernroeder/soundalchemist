if (typeof SoundAlchemist == "undefined") SoundAlchemist = {};
if (typeof SoundAlchemist.view == "undefined") SoundAlchemist.view = {};

SoundAlchemist.view.POINT = 'point';
SoundAlchemist.view.point = function(pt) {
  Session.set('page', SoundAlchemist.view.POINT);
  Meteor.startup(SoundAlchemist.view.point.init);
};

SoundAlchemist.view.point.init = function() {
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

