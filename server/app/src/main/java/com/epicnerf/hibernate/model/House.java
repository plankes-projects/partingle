package com.epicnerf.hibernate.model;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import javax.persistence.*;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Entity
public class House {
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

    @Column(unique = true, nullable = false, length = 36)
    private String recoverToken = UUID.randomUUID().toString();

    @Column(unique = true, nullable = false, length = 36)
    private String joinToken = UUID.randomUUID().toString();

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "house_id")
    private List<Room> rooms;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true, mappedBy = "house")
    private List<User> users;

    @Column(nullable = false)
    private Integer houseId;

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

    public String getRecoverToken() {
        return recoverToken;
    }

    public void setRecoverToken(String recoverToken) {
        this.recoverToken = recoverToken;
    }

    public List<Room> getRooms() {
        return rooms;
    }

    public void setRooms(List<Room> rooms) {
        this.rooms = rooms;
    }

    public List<User> getUsers() {
        return users;
    }

    public void setUsers(List<User> users) {
        this.users = users;
    }

    public String getJoinToken() {
        return joinToken;
    }

    public void setJoinToken(String joinToken) {
        this.joinToken = joinToken;
    }

    public Integer getHouseId() {
        return houseId;
    }

    public void setHouseId(Integer houseId) {
        this.houseId = houseId;
    }

    public com.epicnerf.model.House toApiModel(User user) {
        int allowedInactivityInSec = 20;

        com.epicnerf.model.House house = new com.epicnerf.model.House();
        Stream<User> activeUserStream = getUsers().stream()
                .filter(u -> u.getModifyDate().after(new Date(System.currentTimeMillis() - allowedInactivityInSec * 1000)));
        if (user.getAccepted()) {
            house.setUsers(activeUserStream.map(User::toApiModel).collect(Collectors.toList()));
            house.setRooms(getRooms().stream().map(Room::toApiModel).collect(Collectors.toList()));
        } else {
            //show all users in the same room
            house.setUsers(activeUserStream
                    .filter(u -> u.getLocation().getRoomId().equals(user.getLocation().getRoomId()))
                    .map(User::toApiModel)
                    .collect(Collectors.toList()));
            house.setRooms(Collections.singletonList(getRooms().stream().findFirst().get().toApiModel()));
        }

        house.setHouseId(getHouseId());
        house.setJoinToken(getJoinToken());
        return house;
    }
}