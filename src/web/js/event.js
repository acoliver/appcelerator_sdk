
Object.extend(Event, {
    getEvent: function (e)
    {
    	e = e || window.event;
    	return typeof(e.inspect)=='function' ? e : Event.extend(e);
    },
    isEventObject: function (e)
	{
	   e = this.getEvent(e);
	   if (e)
	   {
		   // IE
		   if (typeof(e.cancelBubble)!='undefined' && typeof(e.qualifier)!='undefined')
		   {
		      return true;
		   }
		   // the others (FF, safari, opera, etc)
		   if (typeof(e.stopPropagation)!='undefined' && typeof(e.preventDefault)!='undefined')
		   {
		      return true;
		   }
	   }
	   return false;
	},    
    getKeyCode: function (event)
    {
        var pK;
        if (event)
        {
            if (typeof(event.keyCode) != "undefined")
            {
                pK = event.keyCode;
            }
            else if (typeof(event.which) != "undefined")
            {
                pK = event.which;
            }
        }
        else
        {
            pK = window.event.keyCode;
        }
        return pK;
    },
    isKey: function (event, code)
    {
        return Event.getKeyCode(event) == code;
    },
    isEscapeKey: function(event)
    {
        return Event.isKey(event, Event.KEY_ESC) || Event.isKey(event, event.DOM_VK_ESCAPE);
    },
    isEnterKey: function(event)
    {
        return Event.isKey(event, Event.KEY_RETURN) || Event.isKey(event, event.DOM_VK_ENTER);
    },
    isSpaceBarKey: function (event)
    {
        return Event.isKey(event, Event.KEY_SPACEBAR) || Event.isKey(event, event.DOM_VK_SPACE);
    },
    isPageUpKey: function (event)
    {
        return Event.isKey(event, Event.KEY_PAGEUP) || Event.isKey(event, event.DOM_VK_PAGE_UP);
    },
    isPageDownKey: function (event)
    {
        return Event.isKey(event, Event.KEY_PAGEDOWN) || Event.isKey(event, event.DOM_VK_PAGE_DOWN);
    },
    isHomeKey: function (event)
    {
        return Event.isKey(event, Event.KEY_HOME) || Event.isKey(event, event.DOM_VK_HOME);
    },
    isEndKey: function (event)
    {
        return Event.isKey(event, Event.KEY_END) || Event.isKey(event, event.DOM_VK_END);
    },
    isDeleteKey: function (event)
    {
        return Event.isKey(event, Event.KEY_DELETE) || Event.isKey(event, event.DOM_VK_DELETE);
    },
    isLeftKey: function (event)
    {
        return Event.isKey(event, Event.KEY_LEFT) || Event.isKey(event, event.DOM_VK_LEFT);
    },
    isRightKey: function (event)
    {
        return Event.isKey(event, Event.KEY_RIGHT) || Event.isKey(event, event.DOM_VK_RIGHT);
    },

    KEY_SPACEBAR: 0,
    KEY_PAGEUP: 33,
    KEY_PAGEDOWN: 34,
    KEY_END: 35,
    KEY_HOME: 36,
    KEY_DELETE: 46
});


