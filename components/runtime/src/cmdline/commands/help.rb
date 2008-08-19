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
CommandRegistry.makeGroup(:help) do |group|
  
  group.registerCommand('help','get help for supported commands',[
    {
      :name=>'command',
      :help=>'get help for a specific command',
      :required=>false,
      :default=>nil,
      :type=>Types::AlphanumericType
    }
  ]) do |args,options|
    
    puts 
    puts 'Appcelerator RIA Platform'.center(80)
    puts 
    puts "  This program comes with ABSOLUTELY NO WARRANTY; for details type "
    puts "  `#{SCRIPTNAME} help:license`. This is free software, and you are welcome to "
    puts "  redistribute it under certain conditions of the GNU GPL version 3 license."
    puts
    
    entry = CommandRegistry.find(args[:command])
    invalid_command = (args[:command] and not entry)
    
    if entry
      puts 
      puts "    #{args[:command]} => #{entry[:help]}"
      puts 
      astr = entry[:args].nil? ? '' : entry[:args].map {|a| a[:required] ? "[#{a[:name]}]" : "<#{a[:name]}>" }.join(' ')
      astr = "[options...] #{astr}" if args[:opts]
      puts "    Usage:"
      puts "      #{SCRIPTNAME} #{args[:command]} #{astr}"
      puts
      
      if entry[:args]
        puts "    Supported arguments:"
        entry[:args].each do |arg|
          optional = arg[:required] ? '' : '(optional)'
          puts "      #{arg[:name].ljust(20)} #{arg[:help]} #{optional}"
        end
      end
      
      puts
      puts "    Supported options:"
      opts = GLOBAL_OPTS.values + entry[:opts]
      opts.each do |opt|
        puts "      #{opt[:display].ljust(20)} #{opt[:help]}"
      end
      
      unless entry[:examples].empty?
        puts 
        puts "    Examples:"
        entry[:examples].each do |example|
          puts "      #{example}"
        end
      end
    
    else
      # if we're not helping with a specific command
      puts "    Usage:"
      puts
      puts "        #{SCRIPTNAME} -h/--help"
      puts "        #{SCRIPTNAME} command [arguments...] [options...]"
      puts
      puts "    Examples:"
      puts
      puts "        #{SCRIPTNAME} create:project ~/myproject foobar java --verbose"
      puts "        #{SCRIPTNAME} install:plugin foo:bar"
      puts
      puts "    For supported commands, use:"
      puts
      puts "        #{SCRIPTNAME} help"
      puts
      puts "    For command-specific help, use:"
      puts
      puts "        #{SCRIPTNAME} help [command]"
      puts
      
      if options[:show_commands] != false
        # show these only if the user _typed_ "app help",
        # not if some command they typed was invalid
        puts
        puts "    Supported commands:"
        puts
        currentGroup = nil

        CommandRegistry.each do |name,entry|
          help = entry[:help]
          group = entry[:group]

          # space between groups
          puts if currentGroup and currentGroup != group
          puts "       #{name.ljust(20)}#{help}"
          currentGroup = group
        end
      end
    end
    puts
    
    if invalid_command
      raise UserError.new("Invalid command: #{args[:command]}")
    else
      true
    end
  end

  group.registerCommand('help:license','get license details for this software') do |args,options|
    license = File.expand_path "#{File.dirname(__FILE__)}/templates/COPYING"
    system "less \"#{license}\""
    true
  end

  group.registerCommand('help:about','get details about this software') do |args,options|
    puts
    puts "Glad you asked....  THANK YOU for using Appcelerator. We love you!"
    puts
    puts "Appcelerator was created by Jeff Haynie and Nolan Wright in 2006 "
    puts "and released as an open source project in 2007. For more information,"
    puts "please visit our developer community at http://www.appcelerator.org"
    puts
    puts "If you'd like to get additional assistance using Appcelerator or "
    puts "professional support, training or alternative licensing options - please"
    puts "email sales@appcelerator.com or visit http://www.appcelerator.com."
    puts
    true
  end
end
