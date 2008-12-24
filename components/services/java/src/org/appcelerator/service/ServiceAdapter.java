
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


package org.appcelerator.service;

import org.appcelerator.messaging.Message;

/**
 * An abstract class for implementing a service adapter. The ServiceRegistry
 * should dispatch Appcelerator requests to one of these.
 * 
 * @author Martin Robinson <mrobinson@appcelerator.com>
 */
public abstract class ServiceAdapter extends GenericInterceptorAdapter implements InterceptorAdapter
{
    protected String request = "";
    protected String response = "";
    protected String exceptionResponse = "";
    protected String version = "";
    private InterceptorStack stack;
    
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

    public String getExceptionResponse() {
        return exceptionResponse;
    }

    /**
     * @return the version
     */
    public String getVersion() 
	{
        return version;
    }
    
    public InterceptorStack getStack() {
        return stack;
    }
    
    public void setStack(InterceptorStack stack) {
        this.stack = stack;
    }

}
