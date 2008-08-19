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
CommandRegistry.registerCommand('create:html','create a new html file',[
  {
    :name=>'name',
    :help=>'name of the HTML file',
    :required=>true,
    :default=>nil,
    :type=>Types::StringType
  }
],nil,[
  'create:html test.html',
  'create:html test'
]) do |args,options|

  name = args[:name].gsub('.html','')
  
  # this is used to make sure we're in a project directory
  lang = Project.get_service

  with_io_transaction(Dir.pwd) do |tx|
    event = {:file=>"#{Dir.pwd}/public/#{name}.html", :service=>lang, :project_dir=> Dir.pwd}
    PluginManager.dispatchEvent 'before_create_html',event
    template = File.read "#{File.dirname(__FILE__)}/templates/template.html"
    tx.put "#{Dir.pwd}/public/#{name}.html", template
    PluginManager.dispatchEvent 'after_create_html',event
    puts "Created HTML file => #{Dir.pwd}/public/#{name}.html" unless OPTIONS[:quiet]
  end

end
