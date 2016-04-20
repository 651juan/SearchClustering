// Stop Words
var stopwords = ["a", "about", "above", "above", "across", "after", "afterwards", "again", "against", "all", "almost", "alone", "along", "already", "also","although","always","am","among", "amongst", "amoungst", "amount",  "an", "and", "another", "any","anyhow","anyone","anything","anyway", "anywhere", "are", "around", "as",  "at", "back","be","became", "because","become","becomes", "becoming", "been", "before", "beforehand", "behind", "being", "below", "beside", "besides", "between", "beyond", "bill", "both", "bottom","but", "by", "call", "can", "cannot", "cant", "co", "con", "could", "couldnt", "cry", "de", "describe", "detail", "do", "done", "down", "due", "during", "each", "eg", "eight", "either", "eleven","else", "elsewhere", "empty", "enough", "etc", "even", "ever", "every", "everyone", "everything", "everywhere", "except", "few", "fifteen", "fify", "fill", "find", "fire", "first", "five", "for", "former", "formerly", "forty", "found", "four", "from", "front", "full", "further", "get", "give", "go", "had", "has", "hasnt", "have", "he", "hence", "her", "here", "hereafter", "hereby", "herein", "hereupon", "hers", "herself", "him", "himself", "his", "how", "however", "hundred", "ie", "if", "in", "inc", "indeed", "interest", "into", "is", "it", "its", "itself", "keep", "last", "latter", "latterly", "least", "less", "ltd", "made", "many", "may", "me", "meanwhile", "might", "mill", "mine", "more", "moreover", "most", "mostly", "move", "much", "must", "my", "myself", "name", "namely", "neither", "never", "nevertheless", "next", "nine", "no", "nobody", "none", "noone", "nor", "not", "nothing", "now", "nowhere", "of", "off", "often", "on", "once", "one", "only", "onto", "or", "other", "others", "otherwise", "our", "ours", "ourselves", "out", "over", "own","part", "per", "perhaps", "please", "put", "rather", "re", "same", "see", "seem", "seemed", "seeming", "seems", "serious", "several", "she", "should", "show", "side", "since", "sincere", "six", "sixty", "so", "some", "somehow", "someone", "something", "sometime", "sometimes", "somewhere", "still", "such", "system", "take", "ten", "than", "that", "the", "their", "them", "themselves", "then", "thence", "there", "thereafter", "thereby", "therefore", "therein", "thereupon", "these", "they", "thickv", "thin", "third", "this", "those", "though", "three", "through", "throughout", "thru", "thus", "to", "together", "too", "top", "toward", "towards", "twelve", "twenty", "two", "un", "under", "until", "up", "upon", "us", "very", "via", "was", "we", "well", "were", "what", "whatever", "when", "whence", "whenever", "where", "whereafter", "whereas", "whereby", "wherein", "whereupon", "wherever", "whether", "which", "while", "whither", "who", "whoever", "whole", "whom", "whose", "why", "will", "with", "within", "without", "would", "yet", "you", "your", "yours", "yourself", "yourselves", "the"];

var urlStopwords = ["http", "https", "www", "com", "co", "org", "net", "html", "htm", "php", "aspx"];

var testDataSubjects = ["polaroid", "kangaroo", "shakira", "kawasaki", "yellow", "strongman", "hud", "fandango", "dsl", "bausch", "pizza", "snake", "queen", "cerberus", "equinox", "marble", "apple", "veracruz", "virgo", "neptune", "judas", "boomerang", "hoover", "nickelodeon", "steam", "atom", "lakota", "ghost", "apartment", "chase", "mannequin", "pods", "aetna", "mustang", "eros", "noggin", "hedonism", "shockwave", "apache", "magic", "bald_eagle", "bermuda_triangle", "monte_carlo", "iron_man", "sherlock_holmes", "trojan_horse", "poison_ivy", "ten_commandments", "flight_93", "ice_age", "zero_hour", "full_moon", "fort_recovery", "soul_food", "mighty_mouse", "jurassic_park", "indiana_university", "heron_island", "match_point", "texas_rangers", "brett_butler", "courtney_cox", "jungle_fever", "blood_work", "harry_potter", "guild_wars", "john_carroll", "black_planet", "century_21", "coyote_ugly", "mortal_kombat", "silent_hill", "stone_cold", "independence_day", "lemonade_stand", "aurora_borealis", "agent_orange", "babel_fish", "far_cry", "carrot_top", "the_last_supper", "romeo_and_juliet", "medal_of_honor", "arch_of_triumph", "dead_or_alive", "man_in_black", "heaven_and_hell", "stand_by_me", "prince_of_persia", "billy_the_kid", "dog_eat_dog", "sense_and_sensibility", "soldier_of_fortune", "one_tree_hill", "sisters_of_mercy", "beauty_and_the_beast", "lord_of_the_flies", "battle_of_the_bulge", "the_da_vinci_code", "the_wizard_of_oz"];

//var testDataSubjects = ["polaroid"];

// Get features which appear in more than one document of the cluster
var extractClusterFeatures = function(cluster) {
	var featureList = {};
	
	// Fill feature list with words found in the documents of the cluster
	cluster.documents.forEach(function(doc) {
		for (var word in doc.data) {
			if (doc.data[word] > 0) {
				if (featureList[word]) {
					//featureList[word] += doc.data[word];
					featureList[word].count++;
				} else {
					featureList[word] = {
						count: 1,
						word: doc.originalReference[word]
					};
				}
			}
		};
	});
	
	// Remove feature if it only appears in one document
	for (var word in featureList) {
		if (featureList[word].count == 1 || !featureList[word].word) {
			delete featureList[word];
		}
	}
	
	return featureList;
};