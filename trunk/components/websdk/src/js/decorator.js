Object.extend(Appcelerator.Decorator,
{
	invalidImage: Appcelerator.ImagePath + 'warning.png',
	validImage: Appcelerator.ImagePath + 'confirm.png',
	
    toString: function ()
    {
        return '[Appcelerator.Decorator]';
    },

    decoratorId: 0,
    names: [],

	addDecorator: function(name, decorator)
	{
		Appcelerator.Decorator[name] = decorator;
		Appcelerator.Decorator.names.push(name);
	},

    checkInvalid: function (element, valid, decId, msg, showValid)
    {
        if (decId)
        {
            var div = $(decId);
            if (div)
            {
                if (showValid)
                {
                    if (valid)
                    {
                    	Appcelerator.Compiler.setHTML(div,'<img src="' + Appcelerator.Decorator.validImage + '"/> <span class="success_color">' + msg + "</span>");
						Appcelerator.Compiler.dynamicCompile(div);
                    }
                }
                else
                {
                    if (!valid)
                    {
                        Appcelerator.Compiler.setHTML(div,'<img src="' + Appcelerator.Decorator.invalidImage + '" style="position:relative;top:3px"/> ' + msg);
						Appcelerator.Compiler.dynamicCompile(div);
                    }
                    Element.setStyle(decId, {visibility:(valid ? 'hidden' : 'visible')});
                }
            }
        }
        else
        {
            var id = 'decorate_' + element.id;
            var div = $(id);

            if (!div)
            {
                // only insert the first time through
                new Insertion.After(element.id, '<span id="' + id + '" style="font-size:11px;color:#ff0000"></span>');
                div = $(id);
            }

            if (showValid)
            {
                Appcelerator.Compiler.setHTML(div,'<img src="' + Appcelerator.Decorator.validImage + '"/> <span class="success_color">' + msg + "</span>");
				Appcelerator.Compiler.dynamicCompile(div);
            }
            else
            {
                if (!valid)
                {
                    // update the message if not valid
                    Appcelerator.Compiler.setHTML(div,'<img src="' + Appcelerator.Decorator.invalidImage + '" style="position:relative;top:3px"/> ' + msg);
					Appcelerator.Compiler.dynamicCompile(div);
                }

                // just flip the visibility flag is valid or invalid - helps with shifting box when you remove/add
                Element.setStyle(id, {visibility:(valid ? 'hidden' : 'visible')});
            }
        }
    }	
});

(function(){
	
	var addDecorator = Appcelerator.Decorator.addDecorator;
	
	addDecorator('defaultDecorator', function(element, valid)
	{
		// do nothing
	});
	
	addDecorator('custom', function(element, valid, decId)
	{
		if (!decId)
		{
			throw "invalid custom decorator, decoratorId attribute must be specified";
		}
		var dec = $(decId);
		if (!dec)
		{
			throw "invalid custom decorator, decorator with ID: "+decId+" not found";
		}
		if (!valid)
		{
			if (dec.style.display=='none')
			{
				dec.style.display='';
			}
			if (dec.style.visibility=='hidden')
			{
				dec.style.visibility='';
			}
		}
		else
		{
			if (dec.style.display!='none')
			{
				dec.style.display='none';
			}
			if (dec.style.visibility!='hidden')
			{
				dec.style.visibility='hidden';
			}
		}
	});
	
    addDecorator('termsAccepted', function(element, valid, decId)
    {
        this.checkInvalid(element, valid, decId, 'must accept terms and conditions');
    });

    addDecorator('required', function(element, valid, decId)
    {
        this.checkInvalid(element, valid, decId, 'required');
    });

    addDecorator('email', function(element, valid, decId)
    {
        this.checkInvalid(element, valid, decId, 'enter a valid email address');
    });
	addDecorator('date', function(element, valid, decId)
	{
       this.checkInvalid(element, valid, decId, 'invalid date');	
	});
	addDecorator('number', function(element, valid, decId)
	{
       this.checkInvalid(element, valid, decId, 'invalid number');			
	});
    addDecorator('fullname', function(element, valid, decId)
    {
        this.checkInvalid(element, valid, decId, 'enter first and last name');
    });

	addDecorator('alphanumeric', function(element,valid,decId)
	{
        this.checkInvalid(element, valid, decId, 'enter an alphanumeric value');
	});

    addDecorator('noSpaces', function(element, valid, decId)
    {
        this.checkInvalid(element, valid, decId, 'value must contain no spaces');
    });

    addDecorator('password', function(element, valid, decId)
    {
        this.checkInvalid(element, valid, decId, 'password must be at least 6 characters');
    });

    addDecorator('url', function (element, valid, decId)
    {
        this.checkInvalid(element, valid, decId, 'enter a valid URL');
    });

   	addDecorator('checked', function (element, valid, decId)
    {
        this.checkInvalid(element, valid, decId, 'item must be checked');
    });

  	addDecorator('wholenumber', function (element, valid, decId)
    {
        this.checkInvalid(element, valid, decId, 'enter a whole number');
    });

    addDecorator('length', function (element, valid, decId)
    {
        if (!valid)
        {
            var min = element.getAttribute('validatorMinLength') || '0';
            var max = element.getAttribute('validatorMaxLength') || '999999';
            this.checkInvalid(element, valid, decId, 'value must be between ' + min + '-' + max + ' characters');
        }
        else
        {
            this.checkInvalid(element, valid, decId, element.value.length + ' characters', true);
        }
    });
})();
