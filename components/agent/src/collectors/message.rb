#
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
