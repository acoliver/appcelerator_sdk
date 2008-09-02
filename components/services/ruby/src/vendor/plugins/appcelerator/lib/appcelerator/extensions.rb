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


class ActiveRecord::Base
    # Converts the ActiveRecord object to a JSON string. Only columns with simple
    # types are included in this object so no recursion problems can occur.
    def to_json(*a)
      result = Hash.new  
      self.class.columns.each do |column|
		begin
			result[column.name.to_sym] = self.send(column.name)
		rescue
			# this is OK and can happen in cases where you
			# have done a find_by_sql and haven't returned all columns
		end
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