/**
 *  Appcelerator SDK
 *  Copyright (C) 2006-2007 by Appcelerator, Inc. All Rights Reserved.
 *  For more information, please visit http://www.appcelerator.org
 *
 *  This program is free software; you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation; either version 2 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License along
 *  with this program; if not, write to the Free Software Foundation, Inc.,
 *  51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 */
package org.appcelerator.dao.hibernate;

import java.io.Serializable;
import java.lang.reflect.Array;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashSet;
import java.util.List;

import org.appcelerator.annotation.InjectBean;
import org.appcelerator.dao.IDAO;
import org.appcelerator.dao.IDAOValueTransformer;
import org.appcelerator.messaging.IMessageDataList;
import org.appcelerator.messaging.IMessageDataMarshaller;
import org.appcelerator.messaging.IMessageDataObject;
import org.appcelerator.messaging.MessageUtils;
import org.hibernate.Criteria;
import org.hibernate.HibernateException;
import org.hibernate.Query;
import org.hibernate.Session;
import org.hibernate.criterion.Example;
import org.springframework.orm.hibernate3.HibernateCallback;
import org.springframework.orm.hibernate3.HibernateTemplate;
import org.springframework.orm.hibernate3.support.HibernateDaoSupport;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

/**
 * AbstractHibernateDAO does a lot of the heavy lifting and repetitive hibernate
 * generic DAO operations for us.
 *
 * @author <a href="mailto:jhaynie@hakano.com">Jeff Haynie</a>
 */
public abstract class AbstractHibernateDAO<T, ID extends Serializable> extends HibernateDaoSupport implements IDAO<T, ID>
{
    /**
     * class persisted by this hibernate DAO.
     */
    private final Class<T> persistentClass;

    /**
     * transaction manager bean used by this hibernate DAO (injected).
     */
    @InjectBean
    private PlatformTransactionManager transactionManager = null;

    /**
     * constructs a new hibernate DAO.
     *
     * @param persistentClass class persisted by this hibernate DAO.
     */
    protected AbstractHibernateDAO(Class<T> persistentClass)
    {
        this.persistentClass = persistentClass;
    }

    /**
     * get the transaction manager.
     *
     * @return transaction manager used by this hibernate DAO.
     */
    public PlatformTransactionManager getTransactionManager()
    {
        return transactionManager;
    }

    /**
     * return the persistent class for this DAO
     *
     * @return peristent class for this DAO
     */
    public Class<T> getPersistentClass()
    {
        return persistentClass;
    }

    /**
     * transform a result value with the specified transformer.
     *
     * @param value       result value to be transformed
     * @param transformer transformer to apply against the result value.
     * @return transformed result value
     */
    protected T transform(T value, IDAOValueTransformer<T> transformer)
    {
        if (value != null)
        {
            if (transformer.transform(this, value))
            {
                return value;
            }
            return null;
        }
        return value;
    }

    /**
     * transform result values.
     *
     * @param transformer transformer to apply against the result values.
     * @param results     result values to transform
     * @return transformed result values
     */
    @SuppressWarnings("unchecked")
    protected T[] transform(IDAOValueTransformer<T> transformer, T... results)
    {
        if (transformer != null && results != null && results.length > 0)
        {
            List<T> r = new ArrayList<T>(results.length);
            for (T t : results)
            {
                if (transformer.transform(this, t))
                {
                    r.add(t);
                }
            }
            return (T[]) r.toArray();
        }
        return results;
    }

    /**
     * transform result values.
     *
     * @param results     result values to transform
     * @param transformer transformer to apply against the result values
     * @return transformed result values
     */
    protected IMessageDataList<T> transform(IMessageDataList<T> results, IDAOValueTransformer<T> transformer)
    {
        if (transformer != null && results != null && !results.isEmpty())
        {
            IMessageDataList<T> r = MessageUtils.createMessageDataObjectList();
            for (T t : results)
            {
                if (transformer.transform(this, t))
                {
                    r.add(t);
                }
            }
            return r;
        }
        return results;
    }

    /**
     * transform result values.
     *
     * @param results     result values to transform
     * @param transformer transformer to apply against the result values
     * @return transformed result values
     */
    protected List<T> transform(List<T> results, IDAOValueTransformer<T> transformer)
    {
        if (transformer != null && results != null && !results.isEmpty())
        {
            List<T> r = new ArrayList<T>(results.size());

            for (T t : results)
            {
                if (transformer.transform(this, t))
                {
                    r.add(t);
                }
            }

            return r;
        }
        return results;
    }

