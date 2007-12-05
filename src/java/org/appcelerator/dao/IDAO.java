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
package org.appcelerator.dao;

import java.io.Serializable;
import java.util.Collection;
import java.util.List;

import org.appcelerator.messaging.IMessageDataList;
import org.appcelerator.messaging.IMessageDataMarshaller;
import org.appcelerator.messaging.IMessageDataObject;

/**
 * IDAO is a generic DAO interface
 *
 * @author <a href="mailto:jhaynie@hakano.com">Jeff Haynie</a>
 */
public interface IDAO<T, ID extends Serializable>
{
    /**
     * find persisted object represented by specified id
     *
     * @param id id of persisted object to find
     * @return object represented by id or <code>null</code> if no result
     */
    T findById(ID id);

    /**
     * find a persisted object by id
     *
     * @param id          id to find
     * @param transformer transformer to apply
     * @return persisted object represented by id, transformed
     */
    T findById(ID id, IDAOValueTransformer<T> transformer);

    /**
     * find persisted objects by ID
     *
     * @param id         id of object to fin
     * @param marshaller marshaller to apply
     * @return collection of persisted objects meeting specified id criteria represented as a message-based data object
     */
    IMessageDataObject findById(ID id, IMessageDataMarshaller<T> marshaller);

    /**
     * find all persisted objects of this type
     *
     * @return list of persisted objects
     */
    List<T> findAll();

    /**
     * find all persisted entities, applying the specified transformer to each result.
     *
     * @param transformer transformer to apply
     * @return all persisted entities tranformed
     */
    List<T> findAll(IDAOValueTransformer<T> transformer);

    /**
     * find by example with exclusions, applying specified transformer to each result
     *
     * @param example example object to use
     * @param exclude exclusions to be applied to example criteria
     * @return persisted results
     * @see org.hibernate.criterion.Example
     */
    List<T> findByExample(T example, String... exclude);

    /**
     * find by example with exclusions, applying specified transformer to each result
     *
     * @param example     example object to use
     * @param transformer transformer to apply
     * @param exclude     exclusions to be applied to example criteria
     * @return persisted results transformed
     * @see org.hibernate.criterion.Example
     */
    List<T> findByExample(T example, IDAOValueTransformer<T> transformer, String... exclude);

    /**
     * given the class of Class<ID> and a Collection of strings (which represent the ID values as strings),
     * return Collection<T>
     *
     * @param IDClass class of ID
     * @param strings values of IDs
     * @return collection of persisted objects represented by id values
     */
    Collection<T> findById(Class<ID> IDClass, Collection<String> strings);

    /**
     * find persisted objects by class ID and collection of strings representing the id values and transform the results
     *
     * @param IDClass     persisted class' identifier class
     * @param strings     values of the ids represented as strings
     * @param transformer transformer to apply
     * @return collection of persisted objects meeting specified id criteria, transformed
     */
    Collection<T> findById(Class<ID> IDClass, Collection<String> strings, IDAOValueTransformer<T> transformer);

    /**
     * given the class of Class<ID> and an array of strings (which represent the ID values as strings),
     * return Collection<T>
     *
     * @param IDClass class of ID
     * @param strings values of IDs
     * @return collection of persisted objects represented by id values
     */
    Collection<T> findById(Class<ID> IDClass, String... strings);

    /**
     * find persisted objects by class ID and collection of strings representing the id values and transform the results
     *
     * @param IDClass     persisted class' identifier class
     * @param transformer transformer to apply
     * @param strings     values of the ids represented as strings
     * @return collection of persisted objects meeting specified id criteria, transformed
     */
    Collection<T> findById(Class<ID> IDClass, IDAOValueTransformer<T> transformer, String... strings);

    /**
     * persist specified entity
     *
     * @param entity entity to save
     * @return saved entity
     */
    T save(T entity);

    /**
     * persist all objects represented in specified collection
     *
     * @param set objects to save
     * @return collection of saved objects
     */
    Collection<T> saveAll(Collection<T> set);

    /**
     * persist all objects represented in entities
     *
     * @param entities objects to save
     * @return array of saved objects
     */
    T[] saveAll(T... entities);

    /**
     * delete specified persisted object
     *
     * @param entity object to delete
     */
    void delete(T entity);

    /**
     * delete all persisted objects represented in specified collection
     *
     * @param set objects to delete
     */
    void deleteAll(Collection<T> set);

