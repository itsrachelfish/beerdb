// Query string parser, from npm
var query = require('query-string');

$(document).ready(function()
{
    var parsed = query.parse(location.search);
    
    $('body').on('click', '.sort-asc', function()
    {
        var column = $(this).parents('th').data('column');
        var type = $(this).parents('th').data('type');

        if(type == 'Range')
        {
            column = column + "_min";
        }

        parsed.column = column;
        parsed.sort = 'asc';

        location = location.origin + location.pathname + '?' + query.stringify(parsed);
    });

    $('body').on('click', '.sort-desc', function()
    {
        var column = $(this).parents('th').data('column');
        var type = $(this).parents('th').data('type');

        if(type == 'Range')
        {
            column = column + "_max";
        }

        parsed.column = column;
        parsed.sort = 'desc';

        location = location.origin + location.pathname + '?' + query.stringify(parsed);
    });
});
