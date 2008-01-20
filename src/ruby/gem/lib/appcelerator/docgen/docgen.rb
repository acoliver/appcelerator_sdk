require 'rubygems'
require 'json'


module Appcelerator
   class Module
      def Module.loadMetaData(file)
         begin
            cmd=open("|java -jar #{File.dirname(__FILE__)}/js.jar -f #{File.dirname(__FILE__)}/loader.js #{file}")
            out=cmd.gets
            return JSON.parse(out) unless out.nil?
         ensure
            cmd.close if cmd
         end
      end
   end
end
