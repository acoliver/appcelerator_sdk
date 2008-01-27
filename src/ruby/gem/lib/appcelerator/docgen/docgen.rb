require 'rubygems'
require 'json'
require 'erb'
require 'hpricot'
require 'maruku'


module Appcelerator
   class Module
      def Module.loadMetaData(file,verbose=false)
         begin
            exc = "java -jar #{File.dirname(__FILE__)}/js.jar -f #{File.dirname(__FILE__)}/init.js -f #{File.dirname(__FILE__)}/prototype.js -f #{File.dirname(__FILE__)}/loader.js -f #{File.dirname(__FILE__)}/types.js #{file}"
            puts exc if verbose
            cmd=open("|#{exc}")
            out=cmd.read
            puts "Returned: #{out}" if verbose
            return JSON.parse(out) unless out.nil?
         ensure
            cmd.close if cmd 
         end
      end
      def Module.document(file,exampleFiles,verbose=false)

            metadata = Module.loadMetaData(file,verbose)
            raise "Module Validation Errors: #{metadata['errors'].join(',')}" if metadata['invalid']

            sourcecode = Module.highlightJS(file,verbose)
                        
            examples=[]
            
            exampleFiles.uniq.each do |example|
              fn = File.basename(example)
              input = File.read(example)
              if input.length > 0
                if fn =~ /\.md$/
                    input = Maruku.new(input).to_html_document
                end
                html = Hpricot.parse(input)
                html.search('pre').each do |elem|
                  code = elem.at('code').inner_html
                  code.gsub!('&lt;','<')
                  code.gsub!('&gt;','>')
                  code.gsub!('&quot;','"')
                  code.gsub!('&apos;','\'')
                  elem.swap(Module.highlightHTML(code))
                end
                examples << {
                  :title=>html.search('/html/head/title').inner_html,
                  :code=>html.search('/html/body').inner_html
                }
              end
            end if exampleFiles
            
            rhtml = ERB.new(File.read("#{File.dirname(__FILE__)}/module_template.txt"))
        
            b = Proc.new { binding }.call
            metadata.each do |key, value|
                eval "@#{key} = metadata['#{key}']", b
            end
            
            eval "@sourcecode = sourcecode", b
            eval "@examples = examples", b
            eval "@introduction = ''", b
            
            rhtml.result(b)
      end
      
      private 
      
      def Module.highlightHTML(code,verbose=false)
        require 'syntax/convertors/html'
        convertor = Syntax::Convertors::HTML.for_syntax "xml"
        convertor.convert(code)
      end
      
      def Module.highlightJS(file,verbose=false)
         begin
            exc = "java -jar #{File.dirname(__FILE__)}/js.jar -e \"var _highlightFile='#{file}'\" -f #{File.dirname(__FILE__)}/highlight.js"
            puts exc if verbose
            cmd=open("|#{exc}")
            out=''
            while cmd.gets do
                out << $_
            end
            puts "Returned JS code [#{out}]" if verbose
            out
         ensure
            cmd.close if cmd
         end
      end
   end
end
