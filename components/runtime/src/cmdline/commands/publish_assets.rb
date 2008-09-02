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
CommandRegistry.registerCommand('publish:assets','publish asset files to Amazon S3',[
  {
    :name=>'bucket',
    :help=>'AWS bucket name',
    :required=>true,
    :default=>nil,
    :type=>Types::StringType
  },
  {
    :name=>'path',
    :help=>'path within bucket which will be appended to path for files',
    :required=>false,
    :default=>'',
    :type=>Types::StringType
  }
],nil,[
  'publish:assets my_bucket',
  'publish:assets my_bucket mypath'
]) do |args,options|

  bucket = args[:bucket]
  path = args[:path]
  
  if not ENV['AWS_ACCESS_KEY_ID']
    $stderr.puts "Please make sure you set the environment variable 'AWS_ACCESS_KEY_ID' to your AWS access key and re-run this command."
    exit 1
  end

  if not ENV['AWS_SECRET_ACCESS_KEY']
    $stderr.puts "Please make sure you set the environment variable 'AWS_SECRET_ACCESS_KEY' to your AWS secret access key and re-run this command."
    exit 1
  end
  
  rb = File.expand_path(File.join(File.dirname(__FILE__),'s3','s3sync.rb'))
  
  # this is used to make sure we're in a project directory
  lang = Project.get_service

  # assets dir
  public_dir = File.join(Dir.pwd,'public')
  
  FileUtils.cd(public_dir) do 
    flags = ''
    flags << ' --progress' unless options[:quiet]
    flags << ' --verbose' if options[:verbose]
    system "\"#{rb}\" --recursive #{flags} --public-read --make-dirs --exclude=\"^widgets/|\.(html|xml|txt|yml|md|doc|rb|java|cgi|fcgi)$\" ./ #{bucket}:#{path}"
  end
  
end
