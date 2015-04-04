function titleCase(input)
{
    var words = input.split(' ');

    words.forEach(function(word, index)
    {
        word = word.toLowerCase();
        
        var letters = word.split('');
        letters[0] = letters[0].toUpperCase();

        words[index] = letters.join('');
    });

    return words.join(' ');
}

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
        var table = req.params.table;
        
        model.table.info(table, function(error, response)
        {
            if(error)
            {
                console.log(error);
                event.emit('message', req, res, {type: 'error', text: 'There was a SQL error!'});
                return;
            }

            var sortable = {};
            var columns = [];

            for(var i = 0, l = response.length; i < l; i++)
            {
                var column = response[i];

                if(column.sortable)
                {
                    var name = column.name;

                    // Add the table name back to the ID
                    if(name == "id")
                    {
                        name = table + "_id";
                        column.name = "ID";
                    }
                    else
                    {
                        column.name = titleCase(column.name);
                    }
                    
                    sortable[name] = true;
                    columns.push(column);
                }
            }

            model.table.select(table, {limit: 50}, function(error, response)
            {
                if(error)
                {
                    co0nsole.log(error);
                    event.emit('message', req, res, {type: 'error', text: 'There was a SQL error!'});
                    return;
                }

                var rows = [];

                for(var i = 0, l = response.length; i < l; i++)
                {
                    var row = {sortable: [], text: [], range: {}};

                    Object.keys(response[i]).forEach(function(column)
                    {
                        var value = response[i][column];
                        var range = column.match(/^(.+)(_min|_max)$/);

                        if(range)
                        {
                            if(range[2] == "_min")
                            {
                                // Save the minimum in the row's range object
                                row.range[range[1]] = value;
                            }
                            else
                            {
                                // Save the final range value
                                var total = row.range[range[1]] + " - " + value;                                
                                row.sortable.push({name: titleCase(range[1]), value: total});
                            }
                        }
                        else
                        {
                            if(sortable[column])
                            {
                                row.sortable.push({name: titleCase(column), value: value});
                            }
                            else
                            {
                                row.text.push({name: titleCase(column), value: value});
                            }
                        }
                    });

                    rows.push(row);
                }

console.log(sortable);
console.log(rows);

                event.emit('render', req, res, {view: 'table', table: table, columns: columns, rows: rows});
            });
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
