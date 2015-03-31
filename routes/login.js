var login = require("../login/sdk/server/wetfish-login");
var config = require("../config.js");

login.init(config.login);

module.exports = function(app, event)
{
    app.get('/login', function(req, res)
    {
        if(!req.query.token)
        {
            event.emit('message', req, res, {type: 'error', label: ' ', text: 'nope'});
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
