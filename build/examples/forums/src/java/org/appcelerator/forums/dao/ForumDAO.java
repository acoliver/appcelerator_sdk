package org.appcelerator.forums.dao;

import org.appcelerator.dao.hibernate.AbstractHibernateDAO;
import org.appcelerator.forums.model.Forum;

public class ForumDAO extends AbstractHibernateDAO<Forum,Long>
{
    public ForumDAO()
    {
        super(Forum.class);
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
