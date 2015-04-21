$(document).ready(function()
{
    $('body').on('click', '.sort-asc', function()
    {
        var column = $(this).parents('th').data('column');
        var type = $(this).parents('th').data('type');
        
        console.log(column, type, "asc!");
    });

    $('body').on('click', '.sort-desc', function()
    {
        var column = $(this).parents('th').data('column');
        var type = $(this).parents('th').data('type');

        console.log(column, type, "desc!");
    });
});
