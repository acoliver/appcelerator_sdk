/**
 *  Appcelerator SDK
 *  Copyright (C) 2006-2007 by Appcelerator, Inc. All Rights Reserved.
 *  For more information, please visit http://www.appcelerator.org
 *
 *  This program is free software; you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation; either version 2 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License along
 *  with this program; if not, write to the Free Software Foundation, Inc.,
 *  51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 */
package org.appcelerator.spring;

import java.beans.PropertyDescriptor;
import java.util.HashMap;
import java.util.Map;

import org.apache.log4j.Logger;
import org.appcelerator.annotation.Downloadable;
import org.appcelerator.annotation.InjectBean;
import org.appcelerator.annotation.InjectBeans;
import org.appcelerator.annotation.LifecycleDestructionAware;
import org.appcelerator.annotation.LifecycleInitializationAware;
import org.appcelerator.annotation.Service;
import org.appcelerator.annotation.ServiceAuthenticator;
import org.springframework.aop.framework.Advised;
import org.springframework.beans.BeanInstantiationException;
import org.springframework.beans.BeansException;
import org.springframework.beans.FatalBeanException;
import org.springframework.beans.PropertyValues;
import org.springframework.beans.factory.FactoryBean;
import org.springframework.beans.factory.config.BeanFactoryPostProcessor;
import org.springframework.beans.factory.config.ConfigurableListableBeanFactory;
import org.springframework.beans.factory.config.DestructionAwareBeanPostProcessor;
import org.springframework.beans.factory.config.InstantiationAwareBeanPostProcessor;
import org.springframework.util.StringUtils;

/**
 * AppBeanPostProcessor is a Spring BeanPostProcessor that will do special processing of beans.
 *
 * @author <a href="mailto:jhaynie@hakano.com">Jeff Haynie</a>
 * @author <a href="mailto:jkashimba@hakano.com">Jared Kashimba</a>
 */
public class AppBeanPostProcessor implements InstantiationAwareBeanPostProcessor, DestructionAwareBeanPostProcessor, BeanFactoryPostProcessor
{
    private static final Logger LOG = Logger.getLogger(AppBeanPostProcessor.class);

    private Map<String, Object> localBeanMap = new HashMap<String, Object>();
    private String lastBeanName;
    private ConfigurableListableBeanFactory beanFactory;
    private InjectBeanVisitor injectBeanVisitor;
    private ServiceVisitor serviceVisitor;
    private LifecycleAwareVisitor lifecycleAwareVisitor;
    private DownloadVisitor downloadVisitor;
    private ServiceAuthenticatorVisitor serviceAuthVisitor;
//    private SessionFactory sessionFactory;

//    /**
//     * this is a simple wrapper for determining if we
//     * need to create a hibernate session and when we need to
//     * flush it
//     */
//    private final class HibernateSessionTransaction
//    {
//        private final String name;
//        private Session session;
//        private boolean participating;
//
//        /**
//         * constructs a new hibernate session transaction
//         *
//         * @param name transaction name
//         */
//        HibernateSessionTransaction(String name)
//        {
//            this.name = name;
//            if (sessionFactory == null)
//            {
//                sessionFactory = (SessionFactory) beanFactory.getBean(beanFactory.getBeanNamesForType(SessionFactory.class)[0]);
//            }
//        }
//
//        /**
//         * begins a session transaction
//         */
//        void begin()
//        {
//            // first check to see if we have a session factory but don't allow
//            // it to create one - this will tell us if we're participating or not
//            if (TransactionSynchronizationManager.hasResource(sessionFactory))
//            {
//                participating = true;
//            }
//            else
//            {
//                participating = false;
//                session = SessionFactoryUtils.getSession(sessionFactory, true);
//                session.setFlushMode(FlushMode.MANUAL);
//                try
//                {
//                    TransactionSynchronizationManager.bindResource(sessionFactory, new SessionHolder(session));
//                }
//                catch (IllegalStateException e)
//                {
//                    // this happens during concurrency with TransactionSynchronizationManager
//                    participating = true;
//                    try
//                    {
//                        session.close();
//                    }
//                    catch (Exception ex)
//                    {
//                        LOG.warn("problem closing hibernate session " + session, ex);
//                    }
//                }
//            }
//            if (LOG.isDebugEnabled())
//            {
//                if (participating)
//                {
//                    LOG.debug("continuing @HibernateSession method: " + name);
//                }
//                else
//                {
//                    LOG.debug(">>> begin @HibernateSession method: " + name);
//                }
//            }
//        }
//
//        /**
//         * commits a session transaction
//         */
//        void commit()
//        {
//            // if we start the transaction and we're the first (mean's we're not participating) then
//            // when we commit, we need to release the session - otherwise, we'll let the let the 
//            // creating session deal with it - this prevents us from getting the lazy load problems
//            // when multiple transactions span across many methos
//            if (!participating)
//            {
//                TransactionSynchronizationManager.unbindResource(sessionFactory);
//                SessionFactoryUtils.closeSession(session);
//                if (LOG.isDebugEnabled())
//                {
//                    LOG.debug("<<< commit @HibernateSession ended transaction - method: " + name);
//                }
//            }
//            else
//            {
//                if (LOG.isDebugEnabled())
//                {
//                    LOG.debug("continuing @HibernateSession for commit - method: " + name);
//                }
//            }
//        }
//    }

