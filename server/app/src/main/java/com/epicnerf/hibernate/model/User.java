package com.epicnerf.hibernate.model;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import javax.persistence.*;
import java.util.Date;
import java.util.UUID;

@Entity
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @CreationTimestamp
    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "create_date", nullable = false)
    private Date createDate;

    @UpdateTimestamp
    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "modify_date", nullable = false)
    private Date modifyDate;

    @Column(nullable = false)
    private Boolean accepted;

    @Column(nullable = false)
    private Boolean admin;

    @Column(nullable = false)
    private Boolean superAdmin;

    @Column(length = 10000)
    private String genericClientData;

    @Column(unique = true, nullable = false, length = 36)
    private String token = UUID.randomUUID().toString();

    @Column(unique = true, nullable = false, length = 36)
    private String uuid = UUID.randomUUID().toString();

    @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true, optional = false)
    private Location location;

    @ManyToOne(fetch = FetchType.LAZY)
    private House house;

    public String getGenericClientData() {
        return genericClientData;
    }

    public void setGenericClientData(String genericClientData) {
        this.genericClientData = genericClientData;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Date getCreateDate() {
        return createDate;
    }

    public void setCreateDate(Date createDate) {
        this.createDate = createDate;
    }

    public Date getModifyDate() {
        return modifyDate;
    }

    public void setModifyDate(Date modifyDate) {
        this.modifyDate = modifyDate;
    }

    public Boolean getAccepted() {
        return accepted;
    }

    public void setAccepted(Boolean accepted) {
        this.accepted = accepted;
    }

    public Boolean getAdmin() {
        return admin;
    }

    public void setAdmin(Boolean admin) {
        this.admin = admin;
    }

    public Boolean getSuperAdmin() {
        return superAdmin;
    }

    public void setSuperAdmin(Boolean superAdmin) {
        this.superAdmin = superAdmin;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public Location getLocation() {
        return location;
    }

    public void setLocation(Location location) {
        this.location = location;
    }

    public String getUuid() {
        return uuid;
    }

    public void setUuid(String uuid) {
        this.uuid = uuid;
    }

    public House getHouse() {
        return house;
    }

    public void setHouse(House house) {
        this.house = house;
    }

    public com.epicnerf.model.User toApiModel() {
        com.epicnerf.model.User user = new com.epicnerf.model.User();
        user.setAccepted(getAccepted());
        user.setAdmin(getAdmin());
        user.setLocation(getLocation().toApiModel());
        user.setSuperAdmin(getSuperAdmin());
        user.setUuid(getUuid());
        user.setGenericClientData(getGenericClientData());
        return user;
    }
}