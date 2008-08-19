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

package org.appcelerator.service;

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