    /**
     * Apply this BeanPostProcessor <i>before the target bean gets instantiated</i>.
     * The returned bean object may be a proxy to use instead of the target bean,
     * effectively suppressing default instantiation of the target bean.
     * <p>If a non-null object is returned by this method, the bean creation process
     * will be short-circuited. The only further processing applied is the
     * {@link #postProcessAfterInitialization} callback from the configured
     * {@link org.springframework.beans.factory.config.BeanPostProcessor BeanPostProcessors}.
     * <p>This callback will only be applied to bean definitions with a bean class.
     * In particular, it will not be applied to beans with a "factory-method".
     *
     * @param clazz the class of the bean to be instantiated
     * @param name  the name of the bean
     * @return the bean object to expose instead of a default instance of the target bean,
     *         or <code>null</code> to proceed with default instantiation
     * @throws org.springframework.beans.BeansException
     *          in case of errors
     * @see org.springframework.beans.factory.support.AbstractBeanDefinition#hasBeanClass
     * @see org.springframework.beans.factory.support.AbstractBeanDefinition#getFactoryMethodName
     */
    @SuppressWarnings("unchecked")
    public Object postProcessBeforeInstantiation(Class clazz, final String name) throws BeansException
    {
        if (LOG.isDebugEnabled()) LOG.debug(name + ": " + clazz);
        /*
        if (clazz.isAnnotationPresent(Transactional.class) || AnnotationUtil.hasMethodAnnotation(clazz, Transactional.class))
        {
            final BeanDefinition beanDef = beanFactory.getBeanDefinition(name);
            final TransactionMethodInterceptor transactionInterceptor = new TransactionMethodInterceptor(beanFactory);
            try
            {
                // create a proxy object that will target @Transactional and @HibernateSession methods
                // (regardless of visibility)
                Object proxy = org.appcelerator.spring.AnnotationInterceptor.create(clazz, new MethodInterceptor()
                {
                    public Object intercept(Object arg0, Method method, Object[] arg2, MethodProxy arg3) throws Throwable
                    {
                        // always get the hibernate session
                        String name = method.getDeclaringClass().getSimpleName() + "." + method.getName();
                        HibernateSessionTransaction hibernateTransaction = new HibernateSessionTransaction(name);
                        hibernateTransaction.begin();
                        boolean transactional = method.isAnnotationPresent(Transactional.class);
                        try
                        {
                            if (transactional)
                            {
                                if (LOG.isDebugEnabled())
                                {
                                    LOG.debug("begin @Transactional for " + name);
                                }
                                return transactionInterceptor.intercept(arg0, method, arg2, arg3);
                            }
                            else
                            {
                                // this is just a simple HibernateSession so just proceed with the real method
                                return arg3.invokeSuper(arg0, arg2);
                            }
                        }
                        finally
                        {
                            hibernateTransaction.commit();

                            if (transactional)
                            {
                                if (LOG.isDebugEnabled())
                                {
                                    LOG.debug("end @Transactional for " + name);
                                }
                            }
                        }
                    }
                }, Transactional.class, HibernateSession.class);
                // you have to manually set properties if you instantiate the class in this 
                // method
                if (beanDef != null)
                {
                    beanFactory.applyBeanPropertyValues(proxy, name);
                }
                return proxy;
            }
            catch (Exception ex)
            {
                LOG.error("error creating bean: " + name, ex);
                throw new BeanInstantiationException(clazz, "Error creating bean: " + name, ex);
            }
        }

        if (clazz.isAnnotationPresent(SessionThreaded.class) || AnnotationUtil.hasMethodAnnotation(clazz, SessionThreaded.class))
        {
            final BeanDefinition beanDef = beanFactory.getBeanDefinition(name);
            final SessionThreadedMethodInterceptor sessionThreadedMethodInterceptor = new SessionThreadedMethodInterceptor((ExecutableSessionManager) beanFactory.getBean("executableSessionManager", ExecutableSessionManager.class));
            try
            {
                Object proxy = org.appcelerator.spring.AnnotationInterceptor.create(clazz, sessionThreadedMethodInterceptor, SessionThreaded.class);
                if (beanDef != null)
                {
                    beanFactory.applyBeanPropertyValues(proxy, name);
                }
                return proxy;
            }
            catch (Exception ex)
            {
                LOG.error("error creating bean: " + name, ex);
                throw new BeanInstantiationException(clazz, "Error creating bean: " + name, ex);
            }
        }
        */
        
        return null;
    }