    /**
     * delete all persisted objects represented in entities
     *
     * @param entities objects to delete
     */
    void deleteAll(T... entities);

    /**
     * find single result of a sql query
     *
     * @param sql sql query to execute
     * @return single persisted object or <code>null</code> if no results found
     */
    T findSingleRow(String sql);

    /**
     * find single result of a sql query with specified parameter
     *
     * @param sql       sql query to execute
     * @param parameter parameter represented in sql query by ?
     * @return single persisted object or <code>null</code> if no results found
     */
    T findSingleRow(String sql, Object parameter);

    /**
     * find single result of a sql query with specified parameters
     *
     * @param sql        sql query to execute
     * @param parameters parameters represented in sql query by ?
     * @return single persisted object or <code>null</code> if no results found
     */
    T findSingleRow(String sql, Object... parameters);

    /**
     * find single result of a sql query
     *
     * @param sql         sql query to execute
     * @param transformer transformer to apply
     * @return single persisted object, transformed, or <code>null</code> if no results found
     */
    T findSingleRow(String sql, IDAOValueTransformer<T> transformer);

    /**
     * find single result of a sql query
     *
     * @param sql        sql query to execute
     * @param marshaller marshaller to apply
     * @return single persisted object or <code>null</code> if no results found, represented as a message-based data object
     */
    IMessageDataObject findSingleRow(String sql, IMessageDataMarshaller<T> marshaller);

    /**
     * find single result of a sql query with one query parameter
     *
     * @param sql        sql query to execute
     * @param parameter  query parameter
     * @param marshaller marshaller to apply
     * @return single persisted object or <code>null</code> if no results found, represented as a message-based data object
     */
    IMessageDataObject findSingleRow(String sql, Object parameter, IMessageDataMarshaller<T> marshaller);

    /**
     * find results of a sql query in a page delineated by specified start and end results
     *
     * @param sql         sql query to execute
     * @param startResult starting result desired
     * @param maxResults   number of results to return
     * @return list of results meeting query and page delineation
     */
    List<T> findResultsByPage(String sql, int startResult, int maxResults);

    /**
     * find results of a sql query in a page delineated by specified start and end results
     *
     * @param sql         sql query to execute
     * @param startResult starting result desired
     * @param maxResults   number of results to return
     * @param transformer transformer to apply
     * @return list of results meeting query and page delineation, transformed
     */
    List<T> findResultsByPage(String sql, int startResult, int maxResults, IDAOValueTransformer<T> transformer);

    /**
     * find persisted objects represented by specified ids with named identifier
     *
     * @param idName name of id to use
     * @param ids    ids of persisted objects to find
     * @return collection of objects represented by ids or empty collection if none found
     */
    Collection<T> findByIds(String idName, ID... ids);

    /**
     * find persisted objects by ids
     *
     * @param idName      id name
     * @param transformer transformer to apply
     * @param ids         collection of ids
     * @return collection of persisted objects meeting specified id criteria, transformed
     */
    Collection<T> findByIds(String idName, IDAOValueTransformer<T> transformer, ID... ids);

    /**
     * find persisted objects represented by specified ids with named identifier
     *
     * @param idName name of id to use
     * @param ids    ids of persisted objects to find
     * @return collection of objects represented by ids or empty collection if none found
     */
    Collection<T> findByIds(String idName, Collection<ID> ids);

    /**
     * find persisted objects by ids
     *
     * @param idName      id name
     * @param ids         collection of ids
     * @param transformer transformer to apply
     * @return collection of persisted objects meeting specified id criteria, transformed
     */
    Collection<T> findByIds(String idName, Collection<ID> ids, IDAOValueTransformer<T> transformer);

    /**
     * find all persisted objects of this type
     *
     * @return list of persisted objects represented as message-based data list
     */
    IMessageDataList<T> findAllAsDataList();

    /**
     * find all persisted entities as a message-based data list using specified marshaller
     *
     * @param marshaller marshaller to use
     * @return all persisted entities as a message-based data list
     */
    IMessageDataList<IMessageDataObject> findAllAsDataList(IMessageDataMarshaller<T> marshaller);

    /**
     * find all persisted entities as a message-based data list, applying to the specified transformer to each result
     *
     * @param transformer transformer to apply
     * @return all persisted entities as a message-based data list, transformed
     */
    IMessageDataList<T> findAllAsDataList(IDAOValueTransformer<T> transformer);

