
# This file is part of Appcelerator.
#
# Copyright (C) 2006-2008 by Appcelerator, Inc. All Rights Reserved.
include Appcelerator
module Appcelerator
  class Mule < Project

    @@paths.merge!({
      :src_java => ["src/java", "Java source"],
      :src_war => ["src/war", "war includes"],
      :lib => ["lib", "necessary jars"]
    })

    #
    # this method is called whenkn a project:update command is run on an existing
    # project.  NOTE: from_version and to_version *might* be the same in the case
    # we're forcing and re-install.  they could be different if moving from one
    # version to the next
    #
    def update_project(from_version, to_version, tx)
      puts "Updating java from #{from_version} to #{to_version}" if OPTIONS[:verbose]
      install(tx,true)

      classpath = IO.readlines("#{to_path}/.classpath")
      classpath.each do |line|
        line.gsub!(/appcelerator-([0-9\.])*\.jar/,"appcelerator-#{to_version}.jar")
        line.gsub!(/appcelerator-mule-([0-9\.])*\.jar/,"appcelerator-multe-#{to_version}.jar")
      end
      tx.put "#{to_path}/.classpath",classpath.join("")

    end

    # 
    # this method is called when a create:project command is run.  NOTE: this
    # command *might* be called instead of update_project in the case the user
    # ran --force-update on an existing project using create:project
    #
    def create_project(tx)
      install(tx,false)
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
    def install(tx, update)

      # remove old jars for upgrades
      if (File.exists?("#{@path}/public/WEB-INF/lib"))
          remove_prev_jar(tx,"appcelerator","#{@path}/public/WEB-INF/lib")
          remove_prev_jar(tx,"appcelerator-mule","#{@path}/public/WEB-INF/lib")
      end

      from_path = @service_dir

      if update != false and not(update.nil?)
        excludes = ['build-override.xml', 'web.xml']
      else
        excludes = []
      end

      Installer.copy(tx, "#{from_path}/pieces/root", @path, excludes)
      Installer.copy(tx, "#{from_path}/pieces/lib", get_path(:lib))
      Installer.copy(tx, "#{from_path}/pieces/config", get_path("config"))
      Installer.copy(tx, "#{from_path}/pieces/plugins", get_path(:plugins))
      Installer.copy(tx, "#{from_path}/pieces/public", get_path(:web))
      Installer.copy(tx, "#{from_path}/pieces/services", get_path(:services))

      tx.after_tx { 
        file = File.join(@path, "build.xml")
        search_and_replace_in_file(file, "@@web-dir@@", @config[:paths][:web])
        search_and_replace_in_file(file, "@@services-dir@@", @config[:paths][:services])
      }

      true

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
end


