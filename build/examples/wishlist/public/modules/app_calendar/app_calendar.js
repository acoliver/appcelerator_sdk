Appcelerator.Module.Calendar={calendarCount:0,getName:function(){return"appcelerator calendar"},getDescription:function(){return"calendar widget"},getVersion:function(){return 1},getSpecVersion:function(){return 1},getAuthor:function(){return"Nolan Wright"},getModuleURL:function(){return"http://www.appcelerator.org"},isWidget:function(){return true},getWidgetName:function(){return"app:calendar"},getAttributes:function(){return[{name:"on",optional:true,description:"May be used to execute the calendar."},{name:"inputId",optional:true},{name:"elementId",optional:true},{name:"minDate",optional:true},{name:"title",optional:true,defaultValue:""}]},execute:function(E,A,D,C,B){Element.show($(A["name"]))},compileWidget:function(I){var H=I["inputId"];var F=I["elementId"];var C=I["minDate"];var G=I["title"];var A="app_calendar_"+this.calendarCount++;var B=I["id"];var A=I["name"];var E=null;if(F){E=$(F)}else{E=$(H)}YAHOO.namespace("appcelerator.calendar");var D=$(A);if(C){YAHOO.appcelerator.calendar[A]=new YAHOO.widget.Calendar(A+"_cal",A,{close:false,mindate:C,title:G})}else{YAHOO.appcelerator.calendar[A]=new YAHOO.widget.Calendar(A+"_cal",A,{close:true,title:G})}YAHOO.appcelerator.calendar[A].render();YAHOO.appcelerator.calendar[A].selectEvent.subscribe(function(M,K,P){var O=K[0];var J=O[0];var L=J[0];var N=J[1];var J=J[2];if(H){E.value=N+"/"+J+"/"+L;Appcelerator.Compiler.executeFunction(E,"revalidate")}else{E.innerHTML=N+"/"+J+"/"+L}Element.hide(D)},YAHOO.appcelerator.calendar[A],true)},buildWidget:function(B,C){if(!C["inputId"]&&!C["elementId"]){throw"inputId or elementId is required"}C["name"]="app_calendar_"+Appcelerator.Module.Calendar.calendarCount++;var A='<div style="position:absolute;z-index:1000;display:none" id="'+C["name"]+'"></div>';return{"position":Appcelerator.Compiler.POSITION_REPLACE,"presentation":A,"functions":["execute"],"compile":true}}};Appcelerator.Core.registerModuleWithJS("app:calendar",Appcelerator.Module.Calendar,["yahoo.js","event.js","dom.js","calendar.js"]);Appcelerator.Core.loadModuleCSS("app:calendar","calendar.css")