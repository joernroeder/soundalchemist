Template.controls.noOnward = function() {
  var onwardPt = Session.get('player:onwardPoint');
  return !onwardPt;
};

Template.controls.noOutward = function() {
  var outwardPt = Session.get('player:outwardPoint');
  return !outwardPt;
};

Template.controls.ready = function () {
  return Session.get('player:outwardPoint') !== null;
};

// TODO(avitalo) - we currently don't use these at all.
Template.controls.onwardHref = function() {
  var onwardPt = Session.get('player:onwardPoint');
  if(onwardPt) {
    return "/at/" + onwardPt;
  } else {
    return "#";
  }
};

Template.controls.outwardHref = function() {
  var outwardPt = Session.get('player:outwardPoint');
  if(outwardPt) {
    return "/at/" + outwardPt;
  } else {
    return "#";
  }
};


Template.controls.events = {
  'click .inwards-button': function (ev) {
    ev.preventDefault();
    setPointId(Session.get('player:onwardPoint'));
  },

  'click .outwards-button': function (ev) {
    ev.preventDefault();
    setPointId(Session.get('player:outwardPoint'));
  }
};
