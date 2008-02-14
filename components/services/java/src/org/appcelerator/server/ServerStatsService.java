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
package org.appcelerator.server;

import java.text.DateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.List;

import javax.servlet.http.HttpSessionEvent;
import javax.servlet.http.HttpSessionListener;

import org.appcelerator.annotation.InjectBean;
import org.appcelerator.annotation.LifecycleDestructionAware;
import org.appcelerator.annotation.LifecycleInitializationAware;
import org.appcelerator.annotation.Service;
import org.appcelerator.messaging.IMessageDataList;
import org.appcelerator.messaging.IMessageDataObject;
import org.appcelerator.messaging.IServiceBroker;
import org.appcelerator.messaging.IServiceListener;
import org.appcelerator.messaging.Message;
import org.appcelerator.messaging.MessageDirection;
import org.appcelerator.messaging.MessageUtils;
import org.appcelerator.servlet.application.IApplicationStatsFilter;
import org.appcelerator.servlet.listener.SessionManager;
import org.appcelerator.util.MemoryFormat;
import org.appcelerator.util.TimeFormat;

public class ServerStatsService implements IApplicationStatsFilter, HttpSessionListener, IServiceListener
{
    private long startTime;
    
    private long pageRequests = 0;
    private long serviceRequests = 0;
    private long totalResponseTime = 0;
    private long averageMessageSize = 0;
    private long averageRequestsPerVisitor = 0;
    private long uniqueVisitors = 0;
    
    @InjectBean
    private IServiceBroker serviceBroker;
    
    @LifecycleInitializationAware
    public void start ()
    {
        startTime = System.currentTimeMillis();
        SessionManager.getInstance().addSessionListener(this);
        serviceBroker.registerListener(this);
    }
    
    @LifecycleDestructionAware
    public void stop ()
    {
        SessionManager.getInstance().removeSessionListener(this);
        serviceBroker.unregisterListener(this);
    }
    
    private String formatTime (long ts)
    {
        return DateFormat.getDateTimeInstance(DateFormat.SHORT, DateFormat.SHORT).format(new Date(ts));
    }
    
    @Service(request="$appcelerator.server.stats.request",response="$appcelerator.server.stats.response",authenticationRequired=false)
    protected void statsRequest(Message request, Message response) throws Exception
    {
        IMessageDataObject data = response.getData();
        data.put("start_time",formatTime(startTime));
        
        long uptime = System.currentTimeMillis() - startTime;
        data.put("uptime",TimeFormat.valueOf(uptime,TimeFormat.ROUND_TO_MINUTE));
        
        data.put("unique",uniqueVisitors);
        data.put("page_requests",pageRequests);
        data.put("service_requests",serviceRequests);
        long avgRT = pageRequests==0 ? 0 : totalResponseTime / pageRequests;
        data.put("avg_response_time",TimeFormat.valueOf(avgRT));
        data.put("avg_message_size",MemoryFormat.valueOf(averageMessageSize));
        data.put("avg_request_visitor",averageRequestsPerVisitor);
    }

