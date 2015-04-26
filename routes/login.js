var login = require("../login/sdk/server/wetfish-login");
var config = require("../config.js");

login.init(config.login);

module.exports = function(app, event)
{
    app.get('/login', function(req, res)
    {
        if(!req.query.token)
        {
            res.redirect('https://login.wetfish.net/apps/join/2d8dc73a81b343cecf4256016ed8640f549016ceb4ffe34ac5925382cbb3a2c5');
            return;
        }
        
        login.verify(req.query.token, function(verified)
        {
            if(verified.status != "success")
            {
                event.emit('message', req, res, {type: 'error', text: verified.message});
                return;
            }

            req.session.user = verified.data;
            event.emit('message', req, res, {type: 'success', text: "You're logged in!"});
        });
    });
}
