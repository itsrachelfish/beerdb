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

app.get('/login', function(req, res)
{
    login.verify(req.query.token, function(verified)
    {
        if(verified.status == "success")
        {
            req.session.user = verified.data;
            res.send("You're logged in!");
        }
        else
        {
            res.send("There was an error!<p><b>" + verified.message + "</b></p>");
        }

        res.end();
    });
});
