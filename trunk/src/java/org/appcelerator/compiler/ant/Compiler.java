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

package org.appcelerator.compiler.ant;

import java.io.File;
import java.io.PrintWriter;

import org.apache.tools.ant.BuildException;
import org.apache.tools.ant.Task;

/**
 * Appcelerator Compiler Ant Task
 * 
 * @author Jeff Haynie
 */
public class Compiler extends Task 
{
	private File source;
	private File destination;
	private boolean verbose;
	private boolean compress = true;
	
    public void setCompress(boolean compress)
    {
        this.compress = compress;
    }

    public Compiler() 
	{
	}

    public void setVerbose(boolean verbose)
    {
        this.verbose = verbose;
    }

	public void setSrcdir (File dir)
	{
		this.source = dir;
	}
	
	public void setDestdir (File dir)
	{
		this.destination = dir;
	}

	public void execute () throws BuildException
	{
		if (this.source==null)
		{
			throw new BuildException("srcdir required");
		}
		if (this.destination==null)
		{
			throw new BuildException("destdir required");
		}
		if (!this.source.exists() || !this.source.isDirectory())
		{
			throw new BuildException("srcdir:"+this.source.getAbsolutePath()+" is not a directory");
		}
		try
		{
			System.out.println("Appcelerator Compiler v"+org.appcelerator.compiler.Compiler.VERSION+"  http://www.appcelerator.org");
            System.out.println("More App. Less Code.");
			System.out.println("Compiling files from: "+this.source);
			System.out.println("Compiling files to: "+this.destination);
			org.appcelerator.compiler.Compiler.compile(this.source, this.destination, new PrintWriter(System.out), verbose, compress);
		}
		catch (Exception ex)
		{
			throw new BuildException(ex);
		}
	}
}
