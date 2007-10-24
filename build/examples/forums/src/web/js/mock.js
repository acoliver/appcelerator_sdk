var Mock = Class.create();
Mock.users = new Array();
Mock.forums = new Array();
Mock.threads = new Array();
Mock.posts = new Array();



function getById(id,collection)
{
	var result = new Array();
	for (var idx=0;idx < collection.length;idx++)
	{
		var obj = collection[idx];
	    if(obj.id == id)
		{
			return obj;
		}
	}
	return '';
}
function getUsersByState(state)
{
	var result = new Array();
	for (var idx=0;idx < Mock.users.length;idx++)
	{
	    if(Mock.users[idx].state == state)
		{
			result.push(Mock.users[idx]);
		}
	}
	return result;
}
function authenticate(username,password)
{
	var result = new Array();
	for (var idx=0;idx < Mock.users.length;idx++)
	{
		var user = Mock.users[idx];
		if (user.username == username && user.password == password)
		{
			return user;
		}
	}
	return '';
}
function createForum(id,name,desc)
{
	var forum = {'id':id,'name':name,'description':desc,'threads':0,'posts':0,'voices':0};
	Mock.forums.push(forum);
	return forum;
}
/* state is (active|lurking) */
function createUser(id,username,fullName,lastLogin,state,password,email)
{
	var user = {'id':id,'username':username,'fullName':fullName,'lastLogin':lastLogin,'state':state,'posts':0,'password':password,'email':email,'threads':0};
	Mock.users.push(user);
	return user;
}
function saveUser(saveuser)
{
	for (var idx=0;idx < Mock.users.length;idx++)
	{
		var user = Mock.users[idx];
		if (''+user.id == saveuser.id)
		{
			user.username=saveuser.username;
			user.fullName=saveuser.fullName;
			user.password=saveuser.password;
			user.email=saveuser.email;
			return user;
		}
	}
}
function createThread(forumid,userid,id,name)
{
	var forum = getById(forumid,Mock.forums);
	forum.threads+=1;
	var thread = {'id':id,'name':name,'forum':forum,'posts':0,'voices':0};
	Mock.threads.push(thread);
	return thread;
}
function createPost(threadid,userid,id,date, body)
{
	var thread = getById(threadid,Mock.threads);
	var user = getById(userid,Mock.users);
	var post = {'id':id,'body':body,'user':user,'thread':thread,'date':date};
	var forum = thread.forum;
	Mock.posts.push(post);

	user.posts+=1;
	thread.posts+=1;
	thread.lastpost= clonePost(post);
	var threadposts = postsByThread(thread);
	var threadusers = uniqueUsers(threadposts);
	thread.voices=threadusers.length;
	forum.posts+=1;
	forum.lastpost = clonePost(post);
	var posts = postsByUser(userid);
	var threads = uniqueThreads(posts);
	user.threads = threads.length;
	var forumposts = postsByForum(forum.id);
	var users = uniqueUsers(forumposts);
	forum.voices = users.length;
	return post;
}
function clonePost(post)
{
	var copy = {'id':post.id,'date':post.date,'body':post.body,'user':post.user};
	return copy;
}
function addUnique(collection,newobj)
{
	var obj = getById(newobj.id,collection);
	if (obj == '')
	{
		collection.push(newobj);
	}
}
function uniqueThreads(posts)
{
	var result = new Array();
	for (var idx=0;idx < posts.length;idx++)
	{
		var post = posts[idx];
		addUnique(result, post.thread);
	}
	return result;
}
function postsByThread(thread)
{
	var result = new Array();
	for (var idx=0;idx < Mock.posts.length;idx++)
	{
		var post = Mock.posts[idx];
		if (post.thread == thread)
		{
			result.push(post);
		}
	}
	return result.sort(sortPost);
}
function postsByQuery(query)
{
	var result = new Array();
	for (var idx=0;idx < Mock.posts.length;idx++)
	{
		var post = Mock.posts[idx];
		var thread = post.thread;
		if (thread.name.match(query) || post.body.match(query) || post.user.username.match(query) || post.user.fullName.match(query))
		{
			result.push(post);
		}
	}
	return result;
}
function postsByUser(userid)
{
	var result = new Array();
	for (var idx=0;idx < Mock.posts.length;idx++)
	{
		var postuserid = Mock.posts[idx].user.id;
	    if(postuserid == userid)
		{
			result.push(Mock.posts[idx]);
		}
	}
	return result;
}
function postsByForum(forumid)
{
	var result = new Array();
	var forum = getById(forumid,Mock.forums);
	for (var idx=0;idx < Mock.threads.length;idx++)
	{
		var thread = Mock.threads[idx];
		if (thread.forum == forum)
		{
			var posts=postsByThread(thread);
			result = result.concat(posts);
		}
	}
	return result;
}
function uniqueUsers(posts)
{
	var result = new Array();
	for (var idx=0;idx < posts.length;idx++)
	{
		var post = posts[idx];
		addUnique(result, post.user);
	}
	return result;
}
function sortPost(a,b)
{
	return a.id - b.id;
}
function loaddata()
{
	$MQ('r:signup.request',{'signupid':1,'signupusername':'leeroy','name':'Billy Bob Jackson','signuppassword':'pwd','email':'email','singupstate':'active'});
	$MQ('r:signup.request',{'signupid':2,'signupusername':'billybob','name':'Leeroy Brown','signuppassword':'pwd','email':'email','singupstate':'active'});
	$MQ('r:signup.request',{'signupid':3,'signupusername':'maryann','name':'Mary Ann Shaw','signuppassword':'pwd','email':'email','singupstate':'active'});
	$MQ('r:signup.request',{'signupid':4,'signupusername':'john','name':'John Smith','signuppassword':'pwd','email':'email','singupstate':'lurking'});

	$MQ('r:createforum.request',{'newforum_forumid':1,'newforum_name':'AppForums','newforum_description':'Bug Reports, features, etc.'});
	$MQ('r:createforum.request',{'newforum_forumid':2,'newforum_name':'Appcelerator','newforum_description':'Open source web2.0 RIA.'});
	$MQ('r:createforum.request',{'newforum_forumid':3,'newforum_name':'Apache','newforum_description':'THE open source web server.'});
	$MQ('r:createforum.request',{'newforum_forumid':4,'newforum_name':'Sexy Sites','newforum_description':'Hot rated web2.0 RIA sites.'});
	
	$MQ('r:createthread.request',{'newthread_forumid':1,'newthread_userid':1,'newthread_threadid':1,'newthread_postid':1,'newthread_name':'Starting off the forums','newthread_body':'boy this is really good stuff'});
	$MQ('r:createthread.request',{'newthread_forumid':2,'newthread_userid':2,'newthread_threadid':2,'newthread_postid':2,'newthread_name':'Appcelerator .NET deployment','newthread_body':'i like it too'});
	$MQ('r:createthread.request',{'newthread_forumid':2,'newthread_userid':3,'newthread_threadid':3,'newthread_postid':3,'newthread_name':'Appcelerator Iterator question','newthread_body':'What are the differences betweeen 1.3 and 2.0?'});
	$MQ('r:createthread.request',{'newthread_forumid':4,'newthread_userid':3,'newthread_threadid':4,'newthread_postid':4,'newthread_name':'check this site out','newthread_body':'When will the .Net server implementation be ready?'});
	$MQ('r:createthread.request',{'newthread_forumid':3,'newthread_userid':1,'newthread_threadid':5,'newthread_postid':5,'newthread_name':'Apache versions....','newthread_body':'How soon will it be here?'});
	$MQ('r:createthread.request',{'newthread_forumid':3,'newthread_userid':1,'newthread_threadid':6,'newthread_postid':6,'newthread_name':'Tomcat support...','newthread_body':'Is tomcat supported?'});

	$MQ('r:createpost.request',{'newpost_threadid':6,'newpost_userid':3,'newpost_postid':7,'newpost_body':'Why tomcat supported?'});
	$MQ('r:createpost.request',{'newpost_threadid':6,'newpost_userid':2,'newpost_postid':8,'newpost_body':'I think so any tips?'});
	$MQ('r:createpost.request',{'newpost_threadid':6,'newpost_userid':1,'newpost_postid':9,'newpost_body':'Make sure that you bump up the -Xmx256m and use apache ajp for proxy....'});
}