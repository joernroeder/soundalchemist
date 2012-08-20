if (typeof _SA == "undefined") _SA = {};
if (typeof SoundAlchemist == "undefined") SoundAlchemist = {};
if (typeof SoundAlchemist.view == "undefined") SoundAlchemist.view = {};

SoundAlchemist.view.POINT = 'point';
SoundAlchemist.view.point = function(pt) {
  Session.set('point:id', pt);

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


var setPointId = function(newPointId) {
  console.log('navigating to ', newPointId);
  _SA.Router.navigate('at/' + newPointId, {trigger: true});
  console.log('navigated to ', newPointId);
};


var setTrackId = function(trackId) {
  if (trackId != Session.get('player:trackId')) {
    Session.set('player:trackId', trackId);

    // disorient(); // indicate that we don't know the next points yet
    Session.set('player:onwardPoint', null);
    Session.set('player:outwardPoint', null);
    Meteor.call('makeTrackRec', trackId, orient);

    getWidget().load('http://api.soundcloud.com/tracks/' + trackId, {
      callback: function() {getWidget().play();}
    });
    registerWidgetListeners();
  }
};

var orient = function() {
  var pointId = Session.get('point:id');
  var trackId = Session.get('player:trackId');
  var point = _SA.Points.findOne({pointId: pointId});

  console.log('DEBUG: making points', pointId, trackId, point);
  var onwardId = makePoint(point, trackId, 1);
  var outwardId = makePoint(point, trackId, -1);

  Session.set('player:onwardPoint', onwardId);
  Session.set('player:outwardPoint', outwardId);
};

var getWidget = function() {
  Meteor.flush();
  var potentialWidgetEl = $('#playa').get(0);
  if (!potentialWidgetEl) {
    throw "couldn't find soundcloud player";
  }

  // console.log('found soundcloud player', potentialWidgetEl);
  return SC.Widget(potentialWidgetEl);
};

var registerWidgetListeners = function() {
  var widget = getWidget();

  // Make sure the dom is rendered
  widget.unbind(SC.Widget.Events.PAUSE);
  widget.bind(SC.Widget.Events.PAUSE, doPause);
  // console.log('bound PAUSE', widget);

  widget.unbind(SC.Widget.Events.FINISH);
  widget.bind(SC.Widget.Events.FINISH, doAutoPlay);
  // console.log('bound FINISH', widget);
};

var doPause = function() {
  console.log('DEBUG: doing pause...');
};

var doAutoPlay = function() {
  console.log('DEBUG: doing auto play...');
  var trackId = Session.get('player:trackId');
  var pointId = Session.get("point:id");
  var pointRec = _SA.PointRecs.findOne({pointId: pointId});

  var nextTrackId = getNextTrack(pointRec, trackId);
  setTrackId(nextTrackId);
};
