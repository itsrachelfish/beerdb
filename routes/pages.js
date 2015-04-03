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

    app.get('/view/:table', function(req, res)
    {
        model.table.info(req.params.table, function(error, columns)
        {
            if(error)
            {
                console.log(error);
                event.emit('message', req, res, {type: 'error', text: 'There was a SQL error!'});
                return;
            }

            var sortable = [];

            for(var i = 0, l = columns.length; i < l; i++)
            {
                var column = columns[i];

                if(column.sortable)
                {
                    sortable.push(column);
                }
            }
            
            event.emit('render', req, res, {view: 'table', table: req.params.table, columns: columns, sortable: sortable});
        });
    });
    
    app.get('/view', function(req, res)
    {
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
