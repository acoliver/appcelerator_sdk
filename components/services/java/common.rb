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

def compile_dir(source_dir, output_dir, cp_dirs)
  puts "Compiling Java files..." if VERBOSE
  output_dir = File.expand_path(output_dir)

  if (cp_dirs.class != Array)
    cp_dirs = [cp_dirs]
  end

  java_path_separator = RUBY_PLATFORM=~/win32/ ? ';' : ':'

  cp = cp_dirs.collect{|d| Dir["#{d}/**/*.jar"]}.flatten()
  cp = cp.join(java_path_separator)
  
  FileUtils.cd(source_dir) do
    src_files = Dir["**/*.java"].collect{|file| File.expand_path(file)}
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
