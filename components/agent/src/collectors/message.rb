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