    @Service(request="$appcelerator.graph.visitors.request",response="$appcelerator.graph.visitors.response",authenticationRequired=false)
    protected void graphVisitorsRequest(Message request, Message response) throws Exception
    {
        IMessageDataObject data = response.getData();
        IMessageDataList<IMessageDataObject> rows = MessageUtils.createMessageDataObjectList();
        
        int today = Calendar.getInstance().get(Calendar.DAY_OF_WEEK);
        switch (today)
        {
            case 0: //Sunday
            {
                rows.add(MessageUtils.createMessageDataObject().put("name", "Mon").put("value", mondayStats.uniqueVisitors));
                rows.add(MessageUtils.createMessageDataObject().put("name", "Tue").put("value", tuesdayStats.uniqueVisitors));
                rows.add(MessageUtils.createMessageDataObject().put("name", "Wed").put("value", wednesdayStats.uniqueVisitors));
                rows.add(MessageUtils.createMessageDataObject().put("name", "Thu").put("value", thursdayStats.uniqueVisitors));
                rows.add(MessageUtils.createMessageDataObject().put("name", "Fri").put("value", fridayStats.uniqueVisitors));
                rows.add(MessageUtils.createMessageDataObject().put("name", "Sat").put("value", saturdayStats.uniqueVisitors));
                rows.add(MessageUtils.createMessageDataObject().put("name", "Sun").put("value", sundayStats.uniqueVisitors));
                break;
            }
            case 1: //Monday
            {
                rows.add(MessageUtils.createMessageDataObject().put("name", "Tue").put("value", tuesdayStats.uniqueVisitors));
                rows.add(MessageUtils.createMessageDataObject().put("name", "Wed").put("value", wednesdayStats.uniqueVisitors));
                rows.add(MessageUtils.createMessageDataObject().put("name", "Thu").put("value", thursdayStats.uniqueVisitors));
                rows.add(MessageUtils.createMessageDataObject().put("name", "Fri").put("value", fridayStats.uniqueVisitors));
                rows.add(MessageUtils.createMessageDataObject().put("name", "Sat").put("value", saturdayStats.uniqueVisitors));
                rows.add(MessageUtils.createMessageDataObject().put("name", "Sun").put("value", sundayStats.uniqueVisitors));
                rows.add(MessageUtils.createMessageDataObject().put("name", "Mon").put("value", mondayStats.uniqueVisitors));
                break;
            }
            case 2: //Tuesday
            {
                rows.add(MessageUtils.createMessageDataObject().put("name", "Wed").put("value", wednesdayStats.uniqueVisitors));
                rows.add(MessageUtils.createMessageDataObject().put("name", "Thu").put("value", thursdayStats.uniqueVisitors));
                rows.add(MessageUtils.createMessageDataObject().put("name", "Fri").put("value", fridayStats.uniqueVisitors));
                rows.add(MessageUtils.createMessageDataObject().put("name", "Sat").put("value", saturdayStats.uniqueVisitors));
                rows.add(MessageUtils.createMessageDataObject().put("name", "Sun").put("value", sundayStats.uniqueVisitors));
                rows.add(MessageUtils.createMessageDataObject().put("name", "Mon").put("value", mondayStats.uniqueVisitors));
                rows.add(MessageUtils.createMessageDataObject().put("name", "Tue").put("value", tuesdayStats.uniqueVisitors));
                break;
            }
            case 3: //Wednesday
            {
                rows.add(MessageUtils.createMessageDataObject().put("name", "Thu").put("value", thursdayStats.uniqueVisitors));
                rows.add(MessageUtils.createMessageDataObject().put("name", "Fri").put("value", fridayStats.uniqueVisitors));
                rows.add(MessageUtils.createMessageDataObject().put("name", "Sat").put("value", saturdayStats.uniqueVisitors));
                rows.add(MessageUtils.createMessageDataObject().put("name", "Sun").put("value", sundayStats.uniqueVisitors));
                rows.add(MessageUtils.createMessageDataObject().put("name", "Mon").put("value", mondayStats.uniqueVisitors));
                rows.add(MessageUtils.createMessageDataObject().put("name", "Tue").put("value", tuesdayStats.uniqueVisitors));
                rows.add(MessageUtils.createMessageDataObject().put("name", "Wed").put("value", wednesdayStats.uniqueVisitors));
                break;
            }
            case 4: //Thursday
            {
                rows.add(MessageUtils.createMessageDataObject().put("name", "Fri").put("value", fridayStats.uniqueVisitors));
                rows.add(MessageUtils.createMessageDataObject().put("name", "Sat").put("value", saturdayStats.uniqueVisitors));
                rows.add(MessageUtils.createMessageDataObject().put("name", "Sun").put("value", sundayStats.uniqueVisitors));
                rows.add(MessageUtils.createMessageDataObject().put("name", "Mon").put("value", mondayStats.uniqueVisitors));
                rows.add(MessageUtils.createMessageDataObject().put("name", "Tue").put("value", tuesdayStats.uniqueVisitors));
                rows.add(MessageUtils.createMessageDataObject().put("name", "Wed").put("value", wednesdayStats.uniqueVisitors));
                rows.add(MessageUtils.createMessageDataObject().put("name", "Thu").put("value", thursdayStats.uniqueVisitors));
                break;
            }
            case 5: //Friday
            {
                rows.add(MessageUtils.createMessageDataObject().put("name", "Sat").put("value", saturdayStats.uniqueVisitors));
                rows.add(MessageUtils.createMessageDataObject().put("name", "Sun").put("value", sundayStats.uniqueVisitors));
                rows.add(MessageUtils.createMessageDataObject().put("name", "Mon").put("value", mondayStats.uniqueVisitors));
                rows.add(MessageUtils.createMessageDataObject().put("name", "Tue").put("value", tuesdayStats.uniqueVisitors));
                rows.add(MessageUtils.createMessageDataObject().put("name", "Wed").put("value", wednesdayStats.uniqueVisitors));
                rows.add(MessageUtils.createMessageDataObject().put("name", "Thu").put("value", thursdayStats.uniqueVisitors));
                rows.add(MessageUtils.createMessageDataObject().put("name", "Fri").put("value", fridayStats.uniqueVisitors));
                break;
            }
            case 6: //Saturday
            {
                rows.add(MessageUtils.createMessageDataObject().put("name", "Sun").put("value", sundayStats.uniqueVisitors));
                rows.add(MessageUtils.createMessageDataObject().put("name", "Mon").put("value", mondayStats.uniqueVisitors));
                rows.add(MessageUtils.createMessageDataObject().put("name", "Tue").put("value", tuesdayStats.uniqueVisitors));
                rows.add(MessageUtils.createMessageDataObject().put("name", "Wed").put("value", wednesdayStats.uniqueVisitors));
                rows.add(MessageUtils.createMessageDataObject().put("name", "Thu").put("value", thursdayStats.uniqueVisitors));
                rows.add(MessageUtils.createMessageDataObject().put("name", "Fri").put("value", fridayStats.uniqueVisitors));
                rows.add(MessageUtils.createMessageDataObject().put("name", "Sat").put("value", saturdayStats.uniqueVisitors));
                break;
            }
        }
        data.put("rows",rows);
    }

