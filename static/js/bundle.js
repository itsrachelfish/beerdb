(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
require('./misc/ajax');
require('./misc/dragon-drop');

require('./pages/create');
require('./pages/insert');

},{"./misc/ajax":2,"./misc/dragon-drop":3,"./pages/create":4,"./pages/insert":5}],2:[function(require,module,exports){
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
    $('body').on('submit', 'form', function(event)
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

},{}],5:[function(require,module,exports){
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

},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzdGF0aWMvanMvbWFpbi5qcyIsInN0YXRpYy9qcy9taXNjL2FqYXguanMiLCJzdGF0aWMvanMvbWlzYy9kcmFnb24tZHJvcC5qcyIsInN0YXRpYy9qcy9wYWdlcy9jcmVhdGUuanMiLCJzdGF0aWMvanMvcGFnZXMvaW5zZXJ0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0VBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJyZXF1aXJlKCcuL21pc2MvYWpheCcpO1xucmVxdWlyZSgnLi9taXNjL2RyYWdvbi1kcm9wJyk7XG5cbnJlcXVpcmUoJy4vcGFnZXMvY3JlYXRlJyk7XG5yZXF1aXJlKCcuL3BhZ2VzL2luc2VydCcpO1xuIiwiZnVuY3Rpb24gcmVkaXJlY3QodXJsLCB0aW1lb3V0KVxue1xuICAgIGlmKCQoJy5yZWRpcmVjdCcpLmxlbmd0aClcbiAgICB7XG4gICAgICAgIHZhciB1cmwgPSAkKCcucmVkaXJlY3QnKS5hdHRyKCdyZWRpcmVjdC11cmwnKTtcbiAgICAgICAgdmFyIHRpbWVvdXQgPSBwYXJzZUludCgkKCcucmVkaXJlY3QnKS5hdHRyKCdyZWRpcmVjdC10aW1lb3V0JykpO1xuICAgIH1cblxuICAgIGlmKHVybClcbiAgICB7XG4gICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7IHdpbmRvdy5sb2NhdGlvbiA9IHVybDsgfSwgdGltZW91dCAqIDEwMDApO1xuICAgIH1cbn1cblxuJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKVxue1xuICAgICQoJ2JvZHknKS5vbignc3VibWl0JywgJ2Zvcm0nLCBmdW5jdGlvbihldmVudClcbiAgICB7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgdmFyIGZvcm0gPSAkKHRoaXMpO1xuICAgICAgICB2YXIgYWN0aW9uID0gJCh0aGlzKS5hdHRyKCdhY3Rpb24nKTtcbiAgICAgICAgdmFyIGRhdGEgPSAkKHRoaXMpLnNlcmlhbGl6ZSgpO1xuXG4gICAgICAgIC8vIFJlbW92ZSBwcmV2aW91cyBlcnJvciBtZXNzYWdlc1xuICAgICAgICBmb3JtLnBhcmVudHMoJy5mb3JtLXdyYXAnKS5maW5kKCcuYWxlcnQnKS5yZW1vdmUoKTtcblxuICAgICAgICAkLnBvc3QoYWN0aW9uLCBkYXRhLCBmdW5jdGlvbihyZXNwb25zZSlcbiAgICAgICAge1xuICAgICAgICAgICAgdHJ5XG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgcmVzcG9uc2UgPSBKU09OLnBhcnNlKHJlc3BvbnNlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoKGVycm9yKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHJlc3BvbnNlID0geydzdGF0dXMnOiAnZXJyb3InLCAnbWVzc2FnZSc6ICdVbmFibGUgdG8gZGVjb2RlIHRoZSByZXNwb25zZSBmcm9tIHRoZSBzZXJ2ZXIuJ307XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICQod2luZG93KS50cmlnZ2VyKCdmb3JtLWxvYWRlZCcsIHJlc3BvbnNlKTtcblxuICAgICAgICAgICAgaWYocmVzcG9uc2Uuc3RhdHVzID09ICdzdWNjZXNzJylcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB2YXIgbWVzc2FnZSA9ICQoJzxkaXYgY2xhc3M9XCJhbGVydCBhbGVydC1zdWNjZXNzXCIgc3R5bGU9XCJkaXNwbGF5Om5vbmVcIiByb2xlPVwiYWxlcnRcIj48c3Ryb25nPlN1Y2Nlc3MhPC9zdHJvbmc+ICcrcmVzcG9uc2UubWVzc2FnZSsnPC9kaXY+Jyk7XG4gICAgICAgICAgICAgICAgZm9ybS5wYXJlbnRzKCcuZm9ybS13cmFwJykucHJlcGVuZChtZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgIG1lc3NhZ2UuZmFkZUluKCk7XG4gICAgICAgICAgICAgICAgZm9ybS5mYWRlT3V0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmKHJlc3BvbnNlLnN0YXR1cyA9PSAnZXJyb3InKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIC8vIEhhbmRsZSBnZW5lcmljIGVycm9yIG1lc3NhZ2VzXG4gICAgICAgICAgICAgICAgaWYocmVzcG9uc2UubWVzc2FnZSlcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBtZXNzYWdlID0gJCgnPGRpdiBjbGFzcz1cImFsZXJ0IGFsZXJ0LWRhbmdlclwiIHN0eWxlPVwiZGlzcGxheTpub25lXCIgcm9sZT1cImFsZXJ0XCI+PHN0cm9uZz5FcnJvcjo8L3N0cm9uZz4gJytyZXNwb25zZS5tZXNzYWdlKyc8L2Rpdj4nKTtcbiAgICAgICAgICAgICAgICAgICAgZm9ybS5wYXJlbnRzKCcuZm9ybS13cmFwJykucHJlcGVuZChtZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlLmZhZGVJbigpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAvLyBIYW5kbGUgbGlzdHMgb2YgZXJyb3IgbWVzc2FnZXNcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAkLmVhY2gocmVzcG9uc2UuZXJyb3JzLCBmdW5jdGlvbihmaWVsZCwgZXJyb3IpXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKGZpZWxkID09IFwidW5rbm93blwiKVxuICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBtZXNzYWdlID0gJCgnPGRpdiBjbGFzcz1cImFsZXJ0IGFsZXJ0LWRhbmdlclwiIHN0eWxlPVwiZGlzcGxheTpub25lXCIgcm9sZT1cImFsZXJ0XCI+PHN0cm9uZz5FcnJvcjo8L3N0cm9uZz4gJytlcnJvcisnPC9kaXY+Jyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9ybS5wYXJlbnRzKCcuZm9ybS13cmFwJykucHJlcGVuZChtZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2UuZmFkZUluKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmKEFycmF5LmlzQXJyYXkoZXJyb3IpKVxuICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvcih2YXIgaSA9IDAsIGwgPSBlcnJvci5sZW5ndGg7IGkgPCBsOyBpKyspXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZihlcnJvcltpXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGlucHV0ID0gZm9ybS5maW5kKCdbbmFtZT1cIicrZmllbGQrJ1tdXCJdJykuZXEoaSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKGlucHV0Lmxlbmd0aClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBSZW1vdmUgYW55IHByZXZpb3VzIGVycm9yIG1lc3NhZ2VzIHdoZW4gZGlzcGxheWluZyBuZXcgb25lc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlucHV0LnNpYmxpbmdzKCcuaGVscC1ibG9jaycpLnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlucHV0LnBhcmVudHMoJy5mb3JtLWdyb3VwJykuYWRkQ2xhc3MoJ2hhcy1lcnJvcicpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG1lc3NhZ2UgPSAkKCc8cCBjbGFzcz1cImhlbHAtYmxvY2tcIiBzdHlsZT1cImRpc3BsYXk6bm9uZVwiPicrZXJyb3JbaV0rJzwvcD4nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbnB1dC5wYXJlbnRzKCcuaW5wdXQtd3JhcCcpLmFwcGVuZChtZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2UuZmFkZUluKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGlucHV0ID0gZm9ybS5maW5kKCdbbmFtZT1cIicrZmllbGQrJ1wiXScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKGlucHV0Lmxlbmd0aClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFJlbW92ZSBhbnkgcHJldmlvdXMgZXJyb3IgbWVzc2FnZXMgd2hlbiBkaXNwbGF5aW5nIG5ldyBvbmVzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlucHV0LnNpYmxpbmdzKCcuaGVscC1ibG9jaycpLnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbnB1dC5wYXJlbnRzKCcuZm9ybS1ncm91cCcpLmFkZENsYXNzKCdoYXMtZXJyb3InKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgbWVzc2FnZSA9ICQoJzxwIGNsYXNzPVwiaGVscC1ibG9ja1wiIHN0eWxlPVwiZGlzcGxheTpub25lXCI+JytlcnJvcisnPC9wPicpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbnB1dC5wYXJlbnRzKCcuaW5wdXQtd3JhcCcpLmFwcGVuZChtZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlLmZhZGVJbigpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlc3BvbnNlKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYocmVzcG9uc2UucmVkaXJlY3QpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgcmVkaXJlY3QocmVzcG9uc2UucmVkaXJlY3QudXJsLCByZXNwb25zZS5yZWRpcmVjdC50aW1lb3V0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICAvLyBBdXRvbWF0aWNhbGx5IHJlbW92ZSBlcnJvciBtZXNzYWdlcyB3aGVuIHR5cGluZyBpbnRvIGFuIGlucHV0XG4gICAgJCgnZm9ybSBpbnB1dCwgZm9ybSB0ZXh0YXJlYScpLm9uKCdrZXl1cCcsIGZ1bmN0aW9uKClcbiAgICB7XG4gICAgICAgIGlmKCQodGhpcykudmFsKCkubGVuZ3RoICYmICQodGhpcykucGFyZW50cygnLmZvcm0tZ3JvdXAnKS5oYXNDbGFzcygnaGFzLWVycm9yJykpXG4gICAgICAgIHtcbiAgICAgICAgICAgICQodGhpcykucGFyZW50cygnLmZvcm0tZ3JvdXAnKS5yZW1vdmVDbGFzcygnaGFzLWVycm9yJyk7XG4gICAgICAgICAgICAkKHRoaXMpLnNpYmxpbmdzKCcuaGVscC1ibG9jaycpLmZhZGVPdXQoZnVuY3Rpb24oKSB7ICQodGhpcykucmVtb3ZlKCk7IH0pO1xuICAgICAgICB9XG4gICAgfSk7XG59KTtcbiIsIiQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKClcbntcbiAgICB2YXIgbW92aW5nO1xuXG4gICAgJCgnYm9keScpLm9uKCdtb3VzZWRvd24nLCAnLm1vdmUtY29sdW1uJywgZnVuY3Rpb24oZXZlbnQpXG4gICAge1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBcbiAgICAgICAgdmFyIHBhcmVudCA9ICQodGhpcykucGFyZW50cygnLm1vdmFibGUnKVxuICAgICAgICBwYXJlbnQuYWRkQ2xhc3MoJ21vdmluZycpO1xuXG4gICAgICAgIG1vdmluZyA9IHRydWU7XG4gICAgfSk7XG5cbiAgICAkKCdib2R5Jykub24oJ21vdXNldXAnLCBmdW5jdGlvbihldmVudClcbiAgICB7XG4gICAgICAgIGlmKG1vdmluZylcbiAgICAgICAge1xuICAgICAgICAgICAgJCgnYm9keScpLnRyaWdnZXIoJ21vdmUtc3RvcCcpO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICAkKCdib2R5Jykub24oJ21vdXNlbGVhdmUnLCBmdW5jdGlvbihldmVudClcbiAgICB7XG4gICAgICAgIGlmKG1vdmluZylcbiAgICAgICAge1xuICAgICAgICAgICAgJCgnYm9keScpLnRyaWdnZXIoJ21vdmUtc3RvcCcpO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICAkKCdib2R5Jykub24oJ21vdXNlZW50ZXInLCAnLm1vdmFibGUnLCBmdW5jdGlvbihldmVudClcbiAgICB7XG4gICAgICAgIGlmKG1vdmluZylcbiAgICAgICAge1xuICAgICAgICAgICAgJCh0aGlzKS5hZGRDbGFzcygnaG92ZXJpbmcnKTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgJCgnYm9keScpLm9uKCdtb3VzZWxlYXZlJywgJy5tb3ZhYmxlJywgZnVuY3Rpb24oZXZlbnQpXG4gICAge1xuICAgICAgICBpZihtb3ZpbmcpXG4gICAgICAgIHtcbiAgICAgICAgICAgICQodGhpcykucmVtb3ZlQ2xhc3MoJ2hvdmVyaW5nJyk7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgICQoJ2JvZHknKS5vbignbW92ZS1zdG9wJywgZnVuY3Rpb24oKVxuICAgIHtcbiAgICAgICAgaWYobW92aW5nKVxuICAgICAgICB7XG4gICAgICAgICAgICB2YXIgJG1vdmluZyA9ICQoJy5tb3ZpbmcnKTtcbiAgICAgICAgICAgIHZhciAkaG92ZXJpbmcgPSAkKCcuaG92ZXJpbmcnKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgJG1vdmluZy5yZW1vdmVDbGFzcygnbW92aW5nJyk7XG4gICAgICAgICAgICAkaG92ZXJpbmcucmVtb3ZlQ2xhc3MoJ2hvdmVyaW5nJyk7XG5cbiAgICAgICAgICAgIGlmKCRtb3ZpbmcubGVuZ3RoICYmICRob3ZlcmluZy5sZW5ndGgpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdmFyIGNsb25lID0gJG1vdmluZy5jbG9uZSgpO1xuXG4gICAgICAgICAgICAgICAgLy8gTG9vcCB0aHJvdWdoIGFsbCBzZWxlY3QgaW5wdXRzIGFuZCBwcmVzZXJ2ZSB0aGVpciB2YWx1ZXNcbiAgICAgICAgICAgICAgICAkbW92aW5nLmZpbmQoJ3NlbGVjdCcpLmVhY2goZnVuY3Rpb24oKVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGluZGV4ID0gJCh0aGlzKS5pbmRleCgpO1xuICAgICAgICAgICAgICAgICAgICBjbG9uZS5maW5kKCdzZWxlY3QnKS5lcShpbmRleCkudmFsKCQodGhpcykudmFsKCkpO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgY2xvbmUuaW5zZXJ0QWZ0ZXIoJGhvdmVyaW5nKTtcbiAgICAgICAgICAgICAgICAkbW92aW5nLnJlbW92ZSgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBtb3ZpbmcgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgIH0pO1xufSk7XG4iLCIkKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpXG57XG4gICAgJCgnYm9keScpLm9uKCdjbGljaycsICcuYWRkLWNvbHVtbicsIGZ1bmN0aW9uKGV2ZW50KVxuICAgIHtcbiAgICAgICAgdmFyIHRlbXBsYXRlID0gJCgnLmNvbHVtbi10ZW1wbGF0ZScpLmNsb25lKCk7XG4gICAgICAgIHRlbXBsYXRlLnJlbW92ZUNsYXNzKCdjb2x1bW4tdGVtcGxhdGUgaGlkZGVuJyk7XG4gICAgICAgIHRlbXBsYXRlLmFkZENsYXNzKCdtb3ZhYmxlJyk7XG4gICAgICAgICQoJy5mb3JtLWNvbnRlbnQnKS5hcHBlbmQodGVtcGxhdGUpO1xuICAgIH0pO1xuXG4gICAgJCgnYm9keScpLm9uKCdjbGljaycsICcucmVtb3ZlLWNvbHVtbicsIGZ1bmN0aW9uKGV2ZW50KVxuICAgIHtcbiAgICAgICAgJCh0aGlzKS5wYXJlbnRzKCcuZm9ybS1ncm91cCcpLmZhZGVPdXQoZnVuY3Rpb24oKVxuICAgICAgICB7XG4gICAgICAgICAgICAkKHRoaXMpLnJlbW92ZSgpO1xuICAgICAgICB9KTtcbiAgICB9KTtcbn0pO1xuIiwiJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKVxue1xuICAgICQod2luZG93KS5vbignZm9ybS1sb2FkZWQnLCBmdW5jdGlvbihldmVudCwgcmVzcG9uc2UpXG4gICAge1xuICAgICAgICBpZihyZXNwb25zZS5zdGF0dXMgPT0gJ3N1Y2Nlc3MnKVxuICAgICAgICB7XG4gICAgICAgICAgICAkKCcuYWRkLWFub3RoZXInKS5yZW1vdmVDbGFzcygnaGlkZGVuJyk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGNvbnNvbGUubG9nKHJlc3BvbnNlKTtcbiAgICB9KTtcbn0pO1xuIl19
