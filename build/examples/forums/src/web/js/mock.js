var Mock = Class.create();
Mock.users = new Array();
Mock.forums = new Array();
Mock.threads = new Array();
Mock.posts = new Array();

createUser(1,'billybob','Billy Bob Jackson','Last Login at noon','active','pwd','email');
createUser(2,'leeroy','Leeroy Brown','Last Login April','active','pwd','email');
createUser(3,'maryann','Mary Ann Shaw','Last Login yesteray','active','pwd','email');
createUser(4,'john','John Smith','Last Login January 2005','lurking','pwd','email');

createForum(1,'AppForums','Bug Reports, features, etc.');
createForum(2,'Appcelerator','Open source web2.0 RIA.');
createForum(3,'Apache','THE open source web server.');
createForum(4,'Sexy Sites','Hot rated web2.0 RIA sites.');

/*forumid,userid,id,name*/
createThread(1,1,1,'Starting off the forums');
createThread(2,2,2,'Appcelerator .NET deployment');
createThread(2,3,3,'Appcelerator Iterator question');
createThread(4,2,4,'check this site out');
createThread(3,1,5,'Apache versions....');
createThread(3,1,6,'Tomcat support...');

/* threadid,userid,id,date,body */
createPost(1,1,1,'Oct 22, 2007 2:13pm','boy this is really good stuff');
createPost(2,1,2,'Oct 22, 2007 2:13pm','i like it too');
createPost(3,2,3,'Sep 20, 2007 1:14pm','What are the differences betweeen 1.3 and 2.0?');
createPost(4,2,4,'Oct 22, 2007 2:13pm','When will the .Net server implementation be ready?');
createPost(5,1,5,'Oct 22, 2007 2:13pm','How soon will it be here?');
createPost(5,3,6,'Oct 22, 2007 2:13pm','Soon....');
createPost(6,3,7,'Oct 22, 2007 2:13pm','Is tomcat supported?');
createPost(6,2,8,'Oct 22, 2007 2:13pm','I think so any tips?');
createPost(6,1,9,'Oct 22, 2007 2:13pm','Make sure that you bump up the -Xmx256m and use apache ajp for proxy....');

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