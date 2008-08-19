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
