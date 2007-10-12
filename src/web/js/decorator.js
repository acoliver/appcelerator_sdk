Appcelerator.Decorator =
{
	invalidImage: Appcelerator.ImagePath + 'warning.png',
	validImage: Appcelerator.ImagePath + 'confirm.png',
	
    toString: function ()
    {
        return '[Appcelerator.Decorator]';
    },

    defaultDecorator: function(element, valid)
    {
        // do nothing
    },

    decoratorId:0,

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
    },

    custom: function(element, valid, decId)
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
	},
	
    termsAccepted: function(element, valid, decId)
    {
        this.checkInvalid(element, valid, decId, 'must accept terms and conditions');
    },

    required: function(element, valid, decId)
    {
        this.checkInvalid(element, valid, decId, 'required');
    },

    email: function(element, valid, decId)
    {
        this.checkInvalid(element, valid, decId, 'enter a valid email address');
    },
	date: function(element, valid, decId)
	{
       this.checkInvalid(element, valid, decId, 'invalid date');	
	},	
	number: function(element, valid, decId)
	{
       this.checkInvalid(element, valid, decId, 'invalid number');			
	},
    fullname: function(element, valid, decId)
    {
        this.checkInvalid(element, valid, decId, 'enter first and last name');
    },

	alphanumeric: function(element,valid,decId)
	{
        this.checkInvalid(element, valid, decId, 'enter an alphanumeric value');
	},

    noSpaces: function(element, valid, decId)
    {
        this.checkInvalid(element, valid, decId, 'value must contain no spaces');
    },

    password: function(element, valid, decId)
    {
        this.checkInvalid(element, valid, decId, 'password must be at least 6 characters');
    },

    url: function (element, valid, decId)
    {
        this.checkInvalid(element, valid, decId, 'enter a valid URL');
    },

   	checked: function (element, valid, decId)
    {
        this.checkInvalid(element, valid, decId, 'item must be checked');
    },

  	wholenumber: function (element, valid, decId)
    {
        this.checkInvalid(element, valid, decId, 'enter a whole number');
    },

    length: function (element, valid, decId)
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
    }
};
