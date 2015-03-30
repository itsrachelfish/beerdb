var redis = require('redis');
var mysql = require('mysql');
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var session = require('express-session');
var RedisStore = require('connect-redis')(session);

var login = require("./login/sdk/server/wetfish-login");
var config = require("./config.js");

login.init(config.login);

server.listen(3000);
console.log("BeerDB server started");

var model =
{
    redis: redis.createClient()
};

// Use the existing connection for session data
app.use(session({
    store: new RedisStore({client: model.redis}),
    secret: config.session.secret
}));

app.use(express.static(__dirname + '/static'));

app.set('views', __dirname + '/views');
app.set('view engine', 'hjs');

require('./src/login')(app);
require('./src/pages')(app);
require('./src/rest')(app);
