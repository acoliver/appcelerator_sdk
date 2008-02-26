/**
 * 
 */
package org.appcelerator.servlet.filter;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletRequestWrapper;

/**
 * @author root
 *
 */
public class XHRFilter implements Filter
{
    private static final String FILTER_FLAG = XHRFilter.class.getName();
    private final List<String> validMethods = Arrays.asList("get","put","delete","options","post");

    /* (non-Javadoc)
     * @see javax.servlet.Filter#destroy()
     */
    public void destroy()
    {
    }

    /* (non-Javadoc)
     * @see javax.servlet.Filter#doFilter(javax.servlet.ServletRequest, javax.servlet.ServletResponse, javax.servlet.FilterChain)
     */
    public void doFilter(ServletRequest arg0, ServletResponse resp,
            FilterChain arg2) throws IOException, ServletException
    {
        HttpServletRequest req = (HttpServletRequest) arg0;
        
        Object obj = req.getAttribute(FILTER_FLAG);
        if (obj != null)
        {
            arg2.doFilter(arg0, resp);
        }
        else
        {
            req.setAttribute(FILTER_FLAG, Boolean.TRUE);
            
            // for REST methods from Ajax XHR we need to look at the 
            // _method parameter and use it instead of the real one
            // since XHR currently doesn't support non-POST/GET verbs in REST
            String xhr = req.getHeader("X-Requested-With");
            
            if (xhr!=null && xhr.equalsIgnoreCase("XMLHttpRequest"))
            {
                String method = req.getParameter("_method");
                
                if (method!=null)
                {
                    method = method.toLowerCase();
                    if (validMethods.contains(method) && !method.equals(req.getMethod()))
                    {
                        // re-write the method to use the appropriate method
                        req = new RESTRequest(req,method.toUpperCase());
                    }
                }
            }
            
            arg2.doFilter(req, resp);
        }
    }

    /* (non-Javadoc)
     * @see javax.servlet.Filter#init(javax.servlet.FilterConfig)
     */
    public void init(FilterConfig arg0) throws ServletException
    {
    }
    
    final class RESTRequest extends HttpServletRequestWrapper
    {
        private final String method;
        
        public RESTRequest(HttpServletRequest request, String method)
        {
            super(request);
            this.method = method;
        }
        @Override
        public String getMethod ()
        {
            return this.method;
        }
    }
}
