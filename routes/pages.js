module.exports = function(app)
{
    app.get('/', function(req, res)
    {
        res.render('index',
        {
            session: req.session,
            partials:
            {
                head: 'partials/head',
                sidebar: 'partials/sidebar',
                foot: 'partials/foot'
            }
        });
    });

    app.get('/view', function(req, res)
    {
        res.end("View all tables");
    });

    app.get('/create', function(req, res)
    {
        res.render('create',
        {
            session: req.session,
            partials:
            {
                head: 'partials/head',
                sidebar: 'partials/sidebar',
                foot: 'partials/foot'
            }
        });
    });

    app.get('/search', function(req, res)
    {
        res.end("Search for something");
    });
}
