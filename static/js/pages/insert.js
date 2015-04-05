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