    /**
     * Perform operations after the bean has been instantiated, via a constructor or factory method,
     * but before Spring property population (from explicit properties or autowiring) occurs.
     *
     * @param bean     the bean instance created, but whose properties have not yet been set
     * @param beanName the name of the bean
     * @return <code>true</code> if properties should be set on the bean; <code>false</code>
     *         if property population should be skipped. Normal implementations should return <code>true</code>.
     *         Returning <code>false</code> will also prevent any subsequent InstantiationAwareBeanPostProcessor
     *         instances being invoked on this bean instance.
     * @throws org.springframework.beans.BeansException
     *          in case of errors
     */
    public boolean postProcessAfterInstantiation(Object bean, String beanName) throws BeansException
    {
        if (LOG.isDebugEnabled())
        {
            LOG.debug("instantiated: " + beanName + ": " + bean + ", advised:" + (bean instanceof Advised));
        }
        return true;
    }

    /**
     * Post-process the given property values before the factory applies them
     * to the given bean. Allows for checking whether all dependencies have been
     * satisfied, for example based on a "Required" annotation on bean property setters.
     * <p>Also allows for replacing the property values to apply, typically through
     * creating a new MutablePropertyValues instance based on the original PropertyValues,
     * adding or removing specific values.
     *
     * @param pvs      the property values that the factory is about to apply (never <code>null</code>)
     * @param pds      the relevant property descriptors for the target bean (with ignored
     *                 dependency types - which the factory handles specifically - already filtered out)
     * @param bean     the bean instance created, but whose properties have not yet been set
     * @param beanName the name of the bean
     * @return the actual property values to apply to to the given bean
     *         (can be the passed-in PropertyValues instance), or <code>null</code>
     *         to skip property population
     * @throws org.springframework.beans.BeansException
     *          in case of errors
     * @see org.springframework.beans.MutablePropertyValues
     */
    public PropertyValues postProcessPropertyValues(PropertyValues pvs, PropertyDescriptor[] pds, Object bean, String beanName) throws BeansException
    {
        if (LOG.isDebugEnabled())
        {
            LOG.debug(beanName + ": " + bean + " " + pvs + " " + pds + ", advised:" + (bean instanceof Advised));
        }
        return pvs;
    }

//    /**
//     * this class is responsible for finding methods that are @Transactional and return its
//     * TransactionAttribute
//     */
//    private static final class TransactionalPropertyResolver extends AnnotationTransactionAttributeSource
//    {
//        private static final long serialVersionUID = 1L;
//
//        @Override
//        protected Collection findAllAttributes(Class clazz)
//        {
//            HashSet<Method> methods = new HashSet<Method>();
//            AnnotationUtil.collectMethods(clazz, methods, Transactional.class);
//            return methods;
//        }
//
//        @Override
//        protected boolean allowPublicMethodsOnly()
//        {
//            return false;
//        }
//
//        @SuppressWarnings("unchecked")
//        @Override
//        protected TransactionAttribute findTransactionAttribute(Collection atts)
//        {
//            // override to force a rollback rule default (which is to rollback on any exception) - the default
//            // is to not rollback
//            RuleBasedTransactionAttribute attr = (RuleBasedTransactionAttribute) super.findTransactionAttribute(atts);
//            List rollbackRules = attr != null ? attr.getRollbackRules() : new ArrayList(1);
//            if (rollbackRules.isEmpty())
//            {
//                RollbackRuleAttribute rule = new RollbackRuleAttribute(Throwable.class);
//                rollbackRules.add(rule);
//            }
//            return attr;
//        }
//    }
//
//    /**
//     * cgilib method interceptor that will delegate to the spring TransactionInterceptor
//     */
//    private final class TransactionMethodInterceptor implements MethodInterceptor
//    {
//        private TransactionInterceptor interceptor;
//        private ConfigurableListableBeanFactory factory;
//
//        private TransactionMethodInterceptor(ConfigurableListableBeanFactory f)
//        {
//            this.factory = f;
//        }
//
//        private void create(PlatformTransactionManager tm)
//        {
//            interceptor = new TransactionInterceptor(tm, new TransactionalPropertyResolver());
//            interceptor.afterPropertiesSet();
//        }
//
//        public Object intercept(Object arg0, Method arg1, Object[] arg2, MethodProxy arg3) throws Throwable
//        {
//            // create the interceptor the first use
//            if (interceptor == null)
//            {
//                // we need to get the TransactionManager
//                create((PlatformTransactionManager) factory.getBean(factory.getBeanNamesForType(PlatformTransactionManager.class)[0]));
//            }
//            MethodInvocation m = new CgiLibMethodInvocation(arg0, arg1, arg2, arg3);
//            return interceptor.invoke(m);
//        }
//    }

