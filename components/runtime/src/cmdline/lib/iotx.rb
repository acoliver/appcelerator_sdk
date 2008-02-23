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
require 'fileutils'
require 'yaml'

module Appcelerator
  class IOTransaction
    def initialize(project_dir,rollback=false,debug=false)
      if rollback
        fn = "#{project_dir}/rollback.yml"
        if not File.exists? fn
          raise "invalid rollback directory - couldn't find rollback file at #{fn}"
        end
        @completed = YAML::load_file fn
        @project_dir = project_dir
        @temp_dir = project_dir
      else
        @project_dir = project_dir
        @temp_dir = "#{project_dir}/tmp/rollback"
        FileUtils.rm_rf @temp_dir if File.exists? @temp_dir
        FileUtils.mkdir_p @temp_dir
      end
      @operations = nil
      @debug = debug
      @fileindex = 0
      @dirindex = 0
      @recorder = nil
      STDOUT.puts "=> creating new transaction for #{@project_dir}, #{@temp_dir}" if debug
    end

    def begin
      raise "Cannot start a new transaction until commit or rollback" if @operations
      @operations = []
      @completed = []
      @recorder = []
      create_tracefile
      trace "=> begin transaction"
    end

    def commit(recordonly=false)
      raise "Cannot commit transaction since one has not yet been started" unless @recorder
      failed = false
      begin
        trace "=> commit transaction begin (recordonly=#{recordonly})"
        @recorder.each_with_index do |op,idx|
          name = "#{op[:name]}_commit"
          method = self.method name.to_sym
          @state = op[:state] || Hash.new
          args = [recordonly].concat op[:args]
          begin
            success = method.call(*args)
            @completed << {:name=>op[:name],:state=>@state} if success
          rescue => e
            STDERR.puts "Error trying to execute #{name.to_sym} with #{args.join(' ')}. Error: #{e}"
            trace "Error trying to execute #{name.to_sym} with #{args.join(' ')}. Error: #{e}"
            trace "State was: #{@state.to_yaml}"
            trace "Commands in stack are:"
            trace @recorder.to_yaml
            trace "Command #{idx} is the one that failed"
            trace "Stack trace -- Error: #{e}:"
            trace e.backtrace.join("\n\t")
          end
          rollback unless success
          failed = true unless success
          break unless success
        end
        if not failed
          f = File.new "#{@temp_dir}/rollback.yml", 'w+'
          f.puts @completed.to_yaml
          f.close
          
          f = File.new "#{@temp_dir}/manifest.yml", 'w+'
          config = {:time=>Time.now, :cmdline=>"#{ARGV.join(' ')}", :count=>@completed.size}
          f.puts config.to_yaml
          f.close

          trace "=> commit transaction completed (#{@completed.size})"
        end
      ensure
        close_tracefile
      end
      if not failed and @completed.empty?
        # no operations in transaction, just delete directory
        FileUtils.rm_rf @temp_dir
      end
      failed == false
    end
    
    def rollback
      raise "Cannot commit transaction since one has not yet been started" unless @completed
      create_tracefile
      begin
        trace "=> begin rollback"
        if @completed and not @completed.empty?
          @completed.reverse_each do |op|
            name = "#{op[:name]}_rollback"
            method = self.method name.to_sym
            trace "----> #{name} => #{op[:state].to_yaml}"
            @state = op[:state] || Hash.new
            method.call rescue nil
          end
          @completed = nil
        end
        trace "=> end rollback"
      ensure
        close_tracefile
        STDERR.puts "Rolled back. Details at: #{@temp_dir}/trace.log"
      end
    end
    
    def cp(*args)
      raise "Cannot use transaction since one has not yet been started" unless @operations
      src = args[0]
      dest = args[1]
      if src.class == Array
        src.each do |e|
          cp(e,dest)
        end
        return
      else
        if File.directory? src
          mkdir dest
          Dir["#{src}/**/*"].each do |f|
            cp File.expand_path(f),dest
          end
          return
        else
          if File.directory? dest
            cp src,File.expand_path(File.join(dest,File.basename(src)))
            return
          end
        end
      end
      record 'cp',*args
    end
    alias :copy :cp
    
    def mkdir(*args)
      raise "Cannot use transaction since one has not yet been started" unless @operations
      record 'mkdir',*args
    end
    
    def rm(*args)
      raise "Cannot use transaction since one has not yet been started" unless @operations
      if args[0].class == Array
        args[0].each do |e|
          record 'rm',e
        end
        return
      end
      record 'rm',*args
    end
    
    def put(*args)
      raise "Cannot use transaction since one has not yet been started" unless @operations
      record 'put',*args
    end
    alias :puts :put
    
    def save
      raise "not in a good state right now - did you call commit?" unless @temp_dir
      @temp_dir
    end
    
    def delete
      FileUtils.rm_rf @temp_dir if @temp_dir
      @temp_dir = nil
    end

    private
    def backup_dir(path)
      @dirindex+=1
      tempdir = "#{@temp_dir}/backupdir.#{@dirindex}"
      trace "=> creating backup directory from #{path} at #{tempdir}"
      FileUtils.mkdir_p tempdir
      FileUtils.cp_r "#{path}/.",tempdir
      tempdir
    end
    def backup(file)
      @fileindex+=1
      tempfile = "#{@temp_dir}/backup.#{@fileindex}"
      trace "=> creating backup from #{file} at #{tempfile}"
      FileUtils.copy_file file,tempfile
      tempfile
    end
    def add(&action)
      @operations << {:state=>{},:action=>action} 
    end
    def record(name,*args)
      @recorder << {:name=>name,:args=>args,:index=>@recorder.length}
      trace "=> recording #{name}, args=#{args.join(',')}"
    end
    def cp_commit(recordonly,src,dest)
      raise "#{src} must be a file" unless File.exists?(src) and File.file?(src)
      src = src.path if src.class == File
      dest = dest.path if dest.class == File
      @state[:src] = src
      @state[:dest] = dest
      @state[:backup] = backup dest if File.exists?(dest)
      if not recordonly
        return true if Installer.same_file?(src,dest)
      end
      trace "=> copy #{src} to #{dest}"
      FileUtils.copy_file src.to_s,dest.to_s unless recordonly
      true
    end
    def cp_rollback
      return true unless File.exists?(@state[:backup])
      trace "=> rollback copy #{@state[:backup]} to #{@state[:dest]}"
      FileUtils.cp @state[:backup],@state[:dest] 
      FileUtils.rm_rf @state[:backup]
      true
    end
    def mkdir_commit(recordonly,path)
      @state[:exists] = File.exists? path
      @state[:path] = path
      trace "=> creating directory #{path}" unless @state[:exists]
      FileUtils.mkdir_p path unless @state[:exists] and not recordonly
      true
    end
    def mkdir_rollback
      trace "=> rollback directory #{state[:path]}" unless state[:exists]
      FileUtils.rm_rf state[:path] unless state[:exists]
    end
    def rm_commit(recordonly,path)
      raise "#{path} doesn't exist" unless File.exists? path
      if File.exists? path
        if File.directory? path
          @state[:backup] = backup_dir path
          @state[:type] = :dir
        elsif File.file? path
          @state[:backup] = backup path
          @state[:type] = :file
        else
          STDERR.puts "not sure what kind of path this is: #{path}"
          raise "I don't support this type of path: #{path}"
        end
        @state[:path]=path
        trace "=> removing #{@state[:type].to_s} -> #{path}"
        FileUtils.rm_rf path unless recordonly
      end
      true
    end
    def rm_rollback
      trace "=> restoring #{@state[:path]} from #{@state[:backup]} (#{@state[:type]})" 
      return nil unless @state[:type]
      if @state[:type] == :dir
        FileUtils.mkdir_p @state[:path] unless File.exists? @state[:path]
        Dir["#{@state[:backup]}/**/**"].each do |f|
          path = f.gsub(@state[:backup],'')
          p = File.join(@state[:path],path)
          if File.directory?(f)
            FileUtils.mkdir_p p
            trace "=> restoring dir #{p}"
          elsif File.file?(f)
            trace "=> restoring file #{p}"
            FileUtils.cp f,p
          end
        end
      else
        trace "=> restoring file #{p} (file)"
        FileUtils.cp_r @state[:backup],@state[:path]
      end
      FileUtils.rm_rf @state[:backup]
    end
    def put_commit(recordonly,file,content)
      @state[:exists] = File.exists? file
      @state[:backup] = backup file if @state[:exists]
      @state[:path] = file
      if not recordonly
        if @state[:exists]
          a = Digest::MD5.hexdigest file
          b = Digest::MD5.hexdigest content
          return true if a==b
        end
        f = File.open file,'w+'
        f.write content
        f.close
      end
      trace "=> writing contents to #{file}" 
      true
    end
    def put_rollback
      FileUtils.cp @state[:backup],@state[:path] if @state[:exists]
      FileUtils.rm_rf @state[:backup] 
      trace "=> rolling back contents from #{@state[:path]} to #{@state[:backup]}"
    end
    
    def trace(*args)
      msg = args.join(' ')
      STDOUT.puts msg if @debug
      @tracefile.puts "#{Time.now} #{msg}" if @tracefile
    end
    
    def close_tracefile
      if @tracefile
        @tracefile.close
        @tracefile = nil
      end
    end
    
    def create_tracefile
      return nil if @tracefile
      return nil unless File.exists? @temp_dir
      begin
        @tracefile = File.new File.join(@temp_dir,'trace.log'), 'w+'
      rescue
        nil
      end
    end
    
  end
