let keys = require('./public/javascript/keys.js');
let twitter = require('twitter');
let spotify = require('spotify');
let request = require('request');
let moment = require('moment');
let fs = require('fs');


let client = new twitter({
    consumer_key: keys.twitterKeys.consumer_key,
    consumer_secret: keys.twitterKeys.consumer_secret,
    access_token_key: keys.twitterKeys.access_token_key,
    access_token_secret: keys.twitterKeys.access_token_secret
});

let combineQuery = '';

let combineArg = () => {
    let queryArr = process.argv;
    for (let i = 3; i < queryArr.length; i++) {
        combineQuery += queryArr[i] + ' ';
    }
}

let myTweets = () => {
    let params = { screen_name: 'Rasianart', count: 20 };
    client.get('statuses/user_timeline', params, let = (error, tweets, response) => {
    	let tweetArr = [];
        if (!error) {
            for (let i = 0; i < 4; i++) {
                tweetArr.push(tweets[i].text);
                tweetArr.push(tweets[i].created_at);
            }
        } else {
            console.log(error);
        }
        let dataObj = tweetArr.reduce(let = (o, v, i) => {
        	if (i%2===0) {
        		i = "Tweet " + (i/2+1);
        	} else {
        		i = "Date Posted " + (i/2+.5);
        	}
            o[i] = v;
            return o;
        }, {});
        logData(JSON.stringify(dataObj));
        printData(dataObj);
    });
}

let searchSpotify = (search, defaultIndex) => {
    spotify.search({ type: 'track', query: search }, let = (error, data) => {
        if (error) {
            console.log(error);
            return;
        } else if (combineQuery === '') {
            console.log("You forgot to enter a song to search!  It's OK, I'll forgive you. Here's some Ace of Base")
            searchSpotify('The Sign', 6);
            combineQuery = '.'
            return;
        } else if (!data.tracks.items[0]) {
            console.log("This track does not exist.  Instead, take some Ace of Base!");
            searchSpotify('The Sign', 6);
            return;
        }
        let dataObj = {
            Artist_Name: data.tracks.items[defaultIndex].artists[0].name,
            Track_Name: data.tracks.items[defaultIndex].name,
            Preview_URL: data.tracks.items[defaultIndex].preview_url,
            Album_Name: data.tracks.items[defaultIndex].album.name
        };
        logData(JSON.stringify(dataObj));
        printData(dataObj);
    });
}

let searchOMDB = (search) => {
    request("http://www.omdbapi.com/?t=" + search + "&y=&plot=short&tomatoes=true&r=json", let = (error, response, body) => {
        if (combineQuery === '') {
            console.log("You forgot to enter a movie!  It's OK, I'll forgive you. Here's Mr. Nobody");
            searchOMDB('Mr.+Nobody');
            combineQuery = '.'
            return;
        } else if (!error && response.statusCode === 200) {
            let data = JSON.parse(body);
            let dataObj = {
                Title: data.Title,
                Year: data.Year,
                ImdbRating: data.imdbRating,
                Country: data.Country,
                Language: data.Language,
                Plot: data.Plot,
                Actors: data.Actors,
                Rotten_Tomatoes_Rating: data.tomatoRating,
                Rotten_Tomatoes_URL: data.tomatoURL
            };
            logData(JSON.stringify(dataObj));
            printData(dataObj);
        }
    });
}

let doWhatItSays = () => {
    let doIt = '';
    fs.readFile('./public/random.txt', 'utf8', let = (error, data) => {
        let dataArr = data.split(',');
        let dataCommand = dataArr[0];
        combineQuery = dataArr[1];
        runLiri(dataCommand);
    });
}

let logData = (log) => {
    fs.appendFile('./public/log.txt', moment().format('MMMM Do YYYY, h:mm:ss a') + log, let = (error, data) => {});
}

let printData = (object) => {
    for (let propName in object) {
        propValue = object[propName];
        console.log(propName + ": ", propValue);
    }
}

let runLiri = (method) => {
    combineArg();
    if (method === 'my-tweets') {
        myTweets();
    } else if (method === 'spotify-this-song') {
        searchSpotify(combineQuery, 0);
    } else if (method === 'movie-this') {
        searchOMDB(combineQuery);
    } else if (method === 'do-what-it-says') {
        doWhatItSays();
    }
}

runLiri(process.argv[2]);
