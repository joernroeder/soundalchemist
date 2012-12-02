if (typeof _SA == "undefined") _SA = {};
if (typeof SoundAlchemist == "undefined") SoundAlchemist = {};

SoundAlchemist.Router = Backbone.Router.extend({
  routes: {
    "": "default",
    "at/:point": "point",
    "at/:point/": "point",
    "at/:point/to/:track": "pointTrack",
    "at/:point/to/:track/": "pointTrack"
  },

  // default -- Show home page.
  default: function() {
    SoundAlchemist.view.home();
  },
  point: function(point) {
    SoundAlchemist.view.point(point);
  },
  pointTrack: function(point, track) {
    SoundAlchemist.view.pointTrack(point, track);
  }
});

_SA.Router = new SoundAlchemist.Router();
