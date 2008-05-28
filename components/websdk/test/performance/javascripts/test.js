function runTest(item)
{
    var div = $(item+'_test');
    if (div)
    {
        var html = '<iframe src="tests/'+item+'.html" width="0" height="0"></iframe>';
        div.innerHTML = html;
    }
}