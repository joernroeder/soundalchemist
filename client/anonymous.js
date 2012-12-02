(function() {
  Meteor.loginAnonymously = function(fn) {
    Accounts.callLoginMethod({methodArguments: [{anonymous: true}]}, fn);
  };
})();

Meteor.startup(function () {
  if (!Meteor.userId()) {
    Meteor.loginAnonymously(function () {
      if (Session.get('page') === SoundAlchemist.view.HOME && Meteor.user().profile.lastUrl) {
        _SA.Router.navigate(Meteor.user().profile.lastUrl, {trigger: true});
      }
    });
  } else {
    if (Session.get('page') === SoundAlchemist.view.HOME) {
      Meteor.autorun(function () {
        if (!Meteor.loggingIn()) {
          if (Meteor.user().profile.lastUrl) {
            _SA.Router.navigate(Meteor.user().profile.lastUrl, {trigger: true});
          }
        }
      });
    }
  }
});
