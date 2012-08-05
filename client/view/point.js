if (typeof SoundAlchemist == "undefined") SoundAlchemist = {};
if (typeof SoundAlchemist.view == "undefined") SoundAlchemist.view = {};

SoundAlchemist.view.POINT = 'point';
SoundAlchemist.view.point = function(pt) {
  Session.set('point:id', pt);
  Session.set('page', SoundAlchemist.view.POINT);

  Meteor.autosubscribe(SoundAlchemist.view.point.isotopeInit);
};


SoundAlchemist.view.point.isotopeInit = function() {
  Session.get('point:recommendations');
  var pointId = Session.get('point:id');
  if(Session.get('point:recommendationsOK+' + pointId)) {
    console.log("DEBUG: initializing isotope.");
    // Initialize isotope
    // - with experimental masonry gutterWidth setting:
    //   http://masonry.desandro.com/demos/gutters.html
    //   http://isotope.metafizzy.co/custom-layout-modes/masonry-gutters.html
    $('.recommendations').isotope({
      animationOptions: {
        duration: 750,
        easing: 'linear',
        queue: false
      },
      masonry: {
        columnWidth: 110,
        gutterWidth: 10
      },
      animationEngine: 'jquery' // TODO(gregp): use css3 transitions
    });
  } else {
    // debugger;
  }
};

