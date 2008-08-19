#
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
def compile_dir(source_dir, output_dir, cp_dirs)
  puts "Compiling Java files..." if VERBOSE
  output_dir = to_path(output_dir)

  if (cp_dirs.class != Array)
    cp_dirs = [cp_dirs]
  end

  cp = cp_dirs.collect{|d| Dir["#{d}/**/*.jar"]}.flatten()
  cp = to_path(cp.join(java_path_separator))
  
  FileUtils.cd(source_dir) do
    src_files = Dir["**/*.java"].collect{|file| to_path(file)}
    src_files.delete_if {|f| f =~ /EchoService.java$/ }
    src_files = src_files.join(' ')

    FileUtils.mkdir_p "#{output_dir}" unless File.exists? "#{output_dir}"
    call_command "javac -g -cp #{cp} #{src_files} -target 1.5 -d #{output_dir}"
  end
end

def create_jar(jar_file, class_dir)
  FileUtils.cd(class_dir) do
     if is_win32
       call_command "jar cvf #{jar_file} ."
      else
       system "jar cvf #{jar_file} ." if VERBOSE
       system "jar cvf #{jar_file} . >/dev/null" unless VERBOSE
     end
  end
end
