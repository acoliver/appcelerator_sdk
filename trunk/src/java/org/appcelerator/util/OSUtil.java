package org.appcelerator.util;

import java.io.File;

public class OSUtil {
	public static String getPath(File base)
	{
		
		String seperator = System.getProperty("file.separator");
        if (seperator.equals("\\")) 
        {
            return base.getAbsolutePath().replace("\\", "/");
        }
        else
        {
        	return base.getAbsolutePath();
        }
	}
}
