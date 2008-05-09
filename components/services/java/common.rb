#
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
