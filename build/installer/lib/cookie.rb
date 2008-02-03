# Appcelerator SDK
#
# Copyright (C) 2006-2008 by Appcelerator, Inc. All Rights Reserved.
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


