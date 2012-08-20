Template.controls.noOnward = function() {
  var onwardPt = Session.get('player:onwardPoint');
  return !onwardPt;
};

Template.controls.noOutward = function() {
  var outwardPt = Session.get('player:outwardPoint');
  return !outwardPt;
};

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
  'click .onward': function (ev) {
    ev.preventDefault();
    if ($(ev.target).hasClass('disabled')) {
      console.log('NOAP');
    } else {
      setPointId(Session.get('player:onwardPoint'));
    }
  },

  'click .outward': function (ev) {
    ev.preventDefault();
    if ($(ev.target).hasClass('disabled')) {
      console.log('NOAP');
    } else {
      setPointId(Session.get('player:outwardPoint'));
    }
  }
};
