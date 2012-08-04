
if (Meteor.is_client) {
  Template.recommendations.list = function () {
    return state.recommendations;
  };
}
