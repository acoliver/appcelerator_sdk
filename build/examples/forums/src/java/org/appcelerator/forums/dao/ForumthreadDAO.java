package org.appcelerator.forums.dao;

import java.util.List;

import org.appcelerator.dao.hibernate.AbstractHibernateDAO;
import org.appcelerator.forums.model.Forum;
import org.appcelerator.forums.model.Forumthread;

public class ForumthreadDAO extends AbstractHibernateDAO<Forumthread,Long>
{
    public ForumthreadDAO()
    {
        super(Forumthread.class);
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
//  @SuppressWarnings("unchecked")
    public List<Forumthread> find(Forum forum)
    {
    	return this.find("FROM Forumthread  WHERE forum = ?", forum);
	}
}
