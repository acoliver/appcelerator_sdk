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

if defined?(ActiveRecord)
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
end

