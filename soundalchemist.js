if (typeof _SA == "undefined") _SA = {};

_SA.Points = _SA.Points || new Meteor.Collection("Points");
// console.log('DEBUG: resetting Points db...');
// _SA.Points.remove({});

_SA.TrackRecs = _SA.TrackRecs || new Meteor.Collection("TrackRecs");
// CAUTION: THIS IS EXPENSIVE TO REBUILD!
// /*
// console.log('DEBUG: resetting TrackRecs db...');
// _SA.TrackRecs.remove({});
// */

// TODO(gregp): put this better...
var goog_string_getRandomString = function() {
  var x = 2147483648;
  return Math.floor(Math.random() * x).toString(36) +
    Math.abs(Math.floor(Math.random() * x) ^ (+new Date())).toString(36);
};