    @Service(request="$appcelerator.graph.usage.request",response="$appcelerator.graph.usage.response",authenticationRequired=false)
    protected void graphUsageRequest(Message request, Message response) throws Exception
    {
        IMessageDataObject data = response.getData();
        IMessageDataList<IMessageDataObject> rows = MessageUtils.createMessageDataObjectList();
        IMessageDataList<IMessageDataObject> titles = MessageUtils.createMessageDataObjectList();
        
        int today = Calendar.getInstance().get(Calendar.DAY_OF_WEEK);
        switch (today)
        {
            case 0: //Sunday
            {
                rows.add(MessageUtils.createMessageDataObject().put("name", "Mon").put("value", mondayStats.pageViewRequests+","+mondayStats.serviceRequests));
                rows.add(MessageUtils.createMessageDataObject().put("name", "Tue").put("value", tuesdayStats.pageViewRequests+","+tuesdayStats.serviceRequests));
                rows.add(MessageUtils.createMessageDataObject().put("name", "Wed").put("value", wednesdayStats.pageViewRequests+","+wednesdayStats.serviceRequests));
                rows.add(MessageUtils.createMessageDataObject().put("name", "Thu").put("value", thursdayStats.pageViewRequests+","+thursdayStats.serviceRequests));
                rows.add(MessageUtils.createMessageDataObject().put("name", "Fri").put("value", fridayStats.pageViewRequests+","+fridayStats.serviceRequests));
                rows.add(MessageUtils.createMessageDataObject().put("name", "Sat").put("value", saturdayStats.pageViewRequests+","+saturdayStats.serviceRequests));
                rows.add(MessageUtils.createMessageDataObject().put("name", "Sun").put("value", sundayStats.pageViewRequests+","+sundayStats.serviceRequests));
                break;
            }
            case 1: //Monday
            {
                rows.add(MessageUtils.createMessageDataObject().put("name", "Tue").put("value", tuesdayStats.pageViewRequests+","+tuesdayStats.serviceRequests));
                rows.add(MessageUtils.createMessageDataObject().put("name", "Wed").put("value", wednesdayStats.pageViewRequests+","+wednesdayStats.serviceRequests));
                rows.add(MessageUtils.createMessageDataObject().put("name", "Thu").put("value", thursdayStats.pageViewRequests+","+thursdayStats.serviceRequests));
                rows.add(MessageUtils.createMessageDataObject().put("name", "Fri").put("value", fridayStats.pageViewRequests+","+fridayStats.serviceRequests));
                rows.add(MessageUtils.createMessageDataObject().put("name", "Sat").put("value", saturdayStats.pageViewRequests+","+saturdayStats.serviceRequests));
                rows.add(MessageUtils.createMessageDataObject().put("name", "Sun").put("value", sundayStats.pageViewRequests+","+sundayStats.serviceRequests));
                rows.add(MessageUtils.createMessageDataObject().put("name", "Mon").put("value", mondayStats.pageViewRequests+","+mondayStats.serviceRequests));
                break;
            }
            case 2: //Tuesday
            {
                rows.add(MessageUtils.createMessageDataObject().put("name", "Wed").put("value", wednesdayStats.pageViewRequests+","+wednesdayStats.serviceRequests));
                rows.add(MessageUtils.createMessageDataObject().put("name", "Thu").put("value", thursdayStats.pageViewRequests+","+thursdayStats.serviceRequests));
                rows.add(MessageUtils.createMessageDataObject().put("name", "Fri").put("value", fridayStats.pageViewRequests+","+fridayStats.serviceRequests));
                rows.add(MessageUtils.createMessageDataObject().put("name", "Sat").put("value", saturdayStats.pageViewRequests+","+saturdayStats.serviceRequests));
                rows.add(MessageUtils.createMessageDataObject().put("name", "Sun").put("value", sundayStats.pageViewRequests+","+sundayStats.serviceRequests));
                rows.add(MessageUtils.createMessageDataObject().put("name", "Mon").put("value", mondayStats.pageViewRequests+","+mondayStats.serviceRequests));
                rows.add(MessageUtils.createMessageDataObject().put("name", "Tue").put("value", tuesdayStats.pageViewRequests+","+tuesdayStats.serviceRequests));
                break;
            }
            case 3: //Wednesday
            {
                rows.add(MessageUtils.createMessageDataObject().put("name", "Thu").put("value", thursdayStats.pageViewRequests+","+thursdayStats.serviceRequests));
                rows.add(MessageUtils.createMessageDataObject().put("name", "Fri").put("value", fridayStats.pageViewRequests+","+fridayStats.serviceRequests));
                rows.add(MessageUtils.createMessageDataObject().put("name", "Sat").put("value", saturdayStats.pageViewRequests+","+saturdayStats.serviceRequests));
                rows.add(MessageUtils.createMessageDataObject().put("name", "Sun").put("value", sundayStats.pageViewRequests+","+sundayStats.serviceRequests));
                rows.add(MessageUtils.createMessageDataObject().put("name", "Mon").put("value", mondayStats.pageViewRequests+","+mondayStats.serviceRequests));
                rows.add(MessageUtils.createMessageDataObject().put("name", "Tue").put("value", tuesdayStats.pageViewRequests+","+tuesdayStats.serviceRequests));
                rows.add(MessageUtils.createMessageDataObject().put("name", "Wed").put("value", wednesdayStats.pageViewRequests+","+wednesdayStats.serviceRequests));
                break;
            }
            case 4: //Thursday
            {
                rows.add(MessageUtils.createMessageDataObject().put("name", "Fri").put("value", fridayStats.pageViewRequests+","+fridayStats.serviceRequests));
                rows.add(MessageUtils.createMessageDataObject().put("name", "Sat").put("value", saturdayStats.pageViewRequests+","+saturdayStats.serviceRequests));
                rows.add(MessageUtils.createMessageDataObject().put("name", "Sun").put("value", sundayStats.pageViewRequests+","+sundayStats.serviceRequests));
                rows.add(MessageUtils.createMessageDataObject().put("name", "Mon").put("value", mondayStats.pageViewRequests+","+mondayStats.serviceRequests));
                rows.add(MessageUtils.createMessageDataObject().put("name", "Tue").put("value", tuesdayStats.pageViewRequests+","+tuesdayStats.serviceRequests));
                rows.add(MessageUtils.createMessageDataObject().put("name", "Wed").put("value", wednesdayStats.pageViewRequests+","+wednesdayStats.serviceRequests));
                rows.add(MessageUtils.createMessageDataObject().put("name", "Thu").put("value", thursdayStats.pageViewRequests+","+thursdayStats.serviceRequests));
                break;
            }
            case 5: //Friday
            {
                rows.add(MessageUtils.createMessageDataObject().put("name", "Sat").put("value", saturdayStats.pageViewRequests+","+saturdayStats.serviceRequests));
                rows.add(MessageUtils.createMessageDataObject().put("name", "Sun").put("value", sundayStats.pageViewRequests+","+sundayStats.serviceRequests));
                rows.add(MessageUtils.createMessageDataObject().put("name", "Mon").put("value", mondayStats.pageViewRequests+","+mondayStats.serviceRequests));
                rows.add(MessageUtils.createMessageDataObject().put("name", "Tue").put("value", tuesdayStats.pageViewRequests+","+tuesdayStats.serviceRequests));
                rows.add(MessageUtils.createMessageDataObject().put("name", "Wed").put("value", wednesdayStats.pageViewRequests+","+wednesdayStats.serviceRequests));
                rows.add(MessageUtils.createMessageDataObject().put("name", "Thu").put("value", thursdayStats.pageViewRequests+","+thursdayStats.serviceRequests));
                rows.add(MessageUtils.createMessageDataObject().put("name", "Fri").put("value", fridayStats.pageViewRequests+","+fridayStats.serviceRequests));
                break;
            }
            case 6: //Saturday
            {
                rows.add(MessageUtils.createMessageDataObject().put("name", "Sun").put("value", sundayStats.pageViewRequests+","+sundayStats.serviceRequests));
                rows.add(MessageUtils.createMessageDataObject().put("name", "Mon").put("value", mondayStats.pageViewRequests+","+mondayStats.serviceRequests));
                rows.add(MessageUtils.createMessageDataObject().put("name", "Tue").put("value", tuesdayStats.pageViewRequests+","+tuesdayStats.serviceRequests));
                rows.add(MessageUtils.createMessageDataObject().put("name", "Wed").put("value", wednesdayStats.pageViewRequests+","+wednesdayStats.serviceRequests));
                rows.add(MessageUtils.createMessageDataObject().put("name", "Thu").put("value", thursdayStats.pageViewRequests+","+thursdayStats.serviceRequests));
                rows.add(MessageUtils.createMessageDataObject().put("name", "Fri").put("value", fridayStats.pageViewRequests+","+fridayStats.serviceRequests));
                rows.add(MessageUtils.createMessageDataObject().put("name", "Sat").put("value", saturdayStats.pageViewRequests+","+saturdayStats.serviceRequests));
                break;
            }
        }
        
        data.put("rows",rows);
        
        titles.add(MessageUtils.createMessageDataObject().put("title","Page Views"));
        titles.add(MessageUtils.createMessageDataObject().put("title","Service Requests"));
        data.put("titles",titles);
    }
    
