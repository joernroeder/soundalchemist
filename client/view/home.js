if (typeof SoundAlchemist == "undefined") SoundAlchemist = {};
if (typeof SoundAlchemist.view == "undefined") SoundAlchemist.view = {};

SoundAlchemist.view.HOME = 'home';
SoundAlchemist.view.home = function() {
  Session.set('page', SoundAlchemist.view.HOME);
};

// Passengers, buckle up!
SoundAlchemist.view.home.startJourney = function() {
  var url = Session.get('startJourney:url');
  if (!url) {
    return;
  }

  // TODO(gregp): getTrackData on register?
  var pointId = Session.get('startJourney:pointId');
  console.log('Starting journey from ' + pointId + ' at ' + url);
  _SA.Router.navigate('at/' + pointId, {trigger: true});
};


// Validate the url and set it to the session
SoundAlchemist.view.home.maybeRegisterUrl = function(url) {
  // TODO(gregp): url validation -- don't set if invalid
  Session.set('startJourney:url', url);
  Session.set('startJourney:ready', false);
  Session.set('startJourney:pending', true);

  // Get a head start on the recommendations
  getTrackData(url, function(data) {
    Meteor.call("loadTrackRec", data.id, function() {
      // TODO(gregp): this is not a valid trail...
      var pointId = _SA.Points.insert({
        trail: [
          {soundcloud: {
            id: data.id,
            url: url}}
        ]});

      // TODO(gregp): can Meteor set multiple session variables at once?
      Session.set('startJourney:pointId', pointId);
      Session.set('startJourney:pending', false);
      Session.set('startJourney:ready', true);
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
    input.val(Session.get('startJourney:defaultUrl'));
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
  input.val(Session.get('startJourney:defaultUrl'));
};

/////////////////// Start Journey Button //////////////////////
SoundAlchemist.view.home.onStartClick = function(ev) {
  SoundAlchemist.view.home.startJourney();
};


//////////////////////// home Template def ////////////////////

Template.home.defaultUrl = function() {
  return Session.get('startJourney:defaultUrl');
};

Template.home.pending = function() {
  return Session.get('startJourney:pending');
};

Template.home.notReady = function() {
  return !Session.get('startJourney:ready');
};

Template.home.events = {
  'keydown #soundcloud-url': SoundAlchemist.view.home.onUrlKeydown,
  'focusout #soundcloud-url': SoundAlchemist.view.home.onUrlBlur,
  'click #soundcloud-url': SoundAlchemist.view.home.onUrlClick,

  'click #start-journey': SoundAlchemist.view.home.onStartClick
};

Session.set('startJourney:pending', false);
Session.set('startJourney:ready', false);
