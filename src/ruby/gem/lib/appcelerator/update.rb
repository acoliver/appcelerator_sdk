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
require 'open-uri'
require 'yaml'

module Appcelerator
  class Update
  
    def Update.monitor(interval=1.week)
        @thread = Thread.new do
            loop do
                Appcelerator::Update.up2date?
                Kernel::sleep interval.to_i
            end
        end
    end
    
    def Update.unmonitor
        if @thread
            @thread.kill
            @thread = nil
            return true
        end
        false
    end
  
    #
    # this is a simple version check utility which will
    # check the appcelerator public update website to 
    # determine if we're running the latest version or not
    #
    def Update.up2date?(force_version=false)
      systemid = ''
      props = Hash.new
      new_version = false
      version = Appcelerator::VERSION
      site = 'http://updatesite.appcelerator.org'
      lastcheck = nil

      begin

        # place in users directory
        filepath = File.join(user_home,'.appcelerator')
        
        aid = nil
        
        if not force_version
            if not File.exists?(filepath)
                c = {'site'=>'http://updatesite.appcelerator.org','version'=>Appcelerator::VERSION,'aid'=>generate_aid}
                f = File.new(filepath,'w+')
                f.puts c.to_yaml
                f.flush
                f.close
            end
            
            y = YAML::load_stream(File.open(filepath)) 
            doc = y.documents.first
            systemid = doc['systemid']
            site = doc['site']
            version = doc['version']
            lastcheck = doc['last']
            aid = doc['aid']
        end
        
        #
        # we don't want to check more than once per day during 
        # restarts
        #
        if not lastcheck.nil?
           delay = Time.now - lastcheck
           if delay < 1.day
               raise 'No change'
           end
        end
        
        uri = "#{site}?v=1&pkg=sdk_ruby&systemid=#{systemid}&version=#{version}&aid=#{aid}"
        
        #
        # this is the URI we're going to hit to see if we have a new version of appcelerator
        #
        xml = open(uri).read

        # parse out the response into a hash of properties
        xml.match(/<version(.*?)>/)[1].gsub(/'/,'').split(' ').map {|e| a=e.split('='); {'key'=>a[0],'value'=>a[1]} }.each do |e|
          props[e['key']] = e['value']
        end

        #
        # check to see if we have the current version or not and if we don't
        # go ahead and let the user know
        #
        if props['current']=='false'
          puts "A new version of Appcelerator is available: #{props['version']}, released on: #{props['date']}"
          new_version = true
        end
        
        if not force_version
            config = {'systemid'=>props['systemid'], 'last'=> Time.now, 'version'=> version, 'site'=>site, 'aid'=>aid}
            f = File.new(filepath,'w+')
            f.puts config.to_yaml
            f.flush
            f.close
        end
      rescue => e
        # oops, we have an error - don't do anything in this case
      end
      return new_version, {'version'=>props['version'],'date'=>props['date'],'filename'=>props['filename']}
    end
  end
  
  def Update.generate_aid
       OpenSSL::HMAC.hexdigest(OpenSSL::Digest::Digest.new('SHA1'), rand(0).to_s, $$.to_s)
  end

  def Update.user_home
    if ENV['HOME']
        ENV['HOME']
    elsif ENV['USERPROFILE']
        ENV['USERPROFILE']
    elsif ENV['HOMEDRIVE'] and ENV['HOMEPATH']
        "#{ENV['HOMEDRIVE']}:#{ENV['HOMEPATH']}"
    else
        File.expand_path '~'
    end
  end
end


if __FILE__ == $0
  # test it out
  new_version, props = Appcelerator::Update.up2date?
end
