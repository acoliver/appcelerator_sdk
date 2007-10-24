package org.appcelerator.forums.services;

import java.util.Date;
import java.util.List;

import org.apache.log4j.Logger;
import org.appcelerator.annotation.InjectBean;
import org.appcelerator.annotation.Service;
import org.appcelerator.forums.dao.ForumDAO;
import org.appcelerator.forums.dao.ForumthreadDAO;
import org.appcelerator.forums.dao.PostDAO;
import org.appcelerator.forums.dao.UserDAO;
import org.appcelerator.forums.model.Forum;
import org.appcelerator.forums.model.Forumthread;
import org.appcelerator.forums.model.Post;
import org.appcelerator.forums.model.User;
import org.appcelerator.messaging.Message;
import org.appcelerator.messaging.MessageDataObjectException;

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

	@Service(request = "users.request", response = "users.response", authenticationRequired = false)
    protected void users (Message request, Message response)
	throws Exception
	{
		List<User> users = userDAO.findAll();
		response.getData().put("rows", users);
		response.getData().put("users", users.size());
		//TODO: implement active and lurking
		response.getData().put("active", 0);
		response.getData().put("lurking", 0);
		response.getData().put("success", true);
	}	
	@Service(request = "threads.request", response = "threads.response", authenticationRequired = false)
    protected void threads (Message request, Message response)
	throws Exception
	{
		String type = request.getData().getString("type");
		if ("byforum".equals(type))
		{
			Long forumid = request.getData().getLong("forumid");
			Forum forum = forumDAO.findById(forumid);
			List<Forumthread> threads = forumthreadDAO.find(forum);
			response.getData().put("forum", forum);
			response.getData().put("rows", threads);
			response.getData().put("type", type);
			response.getData().put("threads", threads.size());
			response.getData().put("posts", forum.getPosts());
			response.getData().put("users", forum.getVoices());
			response.getData().put("success", true);
		}
		else if ("byuser".equals(type))
		{
			//TODO:implement
		}
		else
		{
			//TODO:implement
			//query
		}
	}	
	@Service(request = "forums.request", response = "forums.response", authenticationRequired = false)
    protected void forums (Message request, Message response)
	throws Exception
	{
		List<Forum> forums = forumDAO.findAll();
		response.getData().put("rows", forums);
		response.getData().put("posts", postDAO.findAll().size());
		response.getData().put("threads", forumthreadDAO.findAll().size());
		response.getData().put("users", userDAO.findAll().size());
		response.getData().put("success", true);
	}	
	@Service(request = "createforum.request", response = "createforum.response", authenticationRequired = false)
    protected void createforum (Message request, Message response)
	throws Exception
	{
		Long forumid = request.getData().optLong("newforum_forumid");
		String name = request.getData().getString("newforum_name");
		String description = request.getData().getString("newforum_description");
		Forum forum = new Forum();
		forum.setId(forumid);
		forum.setName(name);
		forum.setDescription(description);
		forumDAO.save(forum);
		response.getData().put("success", true);
	}
	@Service(request = "createthread.request", response = "createthread.response", authenticationRequired = false)
    protected void createthread (Message request, Message response)
	throws Exception
	{
		Long threadid = request.getData().optLong("newthread_threadid");
		Long postid = request.getData().optLong("newthread_postid");
		long forumid = request.getData().getLong("newthread_forumid");
		Forum forum = forumDAO.findById(forumid);
		long userid = request.getData().getLong("newthread_userid");
		String name = request.getData().getString("newthread_name");
		String body = request.getData().getString("newthread_body");

		Forumthread thread = new Forumthread();
		thread.setId(threadid);
		thread.setForum(forum);
		thread.setName(name);
		thread = forumthreadDAO.save(thread);

		Post post = createPost(postid, forum, userid, thread,body);
		response.getData().put("success", true);
		response.getData().put("post", post);
		response.getData().put("thread", thread);
	}
	@Service(request = "createpost.request", response = "createpost.response", authenticationRequired = false)
    protected void createpost (Message request, Message response)
	throws Exception
	{
		Long threadid = request.getData().optLong("newpost_threadid");
		Long postid = request.getData().optLong("newpost_postid");
		long userid = request.getData().getLong("newpost_userid");
		String body = request.getData().getString("newpost_body");

		Forumthread thread = forumthreadDAO.findById(threadid);
		Forum forum = thread.getForum();

		Post post = createPost(postid, forum, userid, thread,body);
		response.getData().put("success", true);
		response.getData().put("post", post);
	}
	private Post createPost(Long postid, Forum forum, long userid, Forumthread thread, String body) throws MessageDataObjectException {
		User user = userDAO.findById(new Long(userid));

		Post post = new Post();
		post.setBody(body);
		post.setDate(new Date());
		post.setThread(thread);
		post.setId(postid);
		post.setUser(user);
		post = postDAO.save(post);

		//update counters
		//TODO: compute thread.users
		thread.setPosts(thread.getPosts().longValue()+1);
		forumthreadDAO.save(thread);
		
		//TODO: compute forum.users
		forum.setPosts(forum.getPosts()+1);
		forumDAO.save(forum);
		
		user.setPosts(user.getPosts().longValue()+1);
		//TODO: compute user.threads
		return post;
	}
	@Service(request = "savaccount.request", response = "savaccount.response", authenticationRequired = false)
    protected void signup (Message request, Message response)
	throws Exception
	{
		Long id = request.getData().optLong("account_id");
		String username = request.getData().getString("account_username");
		String password = request.getData().getString("account_password");
		String fullName = request.getData().getString("account_fullName");
		String email = request.getData().getString("account_email");
		User user = userDAO.findById(id);
		user.setUsername(username);
		user.setEmail(email);
		user.setFullName(fullName);
		user.setPassword(password);
		user = userDAO.save(user);
		response.getData().put("success", true);
		response.getData().put("user", user);
	}
	@Service(request = "signup.request", response = "signup.response", authenticationRequired = false)
    protected void saveaccount (Message request, Message response)
	throws Exception
	{
		Long id = request.getData().optLong("signupid");
		String username = request.getData().getString("signupusername");
		String password = request.getData().getString("signuppassword");
		String fullName = request.getData().getString("name");
		String email = request.getData().getString("email");
		String state = request.getData().optString("signupstate", User.USERSTATE_ACTIVE);
		User user = new User();
		user.setId(id);
		user.setUsername(username);
		user.setEmail(email);
		user.setFullName(fullName);
		user.setPassword(password);
		user.setLastLogin(new Date());
		user.setState(state);
		user = userDAO.save(user);
		response.getData().put("success", true);
		response.getData().put("user", user);
	}
	@Service(request = "login.request", response = "login.response", authenticationRequired = false)
    protected void login (Message request, Message response)
	throws Exception
	{
		String username = request.getData().getString("username");
		String password = request.getData().getString("password");
		User user = userDAO.findByCredentials(username, password);
		if (user != null)
		{
			response.getData().put("success", true);
			response.getData().put("user", user);
		}
		else
		{
			//TODO: remap failed.response
			response.getData().put("success", false);
		}
	}
	@Service(request = "logout.request", response = "logout.response", authenticationRequired = false)
    protected void logout (Message request, Message response)
	throws Exception
	{
		response.getData().put("success", true);
	}
	@Service(request = "user.request", response = "user.response", authenticationRequired = false)
    protected void user (Message request, Message response)
	throws Exception
	{
		Long userid = request.getData().getLong("userid");
		User user = userDAO.findById(userid);
		response.getData().put("user", user);
		response.getData().put("success", true);
	}
	@Service(request = "posts.request", response = "posts.response", authenticationRequired = false)
    protected void posts (Message request, Message response)
	throws Exception
	{
		Long threadid = request.getData().getLong("threadid");
		Forumthread thread = forumthreadDAO.findById(threadid);
		Forum forum = thread.getForum();
		List<Post> posts = postDAO.find(thread);
		response.getData().put("thread", thread);
		response.getData().put("forum", forum);
		response.getData().put("posts", posts);

		//TODO: implement unique users
//		users = getUniqueUsers();
//		response.getData().put("users", users);
		
		response.getData().put("success", true);
	}	
}
