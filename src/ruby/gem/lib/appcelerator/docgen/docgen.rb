require 'rubygems'
require 'json'


module Appcelerator
   class Module
      def Module.loadMetaData(file,verbose=false)
         begin
            exc = "java -jar #{File.dirname(__FILE__)}/js.jar -f #{File.dirname(__FILE__)}/init.js -f #{File.dirname(__FILE__)}/prototype.js -f #{File.dirname(__FILE__)}/loader.js -f #{File.dirname(__FILE__)}/types.js #{file}"
            puts exc if verbose
            cmd=open("|#{exc}")
            out=cmd.gets
            puts "Returned: #{out}" if verbose
            return JSON.parse(out) unless out.nil?
         ensure
            cmd.close if cmd
         end
      end
   end
end
