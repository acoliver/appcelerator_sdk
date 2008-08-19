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
