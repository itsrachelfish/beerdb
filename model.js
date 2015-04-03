var redis = require('redis');
var mysql = require('mysql');

var model =
{
    // Database connection variables
    redis: false,
    mysql: false,
    config: false,

    // Function to connect to our databases
    connect: function(config)
    {
        model.config = config;
        model.redis = redis.createClient(6334);
        model.mysql = mysql.createConnection(
        {
            host     : 'localhost',
            user     : config.mysql.username,
            password : config.mysql.password,
            database : config.mysql.database,
            timezone : 'utc' 
        });

        model.mysql.connect();
    },
    
    where: function(select, glue)
    {
        if(typeof glue == "undefined")
            glue = " and ";

        var where = [];
        var values = [];
        
        for(var i = 0, keys = Object.keys(select), l = keys.length; i < l; i++)
        {
            where.push(model.mysql.escapeId(keys[i]) + ' = ?');
            values.push(select[keys[i]]);
        }

        return {where: where.join(glue), values: values};
    },

    table:
    {
        create: function(table, callback)
        {
            var query = [];
            var columns = [];
            var data = [];

            query.push('Create table ??');
            data.push(table.name);

            query.push('(');

            // Create auto increment ID
            columns.push('?? int NOT NULL AUTO_INCREMENT');
            data.push(table.name + '_id');

            columns.push('PRIMARY KEY (??)');
            data.push(table.name + '_id');

            // Loop through all user requested columns
            for(var i = 0, l = table.columns.length; i < l; i++)
            {
                var column = table.columns[i];

                if(column.type == "label")
                {
                    columns.push('?? varchar(64) NOT NULL');
                    data.push(column.name);

                    columns.push('KEY ?? (??)');
                    data.push(column.name);
                    data.push(column.name);
                }

                else if(column.type == "text" || column.type == "list")
                {
                    columns.push('?? text NOT NULL');
                    data.push(column.name);

                    columns.push('FULLTEXT KEY ?? (??)');
                    data.push(column.name);
                    data.push(column.name);
                }

                else if(column.type == "number")
                {
                    columns.push('?? int NOT NULL');
                    data.push(column.name);

                    columns.push('KEY ?? (??)');
                    data.push(column.name);
                    data.push(column.name);
                }

                else if(column.type == "range")
                {
                    // Ranges are actually two columns
                    columns.push('?? int NOT NULL');
                    data.push(column.name + "_min");

                    columns.push('KEY ?? (??)');
                    data.push(column.name + "_min");
                    data.push(column.name + "_min");

                    columns.push('?? int NOT NULL');
                    data.push(column.name + "_max");

                    columns.push('KEY ?? (??)');
                    data.push(column.name + "_max");
                    data.push(column.name + "_max");

                }
            }


            columns = columns.join(', ');
            query.push(columns);

            query.push(')');
            query.push('ENGINE=MyISAM DEFAULT CHARSET=utf8;');

            query = query.join(' ');
            model.mysql.query(query, data, callback);
        },

        list: function(callback)
        {
            var query =
            [
                'Select table_name as name',
                'from information_schema.tables',
                'where table_schema = ?'
            ];

            query = query.join(' ');
            model.mysql.query(query, model.config.mysql.database, callback);
        },

        info: function(table, callback)
        {
            model.mysql.query('Describe ??', table, function(error, response)
            {
                if(error)
                {
                    callback(error, response);
                    return;
                }

                var columns = [];

                for(var i = 0, l = response.length; i < l; i++)
                {
                    var column = response[i];
                    var output =
                    {
                        name: column.Field
                    };

                    if(column.Key == 'PRI')
                    {
                        output.name = 'id';
                    }

                    if(column.Type.match(/^(int|varchar)/))
                    {
                        output.sortable = true;
                    }

                    if(output.name.match(/_min$/))
                    {
                        output.name = output.name.replace('_min', '');
                    }

                    // Skip range max fields
                    if(output.name.match(/_max$/))
                    {
                        continue;
                    }

                    columns.push(output);
                }

                callback(error, columns);
            });
        }
    }
};

module.exports = model;
