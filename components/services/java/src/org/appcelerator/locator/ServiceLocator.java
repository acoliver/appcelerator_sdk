package org.appcelerator.locator;

import javax.servlet.ServletContext;

public interface ServiceLocator {
    public void setServletContext(ServletContext sc);
    public void findServices();
}
