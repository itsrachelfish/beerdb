module.exports = function(app)
{
    app.get('/', function(req, res)
    {
        res.end("THIS IS THE HOME PAGE!");
    });

    app.get('/view', function(req, res)
    {
        res.end("View all tables");
    });

    app.get('/create', function(req, res)
    {
        res.end("Create a table");
    });

    app.get('/search', function(req, res)
    {
        res.end("Search for something");
    });
}
