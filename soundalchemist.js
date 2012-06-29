// indexes:
// > db.tracks.ensureIndex({trackId: 1})
// > db["room-track"].ensureIndex({roomId: 1, trackId: 1, weight: 1})

/// TASKS:/
// + autoturntheknob by looking at total weight of graph addition or something (find good sample example with a really popular one?)
// + +1 or -1'ing doesnt immediately repsond if some are waiting

// + "store current place in playing"
// + automatically go to next track!!! BUT FADE!!!
//   - different between +1, skip, -1

// - make "+1" even faster!
// - "return to lobby"
// - "publish room"

// [ask david!] why didn't replace-by-id work? i needed to memoize room
// - skip should be VERY fast
// - "spectrum"
// - somehow ensure not stopping something playing while it's playing... (how???)
// - support no http://
// - kick you out of a room that doens't exist? (why wouldn't they exist)

var Data = {
  tracks: new Meteor.Collection("tracks"),
  rooms: new Meteor.Collection("rooms"),
  "room-track": new Meteor.Collection("room-track")
};

Meteor.methods({
  add: function(roomId, url, weight) {
    if (this.is_simulation) {
      Session.set('processing', true);
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
      Session.set('processing', true);
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

      // milliseconds since epoch
      var ts = (new Date()).getTime();
      Data["room-track"].insert(
        {url: Data.tracks.findOne({trackId: trackId}).trackInfo.permalink_url,
         roomId: roomId, trackId: trackId, weight: weight, when: ts,
         who: this.userId(), whoName: Meteor.users.findOne(this.userId()).name});
      console.log('room-track inserted');
    }

    console.log("done adding");
  },

  loadTrack: function(trackId) {
    if (!this.is_simulation) {
      console.log('loading track', trackId);
      this.unblock();
      if (!Data.tracks.findOne({trackId: trackId})) {
        loadTrack(trackId);
      }
      console.log('done loading track', trackId);
    }
  }
});

var loadTrack = function(trackId) {
  // xcxc mark it as loading-in-progress immediately.
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
      this.navigate(Data.rooms.insert({_: 0, owner: Meteor.user()._id}), true);
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

  Template.recentActivity.list = function() {
    return Data["room-track"].find({weight: 1}, {sort: {when: -1}});
  };

  Template.room.events = {
    'click #back-to-lobby': function() {
      Router.navigate('', true);
    },
    'click #newroom': function() {
      Router.newRoom();
    }
  };

  var add = function() {
    var url = $('#url').val();

    if (!url)
      return;

    if (url.indexOf('http://') === -1)
      url = 'http://' + url;

    Meteor.call("add", Session.get("roomId"), url, 1, function() {
      Session.set('processing', false);
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

  var memoizedRooms = {};
  var getRoom = function() {
    var roomId = Session.get('roomId');
    if (!memoizedRooms[roomId]) {
      var room = Data.rooms.findOne(roomId);
      if (room)
        memoizedRooms[roomId] = room;
    }

    return memoizedRooms[roomId];
  };

  Template.processing.processing = function() {
    return Session.get('processing');
  };

  Template.room.roomName = function() {
    return greg(Session.get('roomId'));
  };

  Template["raw-source-track"].roomName = function() {
    return greg(this.roomId);
  };

  Template.sources.list = function() {
    var room = getRoom();
    return Data["room-track"].find({url: {$ne: null}, roomId: Session.get('roomId')},
                                   {sort: {when: 1}});
  };

  Template.recommendations.list = function() {
    var room = getRoom();
    console.log(new Date().toString(), 'start recommendations', room);
    if (!room)
      return [];

    var results = {};
    var roomTracks = Data["room-track"].find({roomId: Session.get('roomId')});

    console.log(new Date().toString(), 'computed roomTracks');

    roomTracks.forEach(function(roomTrack) {
      var track = Data.tracks.findOne({trackId: roomTrack.trackId});
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

    console.log(new Date().toString(), 'about to do array manipulation');

    var resultsArray = _.map(results, function(value, key) {
      return [key, value];
    });
    var sortedResultsArray = _.sortBy(resultsArray, function(kv) {
      return kv[1].rank * -1 /*descending*/;
    });

    console.log(new Date().toString(), 'about to filter');

    // xcxc fetch earlier instead of rewinding here
    roomTracks.rewind();
    var fetchedRoomTracks = roomTracks.fetch();

    var results = [];
    _.find(sortedResultsArray, function(kv) {
      var matchTrackId = parseInt(kv[0], 10);
      if (!_.find(fetchedRoomTracks, function(roomTrack) {
        return roomTrack.roomId === Session.get("roomId") &&
          roomTrack.trackId === matchTrackId;
      })) {
        results.push(kv);
        if (results.length === 3)
          return true;
      };
      return false;
    });

    return _.map(results, function(kv) {
      var trackId = parseInt(kv[0], 10);
      Meteor.call('loadTrack', trackId, function() { Session.set('loaded-' + trackId, true); });
      return {
        trackId: trackId,
        spectrum: kv[1].spectrum,
        rank: kv[1].rank
      };
    });
  };

  Template['source-track'].weightDescriptor = function() {
    if (this.weight === 1)
      return "leaned towards ";
    else if (this.weight === -1)
      return "leaned away from ";
    else
      return "passed by ";
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
    'click .skip': function() {
      Meteor.call('addById', Session.get("roomId"), this.trackId, 0,
                  function() { Session.set('processing', false); });
    }
  };

  Template['recommendation-track'].spectrum = function() {
    return JSON.stringify(this.spectrum);
  };

  Template.voting.events = {
    'click .upvote': function() {
      Meteor.call('addById', Session.get("roomId"), this.trackId, 1,
                  function() { Session.set('processing', false); });
    },
    'click .downvote': function() {
      Meteor.call('addById', Session.get("roomId"), this.trackId, -1,
                  function() { Session.set('processing', false); });
    }
  };

  Template.voting.loaded = function() {
    return Session.get('loaded-' + this.trackId);
  };
/*
  Template['source-track'].url = function() {
    var track = Data.tracks.findOne({trackId: this.trackId});
    return track && track.trackInfo && track.trackInfo.permalink_url;
  };
*/
  Template.track.escapedUrl = function() {
    return escape('http://api.soundcloud.com/tracks/' + this.trackId);
  };

  Template.track.playerId = function() {
//    debugger;
    console.log('playerId called', this.trackId, Data.tracks.findOne({trackId: this.trackId}));
//    console.log('xcxc playerid', this);
    return 'player-' + this.trackId;
  };
}

if (Meteor.is_server) {
  Meteor.publish("lobby", function() {
    return Data["room-track"].find({weight: 1}, {sort: {when: -1}, limit: 12});
  });

  Meteor.publish("room1", function(roomId) {
    return Data["room-track"].find({roomId: roomId}, {sort: {when: 1}});
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
  Meteor.subscribe("lobby");

  Meteor.autosubscribe(function() {
    console.log(Session.get("roomId"));
    Meteor.subscribe("room2", Session.get("roomId"));
    Meteor.subscribe("tracks", Session.get("roomId"));
    Meteor.subscribe("room1", Session.get("roomId"));
  });
}

