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