end

def with_io_transaction(dir,tx=nil)
  commit = true unless tx
  tx = Appcelerator::IOTransaction.new(dir,nil,OPTIONS[:debug]) unless tx
  begin
    tx.begin if commit
    yield tx
    tx.commit if commit
  rescue
    tx.rollback
    raise $!
  end
end

#
# testing testing testing
#
if $0 == __FILE__
  tx = Appcelerator::IOTransaction.new '/Users/jhaynie/tmp/blah',nil,true
  tx.begin
  tx.cp '/Users/jhaynie/tmp/blah/config/appcelerator.config','/Users/jhaynie/tmp/blah/build.properties'
  tx.rm '/Users/jhaynie/tmp/blah/build.properties'
  tx.rm '/Users/jhaynie/tmp/blah/config/appcelerator.config'
  tx.rm '/Users/jhaynie/tmp/blah/lib'
  tx.rm '/Users/jhaynie/tmp/blah/public'
  tx.rm '/Users/jhaynie/tmp/blah/app'
  tx.rm '/Users/jhaynie/tmp/blah/build.xml'
  tx.put '/Users/jhaynie/tmp/blah/README','you suck'
  a = tx.commit
  puts "success=> #{a}"
  td = tx.save
  tx = Appcelerator::IOTransaction.new td,true,true
  tx.rollback
end
