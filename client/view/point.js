if (typeof _SA == "undefined") _SA = {};
if (typeof SoundAlchemist == "undefined") SoundAlchemist = {};
if (typeof SoundAlchemist.view == "undefined") SoundAlchemist.view = {};

SoundAlchemist.view.POINT = 'point';
SoundAlchemist.view.point = function(pt) {
  Session.set('point:id', pt);

  registerWidgetListeners();

  // If we're on some other page, we need to be on POINT
  if (Session.get('page') != SoundAlchemist.view.POINT) {
    Session.set('page', SoundAlchemist.view.POINT);

    Meteor.autosubscribe(SoundAlchemist.view.point.isotopeInit);
  } else {
    console.log('DEBUG: moving to a different point...');
  }

  // Watch for recommendations injection; need to reflow at that time
  var recommendationsOK = Session.get('point:recommendationsOK+' + pt);
  // console.warn('DEBUG: you are at a point: ', pt, recommendationsOK);
  if(recommendationsOK) {
    // Need to wait until the template has actually rendered.
    // TODO(gregp): ewwww
    Meteor.setTimeout(SoundAlchemist.view.point.isotopeInit, 0);
  }
};


Template.point.isPlaying = function () {
  return !!Session.get('player:trackId');
};


SoundAlchemist.view.point.isotopeInit = function() {
  Session.get('point:recommendations');
  var pointId = Session.get('point:id');
  if(Session.get('point:recommendationsOK+' + pointId)) {
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
  } else {
    // debugger;
  }
};




setPointId = function(newPointId) {
  console.log('navigating to ', newPointId);
  _SA.Router.navigate('at/' + newPointId, {trigger: true});
};
