#
# Appcelerator SDK
#
# Copyright (C) 2006-2007 by Appcelerator, Inc. All Rights Reserved.
# For more information, please visit http://www.appcelerator.org
#
# This program is free software; you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation; either version 2 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License along
# with this program; if not, write to the Free Software Foundation, Inc.,
# 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
#

class ActiveRecord::Base
    # Converts the ActiveRecord object to a JSON string. Only columns with simple
    # types are included in this object so no recursion problems can occur.
    def to_json(*a)
      result = Hash.new  
      self.class.columns.each do |column|
        result[column.name.to_sym] = self.send(column.name)
      end
      result.to_json(*a)
    end
end

class ActionController::Base
  def proxy_reset_session
    reset_session 
  end
  
  def proxy_delete_cookie(cookie)
    cookies.delete cookie.to_sym
  end
  
  def proxy_set_cookie_value(cookie, value)
    cookies[cookie] = value
  end
end