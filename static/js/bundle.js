(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
require('./misc/ajax');
require('./misc/dragon-drop');
require('./misc/sort');

require('./pages/create');
require('./pages/insert');
require('./pages/search');

},{"./misc/ajax":2,"./misc/dragon-drop":3,"./misc/sort":4,"./pages/create":5,"./pages/insert":6,"./pages/search":7}],2:[function(require,module,exports){
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

},{}],3:[function(require,module,exports){
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

},{}],4:[function(require,module,exports){
$(document).ready(function()
{
    $('body').on('click', '.sort-asc', function()
    {
        var sort = $(this).parents('th').text();
        console.log(sort, "asc!");
    });

    $('body').on('click', '.sort-desc', function()
    {
        var sort = $(this).parents('th').text();
        console.log(sort, "desc!");
    });
});

},{}],5:[function(require,module,exports){
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

},{}],6:[function(require,module,exports){
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

},{}],7:[function(require,module,exports){
$(document).ready(function()
{
    $(body).on('submit', '.search', function(event)
    {
        console.log("Hi!");
    });
});

},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzdGF0aWMvanMvbWFpbi5qcyIsInN0YXRpYy9qcy9taXNjL2FqYXguanMiLCJzdGF0aWMvanMvbWlzYy9kcmFnb24tZHJvcC5qcyIsInN0YXRpYy9qcy9taXNjL3NvcnQuanMiLCJzdGF0aWMvanMvcGFnZXMvY3JlYXRlLmpzIiwic3RhdGljL2pzL3BhZ2VzL2luc2VydC5qcyIsInN0YXRpYy9qcy9wYWdlcy9zZWFyY2guanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0VBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJyZXF1aXJlKCcuL21pc2MvYWpheCcpO1xucmVxdWlyZSgnLi9taXNjL2RyYWdvbi1kcm9wJyk7XG5yZXF1aXJlKCcuL21pc2Mvc29ydCcpO1xuXG5yZXF1aXJlKCcuL3BhZ2VzL2NyZWF0ZScpO1xucmVxdWlyZSgnLi9wYWdlcy9pbnNlcnQnKTtcbnJlcXVpcmUoJy4vcGFnZXMvc2VhcmNoJyk7XG4iLCJmdW5jdGlvbiByZWRpcmVjdCh1cmwsIHRpbWVvdXQpXG57XG4gICAgaWYoJCgnLnJlZGlyZWN0JykubGVuZ3RoKVxuICAgIHtcbiAgICAgICAgdmFyIHVybCA9ICQoJy5yZWRpcmVjdCcpLmF0dHIoJ3JlZGlyZWN0LXVybCcpO1xuICAgICAgICB2YXIgdGltZW91dCA9IHBhcnNlSW50KCQoJy5yZWRpcmVjdCcpLmF0dHIoJ3JlZGlyZWN0LXRpbWVvdXQnKSk7XG4gICAgfVxuXG4gICAgaWYodXJsKVxuICAgIHtcbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHsgd2luZG93LmxvY2F0aW9uID0gdXJsOyB9LCB0aW1lb3V0ICogMTAwMCk7XG4gICAgfVxufVxuXG4kKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpXG57XG4gICAgJCgnYm9keScpLm9uKCdzdWJtaXQnLCAnLmZvcm0td3JhcCBmb3JtJywgZnVuY3Rpb24oZXZlbnQpXG4gICAge1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAgIHZhciBmb3JtID0gJCh0aGlzKTtcbiAgICAgICAgdmFyIGFjdGlvbiA9ICQodGhpcykuYXR0cignYWN0aW9uJyk7XG4gICAgICAgIHZhciBkYXRhID0gJCh0aGlzKS5zZXJpYWxpemUoKTtcblxuICAgICAgICAvLyBSZW1vdmUgcHJldmlvdXMgZXJyb3IgbWVzc2FnZXNcbiAgICAgICAgZm9ybS5wYXJlbnRzKCcuZm9ybS13cmFwJykuZmluZCgnLmFsZXJ0JykucmVtb3ZlKCk7XG5cbiAgICAgICAgJC5wb3N0KGFjdGlvbiwgZGF0YSwgZnVuY3Rpb24ocmVzcG9uc2UpXG4gICAgICAgIHtcbiAgICAgICAgICAgIHRyeVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHJlc3BvbnNlID0gSlNPTi5wYXJzZShyZXNwb25zZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaChlcnJvcilcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICByZXNwb25zZSA9IHsnc3RhdHVzJzogJ2Vycm9yJywgJ21lc3NhZ2UnOiAnVW5hYmxlIHRvIGRlY29kZSB0aGUgcmVzcG9uc2UgZnJvbSB0aGUgc2VydmVyLid9O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAkKHdpbmRvdykudHJpZ2dlcignZm9ybS1sb2FkZWQnLCByZXNwb25zZSk7XG5cbiAgICAgICAgICAgIGlmKHJlc3BvbnNlLnN0YXR1cyA9PSAnc3VjY2VzcycpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdmFyIG1lc3NhZ2UgPSAkKCc8ZGl2IGNsYXNzPVwiYWxlcnQgYWxlcnQtc3VjY2Vzc1wiIHN0eWxlPVwiZGlzcGxheTpub25lXCIgcm9sZT1cImFsZXJ0XCI+PHN0cm9uZz5TdWNjZXNzITwvc3Ryb25nPiAnK3Jlc3BvbnNlLm1lc3NhZ2UrJzwvZGl2PicpO1xuICAgICAgICAgICAgICAgIGZvcm0ucGFyZW50cygnLmZvcm0td3JhcCcpLnByZXBlbmQobWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICBtZXNzYWdlLmZhZGVJbigpO1xuICAgICAgICAgICAgICAgIGZvcm0uZmFkZU91dCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZihyZXNwb25zZS5zdGF0dXMgPT0gJ2Vycm9yJylcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAvLyBIYW5kbGUgZ2VuZXJpYyBlcnJvciBtZXNzYWdlc1xuICAgICAgICAgICAgICAgIGlmKHJlc3BvbnNlLm1lc3NhZ2UpXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICB2YXIgbWVzc2FnZSA9ICQoJzxkaXYgY2xhc3M9XCJhbGVydCBhbGVydC1kYW5nZXJcIiBzdHlsZT1cImRpc3BsYXk6bm9uZVwiIHJvbGU9XCJhbGVydFwiPjxzdHJvbmc+RXJyb3I6PC9zdHJvbmc+ICcrcmVzcG9uc2UubWVzc2FnZSsnPC9kaXY+Jyk7XG4gICAgICAgICAgICAgICAgICAgIGZvcm0ucGFyZW50cygnLmZvcm0td3JhcCcpLnByZXBlbmQobWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZS5mYWRlSW4oKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgLy8gSGFuZGxlIGxpc3RzIG9mIGVycm9yIG1lc3NhZ2VzXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgJC5lYWNoKHJlc3BvbnNlLmVycm9ycywgZnVuY3Rpb24oZmllbGQsIGVycm9yKVxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZihmaWVsZCA9PSBcInVua25vd25cIilcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgbWVzc2FnZSA9ICQoJzxkaXYgY2xhc3M9XCJhbGVydCBhbGVydC1kYW5nZXJcIiBzdHlsZT1cImRpc3BsYXk6bm9uZVwiIHJvbGU9XCJhbGVydFwiPjxzdHJvbmc+RXJyb3I6PC9zdHJvbmc+ICcrZXJyb3IrJzwvZGl2PicpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvcm0ucGFyZW50cygnLmZvcm0td3JhcCcpLnByZXBlbmQobWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlLmZhZGVJbigpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZihBcnJheS5pc0FycmF5KGVycm9yKSlcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IodmFyIGkgPSAwLCBsID0gZXJyb3IubGVuZ3RoOyBpIDwgbDsgaSsrKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYoZXJyb3JbaV0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBpbnB1dCA9IGZvcm0uZmluZCgnW25hbWU9XCInK2ZpZWxkKydbXVwiXScpLmVxKGkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZihpbnB1dC5sZW5ndGgpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gUmVtb3ZlIGFueSBwcmV2aW91cyBlcnJvciBtZXNzYWdlcyB3aGVuIGRpc3BsYXlpbmcgbmV3IG9uZXNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbnB1dC5zaWJsaW5ncygnLmhlbHAtYmxvY2snKS5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbnB1dC5wYXJlbnRzKCcuZm9ybS1ncm91cCcpLmFkZENsYXNzKCdoYXMtZXJyb3InKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBtZXNzYWdlID0gJCgnPHAgY2xhc3M9XCJoZWxwLWJsb2NrXCIgc3R5bGU9XCJkaXNwbGF5Om5vbmVcIj4nK2Vycm9yW2ldKyc8L3A+Jyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5wdXQucGFyZW50cygnLmlucHV0LXdyYXAnKS5hcHBlbmQobWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlLmZhZGVJbigpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBpbnB1dCA9IGZvcm0uZmluZCgnW25hbWU9XCInK2ZpZWxkKydcIl0nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZihpbnB1dC5sZW5ndGgpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBSZW1vdmUgYW55IHByZXZpb3VzIGVycm9yIG1lc3NhZ2VzIHdoZW4gZGlzcGxheWluZyBuZXcgb25lc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbnB1dC5zaWJsaW5ncygnLmhlbHAtYmxvY2snKS5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5wdXQucGFyZW50cygnLmZvcm0tZ3JvdXAnKS5hZGRDbGFzcygnaGFzLWVycm9yJyk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG1lc3NhZ2UgPSAkKCc8cCBjbGFzcz1cImhlbHAtYmxvY2tcIiBzdHlsZT1cImRpc3BsYXk6bm9uZVwiPicrZXJyb3IrJzwvcD4nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5wdXQucGFyZW50cygnLmlucHV0LXdyYXAnKS5hcHBlbmQobWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZS5mYWRlSW4oKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhyZXNwb25zZSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmKHJlc3BvbnNlLnJlZGlyZWN0KVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHJlZGlyZWN0KHJlc3BvbnNlLnJlZGlyZWN0LnVybCwgcmVzcG9uc2UucmVkaXJlY3QudGltZW91dCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgLy8gQXV0b21hdGljYWxseSByZW1vdmUgZXJyb3IgbWVzc2FnZXMgd2hlbiB0eXBpbmcgaW50byBhbiBpbnB1dFxuICAgICQoJ2Zvcm0gaW5wdXQsIGZvcm0gdGV4dGFyZWEnKS5vbigna2V5dXAnLCBmdW5jdGlvbigpXG4gICAge1xuICAgICAgICBpZigkKHRoaXMpLnZhbCgpLmxlbmd0aCAmJiAkKHRoaXMpLnBhcmVudHMoJy5mb3JtLWdyb3VwJykuaGFzQ2xhc3MoJ2hhcy1lcnJvcicpKVxuICAgICAgICB7XG4gICAgICAgICAgICAkKHRoaXMpLnBhcmVudHMoJy5mb3JtLWdyb3VwJykucmVtb3ZlQ2xhc3MoJ2hhcy1lcnJvcicpO1xuICAgICAgICAgICAgJCh0aGlzKS5zaWJsaW5ncygnLmhlbHAtYmxvY2snKS5mYWRlT3V0KGZ1bmN0aW9uKCkgeyAkKHRoaXMpLnJlbW92ZSgpOyB9KTtcbiAgICAgICAgfVxuICAgIH0pO1xufSk7XG4iLCIkKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpXG57XG4gICAgdmFyIG1vdmluZztcblxuICAgICQoJ2JvZHknKS5vbignbW91c2Vkb3duJywgJy5tb3ZlLWNvbHVtbicsIGZ1bmN0aW9uKGV2ZW50KVxuICAgIHtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgXG4gICAgICAgIHZhciBwYXJlbnQgPSAkKHRoaXMpLnBhcmVudHMoJy5tb3ZhYmxlJylcbiAgICAgICAgcGFyZW50LmFkZENsYXNzKCdtb3ZpbmcnKTtcblxuICAgICAgICBtb3ZpbmcgPSB0cnVlO1xuICAgIH0pO1xuXG4gICAgJCgnYm9keScpLm9uKCdtb3VzZXVwJywgZnVuY3Rpb24oZXZlbnQpXG4gICAge1xuICAgICAgICBpZihtb3ZpbmcpXG4gICAgICAgIHtcbiAgICAgICAgICAgICQoJ2JvZHknKS50cmlnZ2VyKCdtb3ZlLXN0b3AnKTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgJCgnYm9keScpLm9uKCdtb3VzZWxlYXZlJywgZnVuY3Rpb24oZXZlbnQpXG4gICAge1xuICAgICAgICBpZihtb3ZpbmcpXG4gICAgICAgIHtcbiAgICAgICAgICAgICQoJ2JvZHknKS50cmlnZ2VyKCdtb3ZlLXN0b3AnKTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgJCgnYm9keScpLm9uKCdtb3VzZWVudGVyJywgJy5tb3ZhYmxlJywgZnVuY3Rpb24oZXZlbnQpXG4gICAge1xuICAgICAgICBpZihtb3ZpbmcpXG4gICAgICAgIHtcbiAgICAgICAgICAgICQodGhpcykuYWRkQ2xhc3MoJ2hvdmVyaW5nJyk7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgICQoJ2JvZHknKS5vbignbW91c2VsZWF2ZScsICcubW92YWJsZScsIGZ1bmN0aW9uKGV2ZW50KVxuICAgIHtcbiAgICAgICAgaWYobW92aW5nKVxuICAgICAgICB7XG4gICAgICAgICAgICAkKHRoaXMpLnJlbW92ZUNsYXNzKCdob3ZlcmluZycpO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICAkKCdib2R5Jykub24oJ21vdmUtc3RvcCcsIGZ1bmN0aW9uKClcbiAgICB7XG4gICAgICAgIGlmKG1vdmluZylcbiAgICAgICAge1xuICAgICAgICAgICAgdmFyICRtb3ZpbmcgPSAkKCcubW92aW5nJyk7XG4gICAgICAgICAgICB2YXIgJGhvdmVyaW5nID0gJCgnLmhvdmVyaW5nJyk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgICRtb3ZpbmcucmVtb3ZlQ2xhc3MoJ21vdmluZycpO1xuICAgICAgICAgICAgJGhvdmVyaW5nLnJlbW92ZUNsYXNzKCdob3ZlcmluZycpO1xuXG4gICAgICAgICAgICBpZigkbW92aW5nLmxlbmd0aCAmJiAkaG92ZXJpbmcubGVuZ3RoKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHZhciBjbG9uZSA9ICRtb3ZpbmcuY2xvbmUoKTtcblxuICAgICAgICAgICAgICAgIC8vIExvb3AgdGhyb3VnaCBhbGwgc2VsZWN0IGlucHV0cyBhbmQgcHJlc2VydmUgdGhlaXIgdmFsdWVzXG4gICAgICAgICAgICAgICAgJG1vdmluZy5maW5kKCdzZWxlY3QnKS5lYWNoKGZ1bmN0aW9uKClcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBpbmRleCA9ICQodGhpcykuaW5kZXgoKTtcbiAgICAgICAgICAgICAgICAgICAgY2xvbmUuZmluZCgnc2VsZWN0JykuZXEoaW5kZXgpLnZhbCgkKHRoaXMpLnZhbCgpKTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIGNsb25lLmluc2VydEFmdGVyKCRob3ZlcmluZyk7XG4gICAgICAgICAgICAgICAgJG1vdmluZy5yZW1vdmUoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgbW92aW5nID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9KTtcbn0pO1xuIiwiJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKVxue1xuICAgICQoJ2JvZHknKS5vbignY2xpY2snLCAnLnNvcnQtYXNjJywgZnVuY3Rpb24oKVxuICAgIHtcbiAgICAgICAgdmFyIHNvcnQgPSAkKHRoaXMpLnBhcmVudHMoJ3RoJykudGV4dCgpO1xuICAgICAgICBjb25zb2xlLmxvZyhzb3J0LCBcImFzYyFcIik7XG4gICAgfSk7XG5cbiAgICAkKCdib2R5Jykub24oJ2NsaWNrJywgJy5zb3J0LWRlc2MnLCBmdW5jdGlvbigpXG4gICAge1xuICAgICAgICB2YXIgc29ydCA9ICQodGhpcykucGFyZW50cygndGgnKS50ZXh0KCk7XG4gICAgICAgIGNvbnNvbGUubG9nKHNvcnQsIFwiZGVzYyFcIik7XG4gICAgfSk7XG59KTtcbiIsIiQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKClcbntcbiAgICAkKCdib2R5Jykub24oJ2NsaWNrJywgJy5hZGQtY29sdW1uJywgZnVuY3Rpb24oZXZlbnQpXG4gICAge1xuICAgICAgICB2YXIgdGVtcGxhdGUgPSAkKCcuY29sdW1uLXRlbXBsYXRlJykuY2xvbmUoKTtcbiAgICAgICAgdGVtcGxhdGUucmVtb3ZlQ2xhc3MoJ2NvbHVtbi10ZW1wbGF0ZSBoaWRkZW4nKTtcbiAgICAgICAgdGVtcGxhdGUuYWRkQ2xhc3MoJ21vdmFibGUnKTtcbiAgICAgICAgJCgnLmZvcm0tY29udGVudCcpLmFwcGVuZCh0ZW1wbGF0ZSk7XG4gICAgfSk7XG5cbiAgICAkKCdib2R5Jykub24oJ2NsaWNrJywgJy5yZW1vdmUtY29sdW1uJywgZnVuY3Rpb24oZXZlbnQpXG4gICAge1xuICAgICAgICAkKHRoaXMpLnBhcmVudHMoJy5mb3JtLWdyb3VwJykuZmFkZU91dChmdW5jdGlvbigpXG4gICAgICAgIHtcbiAgICAgICAgICAgICQodGhpcykucmVtb3ZlKCk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xufSk7XG4iLCIkKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpXG57XG4gICAgJCh3aW5kb3cpLm9uKCdmb3JtLWxvYWRlZCcsIGZ1bmN0aW9uKGV2ZW50LCByZXNwb25zZSlcbiAgICB7XG4gICAgICAgIGlmKHJlc3BvbnNlLnN0YXR1cyA9PSAnc3VjY2VzcycpXG4gICAgICAgIHtcbiAgICAgICAgICAgICQoJy5hZGQtYW5vdGhlcicpLnJlbW92ZUNsYXNzKCdoaWRkZW4nKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgY29uc29sZS5sb2cocmVzcG9uc2UpO1xuICAgIH0pO1xufSk7XG4iLCIkKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpXG57XG4gICAgJChib2R5KS5vbignc3VibWl0JywgJy5zZWFyY2gnLCBmdW5jdGlvbihldmVudClcbiAgICB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiSGkhXCIpO1xuICAgIH0pO1xufSk7XG4iXX0=