    /**
     * find persisted objects by ids
     *
     * @param idName id name
     * @param ids    collection of ids
     * @return persisted objects meeting specified id criteria, represented as a message-based data list
     */
    IMessageDataList<T> findByIdsAsDataList(String idName, Collection<ID> ids);

    /**
     * find persisted objects by ids
     *
     * @param idName      id name
     * @param ids         collection of ids
     * @param transformer transformer to apply
     * @return persisted objects meeting specified id criteria, transformed, represented as a message-based data list
     */
    IMessageDataList<T> findByIdsAsDataList(String idName, Collection<ID> ids, IDAOValueTransformer<T> transformer);

    /**
     * find persisted objects by ids
     *
     * @param idName     id name
     * @param ids        collection of ids
     * @param marshaller marshaller to apply
     * @return persisted objects meeting specified id criteria, represented as a message-based data list
     */
    IMessageDataList<IMessageDataObject> findByIdsAsDataList(String idName, Collection<ID> ids, IMessageDataMarshaller<T> marshaller);

    /**
     * find persisted objects by ids
     *
     * @param idName     id name
     * @param marshaller marshaller to apply
     * @param ids        collection of ids
     * @return persisted objects meeting specified id criteria, represented as a message-based data list
     */
    IMessageDataList<IMessageDataObject> findByIdsAsDataList(String idName, IMessageDataMarshaller<T> marshaller, ID... ids);

    /**
     * find persisted objects by ids
     *
     * @param idName id name
     * @param ids    collection of ids
     * @return persisted objects meeting specified id criteria, represented as a message-based data list
     */
    IMessageDataList<T> findByIdsAsDataList(String idName, ID... ids);

    /**
     * find persisted objects by ids
     *
     * @param idName      id name
     * @param transformer transformer to apply
     * @param ids         collection of ids
     * @return persisted objects meeting specified id criteria, transformed, represented as a message-based data list
     */
    IMessageDataList<T> findByIdsAsDataList(String idName, IDAOValueTransformer<T> transformer, ID... ids);

    /**
     * find results of a sql query in a page delineated by specified start and end results
     *
     * @param sql         sql query to execute
     * @param startResult starting result desired
     * @param maxResults   number of results to return
     * @return list of results meeting query and page delineation
     */
    IMessageDataList<T> findResultsByPageAsDataList(String sql, int startResult, int maxResults);

    /**
     * find results of a sql query in a page delineated by specified start and end results
     *
     * @param sql         sql query to execute
     * @param startResult starting result desired
     * @param maxResults   number of results to return
     * @param transformer transformer to apply
     * @return list of results meeting query and page delineation, transformed, represented as a message-based data list
     */
    IMessageDataList<T> findResultsByPageAsDataList(String sql, int startResult, int maxResults, IDAOValueTransformer<T> transformer);

    /**
     * find results of a sql query in a page delineated by specified start and end results
     *
     * @param sql         sql query to execute
     * @param startResult starting result desired
     * @param maxResults   number of results to return
     * @param marshaller  marshaller to apply
     * @return list of results meeting query and page delineation, represented as a message-based data list
     */
    IMessageDataList<IMessageDataObject> findResultsByPageAsDataList(String sql, int startResult, int maxResults, IMessageDataMarshaller<T> marshaller);

    /**
     * find by example with exclusions
     *
     * @param example example object to use
     * @param exclude exclusions to be applied to example criteria
     * @return persisted results as a message-based data list
     * @see org.hibernate.criterion.Example
     */
    IMessageDataList<T> findByExampleAsDataList(T example, String... exclude);

    /**
     * find by example with exclusions, applying specified transformer to each result
     *
     * @param example     example object to use
     * @param transformer transformer to apply
     * @param exclude     exclusions to be applied to example criteria
     * @return persisted results transformed as a message-based data list
     * @see org.hibernate.criterion.Example
     */
    IMessageDataList<T> findByExampleAsDataList(T example, IDAOValueTransformer<T> transformer, String... exclude);

    /**
     * find by example with exclusions
     *
     * @param example    example object to use
     * @param marshaller marshaller to use
     * @param exclude    exclusions to be applied to example criteria
     * @return persisted results as a message-based data list
     * @see org.hibernate.criterion.Example
     */
    IMessageDataList<IMessageDataObject> findByExampleAsDataList(T example, IMessageDataMarshaller<T> marshaller, String... exclude);
}
