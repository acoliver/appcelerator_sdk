
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

import java.security.MessageDigest;
import java.security.SecureRandom;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

/**
 * SecurityUtil is a collection of utility methods to handle security and validation.
 *
 * @author <a href="mailto:jhaynie@appcelerator.com">Jeff Haynie</a>
 */
public class SecurityUtil
{
    private static final Log LOG = LogFactory.getLog(SecurityUtil.class);

    private static MessageDigest digest256;
    private static MessageDigest digest512;
    private static SecureRandom random;

    static
    {
        try
        {
            digest256 = MessageDigest.getInstance("SHA-256");
            digest512 = MessageDigest.getInstance("SHA-512");
            random = SecureRandom.getInstance("SHA1PRNG");
        }
        catch (Exception ex)
        {
            throw new RuntimeException(ex);
        }
    }

    /**
     * generate a cryptographically secure random seed based on using
     * the SHA1PRNG secure random number. it uses a double seeded
     * secure generation using 2 1024-bit random generators and then
     * hashing with a SHA-256 hash.
     *
     * @return seed
     * @throws Exception upon error
     */
    public static String generateSecureRandomSeed() throws Exception
    {
        SecureRandom r2 = SecureRandom.getInstance("SHA1PRNG");
        byte buf[] = new byte[1024 / 8];
        byte buf2[] = new byte[1024 / 8];
        random.nextBytes(buf2);
        r2.nextBytes(buf);
        byte buf3[] = digest512.digest((Util.toHexString(buf) + Util.toHexString(buf2)).getBytes());
        return Util.toHexString(buf3);
    }

    /**
     * SHA1-256 hash the value and return it hex-encoded
     *
     * @param value value to hash
     * @return hex encoded value
     */
    public static String sha256(String value)
    {
        return Util.toHexString(digest256.digest(value.getBytes()));
    }

    /**
     * generate a password using SHA-256 one-way hash algorithm
     *
     * @param username user name
     * @param password user password
     * @return user password hash
     */
    public static String generatePassword(String username, String password)
    {
        return sha256(sha256(password) + ":" + username);
    }

    /**
     * return a password salt
     *
     * @return passowrd salt
     */
    public static String getPasswordSalt()
    {
        return "F27634AA8906CE70CCA09CBD528C4C2B1C6DD0BF70603ABCD601FE5EC5165D6CC33C50752528B0F96B692ABCCDC06E782183C221C9709E37F0C52BC63A2B65E1";
    }

    /**
     * validate a password using builtin seed sets
     *
     * @param incoming     incoming value to validated
     * @param passwordHash user password hash
     * @param challenge    challenge value
     * @param sessionid    session id
     * @return <code>true</code< if validated, <code>false</code> otherwise
     * @throws Exception upon error
     */
    public static boolean validate(String incoming, String passwordHash, String challenge, String sessionid) throws Exception
    {
        // FORMULA:
        //
        //   HASH = SHA1 (SHA1 ( SHA1 ( SHA1 ( SHA1(password) + ':' + email) + ':' +sessionid) + ':' + challenge) + ':' + seed)
        //
        String first = sha256(passwordHash + ":" + sessionid);
        String second = sha256(first + ":" + challenge);
        String third = sha256(second + ":" + getPasswordSalt());

        if (LOG.isDebugEnabled())
        {
            if (!third.equals(incoming))
            {
                LOG.debug("validation failed....");
                LOG.debug("first=" + first);
                LOG.debug("second=" + second);
                LOG.debug("third=" + third);
                LOG.debug("incoming=" + incoming);
                LOG.debug("passwordHash=" + passwordHash);
                LOG.debug("challenge=" + challenge);
                LOG.debug("sessionid=" + sessionid);
            }
        }

        return third.equals(incoming);
    }
    
    public static void main (String args[])
    {
        if (args.length != 2)
        {
            System.err.println("Usage: <email> <password>");
            System.exit(1);
        }
        
        
        System.out.println("Use the following hash value in the DB: ");
        System.out.println();
        System.out.println(SecurityUtil.generatePassword(args[0], args[1]));
        System.exit(0);
    }
}
