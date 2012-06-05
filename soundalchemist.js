var Data = {
  sources: new Meteor.Collection("sources"),
  scTracks: new Meteor.Collection("scTracks"),
  scUsers: new Meteor.Collection("scUsers")
};

Meteor.methods({
  add: function(sessionId, url) {
    Data.sources.insert({
      sessionId: sessionId,
      url: url
    });

    if (!this.is_simulation) {
      // xcxc re-load if X minutes have passed?
      if (!Data.scTracks.findOne({url: url})) {
        var data = JSON.parse(Meteor.http.get(
          "http://api.soundcloud.com/resolve.json?url=" + url +
            "&client_id=17a48e602c9a59c5a713b456b60fea68").content);

        // xcxc offsets
        var favoriters = JSON.parse(Meteor.http.get(
          "http://api.soundcloud.com/tracks/" + data.id +
            "/favoriters.json" +
            "?limit=200" +
            "&client_id=17a48e602c9a59c5a713b456b60fea68").content);

        Data.scTracks.insert({
          url: url,
          data: data,
          favoriters: favoriters
        });

        _.each(favoriters, function(favoriter) {
          // xcxc re-load if X minutes have passed?
          if (!Data.scUsers.findOne({url: favoriter.permalink_url})) {
            var favorites = JSON.parse(Meteor.http.get(
              "http://api.soundcloud.com/users/" + favoriter.id +
                "/favorites.json" +
                "?limit=200" +
                "&duration[from]=1200000" +
                "&client_id=17a48e602c9a59c5a713b456b60fea68").content);

            Data.scUsers.insert({
              id: favoriter.id,
              url: favoriter.permalink_url,
              favorites: favorites
            });
          }
        });
      }
    }
  }
});

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
  // XCXC how do i subscribe to the appropriate scTracks?

  var add = function() {
    Meteor.call("add", sessionId, $('#url').val());
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
    return Data.sources.find({sessionId: sessionId});
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
  _.each(['sources', 'scTracks'], function(collection) {
    _.each(['insert', 'update', 'remove'], function(method) {
      Meteor.default_server.method_handlers['/' + collection + '/' + method] = function() {};
    });
  });

  Meteor.publish("sources", function(sessionId) {
    return Data.sources.find({sessionId: sessionId});
  });

  Meteor.publish("scTracks", function(trackIds) {
    return Data.scTracks.find({trackId: {$in: trackIds}});
  });
}

