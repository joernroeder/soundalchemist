Template.player.escapedUrl = function () {
  Meteor.call("prepareTrack", this.url); // xcxc should enable the buttons when done
  if (Session.get('player-trackId'))
    return escape('http://api.soundcloud.com/tracks/' + Session.get('player-trackId'));
  else
    return ''; // xcxc ???
};
