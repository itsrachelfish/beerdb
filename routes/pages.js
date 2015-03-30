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
        res.render('view',
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
        res.render('search',
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
}
