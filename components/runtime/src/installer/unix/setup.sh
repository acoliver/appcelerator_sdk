#!/bin/sh
#
# Linux installer bootstrap script

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
