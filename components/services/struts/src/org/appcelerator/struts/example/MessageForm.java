package org.appcelerator.struts.example;

import javax.servlet.http.HttpServletRequest;

import org.apache.struts.action.ActionForm;
import org.apache.struts.action.ActionMapping;

public class MessageForm extends ActionForm {

    private static final long serialVersionUID = -6904523432028334068L;
    private String message = null;

    public String getMessage() {
        return message;
    }    

    public void setMessage(String text) {
        this.message = text;
    }    
    public void reset(ActionMapping mapping, HttpServletRequest request) {
        this.message = null;
    }

}