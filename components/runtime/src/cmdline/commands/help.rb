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
    puts "Appcelerator Open Web Platform #{APPCELERATOR_VERSION}".center(80)
    puts 
    puts "  This program comes with ABSOLUTELY NO WARRANTY; for details type "
    puts "  `#{SCRIPTNAME} help:license`. This is free software, and you are welcome to "
    puts "  redistribute it under certain conditions of the Apache 2.0 license."
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
    puts "please visit our developer community at http://appcelerator.org"
    puts
    puts "If you'd like to get additional assistance using Appcelerator or "
    puts "professional support, training or alternative licensing options - please"
    puts "email sales@appcelerator.com or visit http://www.appcelerator.com."
    puts
    true
  end
end
