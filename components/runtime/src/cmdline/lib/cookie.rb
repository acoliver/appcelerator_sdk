#
# Copyright 2006-2008 Appcelerator, Inc.
# 
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
# 
#    http://www.apache.org/licenses/LICENSE-2.0
# 
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License. 


require 'uri'
require 'yaml'
require 'date'
require 'cgi'

class CookieJar
	 def initialize
		  @cookies = Hash.new
    end

	 def parse(s)
		cookiestr = s.gsub(' GMT, ',' GMT;; ')
        cookies = cookiestr.split(';;')
        cookies.each do |cookie|
            name_value,*options = cookie.split(';')
            name,value = name_value.split('=')
			name = CGI::unescape(name.strip)
			if not value
				@cookies.delete name
				next
			end
			value = CGI::unescape(value.strip)
            domain,path,expires=nil
			secure=false
			options.each do |option| 
			next unless option
			case option
                when /expires=(.*?GMT)/
                    expires = DateTime.parse($1) rescue nil
                when /path=(.*)/                     
                    path = $1
                when /domain=(.*)/                      
                    domain = $1
				when /secure/
					secure=true
                end
            end
			@cookies[name]={:expires=>expires,:value=>value,:domain=>domain,:path=>path,:secure=>secure}
        end    
		@cookies
     end

	 def [](key)
		value = @cookies[key]
		return nil unless value
		if not value[:expires].nil? 
			expired = false 
			case value[:expires].class.to_s
				when 'DateTime'
					expired = value[:expires] < DateTime.now
				when 'Time'
					expired = value[:expires] < Time.now
			end
			if expired
				@cookies.delete(key)	
				return nil
			end
	   end
	   value[:value]
	 end

	 def save(out)
	    copy = Hash.new
		copy = copy.replace @cookies
		copy.delete_if {|k,v| v[:expires].nil? }
		out.puts copy.to_yaml	
    end

    def restore(yaml)
		 y = YAML::load_documents(yaml) do |doc|
		  @cookies = doc	
		end
	 end

	 def to_s 
		cookies = @cookies.inject([]) do |a,value|
		  if value[1][:expires].nil? or DateTime.now < value[1][:expires]
	      	 a << "#{CGI::escape(value[0])}=#{CGI::escape(value[1][:value])}" 
		  end
		  a
      end
	  cookies.join('; ')
    end
end


