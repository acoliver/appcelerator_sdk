Appcelerator.Module.Chart={flashRequired:true,flashVersion:8,getName:function(){return"appcelerator chart"},getDescription:function(){return"chart widget"},getVersion:function(){return 1},getSpecVersion:function(){return 1},getAuthor:function(){return"Amro Mousa"},getModuleURL:function(){return"http://www.appcelerator.org"},isWidget:function(){return true},getWidgetName:function(){return"app:chart"},getAttributes:function(){return[{name:"on",optional:true,description:"Used to display the chart."},{name:"type",optional:true,defaultValue:""},{name:"title",optional:true,defaultValue:""},{name:"color",optional:true,defaultValue:"#477398"},{name:"angle",optional:true,defaultValue:"15"},{name:"thickness",optional:true,defaultValue:"15"},{name:"width",optional:true,defaultValue:"400"},{name:"height",optional:true,defaultValue:"360"},{name:"chartMode",optional:true,defaultValue:"clustered"},{name:"barOrientation",optional:true,defaultValue:"400"},{name:"rotateXAxisLabel",optional:true,defaultValue:"vertical"},{name:"rotateYAxisLabel",optional:true,defaultValue:"false"},{name:"legend",optional:true,defaultValue:"false"},{name:"brightness_step",optional:true,defaultValue:"15"},{name:"textSize",optional:true,defaultValue:"11"},{name:"property",optional:true,defaultValue:""},{name:"chartTitles",optional:true,defaultValue:""},{name:"fillAlpha",optional:true,defaultValue:"30"},{name:"indicator",optional:true,defaultValue:"false"},{name:"marginTop",optional:true,defaultValue:"50"},{name:"marginLeft",optional:true,defaultValue:"50"},{name:"marginRight",optional:true,defaultValue:"50"},{name:"marginBottom",optional:true,defaultValue:"50"},{name:"legendHighlight",optional:true,defaultValue:"true"},{name:"backgroundColor",optional:true,defaultValue:"true"},{name:"marginTop",optional:true,defaultValue:"#FFFFFF"}]},buildWidget:function(B,C){var A='<div id="'+B.id+'"></div>';return{"presentation":A,"position":Appcelerator.Compiler.POSITION_REPLACE,"parameters":C,"functions":["execute"]}},execute:function(Z,d,k){var o=d["type"];var V=d["title"];var S=d["color"];var L=d["angle"];var K=d["thickness"];var A=d["width"];var D=d["height"];var b=d["chartMode"];var O=d["barOrientation"];var E=d["rotateXAxisLabel"];var P=d["rotateYAxisLabel"];var G=d["legend"];var c=d["brightness_step"];var m=d["property"];var X=d["chartTitles"];var T=d["textSize"];var I=d["fillAlpha"];var Y=d["indicator"];var e=d["marginTop"];var F=d["marginLeft"];var n=d["marginRight"];var W=d["marginBottom"];var Q=d["legendHighlight"];var U=d["oneBalloon"];var B=d["backgroundColor"];if(O.toLowerCase()!="vertical"&&O.toLowerCase()!="horizontal"){O=Object.getNestedProperty(k,O)||"vertical"}if(O.toLowerCase()=="horizontal"){O="bar"}else{O="column"}if(E.toLowerCase()=="true"){E=90}else{E=0}if(P.toLowerCase()=="true"){P=90}else{P=0}if(m){array=Object.getNestedProperty(k,m)||[];d["data"]=array}else{array=[]}if(V!=""){var l=Object.getNestedProperty(k,V);if(l==null){l="*[No Title]*"}if(l!="*[No Title]*"){V=l}}var R="";for(var j=0,M=array.length;j<M;j++){R+=array[j]["name"]+","+array[j]["value"]+"\n"}if(o.toLowerCase()!="bar"&&o.toLowerCase()!="pie"&&o.toLowerCase()!="line"&&o.toLowerCase()!=""){o=Object.getNestedProperty(k,o)||""}if(o.toLowerCase()=="bar"&&(b.toLowerCase()!="clustered"&&b.toLowerCase()!="stacked"&&b.toLowerCase()!="100% stacked")){b=Object.getNestedProperty(k,b)||"clustered"}if(o.toLowerCase()=="line"&&(b.toLowerCase()!="line"&&b.toLowerCase()!="stacked"&&b.toLowerCase()!="100% stacked")){b=Object.getNestedProperty(k,b)||"line"}if(G.toLowerCase()!="true"&&G.toLowerCase()!="false"){G=Object.getNestedProperty(k,G)||"false"}var f=S.split(",");if(f.length>1&&o.toLowerCase()=="pie"){f=S;S="";c=""}else{if(f.length==1&&o.toLowerCase()=="pie"){f=""}}if(f.length>1&&o.toLowerCase()=="bar"){S=f[0]}var h="";if(o.toLowerCase()=="bar"||o.toLowerCase()=="line"){titleArray=Object.getNestedProperty(k,X)||[];d["titleArray"]=titleArray;var N="";if(o.toLowerCase()=="bar"){N='<graph gid="{COL_NUM}"><type>column</type><title>{COL_TITLE}</title><color>{COL_COLOR}</color><alpha></alpha><data_labels><![CDATA[]]></data_labels><fill_alpha>'+I+"</fill_alpha></graph>"}else{if(o.toLowerCase()=="line"){N="<graph><axis>left</axis><title>{COL_TITLE}</title><color>{COL_COLOR}</color><color_hover>FF0000</color_hover><fill_alpha>"+I+"</fill_alpha><balloon_text><![CDATA[{COL_TITLE} {value}]]></balloon_text></graph>"}}var a="";for(var j=0,M=titleArray.length;j<M;j++){a+=N.gsub("{COL_NUM}",j.toString()).gsub("{COL_TITLE}",titleArray[j]["title"]).gsub("{COL_COLOR}",f[j]||"")}if(titleArray.length==0){if(o.toLowerCase()=="bar"){chartTitles='<graph gid="0"><type>column</type><title></title><color>'+S+"</color><alpha></alpha><data_labels><![CDATA[]]></data_labels><fill_alpha>"+I+"</fill_alpha><width></width><bullet></bullet><bullet_size></bullet_size><bullet_color></bullet_color><gradient_fill_colors></gradient_fill_colors></graph>"}else{(o.toLowerCase()=="line")}chartTitles="<graph><axis>left</axis><title></title><color>"+S+"</color><color_hover>#FF0000</color_hover><fill_alpha>"+I+"</fill_alpha><balloon_text><![CDATA[]]></balloon_text></graph>"}else{chartTitles=a}var C=(titleArray.length>0)?"{title}":"{series}";if(b.toLowerCase()=="stacked"){h="<balloon_text><![CDATA["+C+": {value}]]></balloon_text>"}else{if(b.toLowerCase()=="100% stacked"){h="<balloon_text><![CDATA["+C+": {percents}%]]></balloon_text>"}else{if(b.toLowerCase()=="clustered"){h="<balloon_text><![CDATA["+C+": {value}]]></balloon_text>"}else{if(b.toLowerCase()=="line"){h="<balloon_text><![CDATA["+C+": {value}]]></balloon_text>"}}}}}var g=G?Math.floor(D*0.06):0;var J=D-g;var H;if(o.toLowerCase()=="pie"){H=new SWFObject(Appcelerator.DocumentPath+"swf/ampie.swf","ampie",A,D,"8","#FFFFFF");H.addVariable("chart_settings",escape("<settings><width/><height/><data_type>csv</data_type><csv_separator>,</csv_separator><skip_rows>0</skip_rows><font>Arial</font><text_size>"+T+"</text_size><text_color>#000000</text_color><decimals_separator>.</decimals_separator><thousands_separator>,</thousands_separator><redraw/><reload_data_interval/><add_time_stamp>false</add_time_stamp><precision>2</precision><export_image_file/><exclude_invisible/><pie><x/><y></y><radius>90</radius><inner_radius>30</inner_radius><height>"+K+"</height><angle>"+L+"</angle><outline_color/><outline_alpha/><!-- main color --><base_color>"+S+"</base_color><brightness_step>"+c+"</brightness_step><colors>"+f+"</colors><link_target/><alpha/></pie><animation><start_time>2</start_time><start_effect>strong</start_effect><start_radius/><start_alpha>0</start_alpha><pull_out_on_click/><pull_out_time>1.5</pull_out_time><pull_out_effect>Bounce</pull_out_effect><pull_out_radius/><pull_out_only_one/></animation><data_labels><radius/><text_color/><text_size/><max_width>140</max_width><show><![CDATA[{title}: {percents}%]]></show><show_lines/><line_color/><line_alpha/><hide_labels_percent>3</hide_labels_percent></data_labels><group><percent/><color/><title/><url/><description/><pull_out/></group><background><color>"+B+"</color><alpha>100</alpha><border_color/><border_alpha/><file/></background><balloon><enabled/><color/><alpha>80</alpha><text_color/><text_size/><show><![CDATA[{title}: {percents}%]]></show></balloon><legend><enabled>"+G+"</enabled><x/><y/><width/><color>#FFFFFF</color><max_columns/><alpha>0</alpha><border_color>#000000</border_color><border_alpha>0</border_alpha><text_color/><text_size/><spacing>5</spacing><margins>0</margins><key><size>16</size><border_color/></key></legend><strings><no_data/><export_as_image/><collecting_data/></strings><labels><label><x>0</x><y>10</y><rotate>false</rotate><width/><align>center</align><text_color/><text_size>"+T+"</text_size><text>"+V+"</text></label></labels></settings>"))}else{if(o.toLowerCase()=="bar"){H=new SWFObject(Appcelerator.DocumentPath+"swf/amcolumn.swf","amcolumn",A,D,"8","#FFFFFF");H.addVariable("chart_settings",escape("<settings><type>"+O+"</type><width></width><height>"+J+"</height><data_type>csv</data_type><csv_separator>,</csv_separator><skip_rows>0</skip_rows><font>Arial</font><text_size>"+T+"</text_size><text_color>#000000</text_color><decimals_separator>.</decimals_separator><thousands_separator>,</thousands_separator><redraw>false</redraw><reload_data_interval>0</reload_data_interval><add_time_stamp>false</add_time_stamp><precision>2</precision><depth>"+K+"</depth><angle>"+L+"</angle><export_image_file></export_image_file><column><type>"+b+"</type><width>60</width><spacing>1</spacing><grow_time>1</grow_time><grow_effect>strong</grow_effect><alpha>100</alpha><border_color>#FFFFFF</border_color><border_alpha></border_alpha><data_labels><![CDATA[]]></data_labels><data_labels_text_color></data_labels_text_color><data_labels_text_size></data_labels_text_size><data_labels_position></data_labels_position>"+h+"<link_target></link_target><gradient></gradient></column><line><connect></connect><width></width><alpha></alpha><fill_alpha>"+I+"</fill_alpha><bullet></bullet><bullet_size></bullet_size><data_labels><![CDATA[{value}]]></data_labels><data_labels_text_color></data_labels_text_color><data_labels_text_size></data_labels_text_size><balloon_text><![CDATA[{value}]]></balloon_text><link_target></link_target></line><background><color>"+B+"</color><alpha>100</alpha><border_color></border_color><border_alpha></border_alpha><file></file></background><plot_area><color></color><alpha></alpha><margins><left>"+F+"</left><top>"+e+"</top><right>"+n+"</right><bottom>"+W+"</bottom></margins></plot_area><grid><category><color>#000000</color><alpha>5</alpha><dashed>true</dashed><dash_length>5</dash_length></category><value><color>#000000</color><alpha>5</alpha><dashed>false</dashed><dash_length>5</dash_length><approx_count>10</approx_count></value></grid><values><category><enabled>true</enabled><frequency>1</frequency><rotate>"+E+"</rotate><color></color><text_size>"+T+"</text_size></category><value><enabled>true</enabled><min>0</min><max></max><frequency>1</frequency><rotate>"+P+"</rotate><skip_first>true</skip_first><skip_last>false</skip_last><color></color><text_size>"+T+"</text_size><unit></unit><unit_position>right</unit_position><integers_only></integers_only></value></values><axes><category><color>#000000</color><alpha>100</alpha><width>1</width><tick_length>7</tick_length></category><value><color>#000000</color><alpha>100</alpha><width>1</width><tick_length>7</tick_length></value></axes><balloon><enabled>true</enabled><color></color><alpha>80</alpha><text_color></text_color><text_size>"+T+"</text_size></balloon><legend><enabled>"+G+"</enabled><x></x><y>"+Math.floor(D*0.95)+"</y><width></width><color>#FFFFFF</color><alpha>0</alpha><border_color>#000000</border_color><border_alpha>0</border_alpha><text_color></text_color><text_size>"+T+"</text_size><spacing>5</spacing><margins>0</margins><key><size>16</size><border_color></border_color></key></legend><strings><no_data></no_data><export_as_image></export_as_image><collecting_data></collecting_data></strings><labels><label><x>0</x><y>5</y><rotate></rotate><width></width><align>center</align><text_color></text_color><text_size>"+T+"</text_size><text><![CDATA["+V+"]]></text></label></labels><graphs>"+chartTitles+"</graphs></settings>"))}else{if(o.toLowerCase()=="line"){H=new SWFObject(Appcelerator.DocumentPath+"swf/amline.swf","amline",A,D,"8","#FFFFFF");H.addVariable("chart_settings",escape("<settings> <width></width><height>"+J+"</height><data_type>csv</data_type> <type>"+b+"</type> <csv_separator>,</csv_separator> <skip_rows></skip_rows> <font></font> <text_size>"+T+"</text_size> <text_color></text_color> <decimals_separator>.</decimals_separator> <thousands_separator>,</thousands_separator> <redraw></redraw><reload_data_interval></reload_data_interval> <add_time_stamp></add_time_stamp><connect></connect> <hide_bullets_count></hide_bullets_count> <export_image_file></export_image_file><link_target></link_target><background> <color>"+B+"</color> <alpha>100</alpha> <border_color></border_color> <border_alpha></border_alpha> <file></file></background><plot_area> <color></color> <alpha></alpha> <border_color></border_color> <border_alpha></border_alpha> <margins> <left>"+F+"</left> <top>"+e+"</top> <right>"+n+"</right> <bottom>"+W+"</bottom> </margins> </plot_area><scroller> <enabled></enabled> <y></y> <color></color> <alpha></alpha> <bg_color></bg_color> <bg_alpha></bg_alpha> <height></height> </scroller><grid> <x> <enabled></enabled> <color></color><alpha>5</alpha><dashed>true</dashed><dash_length>5</dash_length> <approx_count>10</approx_count> </x> <y_left> <enabled></enabled> <color></color> <alpha>5</alpha><dashed></dashed><dash_length></dash_length> <approx_count></approx_count> </y_left> <y_right> <enabled></enabled> <color></color> <alpha>5</alpha><dashed></dashed><dash_length></dash_length> <approx_count></approx_count> </y_right> </grid><values> <x> <enabled>true</enabled> <rotate>"+E+"</rotate> <frequency></frequency> <skip_first></skip_first> <skip_last></skip_last> <color></color> <text_size>"+T+"</text_size> </x> <y_left> <enabled>true</enabled> <rotate>"+P+"</rotate> <min></min> <max></max> <strict_min_max></strict_min_max> <frequency></frequency> <skip_first></skip_first> <skip_last></skip_last> <color></color> <text_size>"+T+"</text_size> <unit></unit> <unit_position></unit_position> <integers_only></integers_only> </y_left> <y_right> <enabled></enabled> <rotate>"+P+"</rotate> <min></min> <max></max> <strict_min_max></strict_min_max> <frequency></frequency> <skip_first></skip_first> <skip_last></skip_last> <color></color> <text_size>"+T+"</text_size> <unit></unit> <unit_position></unit_position> <integers_only></integers_only> </y_right> </values><axes> <x> <color></color> <alpha></alpha> <width></width> <tick_length></tick_length> </x> <y_left> <color></color> <alpha></alpha> <width></width> <tick_length></tick_length> </y_left> <y_right> <color></color> <alpha></alpha> <width></width> <tick_length></tick_length> </y_right> </axes><indicator> <enabled>"+Y+"</enabled> <zoomable></zoomable> <color></color> <line_alpha></line_alpha> <selection_color></selection_color> <selection_alpha></selection_alpha> <x_balloon_enabled></x_balloon_enabled> <x_balloon_text_color></x_balloon_text_color> <y_balloon_text_size>"+T+"</y_balloon_text_size> <y_balloon_on_off>"+Q+"</y_balloon_on_off> <one_y_balloon>"+U+"</one_y_balloon> </indicator><legend><enabled>"+G+"</enabled> <x></x> <y>"+Math.floor(D*0.95)+"</y> <width></width> <max_columns></max_columns> <color></color> <alpha></alpha> <border_color></border_color> <border_alpha></border_alpha> <text_color></text_color> <text_color_hover></text_color_hover> <text_size>"+T+"</text_size> <spacing>5</spacing> <margins></margins> <graph_on_off>false</graph_on_off> <key> <size></size> <border_color></border_color> <key_mark_color></key_mark_color> </key> <values> <enabled></enabled> <width></width> <align></align> <text><![CDATA[]]></text> </values> </legend><zoom_out_button> <x></x> <y></y> <color></color> <alpha></alpha> <text_color></text_color> <text_color_hover></text_color_hover> <text_size>"+T+"</text_size> <text></text> </zoom_out_button><help> <button> <x></x> <y></y> <color></color> <alpha></alpha> <text_color></text_color> <text_color_hover></text_color_hover> <text_size>"+T+"</text_size> <text></text> </button> <balloon> <color></color> <alpha></alpha> <width></width> <text_color></text_color> <text_size>"+T+"</text_size> <text><![CDATA[]]></text> </balloon> </help><strings> <no_data></no_data> <export_as_image></export_as_image> <error_in_data_file></error_in_data_file> <collecting_data></collecting_data> <wrong_zoom_value></wrong_zoom_value> </strings><labels><label> <x></x> <y>5</y> <rotate></rotate> <width></width> <align>center</align> <text_color></text_color> <text_size>"+T+"</text_size> <text> <![CDATA["+V+"]]> </text> </label></labels> <graphs>"+chartTitles+"</graphs></settings>"))}else{throw ('Appcelerator Chart Error: type must be set to either "pie", "bar", "line" or a valid value passed via the incoming property message; "'+o+'" is not a valid chart type.')}}}if(H!=null){H.addVariable("path",Appcelerator.DocumentPath+"swf/");H.addVariable("chart_data",escape(R));H.addVariable("preloader_color","#FFFFFF");H.write(Z)}}};Appcelerator.Core.registerModuleWithJS("app:chart",Appcelerator.Module.Chart,["swfobject.js"])