    /**
     * find all persisted entities, applying the specified transformer to each result.
     *
     * @param transformer transformer to apply
     * @return all persisted entities tranformed
     */
    public List<T> findAll(IDAOValueTransformer<T> transformer)
    {
        return transform(this.findAll(), transformer);
    }

    /**
     * find all persisted entities as a message-based data list, applying to the specified transformer to each result
     *
     * @param transformer transformer to apply
     * @return all persisted entities as a message-based data list, transformed
     */
    public IMessageDataList<T> findAllAsDataList(IDAOValueTransformer<T> transformer)
    {
        return transform(findAllAsDataList(), transformer);
    }

    /**
     * find by example with exclusions, applying specified transformer to each result
     *
     * @param example     example object to use
     * @param transformer transformer to apply
     * @param exclude     exclusions to be applied to example criteria
     * @return persisted results transformed
     * @see org.hibernate.criterion.Example
     */
    public List<T> findByExample(T example, IDAOValueTransformer<T> transformer, String... exclude)
    {
        return transform(findByExample(example, exclude), transformer);
    }

    /**
     * find by example with exclusions, applying specified transformer to each result
     *
     * @param example     example object to use
     * @param transformer transformer to apply
     * @param exclude     exclusions to be applied to example criteria
     * @return persisted results transformed as a message-based data list
     * @see org.hibernate.criterion.Example
     */
    public IMessageDataList<T> findByExampleAsDataList(T example, IDAOValueTransformer<T> transformer, String... exclude)
    {
        return transform(findByExampleAsDataList(example, exclude), transformer);
    }

    /**
     * find persisted objects by class ID and collection of strings representing the id values and transform the results
     *
     * @param IDClass     persisted class' identifier class
     * @param strings     values of the ids represented as strings
     * @param transformer transformer to apply
     * @return collection of persisted objects meeting specified id criteria, transformed
     */
    public Collection<T> findById(Class<ID> IDClass, Collection<String> strings, IDAOValueTransformer<T> transformer)
    {
        return transform((List<T>) findById(IDClass, strings), transformer);
    }

    /**
     * find persisted objects by class ID and collection of strings representing the id values and transform the results
     *
     * @param IDClass     persisted class' identifier class
     * @param transformer transformer to apply
     * @param strings     values of the ids represented as strings
     * @return collection of persisted objects meeting specified id criteria, transformed
     */
    public Collection<T> findById(Class<ID> IDClass, IDAOValueTransformer<T> transformer, String... strings)
    {
        return transform((List<T>) findById(IDClass, strings), transformer);
    }

    /**
     * find a persisted object by id
     *
     * @param id          id to find
     * @param transformer transformer to apply
     * @return persisted object represented by id, transformed
     */
    public T findById(ID id, IDAOValueTransformer<T> transformer)
    {
        return transform(findById(id), transformer);
    }

    /**
     * find persisted objects by ids
     *
     * @param idName      id name
     * @param ids         collection of ids
     * @param transformer transformer to apply
     * @return collection of persisted objects meeting specified id criteria, transformed
     */
    public Collection<T> findByIds(String idName, Collection<ID> ids, IDAOValueTransformer<T> transformer)
    {
        return transform((List<T>) findByIds(idName, ids), transformer);
    }

    /**
     * find persisted objects by ids
     *
     * @param idName      id name
     * @param transformer transformer to apply
     * @param ids         collection of ids
     * @return collection of persisted objects meeting specified id criteria, transformed
     */
    public Collection<T> findByIds(String idName, IDAOValueTransformer<T> transformer, ID... ids)
    {
        return transform((List<T>) findByIds(idName, ids), transformer);
    }

    /**
     * find persisted objects by ids
     *
     * @param idName      id name
     * @param ids         collection of ids
     * @param transformer transformer to apply
     * @return persisted objects meeting specified id criteria, transformed, represented as a message-based data list
     */
    public IMessageDataList<T> findByIdsAsDataList(String idName, Collection<ID> ids, IDAOValueTransformer<T> transformer)
    {
        return transform(findByIdsAsDataList(idName, ids), transformer);
    }

