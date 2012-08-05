if (typeof _SA == "undefined") _SA = {};
_SA.PointRecs = _SA.PointRecs || new Meteor.Collection(null);

_SA.Tracks = new Meteor.Collection(null);


Meteor.autosubscribe(function () {
  Meteor.subscribe('point', Session.get("point:id"));
});

Meteor.autosubscribe(function () {
  Meteor.subscribe('pointByTrackId', Session.get("home:trackId"));
});

var _registerTrackData = function(result, opt_callback) {
  var trackData = result.data;
  var id = trackData.id;
  trackData.lastUpdate = +new Date();

  // console.log('DEBUG: inserting track data for ' + id, trackData);
  _SA.Tracks.insert(trackData);
  // TODO(gregp): why does ^^ not work?

  Session.set('tracks:imageUrl+' + id,
    trackData.artwork_url || Template.soundcloudImg.DEFAULT_URL);
  Session.set('tracks:url+' + id,
    trackData.permalink_url);

  opt_callback && opt_callback(id);
};

var _soundcloudApiUrl = function(meat) {
  return "http://api.soundcloud.com/" + meat +
    "&client_id=17a48e602c9a59c5a713b456b60fea68";
};

var getTrackData = function(soundcloudId, opt_callback) {
  Meteor.http.get(
    _soundcloudApiUrl("tracks/" + soundcloudId + ".json?"),
    function (error, result) {
      if (error) {
        throw error;
      } else {
        _registerTrackData(result, opt_callback);
      }
    });
};

var getTrackDataFromUrl = function(soundcloudUrl, opt_callback) {
  Meteor.http.get(
    _soundcloudApiUrl("resolve.json?url=" + soundcloudUrl),
    function (error, result) {
      if (error) {
        throw error;
      } else {
        _registerTrackData(result, opt_callback);
      }
    });
};
