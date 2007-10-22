package org.appcelerator.forums.services;

import java.util.List;

import org.apache.log4j.Logger;
import org.appcelerator.annotation.InjectBean;
import org.appcelerator.annotation.Service;
import org.appcelerator.forums.dao.ForumDAO;
import org.appcelerator.forums.dao.ForumthreadDAO;
import org.appcelerator.forums.dao.PostDAO;
import org.appcelerator.forums.dao.UserDAO;
import org.appcelerator.forums.model.Forum;
import org.appcelerator.messaging.Message;

public class ForumManager 
{
	protected static Logger LOG = Logger.getLogger(ForumManager.class);
	
	@InjectBean
	ForumDAO forumDAO;
	
	@InjectBean
	ForumthreadDAO forumthreadDAO;
	
	@InjectBean
	PostDAO postDAO;

	@InjectBean
	UserDAO userDAO;

	@Service(request = "forums.request", response = "forums.response", authenticationRequired = false)
    protected void createContact (Message request, Message response)
	throws Exception
	{
		List<Forum> forums = forumDAO.findAll();
		response.getData().put("rows", forums);
		response.getData().put("posts", postDAO.findAll().size());
		response.getData().put("threads", forumthreadDAO.findAll().size());
		response.getData().put("users", userDAO.findAll().size());
		response.getData().put("success", true);
	}	
	

}
