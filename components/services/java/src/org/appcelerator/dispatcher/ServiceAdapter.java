/**
 * This file is part of Appcelerator.
 *
 * Copyright (C) 2006-2008 by Appcelerator, Inc. All Rights Reserved.
 * For more information, please visit http://www.appcelerator.org
 *
 * Appcelerator is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 */

package org.appcelerator.dispatcher;

import org.appcelerator.messaging.Message;

/**
 * An abstract class for implementing a service adapter. The ServiceRegistry
 * should dispatch Appcelerator requests to one of these.
 * 
 * @author Martin Robinson <mrobinson@appcelerator.com>
 */
public abstract class ServiceAdapter 
{
    protected String request = "";
    protected String response = "";
    protected String version = "";
    

	/**
	 * call the service
	 * 
	 * @param request
	 * @param response
	 */
	public abstract void dispatch(Message request, Message response);

	/**
	 * Check whether these adapters are equivalent for the
	 * purposes of preventing duplicates in the dispatcher.
	 * @param sa the service adapter to compare to
	 * @return true if the adapters are equal, false otherwise
	 */
    public abstract boolean is(ServiceAdapter sa);
    
    public boolean equals(Object o) 
	{
        if (!(o instanceof ServiceAdapter))
            return false;
        
        ServiceAdapter a = (ServiceAdapter) o;
        
        if (a.request.equals(this.request) &&
            a.response.equals(this.response) &&
            a.version.equals(this.version)) {
            return true;
        }
        return false;
    }

    public int hashCode() 
	{
        return request.hashCode() * response.hashCode() * version.hashCode();
    }

    /**
     * @return the request
     */
    public String getRequest() 
	{
        return request;
    }

    /**
     * @return the response
     */
    public String getResponse() 
	{
        return response;
    }

    /**
     * @return the version
     */
    public String getVersion() 
	{
        return version;
    }

}