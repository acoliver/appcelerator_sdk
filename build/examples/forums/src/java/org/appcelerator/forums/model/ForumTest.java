package org.appcelerator.forums.model;

import java.util.Date;

import junit.framework.TestCase;

import org.appcelerator.messaging.JSONMessageDataObject;
import org.appcelerator.messaging.Message;

public class ForumTest extends TestCase {
	public void dtestSimple() {
		User user = createUser();
		Message message = new Message();
		JSONMessageDataObject data = new JSONMessageDataObject();
		message.setData(data);
		message.getData().put("user", user);
		message.getData().put("count", 1);
		String messagestr = data.toDataString();
		assertNotNull(messagestr);
	}
	private User createUser() {
		User user = new User();
		user.setEmail("email");
		user.setFullName("ante wew");
		user.setId(new Long(0));
		user.setPassword("pwd");
		user.setPosts(new Long(0));
		user.setState("mystate");
		user.setThreads(new Long(0));
		user.setUsername("azuercher");
		return user;
	}
	private Post createPost(User user, Forumthread thread)
	{
		Post post = new Post();
		post.setBody("bunch of stuff here");
		post.setDate(new Date());
		post.setId(new Long(0));
		post.setThread(thread);
		post.setUser(user);
		return post;
	}
	private Forumthread createthread(Forum forum) {
		Forumthread thread = new Forumthread();
		thread.setId(new Long(1));
		thread.setName("thread name");
		thread.setForum(forum);
		return thread;
	}
	private Forum createforum() {
		Forum forum = new Forum();
		forum.setDescription("hi ya");
		forum.setId(new Long(1));
		forum.setName("new forum");
		return forum;
	}
	public void testNonrecursive() {
		User user = createUser();
		Forum forum = createforum();
		Forumthread thread = createthread(forum);
		Post post = createPost(user,thread);
		
		forum.setLastPost(post);
		thread.setLastPost(post);
		user.setLastPost(post);

		Message message = new Message();
		message.setData(new JSONMessageDataObject());
		System.out.println("transforming forum...");
		message.getData().put("forum", forum);
		System.out.println("transformed forum to "+message.getData().toDataString());

		message.setData(new JSONMessageDataObject());
		System.out.println("transforming post...");
		message.getData().put("post", post);
		System.out.println("transformed post to "+message.getData().toDataString());

		message.setData(new JSONMessageDataObject());
		System.out.println("transforming user...");
		message.getData().put("user", user);
		System.out.println("transformed user to "+message.getData().toDataString());

		message.setData(new JSONMessageDataObject());
		System.out.println("transforming thread...");
		message.getData().put("thread", thread);
		System.out.println("transformed thread to "+message.getData().toDataString());

	}
}
