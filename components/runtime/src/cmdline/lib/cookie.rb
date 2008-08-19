#
# This file is part of Appcelerator.
#
# Copyright (c) 2006-2008, Appcelerator, Inc.
# All rights reserved.
# 
# Redistribution and use in source and binary forms, with or without modification,
# are permitted provided that the following conditions are met:
# 
#     * Redistributions of source code must retain the above copyright notice,
#       this list of conditions and the following disclaimer.
# 
#     * Redistributions in binary form must reproduce the above copyright notice,
#       this list of conditions and the following disclaimer in the documentation
#       and/or other materials provided with the distribution.
# 
#     * Neither the name of Appcelerator, Inc. nor the names of its
#       contributors may be used to endorse or promote products derived from this
#       software without specific prior written permission.
# 
# THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
# ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
# WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
# DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
# ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
# (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
# LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
# ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
# (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
# SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
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


