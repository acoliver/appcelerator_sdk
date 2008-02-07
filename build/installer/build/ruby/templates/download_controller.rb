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

class DownloadController < ApplicationController

  def index
    request_id = Time.now
    message_type = params['type'] || 'group.list.request'
    scope = params['scope'] || 'appcelerator'
    @callback = params['error'] || 'appcelerator.download.error'
    result = Appcelerator::Dispatcher.dispatch_message(request, response, session, message_type, params, request_id, scope, self, 'array')

    if result and result.size > 0
      response = result[0]['response']
      type = params['mimetype'] || response[params['mimetypeProperty']] || 'application/octet-stream'
      file = response[params['fileProperty']]
      begin
        begin
          x_send_file(file, :type => type)
        rescue
          send_file(file, :type => type)
        end
      rescue
      end
    end
  end
end