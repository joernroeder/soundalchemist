(function() {
  Meteor.loginAnonymously = function(fn) {
    Accounts.callLoginMethod({methodArguments: [{anonymous: true}]}, fn);
  };
})();

Meteor.startup(function () {
  if (!Meteor.userId())
    Meteor.loginAnonymously();
});