    /**
     * Apply this BeanPostProcessor to the given new bean instance <i>before</i> any bean
     * initialization callbacks (like InitializingBean's <code>afterPropertiesSet</code>
     * or a custom init-method). The bean will already be populated with property values.
     * The returned bean instance may be a wrapper around the original.
     *
     * @param configuredBean the new bean instance
     * @param beanName       the name of the bean
     * @return the bean instance to use, either the original or a wrapped one
     * @throws org.springframework.beans.BeansException
     *          in case of errors
     * @see org.springframework.beans.factory.InitializingBean#afterPropertiesSet
     */
    @SuppressWarnings("unchecked")
    public Object postProcessBeforeInitialization(Object configuredBean, String beanName) throws BeansException
    {
        if (LOG.isDebugEnabled()) LOG.debug("postProcessBeforeInitialization - " + beanName + ": " + configuredBean);
        return configuredBean;
    }

    /**
     * method will ensure that we get the real target bean object and bypass any AOP proxies
     * that are wrapped
     *
     * @param configuredBean configured bean
     * @return real target bean if configured bean was proxies
     * @throws Exception upon error
     */
    private Object getBean(Object configuredBean) throws Exception
    {
        if (configuredBean instanceof Advised)
        {
            Advised advised = (Advised) configuredBean;
            // inject our spring bean reference using the underlying target
            // and not the aop proxy
            if (LOG.isDebugEnabled())
            {
                LOG.debug("bean: " + configuredBean + " is advised - target: " + advised.getTargetSource().getTarget());
            }
            return advised.getTargetSource().getTarget();
        }
        if (LOG.isDebugEnabled())
        {
            LOG.debug("bean: " + configuredBean + " is not advised - " + configuredBean);
        }
        return configuredBean;
    }

