Points = new Meteor.Collection("points");

TrackRecs = new Meteor.Collection("trackRecs");
console.log('DEBUG: resetting TrackRecs db...');
TrackRecs.remove({});

if (Meteor.is_client) {
  var computeRecommendations = function () {
    var results = {};
    var point = Points.findOne(Session.get("pointId"));
    if (!point)
      return;

    _.each(point.trail, function (trailPoint) {
      var weight = trailPoint.weight;
      var trackRec = TrackRecs.findOne({trackId: trailPoint.soundcloud.id});
      _.each(trackRec.relativity, function(count, trackId) {
        if (!results[trackId])
          results[trackId] = {rank: 0, url: trackRec.soundcloud.url};
        results[trackId].rank += count * weight;
      });
    });

    var resultsArray = _.map(results, function(value, key) {
      return [key, value];
    });
    var sortedResultsArray = _.sortBy(resultsArray, function(kv) {
      return kv[1].rank * -1;
    });
    Session.set('recommendations', _.map(sortedResultsArray, function(kv) {
      return {url: kv[1].url, rank: kv[1].rank};
    }));
  };

  Meteor.autosubscribe(function () {
    Meteor.subscribe("point", Session.get("pointId"));
  });

  Meteor.autosubscribe(function () {
    var point = Points.findOne(Session.get("pointId"));
    if (!point)
      return;

    var pending = 0;
    _.each(point.trail, function (trailPoint) {
      pending++;
      Meteor.subscribe("trackRec", trailPoint.soundcloud.id, function () {
        pending--;
        if (!pending) {
          computeRecommendations();
        }
      });
    });
  });



  Session.set('recommendations', [
    {url: 'http://soundcloud.com/ajukaja/jam-3-by-ajukaja-andrevski',
      rank: 100},
    {url: 'http://soundcloud.com/therapistudio/therapist-a-study-in-departure',
     rank: 70},
    {url: 'http://soundcloud.com/elliegoulding/ellie-goulding-high-for-this',
     rank: 60},
    {url: "http://soundcloud.com/therapistudio/therapist-a-study-in-departure",
      rank: 65},
    {url: "http://soundcloud.com/four-tet/four-tet-moma",
      rank: 21},
    {url: "http://soundcloud.com/therapistudio/therapist-ephemeral-patterns",
      rank: 91},
    {url: "http://soundcloud.com/sukhush/the-kundalini-has-shifted",
      rank: 49},
    {url: "http://soundcloud.com/djfadamusic/dj-set-psy-chill-inner-light",
      rank: 64},
    {url: "http://soundcloud.com/magical-sunrises/magical-sunrises-psychillmix",
      rank: 51},
    {url: "http://soundcloud.com/m-nus/minus-connections-june-10",
      rank: 7},
    {url: "http://soundcloud.com/four-tet/burial-four-tet-nova",
      rank: 92},
    {url: "http://soundcloud.com/m-nus/minus-connections-february-11",
      rank: 52},
    {url: "http://soundcloud.com/aeroplane/aeroplane-february-2012-mix",
      rank: 27}
  ]);
}

