module.exports = function(app, event, model)
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

    app.get('/view/:table?', function(req, res)
    {
        if(req.params.table)
        {
            event.emit('message', req, res, {type: 'info', text: "You want: " + req.params.table});
            return;
        }
        
        model.table.list(function(error, response)
        {
            if(error)
            {
                console.log(error);
                event.emit('message', req, res, {type: 'error', text: 'There was a SQL error!'});
                return;
            }

            event.emit('render', req, res, {view: 'list', tables: response});
        });
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
