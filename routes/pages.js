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

module.exports = function(app)
{
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
