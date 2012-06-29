// Generate a Greg sentence
greg = function sentence(string) {
  if (!string)
    return '...';

  var iter = 0;

    function randomItem(array) {
      var number = string.charCodeAt(iter) * 7;
      iter++;
      number += string.charCodeAt(iter) * 13;
      iter++;
      number += string.charCodeAt(iter) * 19;
      iter++;
      number += string.charCodeAt(iter) * 23;
      iter++;

      number %= array.length;

      return array[number];
    }

    var adjective   = randomItem(exports.adjectives),
        noun        = randomItem(exports.nouns),
        verb        = randomItem(exports.verbs),
        adverb      = randomItem(exports.adverbs);

    return [adjective, noun, verb/*, adverb*/].join(" ");
};

exports = {};

// English adjectives
exports.adjectives = [
    "cute", "dapper", "large", "small", "long", "short", "thick", "narrow",
    "deep", "flat", "whole", "low", "high", "near", "far", "fast",
    "quick", "slow", "early", "late", "bright", "dark", "cloudy", "warm",
    "cool", "cold", "windy", "noisy", "loud", "quiet", "dry", "clear",
    "hard", "soft", "heavy", "light", "strong", "weak", "tidy", "clean",
    "dirty", "empty", "full", "close", "thirsty", "hungry", "fat", "old",
    "fresh", "dead", "healthy", "sweet", "sour", "bitter", "salty", "good",
    "bad", "great", "important", "useful", "expensive", "cheap", "free", "difficult",
    "strong", "weak", "able", "free", "rich", "afraid", "brave", "fine",
    "sad", "proud", "comfortable", "happy", "clever", "interesting", "famous", "exciting",
    "funny", "kind", "polite", "fair", "share", "busy", "free", "lazy",
    "lucky", "careful", "safe", "dangerous"
];

// English plural nouns (all animals)
exports.nouns = [
    "rabbits", "badgers", "foxes", "chickens", "bats", "deer", "snakes", "hares",
    "hedgehogs", "platypuses", "moles", "mice", "otters", "rats", "squirrels", "stoats",
    "weasels", "crows", "doves", "ducks", "geese", "hawks", "herons", "kingfishers",
    "owls", "peafowl", "pheasants", "pigeons", "robins", "rooks", "sparrows", "starlings",
    "swans", "ants", "bees", "butterflies", "dragonflies", "flies", "moths", "spiders",
    "pikes", "salmons", "trouts", "frogs", "newts", "toads", "crabs", "lobsters",
    "clams", "cockles", "mussles", "oysters", "snails", "cattle", "dogs", "donkeys",
    "goats", "horses", "pigs", "sheep", "ferrets", "gerbils", "guinea pigs", "parrots",
    "greg"
];

// English verbs, past tense
exports.verbs = [
    "sang", "played", "knitted", "floundered", "danced", "played", "listened", "ran",
    "talked", "cuddled", "sat", "kissed", "hugged", "whimpered", "hid", "fought",
    "whispered", "cried", "snuggled", "walked", "drove", "loitered", "whimpered", "felt",
    "jumped", "hopped", "went", "married", "engaged", 
];

// English adverbs
exports.adverbs = [
    "jovially", "merrily", "cordially", "easily"
];