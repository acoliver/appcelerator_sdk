#
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

require 'yaml'
require 'singleton'
require 'tracer'
require 'thread'

module Appcelerator
  class AgentClient
    include Singleton
    
    def initialize
      @enabled = false
      
      config = nil
      @root = nil

      if defined?(RAILS_ROOT)
        @root = RAILS_ROOT
      elsif defined?(Merb)
        @root = Merb.root
      end
      
      config = File.expand_path File.join(@root,'config','appcelerator_agent.yml')
      
      if not File.exists?(config)
        @config = {:enabled=>false,:agent=>'http://127.0.0.1:4098/recorder'}
        f = File.open config,'w'
        f.puts @config.to_yaml
        f.close
      else
        @config = YAML::load_file config
        if @config[:enabled]
          if @config[:appid].nil?
            require 'uuid'
            Appcelerator::UUID.setup File.join(@root,'tmp','uuidgen.state')
            @config[:appid] = Appcelerator::UUID.new
            cf = File.open config,'w+'
            cf.puts @config.to_yaml
            cf.close
          end
          
          @appid = @config[:appid]
          @enabled = true
          @endpoint = URI.parse(@config[:agent] || 'http://127.0.0.1:4098/recorder')
          @queue = []
          @mutex = Mutex.new
          @signal = ConditionVariable.new
          @thread = Thread.new do
            while true
              entry = nil
              @mutex.synchronize do
                @signal.wait @mutex
                entry = [].concat(@queue)
                @queue.clear
              end
              transmit(entry) if entry
            end
          end
          record_start
          at_exit { record_stop }
          require 'hooks/servicebroker_tracer'
        end
      end
    end

    def enabled?
      @enabled
    end
    
    def record(msg,time)
      data = {'type'=>'app.message','data'=>{'message'=>msg,'time'=>time}}
      queue data
    end
    
    private
    
    def record_start
      cf = YAML::load_file "#{@root}/config/appcelerator.config" rescue nil
      cf ||= {}
      data = {'type'=>'app.start','data'=>{'dir'=>@root,'config'=>cf}}
      queue data
    end
    
    def record_stop
      data = {'type'=>'app.stop','data'=>nil}
      queue data
    end
    
    def queue(data)
      # we run the recorder on a separate thread which sends HTTP messages to local agent
      @mutex.synchronize do
        @queue << data
        @signal.signal
      end
    end
    
    def transmit(entries)
      begin
        entries.each do |data|
          data['appid'] = @appid
          puts data.to_json
          post_data = CGI::escape(data.to_json)
          request = Net::HTTP.new(@endpoint.host, @endpoint.port)
          response = request.start do |http|
            http.post(@endpoint.path, post_data) 
          end
        end
      rescue => e
        $stderr.puts "AGENT TRANSMIT ERROR=#{e}. Is your local agent server running?"
        # don't let it ever die
        # TODO: do we just drop it or should we somehow retry?
      end
    end

  end
end


Appcelerator::AgentClient.instance
