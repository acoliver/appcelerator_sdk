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


#
# only run as root when installing
#
if [ $UID -ne 0 ]
then
	echo "This installer requires root access to install Appcelerator"
	echo "Please re-run the installer as a root"
	exit 1
fi

#
# we need to ensure that we have ruby on this system
#
r=`which ruby`
upgrade=1
has_ruby=0

#
# we have ruby, we need to make sure we're at least 1.8.6 or greater
#
if [ $? -eq 0 ]
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
# oops, we don't have ruby installed on this system we'll try and use 
# one of the popular package managers to install it and if we can't find one, 
# we're going to make the user do it
#
if [ $has_ruby -eq 0 ]
then
	upgrade=0
	echo
	echo "Appcelerator requires Ruby version 1.8.6 or greater."
	echo
	ag=`which apt-get 2>/dev/null`
	if [ $? -eq 0 ]
	then
		echo "Appcelerator will now use apt-get to install Ruby"
		echo
		read -p "Continue [Yn]? " -n 1 a
		if [ "$a" == "n" ]
		then
			echo
			echo "Cancelled!"
			echo
			exit 1
		fi
		sudo apt-get install ruby irb rdoc
	else
		y=`which yum 2>/dev/null`
		if [ $? -eq 0 ]
		then
			echo "Appcelerator will now use yum to install Ruby"
			echo
			read -p "Continue [Yn]? " -n 1 a
			if [ "$a" == "n" ]
			then
				echo
				echo "Cancelled!"
				echo
				exit 1
			fi
			sudo yum install ruby
		else
			echo "Not sure how to download Ruby - can't find a package manager"
			echo "Tried to use apt-get and yum but neither seem to be found on your system."
			echo 
			echo "Please install Ruby from "
			echo 
			echo "    http://www.ruby-lang.org/en/downloads"
			echo
			echo "and then re-run the installer"
			echo
			exit 1
		fi
	fi
fi

#
# check to see if we need to upgrade our ruby and if so, notify the user and make 
# them do it for us
#
if [ $upgrade -eq 1 ]
then
	echo "Appcelerator requires Ruby version 1.8.5 or greater."
	echo
	echo "Your system is running: `ruby --version`"
	echo
	echo "Please upgrade your Ruby installation and then re-run the installer"
	echo
	exit 1
fi

# 
# if we get to this point, we have ruby and we can drop into ruby to run the install
#
ruby post-flight.rb
exit $?
