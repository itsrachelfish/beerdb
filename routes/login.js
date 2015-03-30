module.exports = function(app)
{
    app.get('/login', function(req, res)
    {
        login.verify(req.query.token, function(verified)
        {
            if(verified.status == "success")
            {
                req.session.user = verified.data;
                res.send("You're logged in!");
            }
            else
            {
                res.send("There was an error!<p><b>" + verified.message + "</b></p>");
            }

            res.end();
        });
    });
}