    /**
     * find persisted objects by ids
     *
     * @param idName      id name
     * @param transformer transformer to apply
     * @param ids         collection of ids
     * @return persisted objects meeting specified id criteria, transformed, represented as a message-based data list
     */
    public IMessageDataList<T> findByIdsAsDataList(String idName, IDAOValueTransformer<T> transformer, ID... ids)
    {
        return transform(findByIdsAsDataList(idName, ids), transformer);
    }

    /**
     * find results of a sql query in a page delineated by specified start and end results
     *
     * @param sql         sql query to execute
     * @param startResult starting result desired
     * @param endResult   ending result desired
     * @param transformer transformer to apply
     * @return list of results meeting query and page delineation, transformed
     */
    public List<T> findResultsByPage(String sql, int startResult, int endResult, IDAOValueTransformer<T> transformer)
    {
        return transform(findResultsByPage(sql, startResult, endResult), transformer);
    }

    /**
     * find results of a sql query in a page delineated by specified start and end results
     *
     * @param sql         sql query to execute
     * @param startResult starting result desired
     * @param endResult   ending result desired
     * @param transformer transformer to apply
     * @return list of results meeting query and page delineation, transformed, represented as a message-based data list
     */
    public IMessageDataList<T> findResultsByPageAsDataList(String sql, int startResult, int endResult, IDAOValueTransformer<T> transformer)
    {
        return transform(findResultsByPageAsDataList(sql, startResult, endResult), transformer);
    }

    /**
     * find single result of a sql query
     *
     * @param sql         sql query to execute
     * @param transformer transformer to apply
     * @return single persisted object, transformed, or <code>null</code> if no results found
     */
    public T findSingleRow(String sql, IDAOValueTransformer<T> transformer)
    {
        return transform(findSingleRow(sql), transformer);
    }

    /**
     * /**
     * attempt a type conversion from a string to the ID class type
     *
     * @param cls     ID class
     * @param convert value to convert
     * @return value converted to an ID class instance
     * @throws IllegalArgumentException when unable to perform conversion
     */
    private ID getType(Class<ID> cls, String convert) throws IllegalArgumentException
    {
        Object newValue;
        if (Long.class.isAssignableFrom(cls))
        {
            newValue = Long.valueOf(convert);
        }
        else if (Integer.class.isAssignableFrom(cls))
        {
            newValue = Integer.valueOf(convert);
        }
        else if (String.class.isAssignableFrom(cls))
        {
            newValue = convert;
        }
        else if (Float.class.isAssignableFrom(cls))
        {
            newValue = Float.valueOf(convert);
        }
        else if (Double.class.isAssignableFrom(cls))
        {
            newValue = Double.valueOf(convert);
        }
        else if (Short.class.isAssignableFrom(cls))
        {
            newValue = Short.valueOf(convert);
        }
        else
        {
            throw new IllegalArgumentException("don't know how to convert from a String to: " + cls.getName());
        }
        return cls.cast(newValue);
    }

    /**
     * given a Class<ID> and a collection of strings, do a type conversion back into type of ID
     *
     * @param cls     ID class
     * @param strings values to convert to ID class instances
     * @return collection of values transformed to ID class instances
     * @throws IllegalArgumentException when unable to perform conversion
     */
    protected Collection<ID> convertStringToIDs(Class<ID> cls, Collection<String> strings) throws IllegalArgumentException
    {
        Collection<ID> ids = new HashSet<ID>(strings.size());
        for (String s : strings)
        {
            ID _id = getType(cls, s);
            ids.add(_id);
        }
        return ids;
    }

    /**
     * given a Class<ID> and a collection of strings, do a type conversion back into type of ID
     *
     * @param cls     ID class
     * @param strings values to convert to ID class instances
     * @return array of values transformed to ID class instances
     * @throws IllegalArgumentException when unable to perform conversion
     */
    @SuppressWarnings("unchecked")
    protected ID[] convertStringToIDs(Class<ID> cls, String... strings) throws IllegalArgumentException
    {
        ID[] ids = (ID[]) Array.newInstance(cls, strings.length);
        int c = 0;
        for (String s : strings)
        {
            ids[c++] = getType(cls, s);
        }
        return ids;
    }

