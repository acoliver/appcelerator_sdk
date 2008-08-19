/*!
 * This file is part of Appcelerator.
 *
 * Copyright (c) 2006-2008, Appcelerator, Inc.
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 * 
 *     * Redistributions of source code must retain the above copyright notice,
 *       this list of conditions and the following disclaimer.
 * 
 *     * Redistributions in binary form must reproduce the above copyright notice,
 *       this list of conditions and the following disclaimer in the documentation
 *       and/or other materials provided with the distribution.
 * 
 *     * Neither the name of Appcelerator, Inc. nor the names of its
 *       contributors may be used to endorse or promote products derived from this
 *       software without specific prior written permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 *  ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
 * ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
 * ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 **/
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
