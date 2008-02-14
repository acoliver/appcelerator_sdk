/**
 *  Appcelerator SDK
 *  Copyright (C) 2006-2007 by Appcelerator, Inc. All Rights Reserved.
 *  For more information, please visit http://www.appcelerator.org
 *
 *  This program is free software; you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation; either version 2 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License along
 *  with this program; if not, write to the Free Software Foundation, Inc.,
 *  51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 */
package org.appcelerator.threading;

/**
 * AppceleratorThreadGroup is a thread group for appcelerator.
 */
public class AppceleratorThreadGroup extends ThreadGroup
{
    /**
     * singleton hakano thread group instance
     */
    private static final AppceleratorThreadGroup instance = new AppceleratorThreadGroup();

    /**
     * private constructor for hakano thread group
     *
     * @see AppceleratorThreadGroup#getInstance()
     */
    private AppceleratorThreadGroup()
    {
        super("appcelerator");
    }

    /**
     * get singleton instance of hakano thread group
     *
     * @return hakano thread group
     */
    public static AppceleratorThreadGroup getInstance()
    {
        return instance;
    }

    /**
     * return a new ThreadGroup that is a child of the hakano thread group
     *
     * @param name thread group name
     * @return newly created child thread group
     */
    public static ThreadGroup createChild(String name)
    {
        return new ThreadGroup(getInstance(), name);
    }
}
