// xcxc Status for adding new track

var Data = {
  sources: new Meteor.Collection("sources"),
  scTracks: new Meteor.Collection("scTracks"),
  scUsers: new Meteor.Collection("scUsers")
};

Meteor.methods({
  add: function(sessionId, url) {

    this.unblock();

      // xcxc re-load if X minutes have passed?
    if (!Data.scTracks.findOne({url: url})) {

      if (!this.is_simulation) {
        var data = JSON.parse(Meteor.http.get(
          "http://api.soundcloud.com/resolve.json?url=" + url +
            "&client_id=17a48e602c9a59c5a713b456b60fea68").content);

        Data.sources.insert({
          sessionId: sessionId,
          url: url,
          weight: 1,
          id: data.id
        });

        // xcxc offsets
        var favoriters = JSON.parse(Meteor.http.get(
          "http://api.soundcloud.com/tracks/" + data.id +
            "/favoriters.json" +
            "?limit=200" +
            "&client_id=17a48e602c9a59c5a713b456b60fea68").content);

        Data.scTracks.insert({
          url: url,
          data: data,
          favoriterIds: _.map(favoriters, function(favoriter) {
            return favoriter.id;
          })
        });

        var futures = [];

        _.each(favoriters, function(favoriter) {
          console.log('parsing ' + favoriter.username);
          var favoriterId = favoriter.id;
          // xcxc re-load if X minutes have passed?
          if (!Data.scUsers.findOne({id: favoriterId})) {
            var future = new Future;
            futures.push(future);

            Meteor.http.get(
              "http://api.soundcloud.com/users/" + favoriterId +
                "/favorites.json" +
                "?limit=200" +
                "&duration[from]=1200000" +
                "&client_id=17a48e602c9a59c5a713b456b60fea68", function(error, result) {
                  var favorites = result.data;
                  Data.scUsers.insert({
                    id: favoriterId,
                    url: favoriter.permalink_url,
                    favoriteTracks: _.map(favorites, function(favorite) {
                      return {url: favorite.permalink_url, id: favorite.id};
                    })
                  });

                  future.resolver()();
                });

          }
        });

        Future.wait(futures);
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
      var weight = Data.sources.findOne({url: scTrack.url, sessionId: sessionId}).weight;
      _.each(scTrack.favoriterIds, function(favoriterId) {
        if (!userFactors[favoriterId])
          userFactors[favoriterId] = {rank: 0, spectrum: {}};
        userFactors[favoriterId].rank += weight;

        if (!userFactors[favoriterId].spectrum[scTrack.url])
          userFactors[favoriterId].spectrum[scTrack.url] = 0;
        userFactors[favoriterId].spectrum[scTrack.url] += weight;
      });
    });

    var result = {};
    _.each(userFactors, function(factor, userId) {
      var scUser = Data.scUsers.findOne({id: parseInt(userId, 10)});
      if (scUser) {
        _.each(scUser.favoriteTracks, function(track) {
          var favoriteUrl = track.url;
          if (!result[favoriteUrl])
            result[favoriteUrl] = {rank: 0, spectrum: {}, id: track.id};
          result[favoriteUrl].rank += factor.rank;

          _.each(userFactors[userId].spectrum, function(val, url) {
            if (!result[favoriteUrl].spectrum[url])
              result[favoriteUrl].spectrum[url] = 0;
            result[favoriteUrl].spectrum[url] += val;
          });
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
      return kv[1].rank * -1 /*descending*/;
    });

    sortedResultsArray = _.filter(sortedResultsArray, function(kv) {
      var url = kv[0];
      return !Data.sources.findOne({url: url, sessionId: sessionId});
    });

    return _.map(_.first(sortedResultsArray, 12), function(kv) {
      return {
        url: kv[0],
        id: kv[1].id,
        rank: kv[1].rank,
        spectrum: kv[1].spectrum
      };
    });
  };

  Template['source-track'].events = {
    'click .up': function() {
      Data.sources.update(this._id, {$inc: {weight: 1}});
    },
    'click .down': function() {
      Data.sources.update(this._id, {$inc: {weight: -1}});
    },
    'click .unmake-source': function() {
      Data.sources.remove(this._id);
    }
  };

  Template['recommendation-track'].events = {
    'click .make-source': function() {
      Meteor.call('add', sessionId, this.url);
    }
  };

  Template['recommendation-track'].spectrum = function() {
    return JSON.stringify(this.spectrum);
  };

  Template.track.escapedUrl = function() {
    return escape('http://api.soundcloud.com/tracks/' + this.id);
  };

  Template.track.playerId = function() {
    return 'player-' + escape(this.url);
  };
}

if (Meteor.is_server) {
  _.each(['sources', 'scTracks'], function(collection) {
    _.each(['insert', 'update', 'remove'], function(method) {
//xcxc      Meteor.default_server.method_handlers['/' + collection + '/' + method] = function() {};
    });
  });

  Meteor.publish("sources", function(sessionId) {
    return Data.sources.find({sessionId: sessionId});
  });

  Meteor.publish("scTracks", function(trackIds) {
    return Data.scTracks.find({trackId: {$in: trackIds}});
  });
}

