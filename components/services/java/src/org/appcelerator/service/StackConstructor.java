package org.appcelerator.service;

import java.lang.reflect.Method;

import org.appcelerator.annotation.AfterMethods;
import org.appcelerator.annotation.BeforeMethods;
import org.appcelerator.annotation.ExceptionMethod;
import org.appcelerator.annotation.ExceptionMethods;
import org.appcelerator.annotation.ExceptionResponse;
import org.appcelerator.annotation.ExceptionResponses;
import org.appcelerator.annotation.InterceptorMethod;

/**
 * Responsible for constructing the stack of interceptors for a MethodCallServiceAdapter.
 * @author Andrew C. Oliver (acoliver@gmail.com)
 *
 */
public class StackConstructor {

    public static InterceptorStack construct(Method method, MethodCallServiceAdapter call) {
        InterceptorStack stack = new InterceptorStack();
        ExceptionResponses ers = method.getAnnotation(ExceptionResponses.class);
        ExceptionResponse[] responses = ers != null ? ers.value() : new ExceptionResponse[]{};

        DefaultExceptionAdapter dea = new DefaultExceptionAdapter();
        stack.add(dea);
        for (ExceptionResponse response : responses) {
            ExceptionResponseAdapter era = new ExceptionResponseAdapter();
            era.setAnnotation(response);
            stack.add(era);
        }
        ExceptionMethods em = method.getAnnotation(ExceptionMethods.class);
        ExceptionMethod[] ems = em != null ? em.value() : new ExceptionMethod[]{};
        for (ExceptionMethod im : ems) {
            ExceptionMethodAdapter ima = new ExceptionMethodAdapter(im);
            stack.add(ima);
        }
        BeforeMethods bms = method.getAnnotation(BeforeMethods.class);
        InterceptorMethod[] ims = bms != null ? bms.value() : new InterceptorMethod[]{};
        for (InterceptorMethod im : ims) {
            InterceptorMethodAdapter ima = new InterceptorMethodAdapter(im);
            stack.add(ima);
        }
        
        stack.add(call);
        
        AfterMethods ams = method.getAnnotation(AfterMethods.class);
        ims = ams != null ? ams.value() : new InterceptorMethod[]{};
        for (InterceptorMethod im : ims) {
            InterceptorMethodAdapter ima = new InterceptorMethodAdapter(im);
            stack.add(ima);
        }        
        
        return stack;
    }


}
