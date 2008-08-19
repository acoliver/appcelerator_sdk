/*!
 * This file is part of Appcelerator.
 *
 * Copyright (c) 2006-2008, Appcelerator, Inc.
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 * 
 *     * Redistributions of source code must retain the above copyright notice,
 *       this list of conditions and the following disclaimer.
 * 
 *     * Redistributions in binary form must reproduce the above copyright notice,
 *       this list of conditions and the following disclaimer in the documentation
 *       and/or other materials provided with the distribution.
 * 
 *     * Neither the name of Appcelerator, Inc. nor the names of its
 *       contributors may be used to endorse or promote products derived from this
 *       software without specific prior written permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 *  ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
 * ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
 * ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 **/


Appcelerator.Compiler.registerCustomCondition(
{
    conditionNames: ['valid', 'invalid']
},
function (element,condition,action,elseAction,delay,ifCond)
{
	switch (condition)
	{
		case 'valid':
		case 'invalid':
		{
			if (Appcelerator.Compiler.getTagname(element,true)!='app:validation')
			{
				throw condition+' condition can only be used on app:validation widget, found on: '+element.nodeName;
			}
			Appcelerator.Widget.Validation.create(element,condition,action,elseAction,delay,ifCond);
			return true;
		}
		default:
		{
			return false;
		}
	}
});

Appcelerator.Widget.Validation =
{
	getName: function()
	{
		return 'appcelerator validation';
	},
	getDescription: function()
	{
		return 'validation widget';
	},
	getVersion: function()
	{
		return '__VERSION__';
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
		return 'app:validation';
	},
	getAttributes: function()
	{
		return [];
	},	
	buildWidget: function(element,parameters,state)
	{
		return {
			'position' : Appcelerator.Compiler.POSITION_REPLACE,
			'presentation':''
		};
	},
	create: function (element,condition,action,elseAction,delay,ifCond)
	{
		Element.cleanWhitespace(element);
		var newhtml = element.innerHTML;
		newhtml = newhtml.replace(/<MEMBERS/g,'<APP:MEMBERS').replace(/\/MEMBERS>/g,'/APP:MEMBERS>');
		element.innerHTML = newhtml;
		
		var me = element.firstChild;
		if (!me || me.length <= 0)
		{
			throw "required 'members' element not found for "+element.nodeName;
		}
		
		var value = Appcelerator.Compiler.getHtml(me,false);
		var tokens = value.split(/[ ,]/);
		var id = element.id;

		var validAction;
		var invalidAction;
		if (condition=='valid')
		{
			validAction = Appcelerator.Compiler.makeConditionalAction(id,action,ifCond);
		}
		else if (elseAction)
		{
			validAction = Appcelerator.Compiler.makeConditionalAction(id,elseAction,ifCond);
		}
		if (condition=='invalid')
		{
			invalidAction = Appcelerator.Compiler.makeConditionalAction(id,action,ifCond);
		}
		else if (elseAction)
		{
			invalidAction = Appcelerator.Compiler.makeConditionalAction(id,elseAction,ifCond);
		}
		
		var obj = 
		{
			members:[],
			invalid: null,

			listener: function (elem,valid)
			{
				if (this.invalid!=null && (valid && !this.invalid))
				{
					// no change
					return;
				}
				var invalid = true;
				if (valid)
				{
					invalid = false;
					for (var c=0,len=this.members.length;c<len;c++)
					{
						if (!this.members[c].validatorValid)
						{
							invalid = true;
							break;
						}
					}
				}
				if (this.invalid!=null && (this.invalid == invalid))
				{
					// no change
					return;
				}
				this.invalid = invalid;
				if (invalid && invalidAction)
				{
					Appcelerator.Compiler.executeAfter(invalidAction,delay);
				}
				else if (!invalid)
				{
					Appcelerator.Compiler.executeAfter(validAction,delay);
				}
			}
		};
		obj.listenerFunc = obj.listener.bind(obj);
		var valid = true;
		for (var c=0,len=tokens.length;c<len;c++)
		{
			var token = tokens[c].trim();
			if (token.length > 0)
			{
				var elem = $(token);
				if (!elem)
				{
					throw "couldn't find validation member with ID: "+token;
				}
				if (!Appcelerator.Compiler.getFunction(elem,'addValidationListener'))
				{
					if (elem.field)
					{
						elem = elem.field;
					}
					else
					{
						throw "element with ID: "+token+" doesn't have a validator";
					}
				}
				obj.members.push(elem);
				Appcelerator.Compiler.executeFunction(elem,'addValidationListener',[obj.listenerFunc]);
				valid = valid && elem.validatorValid;
			}
		}
		// make the initial call
		obj.listenerFunc(obj.members[0],valid);
		return obj;
	}
};

Appcelerator.Widget.register('app:validation',Appcelerator.Widget.Validation);
