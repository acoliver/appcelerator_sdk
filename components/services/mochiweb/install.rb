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



module Appcelerator
  class Mochiweb < Project
    
    @@paths = {
      :services => ["src", "Appcelerator services"],
      :tmp => ["tmp", "temporary files"],
      :log => ["log", "logs"],
      :web => ["priv/www", "static web files"]
    }
    
    def create_project(tx)
      from_path = @service_dir
      skel_script = "#{from_path}/mochiweb/scripts/new_mochiweb.erl"
      
      if RUBY_PLATFORM =~ /win32|windows/
        puts '-----------------------------------------------------------------'
        puts 'Unless you have cygwin installed, this probably won\'t work right!'
        puts '-----------------------------------------------------------------'
      else
        cmd = "chmod u+x #{skel_script}"
        puts cmd if OPTIONS[:verbose]
        system(cmd)
      end
      
      parent_path = File.dirname(@path)
      cmd = "#{skel_script} #{@config[:name]} #{parent_path}"
      puts cmd if OPTIONS[:verbose]
      system(cmd)
      if $?.nil? or $?.exitstatus != 0
        puts 'Oh no, something good didn\'t happen'
        return false
      end
      
      unless RUBY_PLATFORM =~ /win32|windows/
        cmd = "chmod u+x #{@path}/start-dev.sh"
        puts cmd if OPTIONS[:verbose]
        system(cmd)
        
        cmd = "chmod u+x #{@path}/start.sh"
        puts cmd if OPTIONS[:verbose]
        system(cmd)
      end
      true
    end

    def install_websdk_late?
      true
      # otherwise the skeleton script freaks out
      # to me it seems like the websdk should be installed last by default
    end
  end
end


