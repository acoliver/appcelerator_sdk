
/*
 * Copyright 2006-2008 Appcelerator, Inc.
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *    http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License. 
 */



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
		return 'http://appcelerator.org';
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
