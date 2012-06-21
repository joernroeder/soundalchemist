// indexes:
// > db.tracks.ensureIndex({trackId: 1})
// > db["room-track"].ensureIndex({roomId: 1, trackId: 1, weight: 1})

/// NEW DESIGN:
// only one recommendation?
//   +1, pass, -1
// show trail
// ...xcxc


/// TASKS:
// *** DATA FLICKER PROBLEM!!!
// + skip should be VERY fast
// + "spectrum"
// + "skip all"
// + "return to lobby"
// + "publish room"
// - somehow ensure not stopping something playing while it's playing... (how???)
// - support no http://
// - kick you out of a room that doens't exist? (why wouldn't they exist)
// - autoturntheknob by looking at total weight of graph addition or something

var Data = {
  tracks: new Meteor.Collection("tracks"),
  rooms: new Meteor.Collection("rooms"),
  "room-track": new Meteor.Collection("room-track")
};

Meteor.methods({
  add: function(roomId, url, weight) {
    if (this.is_simulation) {
      Data.rooms.update(roomId, {$set: {processing: true}});
      return;
    };

    var trackId = Meteor.http.get(
      "http://api.soundcloud.com/resolve.json?url=" + url +
        "&client_id=17a48e602c9a59c5a713b456b60fea68").data.id;

    console.log('tid', trackId);

    Meteor.call("addById", roomId, trackId, weight);
  },

  addById: function(roomId, trackId, weight) {
    if (this.is_simulation) {
      Data.rooms.update(roomId, {$set: {processing: true}});
      return;
    };

    if (!roomId)
      throw new Meteor.Error("roomId must be set");

    var roomTrack = Data["room-track"].findOne({roomId: roomId,
                                                trackId: trackId});
    if (!roomTrack) {
      if (!Data.tracks.findOne({trackId: trackId}) && weight !== 0) {
        loadTrack(trackId);
      }

      // minutes since epoch
      var ts = Math.floor((new Date()).getTime() / 1000 / 60);
      Data["room-track"].insert(
        {roomId: roomId, trackId: trackId, weight: weight, when: ts});
      console.log('room-track inserted');
    }

    Data.rooms.update(roomId, {$unset: {processing: 1}});
    console.log("done adding");
  }
});

var loadTrack = function(trackId) {
  var trackInfo = Meteor.http.get(
    "http://api.soundcloud.com/tracks/" + trackId +
      ".json?client_id=17a48e602c9a59c5a713b456b60fea68").data;

  // xcxc offsets
  var favoriters = Meteor.http.get(
    "http://api.soundcloud.com/tracks/" + trackId +
      "/favoriters.json" +
      "?limit=200" +
      "&client_id=17a48e602c9a59c5a713b456b60fea68").data;

  // xcxc better term?
  var influence = {};

  var futures = _.map(favoriters, function(favoriter) {
//    console.log('parsing ' + favoriter.username);
    var favoriterId = favoriter.id;
    var future = new Future;

    Meteor.http.get(
      "http://api.soundcloud.com/users/" + favoriterId +
        "/favorites.json" +
        "?limit=200" +
        "&duration[from]=1200000" +
        "&client_id=17a48e602c9a59c5a713b456b60fea68", function(error, result) {
          var favoriteTracks = result.data;
          _.each(favoriteTracks, function(track) {
            if (!influence[track.id])
              influence[track.id] = 0;
            influence[track.id]++;
          });

          future.resolver()();
        });

    return future;
  });

  Future.wait(futures);
  Data.tracks.insert({trackId: trackId, influence: influence, trackInfo: trackInfo});
  console.log('track inserted');
};