    /**
     * given the class of Class<ID> and a Collection of strings (which represent the ID values as strings),
     * return Collection<T>
     *
     * @param IDClass class of ID
     * @param strings values of IDs
     * @return collection of persisted objects represented by id values
     */
    public Collection<T> findById(Class<ID> IDClass, Collection<String> strings)
    {
        Collection<ID> idlist = convertStringToIDs(IDClass, strings);
        return findByIds(idlist);
    }

    /**
     * given the class of Class<ID> and an array of strings (which represent the ID values as strings),
     * return Collection<T>
     *
     * @param IDClass class of ID
     * @param strings values of IDs
     * @return collection of persisted objects represented by id values
     */
    public Collection<T> findById(Class<ID> IDClass, String... strings)
    {
        ID[] idlist = convertStringToIDs(IDClass, strings);
        return findByIds(idlist);
    }

    /**
     * delete all persisted objects represented in specified collection
     *
     * @param set objects to delete
     */
    @Transactional(propagation = Propagation.REQUIRED)
    public void deleteAll(final Collection<T> set)
    {
        if (set != null)
        {
            HibernateTemplate template = getHibernateTemplate();
            for (T t : set)
            {
                template.delete(t);
            }
        }
    }

    /**
     * delete all persisted objects represented in entities
     *
     * @param entities objects to delete
     */
    @Transactional(propagation = Propagation.REQUIRED)
    public void deleteAll(final T... entities)
    {
        if (entities == null || entities.length == 0)
        {
            return;
        }
        HibernateTemplate template = getHibernateTemplate();
        for (T t : entities)
        {
            template.delete(t);
        }
    }

    /**
     * delete specified persisted object
     *
     * @param entity object to delete
     */
    @Transactional(propagation = Propagation.REQUIRED)
    public void delete(final T entity)
    {
        if (entity != null)
        {
            HibernateTemplate template = getHibernateTemplate();
            template.delete(entity);
        }
    }

    /**
     * find all persisted objects of this type
     *
     * @return list of persisted objects
     */
    @SuppressWarnings("unchecked")
    @Transactional(propagation = Propagation.SUPPORTS)
    public List<T> findAll()
    {
        return (List<T>) getHibernateTemplate().find("from " + getPersistentClass().getName());
    }

    /**
     * find by example with exclusions, applying specified transformer to each result
     *
     * @param example example object to use
     * @param exclude exclusions to be applied to example criteria
     * @return persisted results
     * @see org.hibernate.criterion.Example
     */
    @SuppressWarnings("unchecked")
    @Transactional(propagation = Propagation.SUPPORTS)
    public List<T> findByExample(final T example, final String... exclude)
    {
        HibernateTemplate ht = getHibernateTemplate();
        return (List<T>) ht.execute(new HibernateCallback()
        {
            public Object doInHibernate(Session session) throws HibernateException
            {
                Criteria criteria = session.createCriteria(getPersistentClass());
                Example ex = Example.create(example);
                if (exclude != null)
                {
                    for (String prop : exclude)
                    {
                        ex.excludeProperty(prop);
                    }
                }
                criteria.add(ex);
                return criteria.list();
            }
        });
    }

    /**
     * find single result of a sql query
     *
     * @param sql sql query to execute
     * @return single persisted object or <code>null</code> if no results found
     */
    public T findSingleRow(String sql)
    {
        // cast to prevent calling the other method with IDAOTransformer<T>
        // and causing a stack overflow
        return findSingleRow(sql, (Object) null);
    }

    /**
     * find single result of a sql query with specified parameter
     *
     * @param sql       sql query to execute
     * @param parameter parameter represented in sql query by ?
     * @return single persisted object or <code>null</code> if no results found
     */
    @SuppressWarnings("unchecked")
    @Transactional(propagation = Propagation.SUPPORTS)
    public T findSingleRow(String sql, Object parameter)
    {
        List<T> list = (parameter == null) ? getHibernateTemplate().find(sql) : getHibernateTemplate().find(sql, parameter);

        if (null == list || list.isEmpty())
        {
            return null;
        }

        return list.get(0);
    }

    /**
     * find single result of a sql query with specified parameters
     *
     * @param sql        sql query to execute
     * @param parameters parameters represented in sql query by ?
     * @return single persisted object or <code>null</code> if no results found
     */
    @SuppressWarnings("unchecked")
    @Transactional(propagation = Propagation.SUPPORTS)
    public T findSingleRow(String sql, Object... parameters)
    {
        List<T> list = getHibernateTemplate().find(sql, parameters);

        if (null == list || list.isEmpty())
        {
            return null;
        }

        return list.get(0);
    }

