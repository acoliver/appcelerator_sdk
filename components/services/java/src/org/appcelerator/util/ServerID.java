
/*
 * Copyright 2006-2008 Appcelerator, Inc.
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *    http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License. 
 */

package org.appcelerator.util;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.net.InetAddress;
import java.util.UUID;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

/**
 * ServerID manages generation of a unique server identity.
 *
 * @author <a href="mailto:jhaynie@appcelerator.com">Jeff Haynie</a>
 */
public class ServerID
{
    private static final Log LOG = LogFactory.getLog(ServerID.class);

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
