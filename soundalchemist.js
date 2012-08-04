state = {
  trail: [
    {url: 'http://soundcloud.com/ajukaja/jam-3-by-ajukaja-andrevski',
     vote: 1
    },
    {url: 'http://soundcloud.com/therapistudio/therapist-a-study-in-departure',
     vote: -1
    }
  ],
  current: {
    url: 'http://soundcloud.com/max-cooper/max-cooper-panacea-glade',
    trackId: 41120385
  },
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
  {url: "http://soundcloud.com/four-tet/four-tet-moma",
    rank: 21},
  {url: "http://soundcloud.com/therapistudio/therapist-ephemeral-patterns",
    rank: 91},
  {url: "http://soundcloud.com/sukhush/the-kundalini-has-shifted",
    rank: 49},
  {url: "http://soundcloud.com/djfadamusic/dj-set-psy-chill-inner-light",
    rank: 64},
  {url: "http://soundcloud.com/magical-sunrises/magical-sunrises-psychillmix",
    rank: 51},
  {url: "http://soundcloud.com/m-nus/minus-connections-june-10",
    rank: 7},
  {url: "http://soundcloud.com/four-tet/burial-four-tet-nova",
    rank: 92},
  {url: "http://soundcloud.com/m-nus/minus-connections-february-11",
    rank: 52},
  {url: "http://soundcloud.com/aeroplane/aeroplane-february-2012-mix",
    rank: 27}
];


computeRecommendations = function () {
  state.recommendations = FAKE_RECOMMENDATIONS;
};

computeRecommendations();

/// ^^^ REPLACE ALL ABOVE WITH REALITY LATER ^^^

if (Meteor.is_client) {
  Template.trail.list = state.trail;

  Template.player.escapedUrl = function () {
    return escape('http://api.soundcloud.com/tracks/' + state.current.trackId);
  };
}