    /**
     * find results of a sql query with specified parameters
     *
     * @param sql        sql query to execute
     * @param parameters parameters represented in sql query by ?
     * @return list of persisted objects
     */
    @SuppressWarnings("unchecked")
    @Transactional(propagation = Propagation.SUPPORTS)
    public List<T> find(String sql, Object... parameters)
    {
        return (List<T>) getHibernateTemplate().find(sql, parameters);
    }

    /**
     * find results of a sql query in a page delineated by specified start and end results
     *
     * @param sql         sql query to execute
     * @param startResult starting result desired
     * @param endResult   ending result desired
     * @return list of results meeting query and page delineation
     */
    @SuppressWarnings("unchecked")
    @Transactional(propagation = Propagation.SUPPORTS)
    public List<T> findResultsByPage(final String sql, final int startResult, final int endResult)
    {
        HibernateTemplate ht = getHibernateTemplate();
        return (List<T>) ht.execute(new HibernateCallback()
        {
            public Object doInHibernate(Session session) throws HibernateException
            {
                Query q = session.createQuery(sql);
                q.setReadOnly(true);
                q.setFirstResult(startResult);
                q.setMaxResults(endResult);
                return q.list();
            }
        });

    }

    /**
     * find persisted object represented by specified id
     *
     * @param id id of persisted object to find
     * @return object represented by id or <code>null</code> if no result
     */
    @SuppressWarnings("unchecked")
    @Transactional(propagation = Propagation.SUPPORTS)
    public T findById(ID id)
    {
        return (T) getHibernateTemplate().get(getPersistentClass(), id);
    }

    /**
     * find persisted objects represented by specified ids
     *
     * @param ids ids of persisted objects to find
     * @return collection of objects represented by ids or empty collection if none found
     */
    public Collection<T> findByIds(ID... ids)
    {
        Collection<T> set = new HashSet<T>();
        for (ID id : ids)
        {
            T t = findById(id);
            if (t != null)
            {
                set.add(t);
            }
        }
        return set;
    }

    /**
     * find persisted objects represented by specified ids
     *
     * @param ids ids of persisted objects to find
     * @return collection of objects represented by ids or empty collection if none found
     */
    public Collection<T> findByIds(Collection<ID> ids)
    {
        Collection<T> set = new HashSet<T>();
        for (ID id : ids)
        {
            T t = findById(id);
            if (t != null)
            {
                set.add(t);
            }
        }
        return set;
    }

    /**
     * find persisted objects represented by specified ids with named identifier
     *
     * @param idName name of id to use
     * @param ids    ids of persisted objects to find
     * @return collection of objects represented by ids or empty collection if none found
     */
    @SuppressWarnings({"unused", "unchecked"})
    @Transactional(propagation = Propagation.SUPPORTS)
    public Collection<T> findByIds(String idName, ID... ids)
    {
        StringBuilder sqlBuilder = new StringBuilder("FROM ");
        sqlBuilder.append(getPersistentClass().getName());
        sqlBuilder.append(" WHERE ");
        sqlBuilder.append(idName);
        sqlBuilder.append(" IN (");
        for (int idIndex = 0; ids.length != idIndex;)
        {
            sqlBuilder.append("?");
            if (ids.length > ++idIndex)
            {
                sqlBuilder.append(", ");
            }
        }
        sqlBuilder.append(")");

        return (Collection<T>) getHibernateTemplate().find(sqlBuilder.toString(), ids);
    }

    /**
     * find persisted objects represented by specified ids with named identifier
     *
     * @param idName name of id to use
     * @param ids    ids of persisted objects to find
     * @return collection of objects represented by ids or empty collection if none found
     */
    @SuppressWarnings({"unused", "unchecked"})
    @Transactional(propagation = Propagation.SUPPORTS)
    public Collection<T> findByIds(String idName, Collection<ID> ids)
    {
        StringBuilder sqlBuilder = new StringBuilder("FROM ");
        sqlBuilder.append(getPersistentClass().getName());
        sqlBuilder.append(" WHERE ");
        sqlBuilder.append(idName);
        sqlBuilder.append(" IN (");
        for (int idIndex = 0, length = ids.size(); length != idIndex;)
        {
            sqlBuilder.append("?");
            if (length > ++idIndex)
            {
                sqlBuilder.append(", ");
            }
        }
        sqlBuilder.append(")");

        return (Collection<T>) getHibernateTemplate().find(sqlBuilder.toString(), ids.toArray());
    }

