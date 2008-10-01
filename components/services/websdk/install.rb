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
module Appcelerator
  class Websdk < Project

    @@paths = {
      :tmp => ["tmp", "temporary files"],
      :log => ["log", "logs"],
      :web => ["public", "static web files"]
    }

    #
    # this method is called when a project:update command is run on an existing
    # project.  NOTE: from_version and to_version *might* be the same in the case
    # we're forcing and re-install.  they could be different if moving from one
    # version to the next
    #
    def update_project(from_version, to_version, tx)
      Installer.copy(tx, "#{@service_dir}/pieces/public", get_path(:web))
      true
    end

    # 
    # this method is called when a create:project command is run.  NOTE: this
    # command *might* be called instead of update_project in the case the user
    # ran --force-update on an existing project using create:project
    #
    def create_project(tx)
      Installer.copy(tx, "#{@service_dir}/pieces/public", get_path(:web))
      true
    end

  end
end


