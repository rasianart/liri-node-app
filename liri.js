var keys = require('./public/javascript/keys.js');
var twitter = require('twitter');
var spotify = require('spotify');
var request = require('request');
var moment = require('moment');
var fs = require('fs');


var client = new twitter({
  consumer_key: keys.twitterKeys.consumer_key,
  consumer_secret: keys.twitterKeys.consumer_secret,
  access_token_key: keys.twitterKeys.access_token_key,
  access_token_secret: keys.twitterKeys.access_token_secret
});

var combineQuery = '';
var dateAccessed = moment().format('MMMM Do YYYY, h:mm:ss a');

function combineArg() {
	var queryArr = process.argv;
	for (var i = 3; i < queryArr.length; i++) {
		combineQuery += queryArr[i] + ' ';
	}
}

function myTweets() {
	var params = { screen_name: 'Rasianart', count: 20 };
	client.get('statuses/user_timeline', params, function(error, tweets, response) {
	    if (!error) {
	  	var tweetArr = [];
		  	for (var i = 0; i < 4; i++){
		  		tweetArr.push(tweets[i].text);
		  		tweetArr.push(tweets[i].created_at);  
		  	}
	    } else {
	    	console.log(error);
	    }
	    var dataObj = tweetArr.reduce(function(o, v, i) {
		  o[i] = v;
		  return o;
		}, {});
		logData(dateAccessed + JSON.stringify(dataObj));
		printData(dataObj);
	});
}

function mySpotify() {
	function searchSpotify(search, defaultIndex) {
		spotify.search({ type: 'track', query: search }, function(error, data) {
		    if (error) {
		    	console.log(error);
		    	return;
		    } else if (combineQuery === '') {
		    	console.log("You forgot to enter a song to search!  It's OK, I'll forgive you. Here's some Ace of Base")
		    	searchSpotify('The Sign', 6);
		    	combineQuery = '.'   
		        return; 
		    } 
		    else if (!data.tracks.items[0]) {
		    	console.log("This track does not exist.  Instead, take some Ace of Base!");
		        searchSpotify('The Sign', 6);   
		        return; 
		    }
			var dataObj = {
				Artist_Name: data.tracks.items[defaultIndex].artists[0].name,
				Track_Name: data.tracks.items[defaultIndex].name,
				Preview_URL: data.tracks.items[defaultIndex].preview_url,
				Album_Name: data.tracks.items[defaultIndex].album.name
			};
			logData(dateAccessed + JSON.stringify(dataObj));
			printData(dataObj);
		});
	}
	searchSpotify(combineQuery, 0);
}

function myOMDB() {
	function searchOMDB(search) {
		request("http://www.omdbapi.com/?t=" + search + "&y=&plot=short&r=json", function(error, response, body) {
			if (combineQuery === '') {
		  		console.log("You forgot to enter a movie!  It's OK, I'll forgive you. Here's Mr. Nobody");
			    searchOMDB('Mr.+Nobody');
			    combineQuery = '.'   
			    return; 
		  	} else if (!error && response.statusCode === 200) {
				var data = JSON.parse(body);
				var dataObj = {
					Title: data.Title,
					Year: data.Year,
					ImdbRating: data.imdbRating,
					Country: data.Country,
					Language: data.Language,
					Plot: data.Plot,
					Actors: data.Actors
				};
				logData(dateAccessed + JSON.stringify(dataObj));
				printData(dataObj);
			}
		});
	}
	searchOMDB(combineQuery);
}

function doWhatItSays() {
	var doIt = '';
	fs.readFile('./public/random.txt', 'utf8', function(error, data) {
		var dataArr = data.split(',');
		var dataCommand = dataArr[0];
		combineQuery = dataArr[1];
		runLiri(dataCommand);
	});
}

function logData(log) {
	fs.appendFile('./public/log.txt', log, function(error, data) {
	});
}

function printData(object) {
	for(var propName in object) {
	    propValue = object[propName];
	    console.log(propName + ": ", propValue);
	}
}

function runLiri(method) {
	combineArg();
	if(method === 'my-tweets') {
		myTweets();
	} else if (method === 'spotify-this-song') {
		mySpotify();
	} else if (method === 'movie-this') {
		myOMDB();
	} else if (method === 'do-what-it-says') {
		doWhatItSays();
	}
}

runLiri(process.argv[2]);



