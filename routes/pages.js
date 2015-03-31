var extend = require('util')._extend;
var events = require('events')
var event = new events.EventEmitter();

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
        message.label = 'Success!';
    }
    else if(message.type == 'error')
    {
        message.class = 'danger';
        message.label = 'Error:';
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

module.exports = function(app)
{
    // Middleware to ensure users are logged in
    app.use(function(req, res, next)
    {
        if(!req.session.user)
        {
            event.emit('message', req, res, {type: 'error', text: 'You must be logged in to use BeerDB!'});
            return;
        }

        next();
    });
    
    app.get('/', function(req, res)
    {
        event.emit('render', req, res, {view: 'index'});        
    });

    app.get('/view', function(req, res)
    {
        event.emit('render', req, res, {view: 'view'});
    });

    app.get('/create', function(req, res)
    {
        event.emit('render', req, res, {view: 'create'});
    });

    app.get('/search', function(req, res)
    {
        event.emit('render', req, res, {view: 'search'});
    });
}