    public void filter(IMessageDataObject stats)
    {
        try
        {
            incrementPageViewRequest();
            totalResponseTime+=stats.getLong("duration");
        }
        catch (Exception ex)
        {
            ex.printStackTrace();
        }
        /*
        stats.put("sessionid", request.getSession().getId());
        stats.put("new_session",request.getSession().isNew());
        stats.put("appname",route.appname);
        stats.put("release",route.version);
        stats.put("path",route.path);
        stats.put("duration", duration);
        */
    }
    
    private void incrementPageViewRequest ()
    {
        pageRequests++;
        
        switch (Calendar.getInstance().get(Calendar.DAY_OF_WEEK))
        {
            case 0:
            {
                sundayStats.pageViewRequests++;
                break;
            }
            case 1:
            {
                mondayStats.pageViewRequests++;
                break;
            }
            case 2:
            {
                tuesdayStats.pageViewRequests++;
                break;
            }
            case 3:
            {
                wednesdayStats.pageViewRequests++;
                break;
            }
            case 4:
            {
                thursdayStats.pageViewRequests++;
                break;
            }
            case 5:
            {
                fridayStats.pageViewRequests++;
                break;
            }
            case 6:
            {
                saturdayStats.pageViewRequests++;
                break;
            }
        }
    }
    private void incrementServiceRequest ()
    {
        serviceRequests++;

        switch (Calendar.getInstance().get(Calendar.DAY_OF_WEEK))
        {
            case 0:
            {
                sundayStats.serviceRequests++;
                break;
            }
            case 1:
            {
                mondayStats.serviceRequests++;
                break;
            }
            case 2:
            {
                tuesdayStats.serviceRequests++;
                break;
            }
            case 3:
            {
                wednesdayStats.serviceRequests++;
                break;
            }
            case 4:
            {
                thursdayStats.serviceRequests++;
                break;
            }
            case 5:
            {
                fridayStats.serviceRequests++;
                break;
            }
            case 6:
            {
                saturdayStats.serviceRequests++;
                break;
            }
        }
    }
    private void incrementUniqueVisitorRequest ()
    {
        uniqueVisitors++;

        switch (Calendar.getInstance().get(Calendar.DAY_OF_WEEK))
        {
            case 0:
            {
                sundayStats.uniqueVisitors++;
                break;
            }
            case 1:
            {
                mondayStats.uniqueVisitors++;
                break;
            }
            case 2:
            {
                tuesdayStats.uniqueVisitors++;
                break;
            }
            case 3:
            {
                wednesdayStats.uniqueVisitors++;
                break;
            }
            case 4:
            {
                thursdayStats.uniqueVisitors++;
                break;
            }
            case 5:
            {
                fridayStats.uniqueVisitors++;
                break;
            }
            case 6:
            {
                saturdayStats.uniqueVisitors++;
                break;
            }
        }
    }
    
    private Stats mondayStats = new Stats();
    private Stats tuesdayStats = new Stats();
    private Stats wednesdayStats = new Stats();
    private Stats thursdayStats = new Stats();
    private Stats fridayStats = new Stats();
    private Stats saturdayStats = new Stats();
    private Stats sundayStats = new Stats();
    
    private final class Stats
    {
        private long uniqueVisitors=0;
        private long pageViewRequests=0;
        private long serviceRequests=0;
    }
    
    public void sessionCreated(HttpSessionEvent event)
    {
        incrementUniqueVisitorRequest();
    }

    public void sessionDestroyed(HttpSessionEvent event)
    {
    }

    public boolean accept(Message message)
    {
        return message.getDirection().equals(MessageDirection.INCOMING) &&
               !message.getType().startsWith("$appcelerator.");
    }

    public List<String> getServiceTypes()
    {
        // wildcard match all types
        return null;
    }

    public void onMessage(Message message)
    {
        incrementServiceRequest();
    }
}
