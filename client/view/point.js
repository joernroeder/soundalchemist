if (typeof SoundAlchemist == "undefined") SoundAlchemist = {};
if (typeof SoundAlchemist.view == "undefined") SoundAlchemist.view = {};

SoundAlchemist.view.POINT = 'point';
SoundAlchemist.view.point = function(pt) {
  Session.set('point:id', pt);
  Session.set('page', SoundAlchemist.view.POINT);

  Meteor.autosubscribe(SoundAlchemist.view.point.isotopeInit);
  var recommendationsOK = Session.get('point:recommendationsOK+' + pt);
  // console.warn('DEBUG: you are at a point: ', pt, recommendationsOK);
  if(recommendationsOK) {
    // Need to wait until the template has actually rendered.
    // TODO(gregp): ewwww
    Meteor.setTimeout(SoundAlchemist.view.point.isotopeInit, 0);
  }
};


SoundAlchemist.view.point.isotopeInit = function() {
  Session.get('point:recommendations');
  var pointId = Session.get('point:id');
  if(Session.get('point:recommendationsOK+' + pointId)) {
    // console.log("DEBUG: initializing isotope.");
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

SoundAlchemist.view.point.blaze = function(trackId, weight) {
  console.log('DEBUG: blazing ', trackId, weight);

  var newPointId = goog_string_getRandomString();
  var curPointId = Session.get('point:id');
  var curPoint = _SA.Points.findOne({pointId: curPointId});
  debugger;

  var trail = curPoint.trail;
  var trailPoint = {
    pointId: curPointId,
    trackId: curPoint.trackId,
    weight: weight
  };
  trail.unshift(trailPoint);

  var newPoint = {
    pointId: newPointId,
    trackId: trackId,
    trail: trail
  };
  _SA.Points.insert(newPoint);
  console.log("DEBUG: creating newPoint", newPointId, newPoint);
  _SA.Router.navigate('at/' + newPointId, {trigger: true});
};
