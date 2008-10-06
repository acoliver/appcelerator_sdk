$.each(['clear','reset'],function()
{
	App.regAction(evtRegex(this),function(params,name,data)
	{
		var target = getTarget(params,this);
		var element = target.get(0);
		var tag = getTagname(el).toLowerCase();
		var revalidate = false;

		switch (tag)
		{
			case 'input':
			case 'textarea':
			{
			    target.val('');
				revalidate=true;
				break;
			}
			case 'select':
			{
			    element.selectedIndex = 0;
				revalidate=true;
				break;
			}
			case 'img':
			{
			    target.attr('src','');
				break;
			}
			case 'a':
			{
			    target.attr('href','#');
				break;
			}
			case 'form':
			{
			//	Form.reset(target);
			//	Form.Methods.getInputs(target).each(function(i)
			//	{
			//	    Appcelerator.Compiler.executeFunction(i,'revalidate');
			//	});
	            break;;
			}
			default:
			{
				target.text(value);
				break;
			}
		}

		if (revalidate)
		{
			// TODO: REVALIDATE FUNCTION
		    //Appcelerator.Compiler.executeFunction(element,revalidate);
		}
		
		return this;		
	});
});

