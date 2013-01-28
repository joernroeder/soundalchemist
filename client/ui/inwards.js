

Template.inwards.title = function () {
	return "Inwards";
};

Template.inwards.list = function () {
	var pointId = Session.get("point:id"),
		point = _SA.Points.findOne({
			pointId		: pointId
		}),
		trail = (point && point.trail) || [],
		result = [];

	for (var i in trail) {
		if (trail[i].weight > 0) {
			result.push(trail[i]);
		}
	}	

	return result;
};

Template.inwards.events = {
	'click img': function () {
		setTrackId(this.trackId);
	}
};
