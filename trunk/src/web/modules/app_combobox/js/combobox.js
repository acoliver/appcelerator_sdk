

/**
 * used to create a scrollable region
 */
var ScrollRegion = Class.create();
Object.extend(ScrollRegion.prototype,
{
	initialize:function(scrollableElement,noScrollHandle)
	{
		this.downFlag = false;
		this.upFlag = false;

		var currentFrameScroll = 0;
		var scrollableElementIframe;
		this.scrollableElement = $(scrollableElement);
		
		if(this.scrollableElement.immediateDescendants()[0]) {
			if(this.scrollableElement.immediateDescendants()[0].tagName == 'IFRAME') {
				scrollableElementIframe = this.scrollableElement.immediateDescendants()[0];
			}
		}
		
		this.btnUp = this.scrollableElement.appendChild(new Element("div",{'className':'track_up','id':'track_up'}));
		this.scrollBody = this.scrollableElement.appendChild(new Element("div",{'className':'track'}));
		this.btnDown = this.scrollableElement.appendChild(new Element("div",{'className':'track_down','id':'track_down'}));

		if(!scrollableElementIframe && noScrollHandle!=true)
		{
			this.scrollBody.setStyle({'overflow':'hidden'});
			var scrollHandle = new Element("div",{
				'className':'track_handle'
			});
			scrollHandle.setStyle({
				'height':'28px'
			});

			this.scrollHandle = scrollHandle;
			this.scrollBody.insert(scrollHandle);
			scrollHandle = $(this.scrollBody.firstChild);

			var dragger = new Draggable(scrollHandle,{
				'constraint':'vertical',
				'snap':function(x,y){					
					var scrollbarheight = this.scrollBody.getHeight();
					var scrollhandleheight = scrollHandle.getHeight();
					var totalheight = (scrollbarheight - scrollhandleheight);
					
					if(this.scrollableElement.scrollHeight <= this.scrollableElement.getHeight())
					{
						this.resetScroll();
						return [x,0];
					}
					var result;
					if(y < 0){
						result = [x,0];
					} else if(y > totalheight) {
						result = [x,totalheight];
					} else {
						result = [x,y];
					}
					var ratio = Math.max(0, Math.min(1, y / totalheight));
					doScroll(null,ratio);
					return result;
				}.bind(this)
			});
		}
		
		var moveScrollHandle = function(newRatio){
			if(newRatio>1.0){
				newRatio=1.0;
			}
			var scrollbarheight = this.scrollBody.getHeight();
			var scrollhandleheight = scrollHandle.getHeight();
			var totalheight = (scrollbarheight - scrollhandleheight);		
			if(scrollHandle){
				scrollHandle.setStyle({'top':(totalheight*newRatio)+'px'});
			}
		}.bind(this);
		
		var doScroll = function(by,toRatio){
			var scrollbarheight = this.scrollBody.getHeight();
			var scrollhandleheight = scrollHandle.getHeight();
			var totalheight = (scrollbarheight - scrollhandleheight);
			
	  		if (!scrollableElementIframe) 
			{
				if(typeof(toRatio)=='number'){
					// moving with scroll handle
					this.scrollableElement.scrollTop = (this.scrollableElement.scrollHeight - this.scrollableElement.getHeight()) * toRatio;
				} else {
					// moving with buttons
	  			this.scrollableElement.scrollTop = this.scrollableElement.scrollTop + by;
					if(noScrollHandle!=true){
						moveScrollHandle(this.scrollableElement.scrollTop / (this.scrollableElement.scrollHeight - this.scrollableElement.getHeight()));
					}
				}
			} 
			else 
			{
				// an iframe can only be scrolled with up/down buttons
				window.frames[scrollableElementIframe.id].scrollBy(0, by);
			}			
		}.bind(this);

		Event.observe(this.btnDown,'mousedown',function(ev){
			ev = Event.getEvent(ev);
			this.downFlag = true;
			var timer = setInterval(function()
			{
			  if(this.downFlag == false){
			   // stop this function from running 100ms from now
			   clearInterval(timer);
			   this.downFlag = null;
			  } else if(this.downFlag == true) {
					doScroll(12);
			  }
			}.bind(this),25);
			ev.stop();
		}.bind(this));
		
		Event.observe(this.btnDown,'mouseup',function(ev){
			ev = Event.getEvent(ev);
			this.downFlag = false;
			ev.stop();
		}.bind(this));

		Event.observe(this.btnUp,'mousedown',function(ev){
			ev = Event.getEvent(ev);
			this.upFlag = true;
			var timer = setInterval(function(){
			  if(this.upFlag == false){
			   // stop this function from running 100ms from now
			   clearInterval(timer);
			   this.upFlag = null;
			  } else if(this.upFlag == true) {
					doScroll(-12);
			  }
			}.bind(this),25);
			ev.stop();
		}.bind(this));

		Event.observe(this.btnUp,'mouseup',function(ev){
			ev = Event.getEvent(ev);
			this.upFlag = false;
			ev.stop();
		}.bind(this));
		
		[this.btnUp,this.btnDown].each(function(elm){
			Event.observe(elm,'mouseover',function(ev){
				ev = Event.getEvent(ev);
				elm.addClassName('scrollHover');
				ev.stop();
			}.bind(this));

			Event.observe(elm,'mouseout',function(ev){
				ev = Event.getEvent(ev);
				elm.removeClassName('scrollHover');
				ev.stop();
			}.bind(this));		
		});
		
		this.resetScroll();
	},
	
	// Reset some of the scrollbar's attributes by re-measuring the scrollable element and 
	// determining whether it needs to have a scrollbar anymore. Also, place the handle in 
	// the correct spot if the height of the scrollable region has changed.
	resetScroll:function()
	{
		if(this.scrollableElement.scrollHeight <= this.scrollableElement.getHeight())
		{
			this.scrollableElement.addClassName("scrollbar_hidden");
			this.btnUp.hide();
			this.scrollBody.hide();
			this.btnDown.hide();
		} 
		else 
		{
			this.scrollableElement.removeClassName("scrollbar_hidden");
			this.btnUp.show();
			this.scrollBody.show();
			this.btnDown.show();			
		}
		if(this.scrollHandle!=null && typeof(this.scrollHandle)=='object')
		{
			this.scrollableElement.scrollTop = 0;
			this.scrollHandle.setStyle({'top':'0px'});
		}
	}
});


