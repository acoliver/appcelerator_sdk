#!/bin/sh
#
# Linux installer bootstrap script
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

uid=`id -u`
if [ $uid -ne 0 ];
then
    echo
    echo "Appcelerator tastes best when installed with root privileges."
    echo "Please re-run with 'sudo' or install into a directory you can write to."
    echo
fi

#
# we need to ensure that we have ruby on this system
#
upgrade=1
has_ruby=0
r=`which ruby`
#
# we have ruby, we need to make sure we're at least 1.8.6 or greater
#
if [ $? -eq 0 ];
then
   has_ruby=1
   v=`ruby --version | cut -c 6-10`
   major=`echo $v | cut -c 1`
   if [ $major -eq 1 ]
   then
   	 minor=`echo $v | cut -c 3`
     if [ $minor -eq 8 ]
	 then
		build=`echo $v | cut -c 5`
		if [ $build -ge 6 ]
		then
			upgrade=0
		fi
	 elif [ $minor -gt 8 ]
	 then
	    upgrade=0
 	 fi
   elif [ $major -gt 1 ]
   then
      upgrade=0
   fi
fi

#FIXME
#has_ruby=0

#
# oops, we don't have ruby installed on this system 
# we're going to make the user do it to make sure they
# get the right version
#
if [ $has_ruby -eq 0 ];
then
  echo
  echo "Appcelerator requires Ruby version 1.8.6 or greater."
  echo
  echo "Please install Ruby using your package managment sytem of choice"
  echo "ex. ('yum', 'apt-get', 'yast', etc)"
  echo
  echo "If your distribution does not have Ruby, then see http://www.ruby-lang.org/en/downloads/"
  echo "for instructions"
  echo 
  exit 1
fi

#
# check to see if we need to upgrade our ruby and if so, notify the user and make 
# them do it for us
#
if [ $upgrade -eq 1 ];
then
  echo
	echo "Appcelerator requires Ruby version 1.8.6 or greater."
	echo
	echo "Your system is running: `ruby --version`"
	echo
	echo "Please upgrade your Ruby installation and then re-run the installer"
	echo
	exit 1
fi

#
# check to see if we have ruby gems installed
#
g=`which gem`
if [ $? -ne 0 ];
then
  echo
  echo "Appcelerator requires RubyGems"
  echo
  echo "Please install RubyGems using your package managment sytem of choice"
  echo "ex. ('yum', 'apt-get', 'yast', etc)"
  echo
  echo "If your distribution does not have RubyGems, then see http://www.rubygems.org/"
  echo 
  exit 1
fi

# 
# if we get to this point, we have ruby and we can drop into ruby to run the install
#
ruby post-flight.rb
exit $?
