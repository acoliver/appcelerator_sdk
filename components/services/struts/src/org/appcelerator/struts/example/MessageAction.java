package org.appcelerator.struts.example;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.struts.action.Action;
import org.apache.struts.action.ActionForm;
import org.apache.struts.action.ActionForward;
import org.apache.struts.action.ActionMapping;

public class MessageAction extends Action {
    
    public ActionForward execute(ActionMapping mapping, ActionForm form,
            HttpServletRequest request, HttpServletResponse response)
    throws IOException, ServletException {
        String target = new String("Success");
        
        String message = null;
        if ( form != null ) {
            MessageForm nameForm = (MessageForm)form;
            message = nameForm.getMessage();
        }

        // if no mane supplied Set the target to failure
        if (message != null) {
            request.setAttribute("message", "I received from you: " + message);
            ((MessageForm) form).setMessage("I received from you: " + message);
        }

        return (mapping.findForward(target));
    }
    
}
