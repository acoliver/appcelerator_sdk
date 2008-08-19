#
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
