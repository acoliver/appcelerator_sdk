package org.appcelerator.router;

public class ServiceConstants
{
    public static final String SERVICE_PREFIX = "$appcelerator.";
    
    public static final String SERVICE_ROUTER_REGISTER = SERVICE_PREFIX + "router.register";
    public static final String SERVICE_ROUTER_UNREGISTER = SERVICE_PREFIX + "router.unregister";
    public static final String SERVICE_ROUTER_QUERY_SERVICES_REQUEST = SERVICE_PREFIX + "router.query.services.request";
    public static final String SERVICE_ROUTER_QUERY_SERVICES_RESPONSE = SERVICE_PREFIX + "router.query.services.response";
    public static final String SERVICE_ROUTER_QUERY_SERVERS_REQUEST = SERVICE_PREFIX + "router.query.servers.request";
    public static final String SERVICE_ROUTER_QUERY_SERVERS_RESPONSE = SERVICE_PREFIX + "router.query.servers.response";
    
    public static final String SERVICE_REGISTRY_ADD = SERVICE_PREFIX + "registry.add";
    public static final String SERVICE_REGISTRY_REMOVE = SERVICE_PREFIX + "registry.remove";
    public static final String SERVICE_REGISTRY_QUERY_REQUEST = SERVICE_PREFIX + "registry.query.request";
    public static final String SERVICE_REGISTRY_QUERY_RESPONSE = SERVICE_PREFIX + "registry.query.response";
}
