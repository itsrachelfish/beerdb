(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
require('./misc/ajax');
require('./misc/dragon-drop');
require('./misc/sort');

require('./pages/create');
require('./pages/insert');
require('./pages/search');

},{"./misc/ajax":3,"./misc/dragon-drop":4,"./misc/sort":5,"./pages/create":6,"./pages/insert":7,"./pages/search":8}],2:[function(require,module,exports){
/*!
	query-string
	Parse and stringify URL query strings
	https://github.com/sindresorhus/query-string
	by Sindre Sorhus
	MIT License
*/
(function () {
	'use strict';
	var queryString = {};

	queryString.parse = function (str) {
		if (typeof str !== 'string') {
			return {};
		}

		str = str.trim().replace(/^(\?|#)/, '');

		if (!str) {
			return {};
		}

		return str.trim().split('&').reduce(function (ret, param) {
			var parts = param.replace(/\+/g, ' ').split('=');
			var key = parts[0];
			var val = parts[1];

			key = decodeURIComponent(key);
			// missing `=` should be `null`:
			// http://w3.org/TR/2012/WD-url-20120524/#collect-url-parameters
			val = val === undefined ? null : decodeURIComponent(val);

			if (!ret.hasOwnProperty(key)) {
				ret[key] = val;
			} else if (Array.isArray(ret[key])) {
				ret[key].push(val);
			} else {
				ret[key] = [ret[key], val];
			}

			return ret;
		}, {});
	};

	queryString.stringify = function (obj) {
		return obj ? Object.keys(obj).map(function (key) {
			var val = obj[key];

			if (Array.isArray(val)) {
				return val.map(function (val2) {
					return encodeURIComponent(key) + '=' + encodeURIComponent(val2);
				}).join('&');
			}

			return encodeURIComponent(key) + '=' + encodeURIComponent(val);
		}).join('&') : '';
	};

	if (typeof define === 'function' && define.amd) {
		define(function() { return queryString; });
	} else if (typeof module !== 'undefined' && module.exports) {
		module.exports = queryString;
	} else {
		window.queryString = queryString;
	}
})();

},{}],3:[function(require,module,exports){
function redirect(url, timeout)
{
    if($('.redirect').length)
    {
        var url = $('.redirect').attr('redirect-url');
        var timeout = parseInt($('.redirect').attr('redirect-timeout'));
    }

    if(url)
    {
        setTimeout(function() { window.location = url; }, timeout * 1000);
    }
}

$(document).ready(function()
{
    $('body').on('submit', '.form-wrap form', function(event)
    {
        event.preventDefault();

        var form = $(this);
        var action = $(this).attr('action');
        var data = $(this).serialize();

        // Remove previous error messages
        form.parents('.form-wrap').find('.alert').remove();

        $.post(action, data, function(response)
        {
            try
            {
                response = JSON.parse(response);
            }
            catch(error)
            {
                response = {'status': 'error', 'message': 'Unable to decode the response from the server.'};
            }

            $(window).trigger('form-loaded', response);

            if(response.status == 'success')
            {
                var message = $('<div class="alert alert-success" style="display:none" role="alert"><strong>Success!</strong> '+response.message+'</div>');
                form.parents('.form-wrap').prepend(message);

                message.fadeIn();
                form.fadeOut();
            }
            else if(response.status == 'error')
            {
                // Handle generic error messages
                if(response.message)
                {
                    var message = $('<div class="alert alert-danger" style="display:none" role="alert"><strong>Error:</strong> '+response.message+'</div>');
                    form.parents('.form-wrap').prepend(message);

                    message.fadeIn();
                }
                
                // Handle lists of error messages
                else
                {
                    $.each(response.errors, function(field, error)
                    {
                        if(field == "unknown")
                        {
                            var message = $('<div class="alert alert-danger" style="display:none" role="alert"><strong>Error:</strong> '+error+'</div>');
                            form.parents('.form-wrap').prepend(message);

                            message.fadeIn();
                        }
                        else if(Array.isArray(error))
                        {
                            for(var i = 0, l = error.length; i < l; i++)
                            {
                                if(error[i])
                                {
                                    var input = form.find('[name="'+field+'[]"]').eq(i);
                                    
                                    if(input.length)
                                    {
                                        // Remove any previous error messages when displaying new ones
                                        input.siblings('.help-block').remove();
                                        input.parents('.form-group').addClass('has-error');

                                        var message = $('<p class="help-block" style="display:none">'+error[i]+'</p>');
                                        input.parents('.input-wrap').append(message);

                                        message.fadeIn();
                                    }
                                }
                            }
                        }
                        else
                        {
                            var input = form.find('[name="'+field+'"]');
                            
                            if(input.length)
                            {
                                // Remove any previous error messages when displaying new ones
                                input.siblings('.help-block').remove();
                                input.parents('.form-group').addClass('has-error');

                                var message = $('<p class="help-block" style="display:none">'+error+'</p>');
                                input.parents('.input-wrap').append(message);

                                message.fadeIn();
                            }
                        }
                    });
                }
            }
            else
            {
                console.log(response);
            }

            if(response.redirect)
            {
                redirect(response.redirect.url, response.redirect.timeout);
            }
        });
    });

    // Automatically remove error messages when typing into an input
    $('form input, form textarea').on('keyup', function()
    {
        if($(this).val().length && $(this).parents('.form-group').hasClass('has-error'))
        {
            $(this).parents('.form-group').removeClass('has-error');
            $(this).siblings('.help-block').fadeOut(function() { $(this).remove(); });
        }
    });
});

},{}],4:[function(require,module,exports){
$(document).ready(function()
{
    var moving;

    $('body').on('mousedown', '.move-column', function(event)
    {
        event.preventDefault();
        
        var parent = $(this).parents('.movable')
        parent.addClass('moving');

        moving = true;
    });

    $('body').on('mouseup', function(event)
    {
        if(moving)
        {
            $('body').trigger('move-stop');
        }
    });

    $('body').on('mouseleave', function(event)
    {
        if(moving)
        {
            $('body').trigger('move-stop');
        }
    });

    $('body').on('mouseenter', '.movable', function(event)
    {
        if(moving)
        {
            $(this).addClass('hovering');
        }
    });

    $('body').on('mouseleave', '.movable', function(event)
    {
        if(moving)
        {
            $(this).removeClass('hovering');
        }
    });

    $('body').on('move-stop', function()
    {
        if(moving)
        {
            var $moving = $('.moving');
            var $hovering = $('.hovering');
            
            $moving.removeClass('moving');
            $hovering.removeClass('hovering');

            if($moving.length && $hovering.length)
            {
                var clone = $moving.clone();

                // Loop through all select inputs and preserve their values
                $moving.find('select').each(function()
                {
                    var index = $(this).index();
                    clone.find('select').eq(index).val($(this).val());
                });

                clone.insertAfter($hovering);
                $moving.remove();
            }

            moving = false;
        }
    });
});

},{}],5:[function(require,module,exports){
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

},{"query-string":2}],6:[function(require,module,exports){
$(document).ready(function()
{
    $('body').on('click', '.add-column', function(event)
    {
        var template = $('.column-template').clone();
        template.removeClass('column-template hidden');
        template.addClass('movable');
        $('.form-content').append(template);
    });

    $('body').on('click', '.remove-column', function(event)
    {
        $(this).parents('.form-group').fadeOut(function()
        {
            $(this).remove();
        });
    });
});

},{}],7:[function(require,module,exports){
$(document).ready(function()
{
    $(window).on('form-loaded', function(event, response)
    {
        if(response.status == 'success')
        {
            $('.add-another').removeClass('hidden');
        }
        
        console.log(response);
    });
});

},{}],8:[function(require,module,exports){
$(document).ready(function()
{
    /*
    $('body').on('submit', '.search', function(event)
    {
        console.log("Hi!");
    });
    */
});

},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzdGF0aWMvanMvbWFpbi5qcyIsIm5vZGVfbW9kdWxlcy9xdWVyeS1zdHJpbmcvcXVlcnktc3RyaW5nLmpzIiwic3RhdGljL2pzL21pc2MvYWpheC5qcyIsInN0YXRpYy9qcy9taXNjL2RyYWdvbi1kcm9wLmpzIiwic3RhdGljL2pzL21pc2Mvc29ydC5qcyIsInN0YXRpYy9qcy9wYWdlcy9jcmVhdGUuanMiLCJzdGF0aWMvanMvcGFnZXMvaW5zZXJ0LmpzIiwic3RhdGljL2pzL3BhZ2VzL3NlYXJjaC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0VBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwicmVxdWlyZSgnLi9taXNjL2FqYXgnKTtcbnJlcXVpcmUoJy4vbWlzYy9kcmFnb24tZHJvcCcpO1xucmVxdWlyZSgnLi9taXNjL3NvcnQnKTtcblxucmVxdWlyZSgnLi9wYWdlcy9jcmVhdGUnKTtcbnJlcXVpcmUoJy4vcGFnZXMvaW5zZXJ0Jyk7XG5yZXF1aXJlKCcuL3BhZ2VzL3NlYXJjaCcpO1xuIiwiLyohXG5cdHF1ZXJ5LXN0cmluZ1xuXHRQYXJzZSBhbmQgc3RyaW5naWZ5IFVSTCBxdWVyeSBzdHJpbmdzXG5cdGh0dHBzOi8vZ2l0aHViLmNvbS9zaW5kcmVzb3JodXMvcXVlcnktc3RyaW5nXG5cdGJ5IFNpbmRyZSBTb3JodXNcblx0TUlUIExpY2Vuc2VcbiovXG4oZnVuY3Rpb24gKCkge1xuXHQndXNlIHN0cmljdCc7XG5cdHZhciBxdWVyeVN0cmluZyA9IHt9O1xuXG5cdHF1ZXJ5U3RyaW5nLnBhcnNlID0gZnVuY3Rpb24gKHN0cikge1xuXHRcdGlmICh0eXBlb2Ygc3RyICE9PSAnc3RyaW5nJykge1xuXHRcdFx0cmV0dXJuIHt9O1xuXHRcdH1cblxuXHRcdHN0ciA9IHN0ci50cmltKCkucmVwbGFjZSgvXihcXD98IykvLCAnJyk7XG5cblx0XHRpZiAoIXN0cikge1xuXHRcdFx0cmV0dXJuIHt9O1xuXHRcdH1cblxuXHRcdHJldHVybiBzdHIudHJpbSgpLnNwbGl0KCcmJykucmVkdWNlKGZ1bmN0aW9uIChyZXQsIHBhcmFtKSB7XG5cdFx0XHR2YXIgcGFydHMgPSBwYXJhbS5yZXBsYWNlKC9cXCsvZywgJyAnKS5zcGxpdCgnPScpO1xuXHRcdFx0dmFyIGtleSA9IHBhcnRzWzBdO1xuXHRcdFx0dmFyIHZhbCA9IHBhcnRzWzFdO1xuXG5cdFx0XHRrZXkgPSBkZWNvZGVVUklDb21wb25lbnQoa2V5KTtcblx0XHRcdC8vIG1pc3NpbmcgYD1gIHNob3VsZCBiZSBgbnVsbGA6XG5cdFx0XHQvLyBodHRwOi8vdzMub3JnL1RSLzIwMTIvV0QtdXJsLTIwMTIwNTI0LyNjb2xsZWN0LXVybC1wYXJhbWV0ZXJzXG5cdFx0XHR2YWwgPSB2YWwgPT09IHVuZGVmaW5lZCA/IG51bGwgOiBkZWNvZGVVUklDb21wb25lbnQodmFsKTtcblxuXHRcdFx0aWYgKCFyZXQuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuXHRcdFx0XHRyZXRba2V5XSA9IHZhbDtcblx0XHRcdH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheShyZXRba2V5XSkpIHtcblx0XHRcdFx0cmV0W2tleV0ucHVzaCh2YWwpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0cmV0W2tleV0gPSBbcmV0W2tleV0sIHZhbF07XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiByZXQ7XG5cdFx0fSwge30pO1xuXHR9O1xuXG5cdHF1ZXJ5U3RyaW5nLnN0cmluZ2lmeSA9IGZ1bmN0aW9uIChvYmopIHtcblx0XHRyZXR1cm4gb2JqID8gT2JqZWN0LmtleXMob2JqKS5tYXAoZnVuY3Rpb24gKGtleSkge1xuXHRcdFx0dmFyIHZhbCA9IG9ialtrZXldO1xuXG5cdFx0XHRpZiAoQXJyYXkuaXNBcnJheSh2YWwpKSB7XG5cdFx0XHRcdHJldHVybiB2YWwubWFwKGZ1bmN0aW9uICh2YWwyKSB7XG5cdFx0XHRcdFx0cmV0dXJuIGVuY29kZVVSSUNvbXBvbmVudChrZXkpICsgJz0nICsgZW5jb2RlVVJJQ29tcG9uZW50KHZhbDIpO1xuXHRcdFx0XHR9KS5qb2luKCcmJyk7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiBlbmNvZGVVUklDb21wb25lbnQoa2V5KSArICc9JyArIGVuY29kZVVSSUNvbXBvbmVudCh2YWwpO1xuXHRcdH0pLmpvaW4oJyYnKSA6ICcnO1xuXHR9O1xuXG5cdGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcblx0XHRkZWZpbmUoZnVuY3Rpb24oKSB7IHJldHVybiBxdWVyeVN0cmluZzsgfSk7XG5cdH0gZWxzZSBpZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcgJiYgbW9kdWxlLmV4cG9ydHMpIHtcblx0XHRtb2R1bGUuZXhwb3J0cyA9IHF1ZXJ5U3RyaW5nO1xuXHR9IGVsc2Uge1xuXHRcdHdpbmRvdy5xdWVyeVN0cmluZyA9IHF1ZXJ5U3RyaW5nO1xuXHR9XG59KSgpO1xuIiwiZnVuY3Rpb24gcmVkaXJlY3QodXJsLCB0aW1lb3V0KVxue1xuICAgIGlmKCQoJy5yZWRpcmVjdCcpLmxlbmd0aClcbiAgICB7XG4gICAgICAgIHZhciB1cmwgPSAkKCcucmVkaXJlY3QnKS5hdHRyKCdyZWRpcmVjdC11cmwnKTtcbiAgICAgICAgdmFyIHRpbWVvdXQgPSBwYXJzZUludCgkKCcucmVkaXJlY3QnKS5hdHRyKCdyZWRpcmVjdC10aW1lb3V0JykpO1xuICAgIH1cblxuICAgIGlmKHVybClcbiAgICB7XG4gICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7IHdpbmRvdy5sb2NhdGlvbiA9IHVybDsgfSwgdGltZW91dCAqIDEwMDApO1xuICAgIH1cbn1cblxuJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKVxue1xuICAgICQoJ2JvZHknKS5vbignc3VibWl0JywgJy5mb3JtLXdyYXAgZm9ybScsIGZ1bmN0aW9uKGV2ZW50KVxuICAgIHtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgICB2YXIgZm9ybSA9ICQodGhpcyk7XG4gICAgICAgIHZhciBhY3Rpb24gPSAkKHRoaXMpLmF0dHIoJ2FjdGlvbicpO1xuICAgICAgICB2YXIgZGF0YSA9ICQodGhpcykuc2VyaWFsaXplKCk7XG5cbiAgICAgICAgLy8gUmVtb3ZlIHByZXZpb3VzIGVycm9yIG1lc3NhZ2VzXG4gICAgICAgIGZvcm0ucGFyZW50cygnLmZvcm0td3JhcCcpLmZpbmQoJy5hbGVydCcpLnJlbW92ZSgpO1xuXG4gICAgICAgICQucG9zdChhY3Rpb24sIGRhdGEsIGZ1bmN0aW9uKHJlc3BvbnNlKVxuICAgICAgICB7XG4gICAgICAgICAgICB0cnlcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICByZXNwb25zZSA9IEpTT04ucGFyc2UocmVzcG9uc2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2goZXJyb3IpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgcmVzcG9uc2UgPSB7J3N0YXR1cyc6ICdlcnJvcicsICdtZXNzYWdlJzogJ1VuYWJsZSB0byBkZWNvZGUgdGhlIHJlc3BvbnNlIGZyb20gdGhlIHNlcnZlci4nfTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgJCh3aW5kb3cpLnRyaWdnZXIoJ2Zvcm0tbG9hZGVkJywgcmVzcG9uc2UpO1xuXG4gICAgICAgICAgICBpZihyZXNwb25zZS5zdGF0dXMgPT0gJ3N1Y2Nlc3MnKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHZhciBtZXNzYWdlID0gJCgnPGRpdiBjbGFzcz1cImFsZXJ0IGFsZXJ0LXN1Y2Nlc3NcIiBzdHlsZT1cImRpc3BsYXk6bm9uZVwiIHJvbGU9XCJhbGVydFwiPjxzdHJvbmc+U3VjY2VzcyE8L3N0cm9uZz4gJytyZXNwb25zZS5tZXNzYWdlKyc8L2Rpdj4nKTtcbiAgICAgICAgICAgICAgICBmb3JtLnBhcmVudHMoJy5mb3JtLXdyYXAnKS5wcmVwZW5kKG1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgbWVzc2FnZS5mYWRlSW4oKTtcbiAgICAgICAgICAgICAgICBmb3JtLmZhZGVPdXQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYocmVzcG9uc2Uuc3RhdHVzID09ICdlcnJvcicpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgLy8gSGFuZGxlIGdlbmVyaWMgZXJyb3IgbWVzc2FnZXNcbiAgICAgICAgICAgICAgICBpZihyZXNwb25zZS5tZXNzYWdlKVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIG1lc3NhZ2UgPSAkKCc8ZGl2IGNsYXNzPVwiYWxlcnQgYWxlcnQtZGFuZ2VyXCIgc3R5bGU9XCJkaXNwbGF5Om5vbmVcIiByb2xlPVwiYWxlcnRcIj48c3Ryb25nPkVycm9yOjwvc3Ryb25nPiAnK3Jlc3BvbnNlLm1lc3NhZ2UrJzwvZGl2PicpO1xuICAgICAgICAgICAgICAgICAgICBmb3JtLnBhcmVudHMoJy5mb3JtLXdyYXAnKS5wcmVwZW5kKG1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2UuZmFkZUluKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIC8vIEhhbmRsZSBsaXN0cyBvZiBlcnJvciBtZXNzYWdlc1xuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICQuZWFjaChyZXNwb25zZS5lcnJvcnMsIGZ1bmN0aW9uKGZpZWxkLCBlcnJvcilcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYoZmllbGQgPT0gXCJ1bmtub3duXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG1lc3NhZ2UgPSAkKCc8ZGl2IGNsYXNzPVwiYWxlcnQgYWxlcnQtZGFuZ2VyXCIgc3R5bGU9XCJkaXNwbGF5Om5vbmVcIiByb2xlPVwiYWxlcnRcIj48c3Ryb25nPkVycm9yOjwvc3Ryb25nPiAnK2Vycm9yKyc8L2Rpdj4nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3JtLnBhcmVudHMoJy5mb3JtLXdyYXAnKS5wcmVwZW5kKG1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZS5mYWRlSW4oKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYoQXJyYXkuaXNBcnJheShlcnJvcikpXG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yKHZhciBpID0gMCwgbCA9IGVycm9yLmxlbmd0aDsgaSA8IGw7IGkrKylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKGVycm9yW2ldKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgaW5wdXQgPSBmb3JtLmZpbmQoJ1tuYW1lPVwiJytmaWVsZCsnW11cIl0nKS5lcShpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYoaW5wdXQubGVuZ3RoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFJlbW92ZSBhbnkgcHJldmlvdXMgZXJyb3IgbWVzc2FnZXMgd2hlbiBkaXNwbGF5aW5nIG5ldyBvbmVzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5wdXQuc2libGluZ3MoJy5oZWxwLWJsb2NrJykucmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5wdXQucGFyZW50cygnLmZvcm0tZ3JvdXAnKS5hZGRDbGFzcygnaGFzLWVycm9yJyk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgbWVzc2FnZSA9ICQoJzxwIGNsYXNzPVwiaGVscC1ibG9ja1wiIHN0eWxlPVwiZGlzcGxheTpub25lXCI+JytlcnJvcltpXSsnPC9wPicpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlucHV0LnBhcmVudHMoJy5pbnB1dC13cmFwJykuYXBwZW5kKG1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZS5mYWRlSW4oKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgaW5wdXQgPSBmb3JtLmZpbmQoJ1tuYW1lPVwiJytmaWVsZCsnXCJdJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYoaW5wdXQubGVuZ3RoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gUmVtb3ZlIGFueSBwcmV2aW91cyBlcnJvciBtZXNzYWdlcyB3aGVuIGRpc3BsYXlpbmcgbmV3IG9uZXNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5wdXQuc2libGluZ3MoJy5oZWxwLWJsb2NrJykucmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlucHV0LnBhcmVudHMoJy5mb3JtLWdyb3VwJykuYWRkQ2xhc3MoJ2hhcy1lcnJvcicpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBtZXNzYWdlID0gJCgnPHAgY2xhc3M9XCJoZWxwLWJsb2NrXCIgc3R5bGU9XCJkaXNwbGF5Om5vbmVcIj4nK2Vycm9yKyc8L3A+Jyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlucHV0LnBhcmVudHMoJy5pbnB1dC13cmFwJykuYXBwZW5kKG1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2UuZmFkZUluKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2cocmVzcG9uc2UpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZihyZXNwb25zZS5yZWRpcmVjdClcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICByZWRpcmVjdChyZXNwb25zZS5yZWRpcmVjdC51cmwsIHJlc3BvbnNlLnJlZGlyZWN0LnRpbWVvdXQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9KTtcblxuICAgIC8vIEF1dG9tYXRpY2FsbHkgcmVtb3ZlIGVycm9yIG1lc3NhZ2VzIHdoZW4gdHlwaW5nIGludG8gYW4gaW5wdXRcbiAgICAkKCdmb3JtIGlucHV0LCBmb3JtIHRleHRhcmVhJykub24oJ2tleXVwJywgZnVuY3Rpb24oKVxuICAgIHtcbiAgICAgICAgaWYoJCh0aGlzKS52YWwoKS5sZW5ndGggJiYgJCh0aGlzKS5wYXJlbnRzKCcuZm9ybS1ncm91cCcpLmhhc0NsYXNzKCdoYXMtZXJyb3InKSlcbiAgICAgICAge1xuICAgICAgICAgICAgJCh0aGlzKS5wYXJlbnRzKCcuZm9ybS1ncm91cCcpLnJlbW92ZUNsYXNzKCdoYXMtZXJyb3InKTtcbiAgICAgICAgICAgICQodGhpcykuc2libGluZ3MoJy5oZWxwLWJsb2NrJykuZmFkZU91dChmdW5jdGlvbigpIHsgJCh0aGlzKS5yZW1vdmUoKTsgfSk7XG4gICAgICAgIH1cbiAgICB9KTtcbn0pO1xuIiwiJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKVxue1xuICAgIHZhciBtb3Zpbmc7XG5cbiAgICAkKCdib2R5Jykub24oJ21vdXNlZG93bicsICcubW92ZS1jb2x1bW4nLCBmdW5jdGlvbihldmVudClcbiAgICB7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIFxuICAgICAgICB2YXIgcGFyZW50ID0gJCh0aGlzKS5wYXJlbnRzKCcubW92YWJsZScpXG4gICAgICAgIHBhcmVudC5hZGRDbGFzcygnbW92aW5nJyk7XG5cbiAgICAgICAgbW92aW5nID0gdHJ1ZTtcbiAgICB9KTtcblxuICAgICQoJ2JvZHknKS5vbignbW91c2V1cCcsIGZ1bmN0aW9uKGV2ZW50KVxuICAgIHtcbiAgICAgICAgaWYobW92aW5nKVxuICAgICAgICB7XG4gICAgICAgICAgICAkKCdib2R5JykudHJpZ2dlcignbW92ZS1zdG9wJyk7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgICQoJ2JvZHknKS5vbignbW91c2VsZWF2ZScsIGZ1bmN0aW9uKGV2ZW50KVxuICAgIHtcbiAgICAgICAgaWYobW92aW5nKVxuICAgICAgICB7XG4gICAgICAgICAgICAkKCdib2R5JykudHJpZ2dlcignbW92ZS1zdG9wJyk7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgICQoJ2JvZHknKS5vbignbW91c2VlbnRlcicsICcubW92YWJsZScsIGZ1bmN0aW9uKGV2ZW50KVxuICAgIHtcbiAgICAgICAgaWYobW92aW5nKVxuICAgICAgICB7XG4gICAgICAgICAgICAkKHRoaXMpLmFkZENsYXNzKCdob3ZlcmluZycpO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICAkKCdib2R5Jykub24oJ21vdXNlbGVhdmUnLCAnLm1vdmFibGUnLCBmdW5jdGlvbihldmVudClcbiAgICB7XG4gICAgICAgIGlmKG1vdmluZylcbiAgICAgICAge1xuICAgICAgICAgICAgJCh0aGlzKS5yZW1vdmVDbGFzcygnaG92ZXJpbmcnKTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgJCgnYm9keScpLm9uKCdtb3ZlLXN0b3AnLCBmdW5jdGlvbigpXG4gICAge1xuICAgICAgICBpZihtb3ZpbmcpXG4gICAgICAgIHtcbiAgICAgICAgICAgIHZhciAkbW92aW5nID0gJCgnLm1vdmluZycpO1xuICAgICAgICAgICAgdmFyICRob3ZlcmluZyA9ICQoJy5ob3ZlcmluZycpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAkbW92aW5nLnJlbW92ZUNsYXNzKCdtb3ZpbmcnKTtcbiAgICAgICAgICAgICRob3ZlcmluZy5yZW1vdmVDbGFzcygnaG92ZXJpbmcnKTtcblxuICAgICAgICAgICAgaWYoJG1vdmluZy5sZW5ndGggJiYgJGhvdmVyaW5nLmxlbmd0aClcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB2YXIgY2xvbmUgPSAkbW92aW5nLmNsb25lKCk7XG5cbiAgICAgICAgICAgICAgICAvLyBMb29wIHRocm91Z2ggYWxsIHNlbGVjdCBpbnB1dHMgYW5kIHByZXNlcnZlIHRoZWlyIHZhbHVlc1xuICAgICAgICAgICAgICAgICRtb3ZpbmcuZmluZCgnc2VsZWN0JykuZWFjaChmdW5jdGlvbigpXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICB2YXIgaW5kZXggPSAkKHRoaXMpLmluZGV4KCk7XG4gICAgICAgICAgICAgICAgICAgIGNsb25lLmZpbmQoJ3NlbGVjdCcpLmVxKGluZGV4KS52YWwoJCh0aGlzKS52YWwoKSk7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICBjbG9uZS5pbnNlcnRBZnRlcigkaG92ZXJpbmcpO1xuICAgICAgICAgICAgICAgICRtb3ZpbmcucmVtb3ZlKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIG1vdmluZyA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgfSk7XG59KTtcbiIsIi8vIFF1ZXJ5IHN0cmluZyBwYXJzZXIsIGZyb20gbnBtXG52YXIgcXVlcnkgPSByZXF1aXJlKCdxdWVyeS1zdHJpbmcnKTtcblxuJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKVxue1xuICAgIHZhciBwYXJzZWQgPSBxdWVyeS5wYXJzZShsb2NhdGlvbi5zZWFyY2gpO1xuICAgIFxuICAgICQoJ2JvZHknKS5vbignY2xpY2snLCAnLnNvcnQtYXNjJywgZnVuY3Rpb24oKVxuICAgIHtcbiAgICAgICAgdmFyIGNvbHVtbiA9ICQodGhpcykucGFyZW50cygndGgnKS5kYXRhKCdjb2x1bW4nKTtcbiAgICAgICAgdmFyIHR5cGUgPSAkKHRoaXMpLnBhcmVudHMoJ3RoJykuZGF0YSgndHlwZScpO1xuXG4gICAgICAgIGlmKHR5cGUgPT0gJ1JhbmdlJylcbiAgICAgICAge1xuICAgICAgICAgICAgY29sdW1uID0gY29sdW1uICsgXCJfbWluXCI7XG4gICAgICAgIH1cblxuICAgICAgICBwYXJzZWQuY29sdW1uID0gY29sdW1uO1xuICAgICAgICBwYXJzZWQuc29ydCA9ICdhc2MnO1xuXG4gICAgICAgIGxvY2F0aW9uID0gbG9jYXRpb24ub3JpZ2luICsgbG9jYXRpb24ucGF0aG5hbWUgKyAnPycgKyBxdWVyeS5zdHJpbmdpZnkocGFyc2VkKTtcbiAgICB9KTtcblxuICAgICQoJ2JvZHknKS5vbignY2xpY2snLCAnLnNvcnQtZGVzYycsIGZ1bmN0aW9uKClcbiAgICB7XG4gICAgICAgIHZhciBjb2x1bW4gPSAkKHRoaXMpLnBhcmVudHMoJ3RoJykuZGF0YSgnY29sdW1uJyk7XG4gICAgICAgIHZhciB0eXBlID0gJCh0aGlzKS5wYXJlbnRzKCd0aCcpLmRhdGEoJ3R5cGUnKTtcblxuICAgICAgICBpZih0eXBlID09ICdSYW5nZScpXG4gICAgICAgIHtcbiAgICAgICAgICAgIGNvbHVtbiA9IGNvbHVtbiArIFwiX21heFwiO1xuICAgICAgICB9XG5cbiAgICAgICAgcGFyc2VkLmNvbHVtbiA9IGNvbHVtbjtcbiAgICAgICAgcGFyc2VkLnNvcnQgPSAnZGVzYyc7XG5cbiAgICAgICAgbG9jYXRpb24gPSBsb2NhdGlvbi5vcmlnaW4gKyBsb2NhdGlvbi5wYXRobmFtZSArICc/JyArIHF1ZXJ5LnN0cmluZ2lmeShwYXJzZWQpO1xuICAgIH0pO1xufSk7XG4iLCIkKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpXG57XG4gICAgJCgnYm9keScpLm9uKCdjbGljaycsICcuYWRkLWNvbHVtbicsIGZ1bmN0aW9uKGV2ZW50KVxuICAgIHtcbiAgICAgICAgdmFyIHRlbXBsYXRlID0gJCgnLmNvbHVtbi10ZW1wbGF0ZScpLmNsb25lKCk7XG4gICAgICAgIHRlbXBsYXRlLnJlbW92ZUNsYXNzKCdjb2x1bW4tdGVtcGxhdGUgaGlkZGVuJyk7XG4gICAgICAgIHRlbXBsYXRlLmFkZENsYXNzKCdtb3ZhYmxlJyk7XG4gICAgICAgICQoJy5mb3JtLWNvbnRlbnQnKS5hcHBlbmQodGVtcGxhdGUpO1xuICAgIH0pO1xuXG4gICAgJCgnYm9keScpLm9uKCdjbGljaycsICcucmVtb3ZlLWNvbHVtbicsIGZ1bmN0aW9uKGV2ZW50KVxuICAgIHtcbiAgICAgICAgJCh0aGlzKS5wYXJlbnRzKCcuZm9ybS1ncm91cCcpLmZhZGVPdXQoZnVuY3Rpb24oKVxuICAgICAgICB7XG4gICAgICAgICAgICAkKHRoaXMpLnJlbW92ZSgpO1xuICAgICAgICB9KTtcbiAgICB9KTtcbn0pO1xuIiwiJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKVxue1xuICAgICQod2luZG93KS5vbignZm9ybS1sb2FkZWQnLCBmdW5jdGlvbihldmVudCwgcmVzcG9uc2UpXG4gICAge1xuICAgICAgICBpZihyZXNwb25zZS5zdGF0dXMgPT0gJ3N1Y2Nlc3MnKVxuICAgICAgICB7XG4gICAgICAgICAgICAkKCcuYWRkLWFub3RoZXInKS5yZW1vdmVDbGFzcygnaGlkZGVuJyk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGNvbnNvbGUubG9nKHJlc3BvbnNlKTtcbiAgICB9KTtcbn0pO1xuIiwiJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKVxue1xuICAgIC8qXG4gICAgJCgnYm9keScpLm9uKCdzdWJtaXQnLCAnLnNlYXJjaCcsIGZ1bmN0aW9uKGV2ZW50KVxuICAgIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJIaSFcIik7XG4gICAgfSk7XG4gICAgKi9cbn0pO1xuIl19
