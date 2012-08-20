if (typeof _SA == "undefined") _SA = {};
_SA.PointRecs = _SA.PointRecs || new Meteor.Collection(null);
_SA.Tracks = _SA.Tracks || new Meteor.Collection(null);

Meteor.autosubscribe(function () {
  Meteor.subscribe('trackRec', Session.get("player:trackId"));
});

var _registerTrackData = function(result, opt_callback) {
  var trackData = result.data;
  var id = trackData.id;
  trackData.lastUpdate = +new Date();

  // console.log('DEBUG: inserting track data for ' + id, trackData);
  _SA.Tracks.insert(trackData);

  Session.set('tracks:imageUrl+' + id,
    trackData.artwork_url ||
    (trackData.user && trackData.user.avatar_url) ||
    Template.soundcloudImg.DEFAULT_URL);
  Session.set('tracks:url+' + id,
    trackData.permalink_url);

  opt_callback && opt_callback(null, id);
};

var _soundcloudApiUrl = function(meat) {
  return "http://api.soundcloud.com/" + meat +
    "&client_id=17a48e602c9a59c5a713b456b60fea68";
};

var getTrackDataById = function(soundcloudId, opt_callback) {
  Meteor.http.get(
    _soundcloudApiUrl("tracks/" + soundcloudId + ".json?"),
    function (error, result) {
      if (error) {
        opt_callback && opt_callback(error);
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

var setTrackId = function(trackId) {
  if (trackId != Session.get('player:trackId')) {
    Session.set('player:trackId', trackId);

    // disorient(); // indicate that we don't know the next points yet
    Session.set('player:onwardPoint', null);
    Session.set('player:outwardPoint', null);
    Meteor.call('makeTrackRec', trackId, orient);

    registerWidgetListeners();
  }
};

var orient = function() {
  var pointId = Session.get('point:id');
  var trackId = Session.get('player:trackId');
  var point = _SA.Points.findOne({pointId: pointId});

  var onwardId = makePoint(point, trackId, 1);
  var outwardId = makePoint(point, trackId, -1);

  Session.set('player:onwardPoint', onwardId);
  Session.set('player:outwardPoint', outwardId);
};

var registerWidgetListeners = function() {
  // Make sure the dom is rendered
  Meteor.flush();
  var potentialWidgetEl = $('#playa').get(0);
  if (!potentialWidgetEl) {
    console.warn('couldn\'t find soundcloud player');
    return;
  } else {
    console.log('found soundcloud player', potentialWidgetEl);
  }

  var widget = SC.Widget(potentialWidgetEl);
  // widget.unbind(SC.Widget.Events.PAUSE);
  widget.bind(SC.Widget.Events.PAUSE, doPause);
  console.log('bound PAUSE', widget);

  widget.unbind(SC.Widget.Events.FINISH);
  widget.bind(SC.Widget.Events.FINISH, doAutoPlay);
  console.log('bound FINISH', widget);
};

var doPause = function() {
  console.log('DEBUG: doing pause...');
};

var doAutoPlay = function() {
  console.log('DEBUG: doing auto play...');
  var trackId = Session.get('player:trackId');
  var pointId = Session.get("point:id");
  var pointRec = _SA.PointRecs.findOne({pointId: pointId});

  var nextTrackId = getNextTrack(pointRec, trackId);
  setTrackId(nextTrackId);
};
