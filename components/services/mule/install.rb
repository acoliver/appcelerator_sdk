# This file is part of Appcelerator.
#
# Copyright (C) 2006-2008 by Appcelerator, Inc. All Rights Reserved.
include Appcelerator
module Appcelerator
  class Mule

    #
    # this method is called when a project:update command is run on an existing
    # project.  NOTE: from_version and to_version *might* be the same in the case
    # we're forcing and re-install.  they could be different if moving from one
    # version to the next
    #
    def update_project(from_path,to_path,config,tx,from_version,to_version)
      puts "Updating java from #{from_version} to #{to_version}" if OPTIONS[:verbose]
      install(from_path,to_path,config,tx,true)

      classpath = IO.readlines("#{to_path}/.classpath")
      classpath.each do |line|
        line.gsub!(/appcelerator-([0-9\.])*\.jar/,"appcelerator-#{to_version}.jar")
        line.gsub!(/appcelerator-struts-([0-9\.])*\.jar/,"appcelerator-struts-#{to_version}.jar")
      end
      tx.put "#{to_path}/.classpath",classpath.join("")

    end

    # 
    # this method is called when a create:project command is run.  NOTE: this
    # command *might* be called instead of update_project in the case the user
    # ran --force-update on an existing project using create:project
    #
    def create_project(from_path,to_path,config,tx)
      install(from_path,to_path,config,tx,false)
    end
    
    def get_property(propertyfile,property)
      begin
        props = Properties.new
        f = File.new propertyfile
        props.load f
        props.each do |name, value|
          if name == property
            return value
          end
        end
      rescue
      end
    end
    
    def save_property(name,value,propertyfile)
      begin
        file = File.new propertyfile
        props = Properties.new(file)
        props.store(name,value)
        props.save(propertyfile)
      rescue
      end
    end
    
    private
    def install(from_path,to_path,config,tx,update)

      # remove old jars for upgrades
      if (File.exists?("#{to_path}/public/WEB-INF/lib"))
          remove_prev_jar(tx,"appcelerator","#{to_path}/public/WEB-INF/lib")
          remove_prev_jar(tx,"appcelerator-struts","#{to_path}/public/WEB-INF/lib")
      end

      Installer.copy(tx, "#{from_path}/dist", to_path)
    end

    def replace_app_name(name,file)
      content = File.read file
      f = File.open file,'w+'
      content.gsub!('myapp',name)
      f.puts content
      f.flush
      f.close
      true
    end
  end
end
class Properties < Hash
    def initialize(filename=nil)
      if !filename.nil?
        load filename
      end
    end
    def load(properties_string)
        properties_string.each_line do |line|
            line.strip!
            if line[0] != ?# and line[0] != ?=
                i = line.index('=')

                if i
                    store(line[0..i - 1].strip, line[i + 1..-1].strip)
                # else
                #     store(line, '')
                end
            end
        end
     end

     def save(filename)
       file = File.new(filename,"w+")
       each_pair {|key,value| file.puts "#{key}=#{value}\n" }
    end

    def remove_prev_jar(tx,name,dir)
      exists = File.exists? dir
      if exists
        Dir.foreach("#{dir}") do |file|
          puts "checking #{name}-([0-9]\.)*.jar against '#{file}'" if OPTIONS[:verbose]
          if file =~ Regexp.new("#{name}-[0-9]+.*.jar") or file == "#{name}.jar"
            puts "removing " + File.expand_path(file, dir) if OPTIONS[:verbose]
            tx.rm File.expand_path(file, dir)
          end
        end
      else
        FileUtils.mkdir dir
      end
    end

end


