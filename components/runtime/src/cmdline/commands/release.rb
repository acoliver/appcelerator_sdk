# This file is part of Appcelerator.
#
# Copyright (C) 2006-2008 by Appcelerator, Inc. All Rights Reserved.
# For more information, please visit http://www.appcelerator.org
#
# Appcelerator is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
# 
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
# 
# You should have received a copy of the GNU General Public License
# along with this program.  If not, see <http://www.gnu.org/licenses/>.
#

include Appcelerator
CommandRegistry.registerCommand(%w(release release:widget release:plugin release:service release:websdk release:installer),
'release a component (plugin, service, etc)',[
  {
    :name=>'location',
    :help=>'path to packaged file to be released',
    :required=>true,
    :default=>nil,
    :type=>Types::FileType
  }
],nil,
[
  'release app_widget.zip'
], :network) do |args,options|

  location = args[:location]
  
  basename = File.basename(location)
  
  if not basename =~ /\.zip$/
    die "Invalid file format: #{File.expand_path(location)}. File must be packaged as zip file."
  end
  
  # must be logged in
  Installer.login_if_required
  
  # get the config
  config = Installer.load_config
  
  apikey = config[:apikey]

  if not apikey
    puts 
    puts "To release components into the Appcelerator Developer Network"
    puts "you must obtain a developer API key (free-of-charge). You can "
    puts "obtain a key by visiting your profile page. Once you obtain a"
    puts "key will need to enter it below:"
    puts
    
    while true
      apikey = ask 'API Key: '
      break if apikey
    end
  end
  
  client = Installer.get_client
  
  params = Hash.new
  params['file'] = File.open(location,'rb')
  params['apikey'] = apikey
  
  puts "One moment, transmitting ...."

  # send our request
  response = client.upload 'release.request', params
  
  if not response[:data]['success']
    
    if response[:data]['invalid_key']
      config[:apikey] = nil
      Installer.save_config
    end
    
    die response[:data]['msg'] || 'Unknown response from server'
  end
  
  # save off the api key
  config[:apikey] = apikey
  Installer.save_config
  
  puts "Your release has been queued."
  
end
