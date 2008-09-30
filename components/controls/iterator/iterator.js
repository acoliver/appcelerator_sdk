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

Appcelerator.Control.Iterator = Class.create(Appcelerator.Control.Base,
{
	getAttributes:function()
	{
		var T = Appcelerator.Types;
		
		//
		// two special attributes you never have to define here: render (action), render (condition)
		//
		// if it's a condition, you can register here as T.condition and then call
		//    this.fireEvent(condition,data)
		//
		// if it's an action, you can define a function with the same name that will be invoked
		//
		// if it's anything else, you'll need to define a setter method using Javabeans notation
		//
		// for all setters, the framework will automatically define a getter which will return
		// the value of this.<name> of the property as a convenience (unless already defined by you).
		//
		//
		
		return [
					{name: 'model', optional: true, type: T.object, description: "Set model for iterator"},
					{name: 'template', optional: true, type: T.string, description: "Set the template for each row"},
					{name: 'items', optional: true, type: T.json, description: "reference to array within row"},
					{name: 'property', optional: true, type: T.string, description: "Property for implicit model"},
					{name: 'modelChange', type: T.condition, description: "Model change condition event"}
				];
	},
	setTemplate:function(data)
	{
		if (Object.isString(data))
		{
			this.template = data;
		}
		else
		{
			this.template = Object.getFirstProp(data);
		}
	},
	setItems:function(data)
	{
		this.setModel(data);
	},
	setProperty:function(data)
	{
		if (Object.isString(data))
		{
			this.property = data;
		}
		else
		{
			this.property = Object.getFirstProp(data);
		}
	},
	setModel:function(data)
	{
		if (data && !Appcelerator.Model.isModel(data))
		{
			data = new Appcelerator.Model.TableModel(this.property ? Object.getNestedProperty(data,this.property) : data);
		}
		
		if (this.model)
		{
			// unregister listener
			this.model.unEvent('modelChange',this.modelChanged);
		}

		this.model = data;
		
		// fire event
		this.model.onEvent('modelChange',this.modelChanged);
		
		// fire a model change event for our iterator
		this.fireEvent('modelChange',this.model);
		
		// attempt to render
		this.render(this.element);
	},
	// this is a callback from the registered model
	modelChanged:function(evt)
	{
		this.render(this.element);
	},
	//
	// render is a special method that *must* be defined always but 
	// it need not be registered in getAttributes
	//
	render: function(element)
	{
		this.element = $(element);
		
		if (!this.template)
		{
			this.template = Appcelerator.Compiler.getHtml(this.element);
		}
		
		if (this.template)
		{
			//return true to indicate it was rendered, false to indicate it wasn't
			return this.renderControl();
		}
		
		return false;
	},
	renderControl: function()
	{
		var rowNum = 0;
		var rowCount = this.model ? this.model.getRowCount() : 0;
		
		if (this.element)
		{
			var children = Appcelerator.Compiler.getElementChildren(this.element);
			for (var c=0;c<children.length;c++)
			{
				Appcelerator.Compiler.destroy(children[c],true);
			}
		}
		
		// innerHTML is READ-ONLY for tables in IE
		if (this.element.nodeName == 'TABLE' && Appcelerator.Browser.isIE)
		{
			var nodes = this.element.childNodes;
			for (var i=0;i<nodes.length;i++)
			{
				this.element.removeChild(nodes[i]);
			}
		}
		else
		{
			this.element.innerHTML = '';
		}
		
		//TODO: support tables?
		//TODO: need to review old app:iterator and make sure we support everything
		//TODO: need to test nested iterators
		
		var template = String.unescapeXML(this.template);
		
		// recompile in case template has been called
		var compiledTemplate = Appcelerator.Compiler.compileTemplate(template);
		
		while ( rowNum < rowCount )
		{
			var row = this.model.getRow(rowNum);

			if (typeof(row)!='object')
			{
				row = {'iterator_value': row};
			}

			row.iterator_row_index = rowNum;
			row.iterator_row_length = rowCount;
			row.iterator_odd_even = (rowNum%2==0) ? 'even' : 'odd';
			
			//row.iterator_row_class = parameterMap['rowEvenClassName'];

			var html = compiledTemplate.call(this,row);
			html = scriptlet(html,row);
			
			new Insertion.Bottom(this.element,html);
			rowNum++;
		}
		
		//TODO: compile here?
		if (this.recompile)
		{
			/*
			var children = Appcelerator.Compiler.getElementChildren(this.element);
		    var state = element.state || Appcelerator.Compiler.createCompilerState();
			for (var c=0;c<children.length;c++)
			{
			    Appcelerator.Compiler.compileElement(children[c],state,true);
			}
			element.state = state;
		    state.scanned = true;
		    Appcelerator.Compiler.checkLoadState(element);
			*/
		}
		
		this.recompile = true;
		return true;
	}
});

Appcelerator.UI.registerUIComponent('control','iterator',{
	create:function()
	{
		return new Appcelerator.Control.Iterator();
	}
})
