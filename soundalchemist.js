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
          if (!Data.scUsers.findOne({url: favoriter.uri})) {
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
  // XCXC how do i subscribe to the appropriate scTracks? (and remove autopublish)

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

  var sources = function() {
    return Data.sources.find({sessionId: sessionId});
  };

  Template.sources.list = function() {
    return sources();
  };

  Template.recommendations.list = function() {
    var sourceUrls = sources().map(function(source) { return source.url; });
    var scTracks = Data.scTracks.find({url: {$in: sourceUrls}});

    var userFactors = {};
    scTracks.forEach(function(scTrack) {
      _.each(scTrack.favoriters, function(favoriter) {
        if (!userFactors[favoriter.id])
          userFactors[favoriter.id] = 0;
        userFactors[favoriter.id] += 1; // xcxc KNOB!
      });
    });

    var result = {};
    _.each(userFactors, function(factor, userId) {
      var scUser = Data.scUsers.findOne({id: parseInt(userId, 10)});
      if (scUser) {
        _.each(scUser.favorites, function(favorite) {
          if (!result[favorite.permalink_url])
            result[favorite.permalink_url] = 0;
          result[favorite.permalink_url] += factor;
        });
      } else {
//        return [{url: '', rank: 'Not loaded yet'}];
        // not all users are loaded
      }
    });

    // xcxc session -> room

    var resultsArray = _.map(result, function(value, key) {
      return [key, value];
    });
    var sortedResultsArray = _.sortBy(resultsArray, function(kv) {
      return kv[1] * -1 /*descending*/;
    });

    return _.map(_.first(sortedResultsArray, 15), function(kv) {
      return {
        url: kv[0],
        rank: kv[1]
      };
    });
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

