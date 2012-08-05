if (typeof SoundAlchemist == "undefined") SoundAlchemist = {};
if (typeof SoundAlchemist.view == "undefined") SoundAlchemist.view = {};

SoundAlchemist.view.HOME = 'home';
SoundAlchemist.view.home = function() {
  Session.set('page', SoundAlchemist.view.HOME);
  console.warn('welcome home');
};

Template.home.events = {
  'click #start-journey': function () {
    var url = $('#soundcloud-url').val();
    // TODO(gregp): open source vsn of http://daringfireball.net/2010/07/improved_regex_for_matching_urls
    getTrackData(url, function(data) {
      Meteor.call("loadTrackRec", data.id, function () {
        console.log('loadTrackRec done!');
        var pointId = Points.insert({trail: [{soundcloud: {id: data.id, url: url}}]});
        SoundAlchemistRouter.navigate('at/' + pointId, {trigger: true});
      });
    });
  }
};
