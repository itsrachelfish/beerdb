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

        // Only allow users based on the config file
        if(app.config.allowed.indexOf(req.session.user.user_name) < 0)
        {
            event.emit('message', req, res, {type: 'error', text: 'You are not authorized to use BeerDB!'});
            return;
        }

        next();
    });
    
    // Create a new table
    app.post('/v1/table', function(req, res)
    {
        var error = false;
        var errors = {};
        var table = {columns: []};
        
        if(!req.body.table || !req.body.table.trim())
        {
            error = true;
            errors.table = "Your table needs a name!";
        }

        else
        {
            table.name = req.body.table.toLowerCase().trim();
        }

        if(!Array.isArray(req.body.column) || !Array.isArray(req.body.type))
        {
            error = true;
            errors.unknown = "You didn't create any columns!";
        }

        else if(req.body.column.length != req.body.type.length)
        {
            error = true;
            errors.unknown = "Spooky hacker!";
        }

        else
        {
            errors.column = [];
            errors.type = [];
            var types = ['label', 'text', 'list', 'number', 'range'];
            
            for(var i = 0, l = req.body.column.length; i < l; i++)
            {
                var column = req.body.column[i].trim();
                var type = req.body.type[i].trim();

                // Ignore completely empty columns
                if(!column && !type)
                {
                    continue;
                }

                if(!column)
                {
                    error = true;
                    errors.column[i] = "You must specify a column name!";
                }

                if(!type)
                {
                    error = true;
                    errors.type[i] = "This colum needs a type!";
                }

                else if(types.indexOf(type) == -1)
                {
                    error = true;
                    errors.type[i] = "This isn't a valid type you goose.";
                }
                
                else
                {
                    table.columns.push({name: column.toLowerCase(), type: type});
                }
            }
        }

        // If no valid columns were created
        if(!table.columns.length)
        {
            error = true;
            errors.unknown = "You didn't create any columns!";
        }

        if(error)
        {
            res.end(JSON.stringify({status: 'error', errors: errors}));
            return;
        }

        model.table.create(table, function(error, response)
        {
            if(error)
            {
                console.log(error);
                res.end(JSON.stringify({status: 'error', message: 'There was a SQL error.'}));
                return;
            }
            
            res.end(JSON.stringify({status: 'success', message: 'Table created!'}));
        });
    });

    // List tables
    app.get('/v1/table', function(req, res)
    {
        model.table.list(function(error, response)
        {
            if(error)
            {
                console.log(error);
                res.end(JSON.stringify({status: 'error', message: 'There was a SQL error.'}));
                return;
            }
            
            res.end(JSON.stringify(response));
        });
    });

    // Add data to a table
    app.post('/v1/:table', function(req, res)
    {
        var error = false;
        var errors = {};
        var empty = true;

        Object.keys(req.body).forEach(function(column)
        {
            if(req.body[column].trim())
            {
                empty = false;
            }
        });

        if(empty)
        {
            error = true;
            errors.unknown = "You didn't enter anything!";
        }

        if(error)
        {
            res.end(JSON.stringify({status: 'error', errors: errors}));
            return;
        }

        model.table.insert(req.params.table, req.body, function(error, response)
        {
            if(error)
            {
                console.log(error);
                res.end(JSON.stringify({status: 'error', message: 'There was a SQL error.'}));
                return;
            }
            
            res.end(JSON.stringify({status: 'success', message: 'New row created!'}));
        });
    });

    // List data from a table
    app.get('/v1/:table', function(req, res)
    {

    });

    // Return a sorted list of data from a table
    app.get('/v1/:table/sort/:key/:order?', function(req, res)
    {

    });

    // Return a list of data that matches the search term
    app.get('/v1/:table/search/:query', function(req, res)
    {

    });

    // Get specific information from a table
    app.get('/v1/:table/:id', function(req, res)
    {

    });

    // Edit data in a table
    app.put('/v1/:table/:id', function(req, res)
    {

    });

    // Delete something from a table
    app.delete('/v1/:table/:id', function(req, res)
    {

    });
}
