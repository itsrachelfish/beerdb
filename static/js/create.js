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
