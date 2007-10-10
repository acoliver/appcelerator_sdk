

// taken from http://www.huddletogether.com/projects/lightbox2
// getPageSize()
// Returns array with page width, height and window width, height
// Core code from - quirksmode.org
// Edit for Firefox by pHaez
//
Element.getDocumentSize = function ()
{
   var xScroll, yScroll;
   var pageHeight, pageWidth;

    if (window.innerHeight && window.scrollMaxY) {
		xScroll = document.body.scrollWidth;
		yScroll = window.innerHeight + window.scrollMaxY;
	} else if (document.body.scrollHeight > document.body.offsetHeight){ // all but Explorer Mac
		xScroll = document.body.scrollWidth;
		yScroll = document.body.scrollHeight;
	} else { // Explorer Mac...would also work in Explorer 6 Strict, Mozilla and Safari
		xScroll = document.body.offsetWidth;
		yScroll = document.body.offsetHeight;
	}
	
	var windowWidth, windowHeight;
	if (self.innerHeight) {	// all except Explorer
		windowWidth = self.innerWidth;
		windowHeight = self.innerHeight;
	} else if (document.documentElement && document.documentElement.clientHeight) { // Explorer 6 Strict Mode
		windowWidth = document.documentElement.clientWidth;
		windowHeight = document.documentElement.clientHeight;
	} else if (document.body) { // other Explorers
		windowWidth = document.body.clientWidth;
		windowHeight = document.body.clientHeight;
	}	
	
	// for small pages with total height less then height of the viewport
	if(yScroll < windowHeight){
		pageHeight = windowHeight;
	} else { 
		pageHeight = yScroll;
	}

	// for small pages with total width less then width of the viewport
	if(xScroll < windowWidth){	
		pageWidth = windowWidth;
	} else {
		pageWidth = xScroll;
	}

	return [pageWidth,pageHeight,windowWidth,windowHeight];
};

//
// getPageScroll()
// Returns array with x,y page scroll values.
// Core code from - quirksmode.org
//
Element.getPageScroll = function ()
{
	var yScroll;

	if (self.pageYOffset) {
		yScroll = self.pageYOffset;
	} else if (document.documentElement && document.documentElement.scrollTop){	 // Explorer 6 Strict
		yScroll = document.documentElement.scrollTop;
	} else if (document.body) {// all other Explorers
		yScroll = document.body.scrollTop;
	}

	return yScroll;
}

Element.getCenteredTopPosition = function (relative,name)
{
      var dim = Element.getDimensions(relative);
      var pos = Element.getDimensions(name).width;
      return (dim.height - pos) / 2;
};
   
Element.center = function(relative, name, top)
{
      var element = $(name);
      var dim = Element.getDimensions(relative);
      var width = dim.width;
      var height = dim.height;
      var pos = Element.getDimensions(name).width;
      
      var left = (width - pos) / 2;
      element.style.position = "absolute";
      element.style.left = left + "px";
      element.style.right = left + width +"px";
      
      if (top)
      {
         element.style.top = top +"px";
      }
      else
      {
         var hw = element.offsetHeight || parseInt(element.style.height) || 200;
         element.style.top = (height - hw ) / 2 + "px";
      }
};

Element.findParentForm = function (element)
{
	var found = null;
	
	Element.ancestors(element).each(function(n)
	{
		if (n.nodeName == 'FORM')
		{
			found = n;
			throw $break;
		}
	});
	
	return found;
};

/**
 * determine if our element is showing, regardless of its display property,
 * by walking up the ancestory to determine if *any* of the parents are display:none
 */
Element.showing = function (element, ancestors)
{
	if (!Element.visible(element)) return false;
	
     ancestors = ancestors || element.ancestors();
     
     var visible = true;
     
     ancestors.each(function(ancestor)
     {
     	if (!Element.visible(ancestor))
     	{
     		visible = false;
     		throw $break;
     	}
     });
     
     return visible;
};

/**
 * return the non-showing ancestor or null if all are displaying
 */
Element.findNonShowingAncestor = function (element, ancestors)
{
	if (!Element.visible(element)) return element;
	
     ancestors = ancestors || element.ancestors();
     
     var found = null;
     
     ancestors.each(function(ancestor)
     {
     	if (!Element.visible(ancestor))
     	{
     		found = ancestor;
     		throw $break;
     	}
     });
     
     return found;
};

Element.setHeight = function(element,h) 
{
   	element = $(element);
    element.style.height = h +"px";
};

Element.setWidth = function (element, w)
{
	element = $(element);
	element.style.width = w +"px";
};

Element.setTop = function(element,t) 
{
	element = $(element);
    element.style.top = t +"px";
};

Element.isVisible = function(el)
{
	return el.style.visibility != 'hidden' && el.style.display != 'none';
};

Element.ensureVisible=function(element)
{
	element = $(element);
	Position.prepare();
	var pos = Position.cumulativeOffset(element);

	var docsize = Element.getDocumentSize();
	var top = Element.getPageScroll();
	var bottom = top+docsize[3];

	var belowTop = pos[1]>=top+25;
	var aboveBottom = pos[1]<=bottom-25;

	var within = (belowTop&&aboveBottom);

	if (!within)
	{
	   var y=Math.max(0,pos[1]-30);
	   window.scrollTo(0,y);
	}
};


Element.isDisabled = function(element)
{
	element = $(element);
	return (element && (element.disabled || element.getAttribute('disabled') == 'true'));
};


