if (typeof _SA == "undefined") _SA = {};
if (typeof SoundAlchemist == "undefined") SoundAlchemist = {};
if (typeof SoundAlchemist.view == "undefined") SoundAlchemist.view = {};
_SA.PointRecs = _SA.PointRecs || new Meteor.Collection(null);
_SA.Tracks = _SA.Tracks || new Meteor.Collection(null);
_SA.Points = _SA.Points || new Meteor.Collection("Points");
_SA.TrackRecs = _SA.TrackRecs || new Meteor.Collection("TrackRecs");

SoundAlchemist.view.POINT = 'point';
SoundAlchemist.view.point = function(pt) {
  Session.set('point:id', pt);
  registerAutoPlay();

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
  } else {
    SoundAlchemist.view.point._pagePing =
      Meteor.setInterval(SoundAlchemist.view.point.buildPointRec, 100);
  }
};

SoundAlchemist.view.point.buildPointRec = function() {
  var pointId = Session.get("point:id");
  var point = _SA.Points.findOne({pointId: pointId});
  if (!point) {
    // console.log('DEBUG: Couldn\'t find point %s page... still loading...?', pointId);
    return;
  } else {
    Meteor.clearInterval(SoundAlchemist.view.point._pagePing);
  }

  // Make sure we're not recomputing a recommendation we already have.
  var pointRec = _SA.PointRecs.findOne({pointId: pointId});
  if (pointRec) {
    // console.log('DEBUG: using cached recommendations for ', pointRec);
    return;
  }

  // Need to ensure we have TrackRec objects for each point in the trail
  // Only once we have all of them can we build the recommendations...
  var pending = 0;
  // console.log('DEBUG: getting trail recommendations for point', pointId, point);
  _.each(point.trail, function (trailPoint) {
    var trailPointId = trailPoint.trackId;

    var trackRecs = _SA.TrackRecs.findOne({trackId: trailPointId});
    if (trackRecs) {
      // console.log('DEBUG: using cached track recommendations for point', trackRecs, trailPoint);
      return;
    }

    pending++;
    // console.log('DEBUG: subscribing to trackRec for point', trailPoint);
    Meteor.subscribe("trackRec", trailPointId, function () {
      pending--;
      if (!pending) {
        computeRecommendations(pointId);
      }
    });
  });
};

Meteor.autosubscribe(SoundAlchemist.view.point.buildPointRec);


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
