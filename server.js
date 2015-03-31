var redis = require('redis');
var mysql = require('mysql');
var express = require('express');

var app = express();
var server = require('http').createServer(app);
var session = require('express-session');
var RedisStore = require('connect-redis')(session);
var bodyParser = require('body-parser');

var extend = require('util')._extend;
var events = require('events')
var event = new events.EventEmitter();

var config = require("./config.js");

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

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(__dirname + '/static'));

app.set('views', __dirname + '/views');
app.set('view engine', 'hjs');

// Helper events
event.on('render', function(req, res, options)
{
    var defaults =
    {
        session: req.session,
        partials:
        {
            head: 'partials/head',
            sidebar: 'partials/sidebar',
            foot: 'partials/foot'
        }
    };

    options = extend(defaults, options);
    res.render(options.view, options);
});

// Special handler for messages
event.on('message', function(req, res, message)
{
    message = (message || {type: ''});
    message.type = message.type.toLowerCase();
    
    if(message.type == 'success')
    {
        message.class = 'success';
        message.label = (message.label || 'Success!');
    }
    else if(message.type == 'error')
    {
        message.class = 'danger';
        message.label = (message.label || 'Error:');
    }
    else
    {
        message.class = 'info';
    }

    var options =
    {
        view: 'message',
        message: message
    }
    
    event.emit('render', req, res, options);
});

require('./routes/login')(app, event);
require('./routes/pages')(app, event);
require('./routes/rest')(app, event);
