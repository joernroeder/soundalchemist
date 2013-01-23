// Super ghetto routing
Template.main.isHome = function() {
  return Session.get('page') == SoundAlchemist.view.HOME;
};
Template.main.isPoint = function() {
  return Session.get('page') == SoundAlchemist.view.POINT;
};

Template.main.getClass = function () {
	return 'is-' + Session.get('page');
};

Backbone.history.start({pushState: true});
