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
