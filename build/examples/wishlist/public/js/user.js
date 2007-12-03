

var user_id;

(function()
{
    Appcelerator.Parameters = window.location.href.toQueryParams();
    user_id = Appcelerator.Parameters['id'];
})();

