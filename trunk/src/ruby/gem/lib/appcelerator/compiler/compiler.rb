#
# Appcelerator SDK
#
# Copyright (C) 2006-2007 by Appcelerator, Inc. All Rights Reserved.
# For more information, please visit http://www.appcelerator.org
#
# This program is free software; you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation; either version 2 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License along
# with this program; if not, write to the Free Software Foundation, Inc.,
# 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
#

require 'rubygems'
require 'hpricot'
require 'md5'
require 'zlib'
require 'base64'

#
# Appcelerator Just-in-time Compiler
#
#
module Appcelerator
  class Compiler
    
    def Compiler.compile(input,root_uri=nil,assets_path=nil,uis_path=nil,replacements={},debug=false)
      doc = Hpricot.parse(input)
      
      appjs = nil
      found_widgets = []
      appjsdir = nil
      
      #
      # find any widgets and also make sure we find an appcelerator.js file
      #
      doc.search('/html/head/script[@src]').each do |element|
        src = element.attributes['src']
        if src =~ /appcelerator(-debug|-lite)?\.js/
          appjs = element
          debugon = src.index('-debug')
          if not debugon and debug
            element.raw_attributes['src']=src.gsub('appcelerator.','appcelerator-debug.')
          end
          debug = debugon unless debug
          idx = src.index('appcelerator')
          appjsdir = idx > 0 ? src[0,idx] : ''
          appjsdir = appjsdir + '../'
        elsif match = /modules\/([\w\d]+_[\w\d]+)\/[\w\d]+_[\w\d]+\.js/.match(src)
          widget = match[1]
          widgetname = widget.gsub(/_/,':')
          found_widgets << widgetname
        end
        element.raw_attributes['src']=URI.join(root_uri,src) if root_uri
      end

      # we must have appcelerator.js
      return input unless appjs
      
      # check to see if we're already compiled
      g = doc.search('/html/head/meta[@generator]')
      if g.length > 0
        g.each do |t|
            if t.attributes['content'] =~ /Appcelerator Compiler/
                return input
            end
        end
      end
      
      state = {
          :script=>[], 
          :counter=>0, 
          :widgets=>[], 
          :root_uri=>root_uri, 
          :assets_path=>assets_path,
          :uis_path=>uis_path,
          :replacements=>replacements, 
          :messages=>[],
          :cacheable=>true,
          :erb=>false,
          :debug=>debug
      }
      
      state[:script] << '$$AC.compileOnLoad=false;'
      if root_uri
          state[:script] << 'Appcelerator.ScriptPath=\'' + URI.join(root_uri,'/javascripts/').to_s + '\';'
          state[:script] << 'Appcelerator.ImagePath=\'' + URI.join(root_uri,'/images/').to_s + '\';'
          state[:script] << 'Appcelerator.StylePath=\'' + URI.join(root_uri,'/stylesheets/').to_s + '\';'
          state[:script] << 'Appcelerator.ContentPath=\'' + URI.join(root_uri,'/content/').to_s + '\';'
          state[:script] << 'Appcelerator.ModulePath=\'' + URI.join(root_uri,'/modules/').to_s + '\';'
      end
      state[:script] << '$$AU.ServerConfig.addConfigListener(function(){'
      state[:script] << 'var compilerState = $$AC.createCompilerState();'
      state[:script] << 'var W = window; var A = "appcelerator"; var D = document;'
      state[:script] << 'function S(e,scope){if(e)e.scope = scope};'
      
      # process each element
      (doc/:html).each do |element|
        process(element,state)
      end

      
      # figure out which ones aren't found
      newjs = ''
      state[:widgets].uniq.each do |widget|
        if not found_widgets.index(widget)
          name = widget.gsub(/:/,'_')
          md = debug ? '-debug' : ''
          src = URI.join(root_uri,"modules/#{name}/#{name}#{md}.js") if root_uri
          src = "#{appjsdir}modules/#{name}/#{name}#{md}.js" unless src
          newjs << "<script src=\"#{src}\" type=\"text/javascript\"></script>\n"
        end
      end
      
      appjs.after "\n#{newjs}" if newjs != ''
      
      if state[:messages].length > 0
        state[:script] << '(function(){'
        if debug
          state[:script] << state[:messages].join(";\n")
        else
          state[:script] << state[:messages].join(';')
        end
        state[:script] << '})();'
      end

      state[:script] << 'compilerState.scanned = true;'
      state[:script] << 'compilerState.onafterfinish=function(){'
      state[:script] << '$$AC.compileDocumentOnFinish();'
      state[:script] << 'var TE = new Date().getTime() - T;'
      state[:script] << 'Logger.info("Compile took "+TE+" ms");'
      state[:script] << '};'
      state[:script] << '$$AC.checkLoadState(compilerState);'
      state[:script] << 'if ($$AB.isIE6) $$AB.fixImageIssues();'
      state[:script] << '});'
    
      head = (doc/:html/:head)
      body = (doc/:html/:body)

      title = head.search('title')

      if title.nil? or title.length <= 0
        head.prepend("\n\t<title></title>")
      end
      
      # STYLE must have type to validate
      doc.search('style:not(@type)').each do |style|
        style.raw_attributes['type']='text/css'
      end
      

      # IMG must have alt to validate
      body.search('img:not(@alt)').each do |img|
        img.raw_attributes['alt']=''
      end
      
      # remove our deleted divs
      doc.search("div[@class='__deleted__]'").remove
      
      meta = "\n"
      meta << "\t<meta name=\"generator\" content=\"Appcelerator Compiler #{Appcelerator::VERSION}\">\n"
      meta << "\t<meta name=\"license\" content=\"Appcelerator is licensed under GNU Public License, version 2.0 (GPL)\">\n"
      meta << "\t<meta name=\"copyright\" content=\"Appcelerator is Copyright 2007-2008 by Appcelerator, Inc.\">"
      
      head.prepend(meta)
      
      if debug
        str = "\t<script type=\"text/javascript\">\n(function(){var T = new Date().getTime();$$AC.nextId=#{state[:counter]+1};\n"
        str << state[:script].join("\n")
        str << "})();</script>\n"
        head.append(str)
      else
        head.append("\t<script type=\"text/javascript\">(function(){var T = new Date().getTime();$$AC.nextId=#{state[:counter]+1};#{state[:script].join('')}})();</script>\n")
      end
      
      html = doc.to_s
      
      html = html.gsub('><\/input','>')
      html = html.gsub('><\/img','>')
      html = html.gsub(/<(\w+)(.*)?\/>/,"<\\1\\2>")
      
      html << "\n<!-- Appcelerator. More App. Less Code. -->" 
      
      return html, state[:cacheable], state[:erb]
    end

    private

    COMPILER_ATTRIBUTES = %w(on activators decorator decoratorId validator fieldset sortable multiselect supressAutoStyles selectable draggable droppable resizable srcexpr langid scope onloaded)

    def Compiler.compile_optimized_app_message_widget(element,state)
      name = element.attributes['name']
      return false unless name =~ /^(remote|r)\:/
      colon = name.index(':')
      service = name[colon+1,name.length]
      args = element.attributes['args']||'{}'
      begin
        json = friendly_json_decode(args)
        msg = Appcelerator::Dispatcher::Message.new({}, {}, service, json, Time.new, 'appcelerator')
        message_queue = ServiceBroker.send(msg)   
        message_queue.compact.each do |msg|
           obj = {'requestid'=>'','type'=>msg.response_type,'data'=>msg.response,'scope'=>msg.scope,'datatype'=>'JSON'}
           state[:messages] << "$$AU.ServiceBroker.dispatch(#{obj.to_json});"
        end   
        element.swap("<div class=\"__deleted__\"></div>")
        # don't allow caching since this data is dynamic
        state[:cacheable]=false
        return true
      rescue => e
        puts e
      end
      false
    end
    
    def Compiler.unescape_xml(code)
        code.gsub!('&lt;','<')
        code.gsub!('&gt;','>')
        code.gsub!('&quot;','"')
        code.gsub!('&apos;','\'')
        code.gsub!('&amp;','&')
        code
    end

    def Compiler.compile_optimized_app_script_widget(element,state)
      # if there is an on expression, don't compile it
      # TODO: optimize this
      return false if element.attributes['on']
      code = element.inner_html
      code = code.gsub(/\/\*(.*?)\*\//,'');
      code = Compiler.unescape_xml(code)
      state[:script] << "(function(){#{code}})();"
      element.swap("<div class=\"__deleted__\"></div>")
      return true
    end
    
    def Compiler.find_file(state,src)
        f = File.join(state[:uis_path],src)
        return f if File.exists?(f)
        f = File.join(File.dirname(state[:uis_path]),src)
        return f if File.exists?(f)
        return src if File.exists?(src)
        nil
    end
    
    def Compiler.compile_optimized_app_content_widget(element,state)

      # TODO: better optimize these
      return false if element.attributes['on']
      return false if element.attributes['onload']
      return false if element.attributes['onfetch']
      
      if (element.attributes['lazy'] || 'false') == 'false'
          f = Compiler.find_file(state,element.attributes['src'])
          if f
            content_file = File.read(f)
            doc = Hpricot.parse(content_file)
            html = doc.search('/html/body').inner_html
            id = element.attributes['id']
            args = element.attributes['args']
            if args
              begin
                args = friendly_json_decode(args)
              rescue
                # we might have complex front-end variables that don't work on eval
                # in which case we let front-end deal with it
                return false
              end
              html.gsub!(/#\{(.*?)\}/) do |m|
                m = /#\{(.*?)\}/.match(m)
                args[m[1]] || m[0]
              end
            end
            newelement = element.swap("<div id=\"#{id}\">#{html}</div>")
            process_child(newelement[0],state)
            return true
          end
      end
      false
    end
    
    def Compiler.friendly_json_decode(str)
      JSON.parse(str.gsub(/'(.*?)'/,"\"\\1\""))
    end
    
    def Compiler.compile_widget(element,state)
      
      # see if we have an optimized handler method - call it
      func = "compile_optimized_#{element.name.gsub(':','_')}_widget"
      if self.respond_to?(func)
        result = send("#{func}".to_sym,element,state)
        return if result
      end
      
      #TODO: optimize this
      
      id = element.attributes['id']
      html = element.inner_html.gsub('html:','')
      script = []
      script << "(function(){"
      elemtype = element.name=~/script/i ? 'xmp' : 'div'
      script << "var e = D.createElement('#{elemtype}');"
      if html.strip.length > 0
         if elemtype=='xmp'
            # TODO: optimize this to create a function which is invoked and this
            # content is placed in script directly
            script << "e.innerHTML = \"#{escape_string(html)}\";"
         else
            script << "e.innerHTML = \"#{Compiler.escape_string(html)}\";";
#            script << "e.innerHTML = \"#{Base64.encode64(html).gsub(/\s/,'')}\".decode64();"
         end
      end
      script << "e._tagName = '#{element.name}';"
      script << "e.id = \"#{id}_compiler\";"
      script << "e.style.display='none';"
      element.attributes.each do |key,value|
        script << "e.setAttribute(\"#{key}\",\"#{value}\");" unless key=='id'
      end
      script << "$#{id}.appendChild(e);"
      script << "$$AC.compileWidget($el('#{id}_compiler'),compilerState,'#{element.name}');"
      script << "})();"
      
      state[:script].concat(script)
      state[:widgets] << element.name

      element.swap("<div id=\"#{id}\"></div>")
    end

    def Compiler.escape_string(value)
      value.gsub(/[\n\r]/,"\\\\n").gsub(/[\t]/,"\\\\t").gsub(/["]/,"\\\\\"")
    end
    
    def Compiler.pre_compile_body_element(element,state)
        on = element.attributes['on'] || ''
        if on != ''
            on.gsub!('l:app.compiled then show','')
            on.strip!
        end 
        if on!=''
            if not on =~ /l:app\.compiled/
                on = "l:app.compiled then visible or #{on}"
            end
        else
            on = 'l:app.compiled then visible'
        end
        style = element.attributes['style'] || ''
        styles = Hash.new
        if style!=''
            style.strip.split(';').each {|entry| t = entry.split(':'); styles[t[0].strip] = t[1].strip }
        end
        styles['visibility']='hidden'
        styleattr = ''
        styles.each do |k,v|
            styleattr << "#{k}:#{v};"
        end
        element.raw_attributes['style'] = styleattr
        element.raw_attributes['on'] = on
    end
    
    def Compiler.compile_element(element,state)
      compile = false
      found_attrs = {}
      if element.name =~ /body/i
        Compiler.pre_compile_body_element(element,state)
      end
      element.attributes.each do |name,value|
        COMPILER_ATTRIBUTES.each do |attr|
          if attr==name
            found_attrs[name]=value
            element.remove_attribute name 
            compile = true
          end
        end
      end
      if compile
        id = element.attributes['id']
        found_attrs.each do |key,value|
          state[:script] << "$#{id}.setAttribute(\"#{key}\",\"#{escape_string(value)}\");" unless key=='id'
        end
        recursive=false
        state[:script] << "$$AC.compileElement($#{id},compilerState,#{recursive});"
      end
    end
    
    def Compiler.process_child(element,state)
      if element.elem?
        if element.name.downcase == 'body'
          state[:inbody] = true
          element.raw_attributes['id'] = 'app_body' unless element.attributes['id']
        end
        id = ensure_id(element,state)
        replacement = state[:replacements][id] if id
        element = element.swap(replacement)[0] if replacement
        id = ensure_id(element,state) if replacement
        fix_path(element,state[:root_uri]) if state[:root_uri]
        if element.name.index(':')
          compile_widget(element,state)
        else
          compile_element(element,state)
          process_children(element,state)
        end  
      end
    end
    
    def Compiler.get_scope(element)
      return 'A' unless element and element.elem?
      return "\'#{element.attributes['scope']}\'" if element.attributes['scope']
      return get_scope(element.parent)
    end
    
    def Compiler.ensure_id(element,state)
      return nil unless state[:inbody]
      id = element.attributes['id']
      if not id
        state[:counter] = state[:counter] + 1
        id = element.raw_attributes['id'] = "app_#{state[:counter]}"
      end
      scope = get_scope(element)
      state[:script] << "W['$#{id}']=$el('#{id}');S($#{id},#{scope});"
      id
    end

    def Compiler.process_children(element,state)
      if element.elem?
        element.each_child do |child|
          process_child(child,state)
        end
      end
    end
    
    def Compiler.process(element,state)
      ensure_id(element,state)
      element.attributes.each do |key,value|
        if key =~ /^xmlns/
          element.remove_attribute key
        end
      end
      compile_element(element,state)
      process_children(element,state)
    end

    FIX_URI_ELEMENTS = {'img'=>'src','link'=>'href','script'=>'src'}

    def Compiler.fix_path(element,root_uri)
      attrname = FIX_URI_ELEMENTS[element.name.downcase]
      if attrname
        value = element.attributes[attrname]
        element.raw_attributes[attrname] = URI.join(root_uri,value) if value
      end
    end
    
    
  end
end

if defined?(RAILS_ROOT)
  class ActionController::Base
    def proxy_process(request, response, method = :perform_action, *arguments) #:nodoc:
        
        server = request.headers['SERVER_SOFTWARE'] || 'Unknown'
        response.headers['Server'] = "#{server} (Powered by Appcelerator #{Appcelerator::VERSION})"
        
        path_info = request.path_info || '/index.html'
        path_info = '/index.html' if path_info==''

        #
        # attempt to compile file
        #
        if request.get? and path_info =~ /\.html$/
          file = "#{RAILS_ROOT}/public#{path_info}"
          if File.exists?(file)
            f = File.open(file,'r')
            input = f.read
            f.close
            return compile(request,response,input)
          end
      end

      # call the real process
      response = real_process(request,response,method,*arguments)
      
      #
      # attempt to compile the response if it's OK and HTML
      #
      if request.get? and response.headers['Status'] =~ /^200/ and response.headers['type'] =~ /^text\/html/
        return compile(request,response,response.body)
      end
      response
    end
    
    def compile(request,response,input)
      #
      # read in the file and then compile it
      #
      response.headers['Status']='200 OK'
      response.headers['Content-Type']='text/html'

      root_uri="#{request.protocol}#{request.host_with_port}/"
      assets_path="#{RAILS_ROOT}/public"
   
      #
      # TODO: support caching of compiled files
      #
      output,cacheable,state = Appcelerator::Compiler.compile(input,root_uri,assets_path)
      response.body = output
      response.headers.delete 'Cache-Control' if cacheable
      response.headers['ETag'] = MD5.hexdigest(output)
      if request.headers['HTTP_IF_NONE_MATCH'] == response.headers['ETag']
        response.headers['Status'] = '304 Not Modified'
        response.body = ''
        return response
      end
      
      #
      # attempt to do deflate compression if supported by the browser
      #
      begin
        encoding = request.headers['HTTP_ACCEPT_ENCODING']
        if encoding and encoding =~ /deflate/
          response.headers["Content-Encoding"] = 'deflate'
          response.body = deflate(response.body)
        end
      rescue => e
          puts e
      end
      
      response.headers['Content-Length'] = response.body.size
      if cacheable
        response.headers['Expires'] = CGI::rfc1123_date(Time.now + 10.minutes)
      end
      response
    end
    
    def deflate(content)
      deflater = Zlib::Deflate.new(
        Zlib::DEFAULT_COMPRESSION,
        # drop the zlib header which causes both Safari and IE to choke
        -Zlib::MAX_WBITS, 
        Zlib::DEF_MEM_LEVEL,
        Zlib::DEFAULT_STRATEGY)

      gzout = StringIO.new(deflater.deflate(content, Zlib::FINISH))
      gzout.rewind
      gzout.read
    end

    alias :real_process :process
    alias :process :proxy_process
  end

  if defined?(Mongrel)
    module Mongrel
      class DirHandler
        #
        # we are going to override the default handling of static
        # files from mongrel for HTML and allow us to serve them so
        # they can be compiled
        #
        def proxy_can_serve(path_info)
          result = real_can_serve(path_info)
          if result and result =~ /\.html$/
            result = nil
          end
          result
        end
        alias :real_can_serve :can_serve
        alias :can_serve :proxy_can_serve
      end
    end
  end
  if $0 =~ /server/
    puts "** Installed Appcelerator JIT Compiler"
  end
end



#
# TODO:
#
# - optimize on attributes
# - add if widget compile 
#