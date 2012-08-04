if (typeof SoundAlchemist == "undefined") SoundAlchemist = {};
if (typeof SoundAlchemist.view == "undefined") SoundAlchemist.view = {};

SoundAlchemist.view.HOME = 'home';
SoundAlchemist.view.home = function() {
  Session.set('page', SoundAlchemist.view.HOME);
  console.warn('welcome home');
};
