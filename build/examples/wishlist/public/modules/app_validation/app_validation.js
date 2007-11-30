Appcelerator.Compiler.registerCustomCondition(function(C,F,E,A,B,D){switch(F){case"valid":case"invalid":if(Appcelerator.Compiler.getTagname(C,true)!="app:validation"){throw F+" condition can only be used on app:validation widget, found on: "+C.nodeName}Appcelerator.Module.Validation.create(C,F,E,A,B,D);return true;default:return false}});Appcelerator.Module.Validation={getName:function(){return"appcelerator validation"},getDescription:function(){return"validation widget"},getVersion:function(){return 1},getSpecVersion:function(){return 1},getAuthor:function(){return"Jeff Haynie"},getModuleURL:function(){return"http://www.appcelerator.org"},isWidget:function(){return true},getWidgetName:function(){return"app:validation"},getAttributes:function(){return[]},buildWidget:function(A,B,C){return{"position":Appcelerator.Compiler.POSITION_REPLACE,"presentation":""}},create:function(A,M,L,D,R,E){Element.cleanWhitespace(A);var J=A.innerHTML;J=J.replace(/<MEMBERS/g,"<APP:MEMBERS").replace(/\/MEMBERS>/g,"/APP:MEMBERS>");A.innerHTML=J;var S=A.firstChild;if(!S||S.length<=0){throw"required 'members' element not found for "+A.nodeName}var K=Appcelerator.Compiler.getHtml(S,false);var G=K.split(/[ ,]/);var H=A.id;var P;var C;if(M=="valid"){P=Appcelerator.Compiler.makeConditionalAction(H,L,E)}else{if(D){P=Appcelerator.Compiler.makeConditionalAction(H,D,E)}}if(M=="invalid"){C=Appcelerator.Compiler.makeConditionalAction(H,L,E)}else{if(D){C=Appcelerator.Compiler.makeConditionalAction(H,D,E)}}var F={members:[],invalid:null,listener:function(V,U){if(this.invalid!=null&&(U&&!this.invalid)){return }var W=true;if(U){W=false;for(var X=0,T=this.members.length;X<T;X++){if(!this.members[X].validatorValid){W=true;break}}}if(this.invalid!=null&&(this.invalid==W)){return }this.invalid=W;if(W&&C){Appcelerator.Compiler.executeAfter(C,R)}else{if(!W){Appcelerator.Compiler.executeAfter(P,R)}}}};F.listenerFunc=F.listener.bind(F);var I=true;for(var Q=0,N=G.length;Q<N;Q++){var B=G[Q].trim();if(B.length>0){var O=$(B);if(!O){throw"couldn't find validation member with ID: "+B}if(!Appcelerator.Compiler.getFunction(O,"addValidationListener")){if(O.field){O=O.field}else{throw"element with ID: "+B+" doesn't have a validator"}}F.members.push(O);Appcelerator.Compiler.executeFunction(O,"addValidationListener",[F.listenerFunc]);I=I&&O.validatorValid}}F.listenerFunc(F.members[0],I);return F}};Appcelerator.Core.registerModule("app:validation",Appcelerator.Module.Validation)