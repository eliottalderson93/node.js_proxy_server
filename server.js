require('dotenv').config();
var timestamp = require('internet-timestamp');
const config = require('./config/config');
const express = require('express');
const request = require('request');
const cors = require('cors');
const app = express();
const port = config.port;
app.use(cors());
app.get('/favicon.ico', (req, res) => res.status(204));
app.use('/', function (req, res) {
    //this route either gives all crypto-currency prices in past 1d, 7d, 30d, 365d (default)
    //or gives all crypto currency prices between two utc dates that are given in the first two url variables
    //Take the baseurl from your api and also supply whatever 
    //route you use with that url
    let url = config.apiUrl;  //https://api.nomics.com/v1
    var interval = false;
    var begin;
    var end;
    var urlVars;
    console.log("req.url: ",req.url)
    if (req.url.length > 1) { //request contains url variables
        interval = true;
        urlVars = req.url.split('/'); //split each url variable up
    }
    //so far I only account for the first two url variables in a request to this proxy server 
    //because thats all that matters for my purposes in requesting the Nomics API
    if (interval) {
        var beginValidate = parseInt(urlVars[1]); //these parameters are integer UTC dates
        var endValidate = parseInt(urlVars[2]);
        if (paramCheck(beginValidate) && paramCheck(endValidate)) { //both are ints under parseInt() native check, not necessarily valid UTC dates
            begin = new Date(beginValidate);
            end = new Date(endValidate);
            if (isValidDate(begin) && isValidDate(end)) { //validate date Objects
                begin = URIesc(begin);
                end = URIesc(end);
                url += "/currencies/interval?key=";
                url += config.apiKeyValue;
                url += "&start=";
                url += begin;
                url += "&end=";
                url += end;
            }
            else { //invalid date object -> build default url
                url = defaultUrl(config.apiUrl, config.apiKeyValue);
            }
        }
        else { //invalid parameters -> build default url
            url = defaultUrl(config.apiUrl, config.apiKeyValue);
        }
    }
    else { //default url route -> all currencies in past 1d, 7d, 30d, 365d
        url = defaultUrl(config.apiUrl, config.apiKeyValue);
    }
    let query = config.assignKey(req.query);
    console.log("base url PROXY::", url, query);
    //Pipe is through request, this will just redirect 
    //everything from the api to your own server at localhost. 
    //It will also pipe your queries in the url
    req.pipe(request({ qs: query , uri: url })).pipe(res);
});
//Start the server by listening on a port
app.listen(port, () => {
  console.log("+---------------------------------------+");
  console.log("|                                       |");
  console.log(`|  [\x1b[34mSERVER\x1b[37m] Listening on port: \x1b[36m${port} 🤖  \x1b[37m |`);
  console.log("|                                       |");
  console.log("\x1b[37m+---------------------------------------+");
});
function URIesc(timeStamp) { //translates date objects to strings RFC3339 format with URI escaped characters: ready for Nomics API
    let output = timestamp(timeStamp).replace(/:\s*/g, "%3A").substring(0, 23).concat("Z");
    //replace : with %3A.
    //the timestamp is too exact so cut off unnecessary bits with substring
    //the format requires Z at the end
    return output
}
function paramCheck(dateIntUTC) {
    if (dateIntUTC == NaN) {
        return false;
    }
    else {
        return true
    }
}
function isValidDate(d) {
    return d instanceof Date && !isNaN(d);
}
function defaultUrl(base,apiKey) {
    base += "/currencies/ticker?key=";
    base += apiKey;
    return base;
}