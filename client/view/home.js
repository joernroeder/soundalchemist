if (typeof SoundAlchemist == "undefined") SoundAlchemist = {};
if (typeof SoundAlchemist.view == "undefined") SoundAlchemist.view = {};

SoundAlchemist.view.HOME = 'home';
SoundAlchemist.view.home = function() {
  Session.set('page', SoundAlchemist.view.HOME);
};

// Passengers, buckle up!
SoundAlchemist.view.home.startJourney = function() {
  var url = Session.get('home:url');
  if (!url) {
    return;
  }

  var pointId = Session.get('point:id');
  console.log('Starting journey from ' + pointId + ' at ' + url);
  // TODO(gregp): specify at/_point_/to/_trackId_
  _SA.Router.navigate('at/' + pointId, {trigger: true});
};

// Validate the url and set it to the session
SoundAlchemist.view.home.maybeRegisterUrl = function(soundcloudUrl) {
  // TODO(gregp): url validation -- don't set if invalid
  Session.set('home:url', soundcloudUrl);
  Session.set('home:ready', false);
  Session.set('home:pending', true);

  // Get a head start on the recommendations
  getTrackDataFromUrl(soundcloudUrl, function(trackId) {
    Session.set('home:trackId', trackId);
    Meteor.call("makeInitialPoint", trackId, function(error, pointId) {
      if (error) {throw error;}
      Session.set('point:id', pointId);

      // TODO(gregp): this needs to wait for *POINTREC* actually
      // TODO(gregp): can Meteor set multiple session variables at once?
      Session.set('home:pending', false);
      Session.set('home:ready', true);
    });
  });
};



// TODO(gregp): nobody else keeps this?!...
keyCodes = {
  ESCAPE: 27,
  ENTER: 13
};

////////////////// URL Input Field ////////////////////////

SoundAlchemist.view.home.onUrlKeydown = function(ev) {
  var input = $(ev.target);
  // If escape, make sure the user remembers to add the http
  if (ev.keyCode == keyCodes.ESCAPE) {
    input.val(Session.get('home:defaultUrl'));
    return;
  }

  // Otherwise, run our validation
  var urlVal = input.val();
  SoundAlchemist.view.home.maybeRegisterUrl(urlVal);

  // Maybe even start them from here
  if (ev.keyCode == keyCodes.ENTER) {
    SoundAlchemist.view.home.startJourney();
  }
};

// Clear the field so pasting is easier
SoundAlchemist.view.home.onUrlClick = function(ev) {
  var input = $(ev.target);
  input.val('');
};

SoundAlchemist.view.home.onUrlBlur = function(ev) {
  var input = $(ev.target);
  input.val(Session.get('home:defaultUrl'));
};

/////////////////// Start Journey Button //////////////////////
SoundAlchemist.view.home.onStartClick = function(ev) {
  SoundAlchemist.view.home.startJourney();
};


//////////////////////// home Template def ////////////////////

Template.home.defaultUrl = function() {
  return Session.get('home:defaultUrl');
};

Template.home.pending = function() {
  return Session.get('home:pending');
};

Template.home.notReady = function() {
  return !Session.get('home:ready');
};

Template.home.events = {
  'keydown #soundcloud-url': SoundAlchemist.view.home.onUrlKeydown,
  'focusout #soundcloud-url': SoundAlchemist.view.home.onUrlBlur,
  'click #soundcloud-url': SoundAlchemist.view.home.onUrlClick,

  'click #start-journey': SoundAlchemist.view.home.onStartClick
};

Session.set('home:pending', false);
Session.set('home:ready', false);