if (Meteor.is_client) {
  SoundalchemistRouter = Backbone.Router.extend({
    routes: {
      "": "lobby",
      ":roomId": "room"
    },
    lobby: function() {
      Session.set("roomId", null);
    },
    room: function(roomId) {
      Session.set("roomId", roomId);
    },
    newRoom: function() {
      this.navigate(Data.rooms.insert({_: 0}));
    }
  });

  Router = new SoundalchemistRouter();

  Meteor.startup(function () {
    Backbone.history.start({pushState: true});
  });

  Template.main.isLobby = function() {
    return !Session.get("roomId");
  };

  Template.lobby.events = {
    'click #newroom': function() {
      Router.newRoom();
    }
  };

  var add = function() {
    Meteor.call("add", Session.get("roomId"), $('#url').val(), 1);
    $('#url').val('');
  };
  Template.sources.events = {
    'click #add': add,
    'keyup #url': function(event) {
      if (event.keyCode === 13)
        add();
    }
  };

  var getRoom = function() {
    return Data.rooms.findOne(Session.get('roomId'));
  };

  Template.processing.processing = function() {
    var room = getRoom();
    return room && room.processing;
  };

  Template.sources.list = function() {
    var room = getRoom();
    return Data["room-track"].find({roomId: Session.get('roomId'),
                                    weight: {$ne: 0}},
                                   {sort: {when: 1}});
  };

  Template.recommendations.list = function() {
    var room = getRoom();
    console.log('xcxc4', room);
    if (!room)
      return [];

    var results = {};
    console.log('xcxc2');
    Data["room-track"].find({roomId: Session.get('roomId')}).forEach(function(roomTrack) {
      var track = Data.tracks.findOne({trackId: roomTrack.trackId});
      console.log('xcxc', track);
      if (!track)
        return;

      var weight = roomTrack.weight;
      _.each(track.influence, function(count, trackId) {
        if (!results[trackId])
          results[trackId] = {rank: 0, spectrum: {}};
        results[trackId].rank += count * weight;

        if (!results[trackId].spectrum[roomTrack.trackId])
          results[trackId].spectrum[roomTrack.trackId] = 0;
        results[trackId].spectrum[roomTrack.trackId] += count * weight;
      });
    });

    var resultsArray = _.map(results, function(value, key) {
      return [key, value];
    });
    var sortedResultsArray = _.sortBy(resultsArray, function(kv) {
      return kv[1].rank * -1 /*descending*/;
    });
    var filteredSortedResultsArray = _.reject(
      sortedResultsArray, function(kv) {
        return Data["room-track"].findOne({roomId: Session.get("roomId"),
                                           trackId: parseInt(kv[0], 10)});
      });

    return _.map(_.first(filteredSortedResultsArray, 30), function(kv) {
      return {
        trackId: parseInt(kv[0], 10),
        spectrum: kv[1].spectrum,
        rank: kv[1].rank
      };
    });
  };

  Template['source-track'].events = {
    //xcxc redo all these
    'click .change_weight': function() {
      Data["room-track"].update({roomId: Session.get("roomId"), trackId: this.trackId},
                                {$set: {weight: prompt('weight')}});
    },
    'click .unmake-source': function() {
      Data["room-track"].remove({roomId: Session.get("roomId"),
                                 trackId: this.trackId});
    }
  };

  Template['recommendation-track'].events = {
    'click .upvote': function() {
      Meteor.call('addById', Session.get("roomId"), this.trackId, 1);
    },
    'click .downvote': function() {
      Meteor.call('addById', Session.get("roomId"), this.trackId, -1);
    },
    'click .skip': function() {
      Meteor.call('addById', Session.get("roomId"), this.trackId, 0);
    }
  };

  Template['recommendation-track'].spectrum = function() {
    return JSON.stringify(this.spectrum);
  };

  Template['source-track'].url = function() {
    var track = Data.tracks.findOne({trackId: this.trackId});
    return track && track.trackInfo && track.trackInfo.permalink_url;
  };

  Template.track.escapedUrl = function() {
    return escape('http://api.soundcloud.com/tracks/' + this.trackId);
  };

  Template.track.playerId = function() {
    return 'player-' + escape(this.url);
  };
}

if (Meteor.is_server) {
  Meteor.publish("room1", function(roomId) {
    return Data["room-track"].find({roomId: roomId}, {$sort: {when: 1}});
  });

  Meteor.publish("room2", function(roomId) {
    console.log("room2", roomId);
    var res = Data.rooms.find({_id: roomId});
    return res;
  });

  Meteor.publish("tracks", function(roomId) {
    var self = this;
    console.log(roomId);
    var room = Data.rooms.findOne(roomId);
    if (room) {
      var roomTracksCursor = Data["room-track"].find({roomId: roomId});

      // do a reactive join

      var subhandles = {};

      var roomTracks = {};
      var firstTimePolling = true;

      console.log('about to observe');

      var observe_handle = roomTracksCursor.observe({
        added: function (obj) {
          console.log('otid', obj.trackId);
          var result = Data.tracks.findOne({trackId: obj.trackId});
          console.log('result', result && result._id);
          if (result) {
            self.set('tracks', result._id, result);
            self.flush();
          } else {
            console.log("weird, couldn't find track ", JSON.stringify(obj));
          }
        },
        changed: function (obj, old_idx, old_obj) {
          // xcxc nothing?
        },
        removed: function (old_obj, old_idx) {
          self.unset('tracks', old_obj._id, _.keys(old_obj));
          self.flush();
        }
      });

      // observe only returns after the initial added callbacks have
      // run.  mark subscription as completed.
      self.complete();
      self.flush();

      // register stop callback (expects lambda w/ no args).
      self.onStop(_.bind(observe_handle.stop, observe_handle));

    } else {
      // don't publish anything
    }
  });
} else {
  Meteor.autosubscribe(function() {
    console.log(Session.get("roomId"));
    Meteor.subscribe("room1", Session.get("roomId"));
    Meteor.subscribe("room2", Session.get("roomId"));
    Meteor.subscribe("tracks", Session.get("roomId"));
  });
}