    /**
     * Apply this BeanPostProcessor to the given new bean instance <i>after</i> any bean
     * initialization callbacks (like InitializingBean's <code>afterPropertiesSet</code>
     * or a custom init-method). The bean will already be populated with property values.
     * The returned bean instance may be a wrapper around the original.
     * <p>In case of a FactoryBean, this callback will be invoked for both the FactoryBean
     * instance and the objects created by the FactoryBean (as of Spring 2.0). The
     * post-processor can decide whether to apply to either the FactoryBean or created
     * objects or both through corresponding <code>bean instanceof FactoryBean</code> checks.
     * <p>This callback will also be invoked after a short-circuiting triggered by a
     * {@link org.springframework.beans.factory.config.InstantiationAwareBeanPostProcessor#postProcessBeforeInstantiation} method,
     * in contrast to all other BeanPostProcessor callbacks.
     *
     * @param bean     the new bean instance
     * @param beanName the name of the bean
     * @return the bean instance to use, either the original or a wrapped one
     * @throws org.springframework.beans.BeansException
     *          in case of errors
     * @see org.springframework.beans.factory.InitializingBean#afterPropertiesSet
     * @see org.springframework.beans.factory.FactoryBean
     */
    @SuppressWarnings("unchecked")
    public Object postProcessAfterInitialization(Object bean, String beanName) throws BeansException
    {
        if (LOG.isDebugEnabled()) LOG.debug(beanName + ": " + bean + ", factoryBean?" + (bean instanceof FactoryBean));
        localBeanMap.put(beanName, bean);
        if (LOG.isInfoEnabled())
        {
            LOG.info("initialized beans (" + localBeanMap.size() + "/" + beanFactory.getBeanDefinitionCount() + ") " + StringUtils.arrayToCommaDelimitedString(beanFactory.getSingletonNames()));
        }

        //
        // check to see if we're done initializing beans... (note, with proxy factory beans, you'll get call more than once)
        //
        if (lastBeanName.equals(beanName))
        {
            //
            // inject bean dependencies...
            //
            for (Object instance : localBeanMap.values())
            {
                try
                {
                    Object configuredBean = getBean(instance);
                    if (configuredBean==null) 
                    {
                        if (LOG.isDebugEnabled()) LOG.debug("skipping proxy for unset reference ");
                    	continue;
                    }
                    if (LOG.isDebugEnabled()) LOG.debug("visiting " + configuredBean + " for injection...");
                    AnnotationUtil.fieldVisitor(configuredBean, injectBeanVisitor, InjectBeans.class, InjectBean.class);
                    AnnotationUtil.methodVisitor(configuredBean, injectBeanVisitor, InjectBeans.class, InjectBean.class);
                }
                catch (Exception exception)
                {
                    throw new BeanInstantiationException(instance.getClass(), "problem during InjectBean(s) visitation", exception);
                }
            }

            //
            // set up annotations
            //
            for (Object configuredBean : localBeanMap.values())
            {
                try
                {
                    if (LOG.isDebugEnabled()) LOG.debug("visiting " + configuredBean + " for services ...");
                    AnnotationUtil.methodVisitor(configuredBean, serviceVisitor, Service.class);
                }
                catch (Exception exception)
                {
                    throw new BeanInstantiationException(configuredBean.getClass(), "problem during Service visitation", exception);
                }
                try
                {
                    if (LOG.isDebugEnabled()) LOG.debug("visiting " + configuredBean + " for service authenticators...");
                    AnnotationUtil.methodVisitor(configuredBean, serviceAuthVisitor, ServiceAuthenticator.class);
                }
                catch (Exception exception)
                {
                    throw new BeanInstantiationException(configuredBean.getClass(), "problem during ServiceAuthenticator visitation", exception);
                }
                try
                {
                    if (LOG.isDebugEnabled()) LOG.debug("visiting " + configuredBean + " for downloadable...");
                    AnnotationUtil.methodVisitor(configuredBean, downloadVisitor, Downloadable.class);
                }
                catch (Exception exception)
                {
                    throw new BeanInstantiationException(configuredBean.getClass(), "problem during DownloadVisitor visitation", exception);
                }
            }
            // complete the configuration
            try
            {
                serviceVisitor.initialization();
            }
            catch (Exception e)
            {
                LOG.fatal("service registration initialization failed",e);
            }
            
            //
            // perform bean initializations...
            //
            for (Object configuredBean : localBeanMap.values())
            {
                try
                {
                    if (LOG.isDebugEnabled())
                    {
                        LOG.debug("visiting " + configuredBean + " for lifecycle initialization...");
                    }
                    AnnotationUtil.methodVisitor(configuredBean, lifecycleAwareVisitor, LifecycleInitializationAware.class);
                }
                catch (Exception exception)
                {
                    throw new BeanInstantiationException(configuredBean.getClass(), "problem during LifecycleInitializationAware visitation", exception);
                }
            }
            localBeanMap.clear();
            
            // complete the configuration
            serviceVisitor.endConfiguration();
        }
        return bean;
    }

