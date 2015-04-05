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
