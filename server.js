require('dotenv').config(); 
const config = require('./config/config');
const express = require('express');
const request = require('request');
const cors = require('cors');
const app = express();
const port = config.port;
app.use(cors());

app.use('/', function(req, res) {
  //Take the baseurl from your api and also supply whatever 
  //route you use with that url
  let url =  config.apiUrl + req.url;
  let query = config.assignKey(req.query);
  console.log("base url PROXY::",url,query);
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