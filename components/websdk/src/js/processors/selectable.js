//
// add a selectable attribute which implements a single state selection
// for all children of element passed in
//
Appcelerator.Compiler.SelectableGroups = {};

Appcelerator.Compiler.retainedWidgetAttributes.push('selectable');

Appcelerator.Compiler.wireSelectable = function(element,value)
{
	element = $(element);
	
	var name = value;
	var multiselect = false;
	var tokens = name.split(',');
	if (tokens.length > 1)
	{
		multiselect = tokens[1]=='multiselect';
	}
	var id = element.id;
	var dontAddStyles = element.getAttribute('supressAutoStyles')=='true';
	
	var members = Appcelerator.Compiler.SelectableGroups[name];
	if (!members)
	{
		var v = multiselect ? [] : null;
		members = {selected:v,members:[]};
		Appcelerator.Compiler.SelectableGroups[name] = members;
	}
	
	var selectFunc = function(element,selected,count,unselect)
	{
		count = count || 0;
		if (!dontAddStyles)
		{
			if (selected)
			{
				element.setAttribute('selected','true');
				Element.addClassName(element,'selected');
			}
			else
			{
				element.removeAttribute('selected');
				Element.removeClassName(element,'selected');
			}
		}
		Appcelerator.Compiler.executeFunction(element,'selected',[selected,count,unselect]);
	}

	for (var c=0,len=element.childNodes.length;c<len;c++)
	{
		var child = element.childNodes[c];
		if (child && child.nodeType && child.nodeType == 1)
		{
		    (function()
		    {
	            var childid = Appcelerator.Compiler.getAndEnsureId(child);
	            members.members.push(childid);
	            var scope = {};
	            scope.element = child;
	            child.app_selectable = true;
	            var selectListener = function(e,unselectOnly)
	            {
	                e = Event.getEvent(e);
	                var target = this.element;
	                if (e)
	                {
	                    var t = Event.element(e);
	                    
	                    if (t == this.element)
	                    {
	                        if (e._selectedEventSeen)
	                        {
	                            return;
	                        }
	                        e._selectedEventSeen = true;
	                    }
	                    else
	                    {
	                        // TODO: walk up to find the selectable div and then
	                        // make sure he's selected if not
	                        var p = t.parentNode;
	                        while (p && p!=document.body)
	                        {
	                            if (p.app_selectable)
	                            {
	                                target = p;
	                                if (e._selectedEventSeen)
	                                {
	                                    return;
	                                }
	                                if (target == members.selected)
	                                {
	                                    return;
	                                }
	                                e._selectedEventSeen = true;
	                                break;
	                            }
	                            else
	                            {
	                                p = p.parentNode;
	                            }
	                        }
	                    }
	                }
	                unselectOnly = unselectOnly!=null ? unselectOnly==true : false;
	                var fired = false;
	                var unselect = unselectOnly;
	                var reselect = (!unselectOnly && members.selected && members.selected!=target);
	                if (members.selected || (unselectOnly && !members.selected))
	                {
	                    if (multiselect)
	                    {
	                        var idx = members.selected.indexOf(target.id);
	                        if ( idx >=0 )
	                        {
	                            // unselect
	                            unselect = true;
	                            selectFunc(target,false,members.selected.length-1,unselect);
	                            members.selected.removeAt(idx);
	                            fired=true;
	                            return;
	                        }
	                    }
	                    else
	                    {
	                        var t = members.selected;
	                        selectFunc(members.selected,false,reselect?1:0,true);
	                        fired=true;
	                        members.selected = null;
	                        if (t == target)
	                        {
	                            return;
	                        }
	                    }
	                }
	                if (!unselectOnly)
	                {
	                    var count = 1;
	                    if (multiselect)
	                    {
	                        members.selected.push(target.id);
	                        count = members.selected.length;
	                    }
	                    else
	                    {
	                        members.selected = target;
	                    }
	                    selectFunc(target,true,count,false);
	                    fired=true;
	                }
	                else if (!fired)
	                {
	                    var idx = members.selected.indexOf(target.id);
	                    if ( idx >=0 )
	                    {
	                        // unselect
	                        selectFunc(target,false,members.selected.length-1,unselect);
	                        members.selected.removeAt(idx);
	                        fired=true;
	                        return;
	                    }
	                    Logger.warn('not removed on unselected '+target.id+',current='+members.selected.join(','));
	                }
	            };
	            var f = selectListener.bind(scope);
	            Appcelerator.Compiler.attachFunction(child,'unselect',function()
                {
                    selectListener.apply(this,[null,true]);
                }.bind(scope));
                Appcelerator.Compiler.attachFunction(child,'select',function()
                {
                    selectListener.apply(this,[null,false]);
                }.bind(scope));
	            Event.observe(child,'click',f,false);
	            Appcelerator.Compiler.addTrash(child,function()
	            {
	                selectListener.apply(this,[null,true]);
	                members.members.remove(this.element.id);
	                Event.stopObserving(this.element,'click',f);
	            }.bind(scope));
		    })();
		}
	}
};

Appcelerator.Compiler.registerAttributeProcessor(['div','ul','ol','tr'],'selectable',
{
	handle: function(element,attribute,value)
	{
		if (value)
		{
			Appcelerator.Compiler.wireSelectable(element,value);
		}
	}
});
