Appcelerator.Module.Message={getName:function(){return"appcelerator message"},getDescription:function(){return"message widget"},getVersion:function(){return 1},getSpecVersion:function(){return 1},getAuthor:function(){return"Jeff Haynie"},getModuleURL:function(){return"http://www.appcelerator.org"},isWidget:function(){return true},getWidgetName:function(){return"app:message"},execute:function(E,A,D,C,B){Appcelerator.Module.Message.sendMessage(A)},getAttributes:function(){return[{name:"on",optional:true,description:"May be used to express when the message should be fired (executed)."},{name:"name",optional:false,description:"The name of the message to be fired."},{name:"args",optional:true,description:"The arguement payload of the message."},{name:"version",optional:true,description:"The version attached to the message."},{name:"interval",optional:true,description:"Indicates that an interval (in milliseconds) that the message will continously be fired."}]},buildWidget:function(G,D){var F=D["name"];var E=D["args"];var B=D["version"];var A=D["on"];E=E?String.unescapeXML(E):null;var C=D["interval"];var H={args:E,name:F,scope:G.scope,interval:C,version:B};if(A){return{"position":Appcelerator.Compiler.POSITION_REMOVE,"functions":["execute"],"parameters":H}}else{Appcelerator.Module.Message.sendMessage(H);return{"position":Appcelerator.Compiler.POSITION_REMOVE}}},sendMessage:function(E){var A=E.name;var H=E.args;var G=E.version;var I=E.scope;var C=E.interval;if(H&&H!="null"){var F=Object.evalWithinScope(H,window)}$MQ(A,F,I,G);if(C!=null){var D=parseInt(C);if(D>0){var B=setInterval(function(){if(H&&H!="null"){F=Object.evalWithinScope(H,window)}$MQ(A,F,I,G)},D)}}}};Appcelerator.Core.registerModule("app:message",Appcelerator.Module.Message)