    /**
     * persist all objects represented in specified collection
     *
     * @param set objects to save
     * @return collection of saved objects
     */
    @SuppressWarnings("unchecked")
    @Transactional(propagation = Propagation.REQUIRED)
    public Collection<T> saveAll(final Collection<T> set)
    {
        if (set != null && !set.isEmpty())
        {
            HibernateTemplate template = getHibernateTemplate();
            HashSet<T> saved = new HashSet<T>();
            for (T t : set)
            {
                T newObj = (T) template.merge(t);
                saved.add(newObj);
            }
            return saved;
        }
        return set;
    }

    /**
     * persist all objects represented in entities
     *
     * @param entities objects to save
     * @return array of saved objects
     */
    @SuppressWarnings("unchecked")
    @Transactional(propagation = Propagation.REQUIRED)
    public T[] saveAll(final T... entities)
    {
        if (entities == null || entities.length == 0)
        {
            return entities;
        }
        else
        {
            final ArrayList<Object> list = new ArrayList<Object>(entities.length);
            HibernateTemplate template = getHibernateTemplate();
            for (T t : entities)
            {
                Object saved = template.merge(t);
                list.add(saved);
            }
            return (T[]) list.toArray();
        }
    }

    /**
     * persist specified entity
     *
     * @param entity entity to save
     * @return saved entity
     */
    @SuppressWarnings("unchecked")
    @Transactional(propagation = Propagation.REQUIRED)
    public T save(final T entity)
    {
        HibernateTemplate template = getHibernateTemplate();
        return (T) template.merge(entity);
    }

    /**
     * find all persisted objects of this type
     *
     * @return list of persisted objects represented as message-based data list
     */
    public IMessageDataList<T> findAllAsDataList()
    {
        return MessageUtils.createMessageDataObjectList(findAll());
    }

    /**
     * find persisted objects by ids
     *
     * @param idName id name
     * @param ids    collection of ids
     * @return persisted objects meeting specified id criteria, represented as a message-based data list
     */
    public IMessageDataList<T> findByIdsAsDataList(String idName, Collection<ID> ids)
    {
        return MessageUtils.createMessageDataObjectList(findByIds(idName, ids));
    }

    /**
     * find persisted objects by ids
     *
     * @param idName id name
     * @param ids    collection of ids
     * @return persisted objects meeting specified id criteria, represented as a message-based data list
     */
    public IMessageDataList<T> findByIdsAsDataList(String idName, ID... ids)
    {
        return MessageUtils.createMessageDataObjectList(findByIds(idName, ids));
    }

    /**
     * find results of a sql query in a page delineated by specified start and end results
     *
     * @param sql         sql query to execute
     * @param startResult starting result desired
     * @param endResult   ending result desired
     * @return list of results meeting query and page delineation
     */
    public IMessageDataList<T> findResultsByPageAsDataList(String sql, int startResult, int endResult)
    {
        return MessageUtils.createMessageDataObjectList(findResultsByPage(sql, startResult, endResult));
    }

    /**
     * find by example with exclusions
     *
     * @param example example object to use
     * @param exclude exclusions to be applied to example criteria
     * @return persisted results as a message-based data list
     * @see org.hibernate.criterion.Example
     */
    public IMessageDataList<T> findByExampleAsDataList(T example, String... exclude)
    {
        return MessageUtils.createMessageDataObjectList(findByExample(example, exclude));
    }

    /**
     * find all persisted entities as a message-based data list using specified marshaller
     *
     * @param marshaller marshaller to use
     * @return all persisted entities as a message-based data list
     */
    public IMessageDataList<IMessageDataObject> findAllAsDataList(IMessageDataMarshaller<T> marshaller)
    {
        return MessageUtils.createMessageDataObjectList(findAll(), marshaller);
    }

