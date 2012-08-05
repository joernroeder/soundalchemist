Template.controls.events = {
  'click .onward': function (ev) {
    ev.preventDefault();
    var nowPlaying = Session.get('player:trackId');
    SoundAlchemist.view.point.blaze(nowPlaying, 1);
  },

  'click .outward': function (ev) {
    ev.preventDefault();
    var nowPlaying = Session.get('player:trackId');
    SoundAlchemist.view.point.blaze(nowPlaying, -1);
  }
};
