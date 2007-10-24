package org.appcelerator.forums.model;

import java.io.Serializable;
import java.util.Date;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.Table;

import org.appcelerator.annotation.MessageAttr;
import org.appcelerator.json.JSONObject;
import org.appcelerator.model.AbstractModelObject;

@Entity
@Table(name = "USER")
public class User extends AbstractModelObject implements Serializable {
	private static final long serialVersionUID = 1L;
	public static final String USERSTATE_ACTIVE="active";
	public static final String USERSTATE_LURKING="lurking";
    
    @MessageAttr
    public String fullName;
    @MessageAttr
    public String email;
    @MessageAttr
    public String username;
    @MessageAttr
    public String password;
    @MessageAttr
    public Long posts= new Long(0);
    @MessageAttr
    public Long threads= new Long(0);
    @MessageAttr
    public Date lastLogin;
    
    @MessageAttr
    public String state = USERSTATE_ACTIVE;
    
    @Column
    public String getState() {
		return state;
	}

	public void setState(String state) {
		this.state = state;
	}

	@Column(nullable = true)
    public Date getLastLogin() {
		return lastLogin;
	}

	public void setLastLogin(Date lastLogin) {
		this.lastLogin = lastLogin;
	}

	@Id
    @GeneratedValue
    public Long getId()
    {
        return super.getId();
    }

    @Column(nullable = false, length = 100, unique = false)
    public String getFullName() 
    {
		return fullName;
	}
    @Column(nullable = false, length = 250, unique = false)
    public String getEmail() 
    {
		return email;
	}
    @Column(nullable = false, length = 100, unique = true)
	public String getUsername() {
		return username;
	}

    @Column(nullable = false, length = 100, unique = false)
	public String getPassword() {
		return password;
	}

	public void setUsername(String username) {
		this.username = username;
	}

	public void setPassword(String password) {
		this.password = password;
	}

    @Column(nullable = false)
	public Long getPosts() {
		return posts;
	}

	public void setPosts(Long posts) {
		this.posts = posts;
	}

    @Column(nullable = false)
	public long getThreads() {
		return threads;
	}

	public void setThreads(Long threads) {
		this.threads = threads;
	}

	public void setFullName(String fullName) {
		this.fullName = fullName;
	}

	public void setEmail(String email) {
		this.email = email;
	}
	public JSONObject toJSONObject() {
		JSONObject obj = JSONObject.createBean(this);
		return obj;
	}
}