    /**
     * Apply this BeanPostProcessor to the given bean instance before
     * its destruction. Can invoke custom destruction callbacks.
     * <p>Like DisposableBean's <code>destroy</code> and a custom destroy method,
     * this callback just applies to singleton beans in the factory (including
     * inner beans).
     *
     * @param bean     the bean instance to be destroyed
     * @param beanName the name of the bean
     * @throws org.springframework.beans.BeansException
     *          in case of errors
     * @see org.springframework.beans.factory.DisposableBean
     * @see org.springframework.beans.factory.support.AbstractBeanDefinition#setDestroyMethodName
     */
    @SuppressWarnings("unchecked")
    public void postProcessBeforeDestruction(Object bean, String beanName) throws BeansException
    {
        if (LOG.isDebugEnabled()) LOG.debug(beanName + ": " + bean);

        try
        {
            serviceVisitor.destroy(bean,beanName);
        }
        catch (Exception e)
        {
            LOG.warn("service cleanup failed",e);
        }

        try
        {
            if (LOG.isDebugEnabled()) LOG.debug("visiting " + bean + " for lifecycle destruction...");
            AnnotationUtil.methodVisitor(bean, lifecycleAwareVisitor, LifecycleDestructionAware.class);
        }
        catch (Exception exception)
        {
            throw new FatalBeanException("problem during LifecycleDestructionAware visitation to " + bean, exception);
        }
    }

    /**
     * Modify the application context's internal bean factory after its standard
     * initialization. All bean definitions will have been loaded, but no beans
     * will have been instantiated yet. This allows for overriding or adding
     * properties even to eager-initializing beans.
     *
     * @param beanFactory the bean factory used by the application context
     * @throws org.springframework.beans.BeansException
     *          in case of errors
     */
    @SuppressWarnings("unchecked")
    public void postProcessBeanFactory(ConfigurableListableBeanFactory beanFactory) throws BeansException
    {
        if (LOG.isDebugEnabled()) LOG.debug(beanFactory);
        this.beanFactory = beanFactory;

        String beanNames[] = this.beanFactory.getBeanDefinitionNames();
        lastBeanName = beanNames[beanNames.length - 1];
        if (LOG.isDebugEnabled()) LOG.debug("last bean name will be: " + lastBeanName);
        if (LOG.isInfoEnabled())
        {
            LOG.info("configured beans (" + beanFactory.getBeanDefinitionCount() + ") " + StringUtils.arrayToCommaDelimitedString(beanFactory.getBeanDefinitionNames()));
        }
        serviceAuthVisitor = new ServiceAuthenticatorVisitor();
        injectBeanVisitor = new InjectBeanVisitor(beanFactory);
        serviceVisitor = new ServiceVisitor(beanFactory,serviceAuthVisitor);
        lifecycleAwareVisitor = new LifecycleAwareVisitor();
        downloadVisitor = new DownloadVisitor();
    }
}
