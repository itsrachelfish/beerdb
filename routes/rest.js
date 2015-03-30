module.exports = function(app)
{
    // List tables
    app.get('/v1/table', function(req, res)
    {

    });

    // Create a new table
    app.post('/v1/table', function(req, res)
    {
        res.end(JSON.stringify(req.body));
    });

    // List data from a table
    app.get('/v1/:table', function(req, res)
    {

    });

    // Add data to a table
    app.post('/v1/:table', function(req, res)
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
