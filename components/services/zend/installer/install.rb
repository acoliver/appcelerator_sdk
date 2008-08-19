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
  class Zend
    def create_project(from_path,to_path,config,tx)
      puts "Creating new zend framework project using #{from_path}" if OPTIONS[:debug]

      exclude = ["#{__FILE__}",'build.yml', '.project']
      Appcelerator::Installer.copy(tx, "#{from_path}/src/.", "#{to_path}", exclude, true)

      %w(log script).each do |name|
        FileUtils.rm_rf("#{to_path}/#{name}")
      end

      FileUtils.cp("#{from_path}/src/.project", "#{to_path}")
      search_and_replace_in_file("#{to_path}/.project",
                                 "MYAPP",
                                  File.basename(to_path))
      true
    end

    def search_and_replace_in_file(file, to_find, to_replace)
      content = File.read(file).gsub!(to_find, to_replace)

      f = File.open(file,'w+')
      f.puts(content)
      f.flush()
      f.close()
      true
    end
    
  end
end


