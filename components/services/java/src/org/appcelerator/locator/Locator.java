package org.appcelerator.locator;

import javax.servlet.ServletContext;

public interface Locator {

    /* (non-Javadoc)
     * @see org.appcelerator.dispatcher.ServiceLocator#initialize(javax.servlet.ServletContext)
     */
    public abstract void initialize(ServletContext sc);

}
