if (typeof _SA == "undefined") _SA = {};
if (typeof SoundAlchemist == "undefined") SoundAlchemist = {};
if (typeof SoundAlchemist.view == "undefined") SoundAlchemist.view = {};

SoundAlchemist.view.POINT = 'point';
SoundAlchemist.view.point = function(pt) {
  Session.set('point:id', pt);
  registerWidgetListeners();

  // TODO(gregp): does the router rEEEEALLY require this?!
  // If we're on some other page, we need to be on POINT
  if (Session.get('page') != SoundAlchemist.view.POINT) {
    Session.set('page', SoundAlchemist.view.POINT);
  } else {
    console.log('DEBUG: moving to a different point...');
  }
};


Template.point.isPlaying = function () {
  return !!Session.get('player:trackId');
};

SoundAlchemist.view.point.isotopeInit = function() {
  Meteor.flush();
  // console.log('DEBUG: initializing isotope.');
  // Initialize isotope
  // - with experimental masonry gutterWidth setting:
  //   http://masonry.desandro.com/demos/gutters.html
  //   http://isotope.metafizzy.co/custom-layout-modes/masonry-gutters.html
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


setPointId = function(newPointId) {
  console.log('navigating to ', newPointId);
  _SA.Router.navigate('at/' + newPointId, {trigger: true});
};
