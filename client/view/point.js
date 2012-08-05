if (typeof SoundAlchemist == "undefined") SoundAlchemist = {};
if (typeof SoundAlchemist.view == "undefined") SoundAlchemist.view = {};

SoundAlchemist.view.POINT = 'point';
SoundAlchemist.view.point = function(pt) {
  Session.set('point:id', pt);

  // If we're on some other page, we need to be on POINT
  if (Session.get('page') != SoundAlchemist.view.POINT) {
    Session.set('page', SoundAlchemist.view.POINT);

    Meteor.autosubscribe(SoundAlchemist.view.point.disorient);
    Meteor.autosubscribe(SoundAlchemist.view.point.orient);
    Meteor.autosubscribe(SoundAlchemist.view.point.isotopeInit);
  } else {
    // console.log('DEBUG: moving to a different point...');
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


SoundAlchemist.view.point.disorient = function() {
  var trackId = Session.get('player:trackId');
  var pointId = Session.get('point:id');

  if(!trackId) return;
  Meteor.subscribe('pointByTrackId', trackId);
  Meteor.call('blazePoint', pointId, trackId, -1);
  Meteor.call('blazePoint', pointId, trackId, 1);

  Session.set('player:onwardPoint', null);
  Session.set('player:outwardPoint', null);
  // console.log('DEBUG: onward/outward disabled pending orientation', pointId, trackId);
};


SoundAlchemist.view.point.orient = function() {
  var trackId = Session.get('player:trackId');
  var pointId = Session.get('point:id');

  var nothing = true;
  var points = _SA.Points.find({trackId: trackId}).fetch();
  var onwardPoint = _.find(points, function(point) {
    return point.trail && point.trail.length && point.trail[0].weight == 1;
  });
  if (onwardPoint) {
    // console.log('DEBUG: onward point found', onwardPoint);
    Session.set('player:onwardPoint', onwardPoint.pointId);
    nothing = false;
  }

  var outwardPoint = _.find(points, function(point) {
    return point.trail && point.trail.length && point.trail[0].weight == -1;
  });
  if (outwardPoint) {
    // console.log('DEBUG: outward point found', outwardPoint);
    Session.set('player:outwardPoint', outwardPoint.pointId);
    nothing = false;
  }

  if (nothing) {
    // console.log('DEBUG: points found but non-blaze-relevant', points);
  }
};


SoundAlchemist.view.point.blaze = function(newPointId) {
  console.log('navigating to ', newPointId);
  _SA.Router.navigate('at/' + newPointId, {trigger: true});
};
