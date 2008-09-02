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
# this collector is responsible for collecting app.start and app.stop
# events
#
# NOTE: no privacy or payload information is actual transmitted or 
# stored by the agent
#
module Appcelerator
  class AppCollector
    def initialize
      @data = {}
    end
    def process(data)
      if data['type'] == 'app.start' or data['type'] == 'app.stop'
        @data['appid'] = data['appid']
        @data['data'] = data['data']
        @data['type'] = data['type']
        return true
      end
    end
    def key
      'app'
    end
    def collect
      return nil if @data.empty?
      data = {}.merge @data
      @data.clear
      data
    end
  end
end

Appcelerator::Collector.instance.add(Appcelerator::AppCollector.new)
