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
package org.appcelerator.util;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.net.InetAddress;
import java.util.UUID;

import org.apache.log4j.Logger;

/**
 * ServerID manages generation of a unique server identity.
 *
 * @author <a href="mailto:jhaynie@hakano.com">Jeff Haynie</a>
 */
public class ServerID
{
    private static final Logger LOG = Logger.getLogger(ServerID.class);

    private static String id;

    /**
     * return the unique ID for this server. This value should be the same
     * even after a reboot of the Java process or Physical Machine.  The process
     * basically stores a special file in the current directory of the process with the
     * ID and reads it in the first time this method is called. If the file doesn't exist,
     * a new ID is generated and the file is re-created.
     *
     * @return unique server identity
     */
    public static String getServerID()
    {
        if (id == null)
        {
            try
            {
                File f = new File(".server.id");
                if (f.exists())
                {
                    FileInputStream fis = new FileInputStream(f);
                    byte buf[] = new byte[128];
                    int count = fis.read(buf);
                    fis.close();
                    if (count > 0)
                    {
                        id = new String(buf, 0, count);
                    }
                }

                if (id == null)
                {
                    id = Util.calcMD5(InetAddress.getLocalHost().getHostAddress() + "-" + UUID.randomUUID().toString());
                    FileOutputStream fos = new FileOutputStream(f);
                    fos.write(id.getBytes());
                    fos.close();
                }
            }
            catch (Exception ex)
            {
                LOG.warn("problem getting server ID", ex);
            }
        }
        return id;
    }
}
