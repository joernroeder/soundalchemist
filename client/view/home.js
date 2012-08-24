if (typeof SoundAlchemist == "undefined") SoundAlchemist = {};
if (typeof SoundAlchemist.view == "undefined") SoundAlchemist.view = {};

SoundAlchemist.view.HOME = 'home';
SoundAlchemist.view.home = function() {
  Session.set('page', SoundAlchemist.view.HOME);

  var defaultUrl = Session.get('home:defaultUrl');
  if (defaultUrl) {
    Session.set('home:url', defaultUrl);
    //SoundAlchemist.view.home.registerUrl(defaultUrl);
  }
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

// Validate the url
SoundAlchemist.view.home.validateUrl = function(url) {
  var regex = /^((http:\/\/)?)(soundcloud.com|www.soundcloud.com)([0-9a-zA-Z./_-]+)$/gi;
  var validUrl = regex.test(url);
  Session.set('home:badUrl', !validUrl);
  return validUrl;
};

// Set the url to the session
SoundAlchemist.view.home.registerUrlAndStartJourney = function() {
  Session.set('home:ready', false);
  Session.set('home:pending', true);

  soundcloudUrl = Session.get('home:url');
  if (soundcloudUrl.indexOf('http://') === -1) {
    soundcloudUrl = 'http://' + soundcloudUrl;
  }

  // Get a head start on the recommendations
  console.log('DEBUG: getting track data from url ', soundcloudUrl);
  getTrackDataFromUrl(soundcloudUrl, function(error, trackId) {
    if (error) {
      Session.set('home:ready', false);
      Session.set('home:pending', false);
    }

    // Create the point we're going to go to
    var pointId = makePoint({
      pointId: null,
      trail: []
    }, trackId, 1);

    Meteor.call("makeTrackRec", trackId, function(error) {
      if (error) {throw error;}
      Session.set('point:id', pointId);

      // TODO(gregp): this needs to wait for *POINTREC* actually
      // TODO(gregp): can Meteor set multiple session variables at once?
      Session.set('home:pending', false);
      Session.set('home:ready', true);

      SoundAlchemist.view.home.startJourney();
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
    Session.set('home:badUrl', false);
    return;
  }

  // Otherwise, run our validation
  var urlVal = input.val();
  if (!SoundAlchemist.view.home.validateUrl(urlVal)) {
    return;
  }
  Session.set('home:url', urlVal);

  // Maybe even start them from here
  if (ev.keyCode == keyCodes.ENTER) {
    SoundAlchemist.view.home.registerUrlAndStartJourney();
  }
};

// Clear the field so pasting is easier
SoundAlchemist.view.home.onUrlClick = function(ev) {
  var input = $(ev.target);
  if (input.val() === Session.get('home:defaultUrl')) {
    input.val('');
  }
  SoundAlchemist.view.home.validateUrl(input.val());
};

SoundAlchemist.view.home.onUrlBlur = function(ev) {
  var input = $(ev.target);
  if (input.val() === "") {
    input.val(Session.get('home:defaultUrl'));
  }
  SoundAlchemist.view.home.validateUrl(input.val());
};

SoundAlchemist.view.home.onPaste = function(ev) {
  if (window.clipboardData && window.clipboardData.getData) { // IE
      pastedText = window.clipboardData.getData('Text');
  } else if (ev.clipboardData && ev.clipboardData.getData) {
      pastedText = ev.clipboardData.getData('text/plain');
  }

  if (SoundAlchemist.view.home.validateUrl(pastedText)) {
      Session.set('home:url', pastedText);
  }
};

/////////////////// Start Journey Button //////////////////////
SoundAlchemist.view.home.onStartClick = function(ev) {
  var input = $(ev.target);
  SoundAlchemist.view.home.registerUrlAndStartJourney();
};


//////////////////////// home Template def ////////////////////

Template.home.defaultUrl = function() {
  return Session.get('home:defaultUrl');
};

Template.home.pending = function() {
  return Session.get('home:pending');
};

Template.home.notReady = function() {
  return !Session.get('home:ready') || Session.get('home:badUrl');
};

Template.home.badUrl = function() {
  return Session.get('home:badUrl');
};

Template.home.events = {
  'keydown #soundcloud-url': SoundAlchemist.view.home.onUrlKeydown,
  'paste #soundcloud-url': SoundAlchemist.view.home.onPaste,
  'focusout #soundcloud-url': SoundAlchemist.view.home.onUrlBlur,
  'click #soundcloud-url': SoundAlchemist.view.home.onUrlClick,
  'click #start-journey': SoundAlchemist.view.home.onStartClick
};

Session.set('home:pending', false);
Session.set('home:ready', true);
Session.set('home:badUrl', false);
