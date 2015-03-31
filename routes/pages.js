module.exports = function(app, event)
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
