package org.appcelerator.forums.dao;

import org.appcelerator.dao.hibernate.AbstractHibernateDAO;
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

}
