package org.appcelerator.forums.dao;

import org.appcelerator.dao.hibernate.AbstractHibernateDAO;
import org.appcelerator.forums.model.User;

public class UserDAO extends AbstractHibernateDAO<User,Long>
{
    public UserDAO()
    {
        super(User.class);
    }
//    @SuppressWarnings("unchecked")
//    public Collection<Forum> findByName(String  name)
//    {
//        return getHibernateTemplate().find("FROM Employee  WHERE name LIKE ?","%"+ name + "%");
//    }
//
    @SuppressWarnings("unchecked")
    public User findByCredentials(String  username, String password)
    {
        return findSingleRow("FROM User  WHERE username = ? and password = ?", username, password);
    }

}