    /**
     * find by example with exclusions
     *
     * @param example    example object to use
     * @param marshaller marshaller to use
     * @param exclude    exclusions to be applied to example criteria
     * @return persisted results as a message-based data list
     * @see org.hibernate.criterion.Example
     */
    public IMessageDataList<IMessageDataObject> findByExampleAsDataList(T example, IMessageDataMarshaller<T> marshaller, String... exclude)
    {
        return MessageUtils.createMessageDataObjectList(findByExample(example, exclude), marshaller);
    }

    /**
     * find persisted objects by ID
     *
     * @param id         id of object to fin
     * @param marshaller marshaller to apply
     * @return collection of persisted objects meeting specified id criteria represented as a message-based data object
     */
    public IMessageDataObject findById(ID id, IMessageDataMarshaller<T> marshaller)
    {
        IMessageDataObject result = MessageUtils.createMessageDataObject();
        T t = findById(id);
        marshaller.marshal(t, result);
        return result;
    }

    /**
     * find persisted objects by ids
     *
     * @param idName     id name
     * @param ids        collection of ids
     * @param marshaller marshaller to apply
     * @return persisted objects meeting specified id criteria, represented as a message-based data list
     */
    public IMessageDataList<IMessageDataObject> findByIdsAsDataList(String idName, Collection<ID> ids, IMessageDataMarshaller<T> marshaller)
    {
        return MessageUtils.createMessageDataObjectList(findByIds(idName, ids), marshaller);
    }

    /**
     * find persisted objects by ids
     *
     * @param idName     id name
     * @param marshaller marshaller to apply
     * @param ids        collection of ids
     * @return persisted objects meeting specified id criteria, represented as a message-based data list
     */
    public IMessageDataList<IMessageDataObject> findByIdsAsDataList(String idName, IMessageDataMarshaller<T> marshaller, ID... ids)
    {
        return MessageUtils.createMessageDataObjectList(findByIds(idName, ids), marshaller);
    }

    /**
     * find results of a sql query in a page delineated by specified start and end results
     *
     * @param sql         sql query to execute
     * @param startResult starting result desired
     * @param endResult   ending result desired
     * @param marshaller  marshaller to apply
     * @return list of results meeting query and page delineation, represented as a message-based data list
     */
    public IMessageDataList<IMessageDataObject> findResultsByPageAsDataList(String sql, int startResult, int endResult, IMessageDataMarshaller<T> marshaller)
    {
        return MessageUtils.createMessageDataObjectList(findResultsByPage(sql, startResult, endResult), marshaller);
    }

    /**
     * find single result of a sql query
     *
     * @param sql        sql query to execute
     * @param marshaller marshaller to apply
     * @return single persisted object or <code>null</code> if no results found, represented as a message-based data object
     */
    public IMessageDataObject findSingleRow(String sql, IMessageDataMarshaller<T> marshaller)
    {
        IMessageDataObject result = MessageUtils.createMessageDataObject();
        T t = findSingleRow(sql);
        marshaller.marshal(t, result);
        return result;
    }

    /**
     * find single result of a sql query with one query parameter
     *
     * @param sql        sql query to execute
     * @param parameter  query parameter
     * @param marshaller marshaller to apply
     * @return single persisted object or <code>null</code> if no results found, represented as a message-based data object
     */
    public IMessageDataObject findSingleRow(String sql, Object parameter, IMessageDataMarshaller<T> marshaller)
    {
        IMessageDataObject result = MessageUtils.createMessageDataObject();
        T t = findSingleRow(sql, parameter);
        marshaller.marshal(t, result);
        return result;
    }

    @SuppressWarnings("unchecked")
    public List<T> findByNamedQuery(String queryName, Object ...parameters)
    {
        return getHibernateTemplate().findByNamedQuery(queryName, parameters);
    }

    @SuppressWarnings("unchecked")
    public List<T> findByNamedQuery(String queryName)
    {
        return getHibernateTemplate().findByNamedQuery(queryName);
    }

    @SuppressWarnings("unchecked")
    public T findSingleRowByNamedQuery(String queryName, Object ...parameters)
    {
        List<T> values = getHibernateTemplate().findByNamedQuery(queryName, parameters);
        if (null == values || values.isEmpty())
        {
            return null;
        }

        return values.get(0);
    }

    @SuppressWarnings("unchecked")
    public T findSingleRowByNamedQuery(String queryName)
    {
        List<T> values = getHibernateTemplate().findByNamedQuery(queryName);
        if (null == values || values.isEmpty())
        {
            return null;
        }

        return values.get(0);
    }
}
