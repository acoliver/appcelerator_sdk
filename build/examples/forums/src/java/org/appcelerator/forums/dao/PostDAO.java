package org.appcelerator.forums.dao;

import java.util.List;

import org.appcelerator.dao.hibernate.AbstractHibernateDAO;
import org.appcelerator.forums.model.Forumthread;
import org.appcelerator.forums.model.Post;

public class PostDAO extends AbstractHibernateDAO<Post,Long>
{
    public PostDAO()
    {
        super(Post.class);
    }
//    @SuppressWarnings("unchecked")
//    public Collection<Forum> findByName(String  name)
//    {
//        return getHibernateTemplate().find("FROM Employee  WHERE name LIKE ?","%"+ name + "%");
//    }
//
//    @SuppressWarnings("unchecked")
//    public Employee findByCredentials(String  email, String password)
//    {
//        return findSingleRow("FROM Employee  WHERE email = ? and password = ?", email, password);
//    }

	public List<Post> find(Forumthread thread) {
		return this.find("FROM Post  WHERE thread = ?", thread);
	}
}
