
Appcelerator.Module.Keybinding =
{
    getName: function()
    {
        return 'appcelerator key bindings';
    },
    getDescription: function()
    {
        return 'keyboard bindings widget';
    },
    getVersion: function()
    {
        return 1.0;
    },
    getSpecVersion: function()
    {
        return 1.0;
    },  
    getAuthor: function()
    {
        return 'Jeff Haynie';
    },
    getModuleURL: function ()
    {
        return 'http://www.appcelerator.org';
    },
    isWidget: function ()
    {
        return true;
    },
    getWidgetName: function()
    {
        return 'app:keybinding';
    },
    getAttributes: function()
    {
        return [];
    },
    keypress: function(evt,bindings)
    {
        for (var c=0;c<bindings.length;c++)
        {
            if (bindings[c].matcher(evt))
            {
                bindings[c].onExpression();
            }
        }
        return true;
    },
    keycodeMap:{
        8:'BACKSPACE',
        9:'TAB',
        13:'RETURN',
        27:'ESC',
        33:'PAGEUP',
        34:'PAGEDOWN',
        35:'END',
        36:'HOME',
        37:'LEFT',
        38:'UP',
        39:'RIGHT',
        40:'DOWN',
        45:'INSERT',
        46:'DELETE'
    },
    getKey: function(event)
    {
    Logger.info(event);
        if (event.keyIdentifier)
        {
            return event.keyIdentifier.toUpperCase();
        }
        var result = this.keycodeMap[event.keyCode];
        if (!result)
        {
            result = String.fromCharCode(event.charCode ? event.charCode : event.keyCode);
        }
        return result;
    },
    compileWidget: function(params)
    {
        var self = this;
        var bindings = params['bindings'];
        for (var c=0;c<bindings.length;c++)
        {
            var binding = bindings[c]['binding'];
            var onexpr = bindings[c]['on'];  
            var onExpression = function()
            {
                alert('matched');
            };
            var matcher = function(e) 
            {
                alert(e);
                /*
                alert('key='+self.getKey(e));
                return (Event.isKey(e,Event['KEY_'+binding.toUpperCase()]));
                */
            };
            bindings[c]['matcher']=matcher; 
            bindings[c]['onExpression']=onExpression;
        }
        Appcelerator.Util.KeyManager.installHandler(null,null,function(e)
        {
            alert(e);
            return self.keypress(e,bindings);
        }.bind(this));
    },
    buildWidget: function(element, parameters)
    {
        var bindings = [];
        parameters['bindings'] = bindings;
        
        if (Appcelerator.Browser.isIE)
        {
            // NOTE: in IE, you have to append with namespace
            var newhtml = element.innerHTML;
            newhtml = newhtml.replace(/<KEY/g,'<APP:KEY');
            newhtml = newhtml.replace(/\/KEY>/g,'/APP:KEY>');
            element.innerHTML = newhtml;
        }
        
        for (var c=0,len=element.childNodes.length;c<len;c++)
        {
            var node = element.childNodes[c];
            
            if (node.nodeType == 1 && node.nodeName.toLowerCase() == 'key')
            {
                bindings.push({binding:node.getAttribute('binding'),on:node.getAttribute('on')});
            }
        }        
        
        return {
            'position' : Appcelerator.Compiler.POSITION_REMOVE,
            'compile': true
        };
    }
};

Appcelerator.Core.registerModule('app:keybinding',Appcelerator.Module.Keybinding);