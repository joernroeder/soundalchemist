

Template.outwards.title = function () {
	return "Outwards";
};

Template.outwards.list = function () {
	var pointId = Session.get("point:id"),
		point = _SA.Points.findOne({
			pointId		: pointId
		}),
		trail = (point && point.trail) || [],
		result = [];

	for (var i in trail) {
		if (trail[i].weight < 0) {
			result.push(trail[i]);
		}
	}	

	return result;
};

Template.outwards.events = {
	'click img': function () {
		setTrackId(this.trackId);
	}
};
