if (typeof SoundAlchemist == "undefined") SoundAlchemist = {};
SoundAlchemist.Router = Backbone.Router.extend({
  routes: {
    "": "default",
    "at/:point": "point"
  },

  // default -- Show home page.
  default: function() {
    SoundAlchemist.view.home();
  },
  point: function(point) {
    SoundAlchemist.view.point(point);
  }
});

Router = new SoundAlchemist.Router();
