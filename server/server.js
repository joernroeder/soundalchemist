
Meteor.publish("point", function (pointId) {
  return Points.find({pointId: pointId});
});

Meteor.publish("trackRec", function (trackId) {
  return TrackRecs.find({trackId: trackId});
});

Meteor.methods({
  loadTrackRec: function (trackId) {
    if (!TrackRecs.findOne({trackId: trackId})){
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
      var relativity = {};

      var futures = _.map(favoriters, function(favoriter) {
        //    console.log('parsing ' + favoriter.username);
        var favoriterId = favoriter.id;
        var future = new Future();
        var onGetFavorites = future.resolver();

        Meteor.http.get(
          "http://api.soundcloud.com/users/" + favoriterId +
            "/favorites.json" +
            "?limit=200" +
            "&duration[from]=1200000" +
            "&client_id=17a48e602c9a59c5a713b456b60fea68", function(error, result) {
              var favoriteTracks = result.data;
              _.each(favoriteTracks, function(track) {
                if (!relativity[track.id])
                  relativity[track.id] = 0;
                relativity[track.id]++;
              });

              onGetFavorites();
            });

        return future;
      });

      Future.wait(futures);
      var trackRec = {
        trackId: trackId,
        relativity: relativity,
        lastUpdate: +new Date()
      };
      TrackRecs.insert(trackRec);
      console.log('track inserted', trackRec);
    }
  }
});
