if (typeof _SA == "undefined") _SA = {};
if (typeof _SA.MOCK == "undefined") _SA.MOCK = {};

_SA.MOCK.SOUNDCLOUD_URLS = [
  "http://soundcloud.com/outlook-on-music-oom/oom-1-happa",
  "http://soundcloud.com/shigeto/shigeto-live-lincoln-hall-7-10",
  "http://soundcloud.com/kelpe/kelpe-sonic-router-mix-128",
  "http://soundcloud.com/platform/br-92-blawan",
  "http://soundcloud.com/r-srecords/airhead-pyramid-lake",
  "http://soundcloud.com/therapistudio/therapist-a-study-in-departure",
  "http://soundcloud.com/four-tet/four-tet-moma",
  "http://soundcloud.com/therapistudio/therapist-ephemeral-patterns",
  "http://soundcloud.com/sukhush/the-kundalini-has-shifted",
  "http://soundcloud.com/djfadamusic/dj-set-psy-chill-inner-light",
  "http://soundcloud.com/magical-sunrises/magical-sunrises-psychillmix",
  "http://soundcloud.com/m-nus/minus-connections-june-10",
  "http://soundcloud.com/four-tet/burial-four-tet-nova",
  "http://soundcloud.com/m-nus/minus-connections-february-11",
  "http://soundcloud.com/aeroplane/aeroplane-february-2012-mix",
  "http://soundcloud.com/aeroplane/aeroplane-april-2012-mix",
  "http://soundcloud.com/aeroplane/aeroplane-may-2012-mix",
  "http://soundcloud.com/aeroplane/aeroplane-march-2012-mix"
  ];

_SA.MOCK.DEFAULT_URL = _SA.MOCK.SOUNDCLOUD_URLS[
  Math.floor(Math.random() * _SA.MOCK.SOUNDCLOUD_URLS.length)
];
Session.set('home:defaultUrl', _SA.MOCK.DEFAULT_URL);
SoundAlchemist.view.home.maybeRegisterUrl(_SA.MOCK.DEFAULT_URL);

_SA.MOCK.RECOMMENDATIONS =  _.map(_SA.MOCK.SOUNDCLOUD_URLS, function(href) {
  return {url: href, rank: Math.random() * 100};
});
Session.set('point:recommendations', _SA.MOCK.RECOMMENDATIONS);
