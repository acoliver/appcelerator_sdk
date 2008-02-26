
window=this;
top = window;

window.navigator = 
{
    get userAgent()
    {
      return "Mozilla/5.0 (Macintosh; U; Intel Mac OS X; en-US; rv:1.8.1.3) Gecko/20070309 Firefox/2.0.0.3";
    }
};
    
window.screen = 
{
    height:768,
    width:1024,
    colorDepth:32
};

window.setTimeout=function(f,i)
{
    f();
};

window.setInterval=function(f,i)
{
};
    
_element = 
{
    attachEvent:function()
    {
    },
    appendChild:function()
    {
    },
    addEventListener:function()
    {
    }
};

document = 
{
    createElement:function()
    {
        return _element;
    },
    createTextNode: function()
    {
        return {};
    },
    createEvent:function()
    {
        return {};
    },
    write:function(msg)
    {
    },
    getElementById: function(id)
    {
        return _element;
    },
    getElementsByTagName:function()
    {
        return [];
    }
};

window.__defineGetter__("location", function(url)
{
        return {
            get protocol(){
                return "file:";
            },
            get href(){
                return "file://test.html";
            },
            toString: function(){
                return this.href;
            }
        };
});

window.document = document;
window.document.location = window.location;