/**
 * Skinnable Combo Box
 */
var SkinnableComboBox = Class.create();
Object.extend(SkinnableComboBox.prototype,
{
	initialize: function(containingElement,selectorElement,changeCallback,currentValue,scrollColor) 
	{
		containingElement = $(containingElement);
		selectorElement = $(selectorElement);
		this.positioned = false;
		this.currentValue = currentValue;
	
		// container contains the entire dropdown selector, its activator button, its contents, etc
		var container = new Element("div",{'className':'dropdown_main_container'});

		var activation_button = new Element("div",{'className':'dropdown_btn'});
		activation_button.innerHTML = 'v';
		
		// contents are all the dropdown's options + scrollbar
		var contents = new Element("div",{'className':'dropdown_contents'});
		contents.hide();

		// innerContents are all the dropdown's options (inner wrapper)
		this.innerContents = contents.appendChild(new Element("div",{'className':'dropdown_contents_inner small_'+ scrollColor +'_scroll'}));
		// TODO measure if this region actually needs a scrollbar		
		this.scroller = new ScrollRegion(this.innerContents);

		// dropdown selector hider function
		this.hide = function() 
		{ 
			var opacity = contents.getOpacity();
			
			new Effect.Parallel([
				new Effect.BlindUp(contents,{duration:0.5}),
				new Effect.Fade(contents)
			],{
				afterFinish:function()
				{
					(function(){
						contents.setOpacity(opacity);
					}).defer();
				}
			});
		};
		
		// label and the actual items
		this.label = new Element("div",{'className':'dropdown_label'});
		this.label.innerHTML = this.currentItem ? this.currentItem.label : '';

		if (selectorElement)
		{
			selectorElement.hide();
			if($A(selectorElement.classNames()).include("positioned")){
				this.positioned = true;
				containingElement.makePositioned().absolutize();
				var offset = containingElement.cumulativeOffset();
				this.posy = offset[1];
				this.posx = offset[0];
				containingElement = new Element("div");
				containingElement.setStyle({
					'zIndex':'1000',
					'position':'absolute',
					'top':this.posy+'px',
					'left':this.posx+'px'
				});
				containingElement = $(document.body.appendChild(containingElement));
			}
			// convert an (un)ordered list into a list that we can accept
			var itemList = selectorElement.getElementsBySelector("option").map(function(item){
				return {
					'value':item.value,
					'label':item.innerHTML.strip()
				};
			});
			this.setOptions(itemList);
		}

	
		this.changeCallback = changeCallback;
	
		// populate contents container with items
		this.currentItemHTMLElement = null;

		var clickHandler = function(ev) 
		{
			if (this.disabled===true) return;
			
			ev = Event.getEvent(ev);
			if(contents.style.display=="none") 
			{ 
				contents.show();
				this.scroller.resetScroll();
				if (this.currentItemHTMLElement)
				{
					contents.scrollTop = this.currentItemHTMLElement.offsetTop;
				}
			} 
			else 
			{ 			
				this.hide();
			}
			if(ev)
			{
				ev.stop();
			}
			return false;
		}.bind(this);	
						
		// attach activation function to button
		activation_button.onclick = clickHandler;
		this.label.onclick = clickHandler;
		
		container.appendChild(this.label);
		container.appendChild(contents);

		containingElement.appendChild(container);
		containingElement.appendChild(activation_button);

		var self = this;
		Event.observe(document,'click',function(ev)
		{
			ev = Event.getEvent(ev);
			var target = Event.element(ev);
			if (target && (target==containingElement || target.descendantOf(containingElement)))
			{
				return;
			}
			self.hide();
		});
	},
	
	setOptions: function(itemList, clear)
	{
		clear = clear==null ? true : clear;
		if (clear)
		{   
			this.innerContents.getElementsBySelector('.dropdown_item').each(function(item)
			{
				Element.remove(item);
			});
			this.currentValue = null;
		}
		this.currentItem = this.getCurrentItem(itemList,this.currentValue);
		this.label.innerHTML = this.currentItem ? this.currentItem.label : '';
		itemList.each(function(item,idx)
		{
			var e = this.createDropitem(
				item,
				this.hide,
				function(labelText) {
					this.label.innerHTML = "";
					this.label.appendChild(document.createTextNode(labelText));
				}.bind(this),
				idx
			);
			if (this.currentItem && idx==this.currentItem.index) this.currentItemHTMLElement = e;
			this.innerContents.appendChild(e);
		}.bind(this));
	},

	createDropitem: function(item,hideFunc,setLabelFunction,idx) 
	{
		var d = new Element("div",{'className':'dropdown_item'});
		Event.observe(d,'click',function(){
			setLabelFunction(item.label);
			hideFunc();
			if(typeof(this.changeCallback)=='function'){
				this.changeCallback(item.label,item.value,idx);
			}
		}.bind(this));
		
		Event.observe(d,'mouseover',function(){
			d.addClassName("dropdown_item_over");
		});
		Event.observe(d,'mouseout',function(){
			d.removeClassName("dropdown_item_over");
		});
		d.innerHTML = item.label;
		return d;
	},

	// return current item from itemList where item's value==currentValue
	getCurrentItem: function(itemList,currentValue) {
		var foundIndex;
		var foundItem = itemList.find(function(item,i){ foundIndex=i; return item.value==currentValue; });
		if(!foundItem) {
			foundItem = itemList[0];
			foundIndex = 0;
		}
		return {'index':foundIndex, 'value':foundItem.value, 'label':foundItem.label };
	}
});

