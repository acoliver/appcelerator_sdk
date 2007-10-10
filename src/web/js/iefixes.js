
//Correctly handle PNG transparency in Win IE 5.5 & 6.
//http://homepage.ntlworld.com/bobosola. Updated 18-Jan-2006.
//modified to work with delayed loading for Appcelerator by JHaynie
if (Appcelerator.Browser.isIE6)
{
	try
	{
		// remove CSS background image flicker and cache images if
		// the server says so
		// http://evil.che.lu/2006/9/25/no-more-ie6-background-flicker
   		document.execCommand("BackgroundImageCache", false, true);
    }
	catch(e){}
	
	
	Appcelerator.Browser.buildIEImage = function (img,width,height,src)
	{
        var imgID = (img.id) ? "id='" + img.id + "' " : "";
        var imgClass = (img.className) ? "class='" + img.className + "' " : "";
        var imgTitle = (img.title) ? "title='" + img.title + "' " : "title='" + img.alt + "' ";
        var imgStyle = "display:inline-block;" + img.style.cssText ;
        if (img.align == "left") imgStyle = "float:left;" + imgStyle;
        if (img.align == "right") imgStyle = "float:right;" + imgStyle;
        if (img.parentElement && img.parentElement.href) imgStyle = "cursor:hand;" + imgStyle;
        var strNewHTML = "<img " + imgID + imgClass + imgTitle;
		var sizing = "width:" + width + "px; height:" + height + "px;";
        strNewHTML+= " style=\"" + sizing + imgStyle + ";"
        + "filter:progid:DXImageTransform.Microsoft.AlphaImageLoader"
        + "(src=\'" + (src||img.src) + "\', sizingMethod='image');\" src='"+Appcelerator.ImagePath+"blank_1x1.gif'></img>" ;
		return strNewHTML;
	};

	document.getElementsByTagNameNS = function(xmlns, tag)
	{
		var ar = $A(document.getElementsByTagName('*'));
		// IE doesn't under default - of course
		if(xmlns == "http://www.w3.org/1999/xhtml") 
		{
			xmlns = "";
		}
		var found = [];
		for (var c=0,len=ar.length;c<len;c++)
		{
			var elem = ar[c];
			if (elem.tagUrn == xmlns && (tag == '*' || elem.nodeName == tag))
			{
				found.push(elem);
			}
		}
		return found;
	};
	
	Appcelerator.Browser.fixBackgroundPNG = function(obj) 
	{
		var bg	= obj.currentStyle.backgroundImage;
		var src = bg.substring(5,bg.length-2);
		var scale = obj.currentStyle.backgroundRepeat == 'no-repeat' ? 'image' : 'scale';
		obj.style.filter = "progid:DXImageTransform.Microsoft.AlphaImageLoader(src='" + src + "', sizingMethod='"+scale+"')";
		obj.style.backgroundImage = "url("+Appcelerator.ImagePath+"blank_1x1.gif)";
	};
}

Appcelerator.Browser.fixImage = function(element,value)
{
	element = $(element);
	value = value || element.src;
	if (Appcelerator.Browser.isIE6 && value)
	{
     	var imgName = value.toUpperCase();
      	if (imgName.substring(imgName.length-3, imgName.length) == "PNG")
      	{
      		var height = element.height, width = element.width;
		 	if (!height || !width)
		 	{
				// in this case, we're not visible so IE won't load the image in some cases
				// so we are going to force a pre-load of the image to calculate the size and then
				// replace it once the image is loaded instead
	      		var tempImage = new Image();
	      		tempImage.onload = function()
	      		{
	      			element.outerHTML = Appcelerator.Browser.buildIEImage(element,tempImage.width,tempImage.height,value.trim());
	      		};
	      		tempImage.src = value;
		 	}
		 	else
		 	{
	      		element.outerHTML = Appcelerator.Browser.buildIEImage(element,width,height,value.trim());
		 	}
      	}
	}
};

Appcelerator.Browser.fixImageIssues = function()
{
	if (Appcelerator.Browser.isIE6)
	{
		/*
		function fnPropertyChanged() 
		{
			if (window.event.propertyName == "style.backgroundImage") 
			{
				var el = window.event.srcElement;
				if (!el.currentStyle.backgroundImage.match(/blank_1x1\.gif/i)) 
				{
					var bg	= el.currentStyle.backgroundImage;
					var src = bg.substring(5,bg.length-2);
					el.filters.item(0).src = src;
					el.style.backgroundImage = "url("+Appcelerator.ImagePath+"blank_1x1.gif)";
				}
			}
		}*/

		for (var i = document.all.length - 1, obj = null; (obj = document.all[i]); i--) 
		{
			if (obj.currentStyle.backgroundImage.match(/\.png/i) != null) 
			{
				Appcelerator.Browser.fixBackgroundPNG(obj);
				//obj.attachEvent("onpropertychange", fnPropertyChanged);
			}
			else if (obj.nodeName == 'IMG')
			{
				Appcelerator.Browser.fixImage(obj);
			}
		}
	}
};

Appcelerator.Core.onload(Appcelerator.Browser.fixImageIssues);