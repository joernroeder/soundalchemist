state = {
  trail: [],
  current: 'soundcloud.com/max-cooper/max-cooper-panacea-glade',
  recommendations: []
};

computeRecommendations = function () {
  state.recommendations = [
    {url: 'http://soundcloud.com/ajukaja/jam-3-by-ajukaja-andrevski',
      rank: 100},
    {url: 'http://soundcloud.com/therapistudio/therapist-a-study-in-departure',
     rank: 70},
    {url: 'http://soundcloud.com/elliegoulding/ellie-goulding-high-for-this',
     rank: 60}
  ];
};
