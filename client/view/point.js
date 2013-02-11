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
SoundAlchemist.view.pointTrack = function(pt, track) {
  console.log('pointTrack');
  SoundAlchemist.view.point(pt);
  setTrackId(track);
};

Template.point.events({
  'click .home': function () {
    _SA.Router.navigate('/', {trigger: true});
    return false;
  }
});


Template.point.isPlaying = function () {
  return !!Session.get('player:trackId');
};

SoundAlchemist.view.point.hasIsotope = false;
SoundAlchemist.view.point.isotopeInit = function() {

  Meteor.flush();
 
  // console.log('DEBUG: initializing Initialize.');
  // isotope isotope
  // - with experimental masonry gutterWidth setting:
  //   http://masonry.desandro.com/demos/gutters.html
  //   http://isotope.metafizzy.co/custom-layout-modes/masonry-gutters.html
  $('.recommendations').isotope({
    animationOptions: {
      duration: 350,
      easing: 'swing',
      queue: false
    },
    masonry: {
      columnWidth: 110,
      gutterWidth: 10
    },
    animationEngine: 'best-available' // TODO(gregp): use css3 transitions
  });
};

// small player api wrapper
SoundAlchemist.view.point.scPlayer = {
  $el: null,

  options: {
    autoPlay: isProd()
  },

  play: function (trackId) {
    var opts = {
        links: [{
          url: 'http://api.soundcloud.com/tracks/' + trackId
        }]
      };

    this.$el.scPlayer($.extend({}, this.options, opts));
  },

  registerListeners: function () {
    this.$el.on('onPlayerInit', function (event) {
      console.log(event.target, 'it\'s playing!');
    });
  },

  updateDom: function () {
    this.$el.prepend('<div class="flip"><div class="half">FOO</div></div>');
    console.log(this.$el.html());
  },

  init: function () {
    console.log('INIT PLAYER');
    var trackId = Session.get('player:trackId');
    if (this.$el) {
      this.registerListeners();

      if (trackId) {
        this.play(trackId);
      }
    }
  }
};

SoundAlchemist.view.point.scPlayerInit = function () {
  Meteor.flush();
  var $potentialWidgetEl = $('#sc-player');
  
  //$.scPlayer.defaults.apiKey = 'alchemist';
  
  console.log('scPlayerInit');
  console.log($potentialWidgetEl);
  $potentialWidgetEl.scPlayer({
    links: [{
      //url: "http://soundcloud.com/matas/hobnotropic",
      url: "http://api.soundcloud.com/tracks/63390081"
    }],
    beforeRender  :   function(tracksData) {
      var $player = $(this);
      $player.addClass('super-player-class');
      SoundAlchemist.view.point.scPlayer.$el = $player;
      SoundAlchemist.view.point.scPlayer.init();
      SoundAlchemist.view.point.scPlayer.updateDom();
    }
  });
};


var setPointId = function(newPointId) {
  console.log('navigating to ', newPointId);
  var url = 'at/' + newPointId + '/to/' + Session.get('player:trackId');
  _SA.Router.navigate(url, {trigger: true});
  if (Meteor.user()) {
    Meteor.users.update(Meteor.userId(), {$set: {"profile.lastUrl": url}});
  }
  console.log('navigated to ', newPointId);
};


var setTrackId = function(trackId) {
  if (trackId != Session.get('player:trackId')) {
    var url = 'at/' + Session.get('point:id') + '/to/' + trackId;
    _SA.Router.navigate(url, {trigger: true});
    if (Meteor.user()) {
      Meteor.users.update(Meteor.userId(), {$set: {"profile.lastUrl": url}});
    }

    // disorient(); // indicate that we don't know the next points yet
    Session.set('player:onwardPoint', null);
    Session.set('player:outwardPoint', null);
    Meteor.call('makeTrackRec', trackId, orient);

    /*getWidget().load('http://api.soundcloud.com/tracks/' + trackId, {
      auto_play: isProd(), // thank you greg
    });*/
    //registerWidgetListeners();
    Session.set('player:trackId', trackId);
  }
};

Meteor.startup(function () {
  var trackId = Session.get('player:trackId');
  if (!trackId) {
    return;
  }

  Meteor.flush();
  getWidget().load('http://api.soundcloud.com/tracks/' + trackId, {
    auto_play: isProd(), // thank you greg
  });
  registerWidgetListeners();
});

var orient = function(insideAutorun) {
  var pointId = Session.get('point:id');
  var trackId = Session.get('player:trackId');
  var point = _SA.Points.findOne({pointId: pointId});
  if (!point) {
    Meteor.autorun(function () {
      if (_SA.Points.findOne({pointId: pointId}))
        orient(true);
    });
    return;
  }

  console.log('DEBUG: making points', pointId, trackId, point);
  var onwardId = makePoint(point, trackId, 1);
  var outwardId = makePoint(point, trackId, -1);

  Session.set('player:onwardPoint', onwardId);
  Session.set('player:outwardPoint', outwardId);
};

var getWidget = function() {
  Meteor.flush();
  var potentialWidgetEl = $('.sc-player');

  // console.log('found soundcloud player', potentialWidgetEl);
  return potentialWidgetEl;
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
