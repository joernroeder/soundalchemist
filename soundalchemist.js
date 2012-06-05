var Data = {
  sources: new Meteor.Collection("sources")
};

if (Meteor.is_client) {
  var sessionId = null;

  if (window.location.pathname !== '/') {
    var path = window.location.pathname.substring(1);
    if (isNaN(parseInt(path)))
      window.location.pathname = '/';
    else
      sessionId = parseInt(path);
  }
  if (!sessionId) {
    sessionId = Math.floor(Math.random() * 1000000);
    window.location.pathname = sessionId;
  }

  Meteor.subscribe("sources", sessionId);

  var add = function() {
    Data.sources.insert({
      sessionId: sessionId,
      url: $('#url').val()
    });
    $('#url').val('');
  };
  Template.sources.events = {
    'click #add': add,
    'keyup #url': function(event) {
      if (event.keyCode === 13)
        add();
    }
  };

  Template.sources.list = function() {
    return Data.sources.find();
  };

  Template.recommendations.list = function() {
    // XCXC RECOMMENDATION ENGINE!!!
  };

  Template.track.escapedUrl = function() {
    return escape(this.url);
  };

  Template.track.playerId = function() {
    return 'player-' + escape(this.url);
  };
}

if (Meteor.is_server) {
  Meteor.publish("sources", function(sessionId) {
    return Data.sources.find({sessionId: sessionId});
  });

  Meteor.startup(function () {
    // code to run on server at startup
  });
}