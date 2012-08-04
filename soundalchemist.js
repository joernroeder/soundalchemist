state = {
  trail: [],
  current: 'http://soundcloud.com/max-cooper/max-cooper-panacea-glade',
  recommendations: []
};


FAKE_RECOMMENDATIONS = [
  {url: 'http://soundcloud.com/ajukaja/jam-3-by-ajukaja-andrevski',
    rank: 100},
  {url: 'http://soundcloud.com/therapistudio/therapist-a-study-in-departure',
   rank: 70},
  {url: 'http://soundcloud.com/elliegoulding/ellie-goulding-high-for-this',
   rank: 60},
  {url: "http://soundcloud.com/therapistudio/therapist-a-study-in-departure",
    rank: 65},
  {url: "http://soundalchemist.meteor.com/a42dbb37-8a0c-4680-853c-0a961f824ab0",
    rank: 97},
  {url: "http://soundcloud.com/four-tet/four-tet-moma",
    rank: 21},
  {url: "http://soundalchemist.meteor.com/15464b44-ed15-4fe9-a584-e694b7e44276",
    rank: 61},
  {url: "http://soundcloud.com/therapistudio/therapist-ephemeral-patterns",
    rank: 91},
  {url: "http://soundalchemist.meteor.com/a42dbb37-8a0c-4680-853c-0a961f824ab0",
    rank: 50},
  {url: "http://soundcloud.com/sukhush/the-kundalini-has-shifted",
    rank: 49},
  {url: "http://soundalchemist.meteor.com/a42dbb37-8a0c-4680-853c-0a961f824ab0",
    rank: 44},
  {url: "http://soundcloud.com/djfadamusic/dj-set-psy-chill-inner-light",
    rank: 64},
  {url: "http://soundalchemist.meteor.com/a42dbb37-8a0c-4680-853c-0a961f824ab0",
    rank: 95},
  {url: "http://soundcloud.com/magical-sunrises/magical-sunrises-psychillmix",
    rank: 51},
  {url: "http://soundalchemist.meteor.com/a42dbb37-8a0c-4680-853c-0a961f824ab0",
    rank: 81},
  {url: "http://soundcloud.com/m-nus/minus-connections-june-10",
    rank: 7},
  {url: "http://soundalchemist.meteor.com/ebdd5c74-a40c-4beb-a6f5-0d73f63b9648",
    rank: 4},
  {url: "http://soundcloud.com/four-tet/burial-four-tet-nova",
    rank: 92},
  {url: "http://soundalchemist.meteor.com/2259ad72-bd6c-4dbc-bc90-64f3e48861c9",
    rank: 47},
  {url: "http://soundcloud.com/m-nus/minus-connections-february-11",
    rank: 52},
  {url: "http://soundalchemist.meteor.com/ebdd5c74-a40c-4beb-a6f5-0d73f63b9648",
    rank: 2},
  {url: "http://soundcloud.com/aeroplane/aeroplane-february-2012-mix",
    rank: 27}
];


computeRecommendations = function () {
  state.recommendations = FAKE_RECOMMENDATIONS;
};

computeRecommendations();

/// ^^^ REPLACE ALL ABOVE WITH REALITY LATER ^^^

if (Meteor.is_client) {
  Template.recommendations.list = function () {
    return state.recommendations;
  };
}