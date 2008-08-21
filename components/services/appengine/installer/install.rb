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

module Appcelerator
  class Appengine
        
    def create_project(from_path,to_path,config,tx)
      
      project_name = config[:name]
      
      unless project_name =~ /^(?!-)[a-z\d\-]{1,100}$/
        die 'AppEngine projects must have names that match this regex: /^(?!-)[a-z\d\-]{1,100}$/'
      end
      
      FileUtils.cd to_path do
        
        FileUtils.cp_r(from_path+'/project/.', to_path)
      
        [ "public/appcelerator.xml",
          "launch/proxy.py",
          "launch/servicebroker.py",
          "app.yaml"
        ].each do |filename|
          edit(tx, File.join(to_path, filename)) do |content|
            content.gsub(/__projectname__/, "#{project_name}")
          end
        end
      end
      
      Dir["#{from_path}/plugins/*.rb"].each do |fpath|
        fname = File.basename(fpath)
        Installer.copy tx, fpath,"#{to_path}/plugins/#{fname}"
      end
      
      true
    end

    def update_project(from_path,to_path,config,tx,from_version,to_version)
        config[:name] = File.basename(Dir.pwd)
        create_project(from_path,to_path,config,tx)
    end
    
    #
    # Helpers
    #
    def edit(tx,filename)
      content = File.read(filename)
      content = yield(content)
      tx.put(filename,content)
    end
    
    def assert(test)
      raise "Assertion Failed" unless test
    end
  end
end
