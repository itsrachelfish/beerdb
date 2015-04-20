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
