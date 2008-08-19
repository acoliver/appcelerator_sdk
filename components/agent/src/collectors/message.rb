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

#
# this collector is responsible for collecting message performance
# details such as the number of invocations of a particular service
# and the execution time
#
# NOTE: no privacy or payload information is actual transmitted or 
# stored by the agent
#
module Appcelerator
  class MessageCollector
    def initialize
      @history = {}
    end
    def process(data)
      if data['type'] == 'app.message'
        payload = data['data']
        if payload
          appid = data['appid']
          hash = @history[appid]
          if not hash
            hash = {}
            @history[appid]=hash
          end
          entry = hash[payload['message']]
          if not entry
            entry = {:count=>0,:time=>0}
            hash[payload['message']]=entry
          end
          entry[:count]+=1
          entry[:time]+=payload['time']
        end
      end
    end
    def key
      'messages'
    end
    def collect
      return nil if @history.empty?
      data = {}.merge @history
      @history.clear
      data
    end
  end
end

Appcelerator::Collector.instance.add(Appcelerator::MessageCollector.new)
