package com.epicnerf.api;

import com.epicnerf.hibernate.model.Location;
import com.epicnerf.hibernate.model.Room;
import com.epicnerf.hibernate.repository.HouseRepository;
import com.epicnerf.hibernate.repository.UserRepository;
import com.epicnerf.model.House;
import com.epicnerf.model.InitialData;
import com.epicnerf.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class HouseApiDelegateImpl implements HouseApiDelegate {
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private HouseRepository houseRepository;

    @Override
    public ResponseEntity<Void> houseAcceptGet(String token, String targetUserUuid) {
        com.epicnerf.hibernate.model.User caller = userRepository.findByToken(token);
        if (caller == null || !caller.getAccepted()) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }

        com.epicnerf.hibernate.model.User target = userRepository.findByUuid(targetUserUuid);
        if (target == null) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }

        if (!target.getHouse().getId().equals(caller.getHouse().getId())) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }

        target.setAccepted(true);
        userRepository.save(target);

        return new ResponseEntity<>(HttpStatus.OK);
    }

    @Override
    public ResponseEntity<InitialData> houseCreateGet(Integer houseId, Integer numOfRooms) {
        com.epicnerf.hibernate.model.House house = createHouse(houseId, numOfRooms);
        com.epicnerf.hibernate.model.User user = house.getUsers().stream().findFirst().get();

        InitialData data = new InitialData();
        data.setHouseRecoverToken(house.getRecoverToken());
        data.setUserToken(user.getToken());
        data.setUserUuid(user.getUuid());
        return ResponseEntity.ok(data);
    }

    private com.epicnerf.hibernate.model.House createHouse(Integer houseId, Integer numOfRooms) {
        com.epicnerf.hibernate.model.User user = createSuperAdminUser();
        List<Room> rooms = new ArrayList<>();
        for (int i = 0; i < numOfRooms; i++) {
            Room room = new Room();
            room.setRoomId(i);
            rooms.add(room);
        }

        com.epicnerf.hibernate.model.House house = new com.epicnerf.hibernate.model.House();
        house.setRooms(rooms);
        house.setUsers(Collections.singletonList(user));
        house.setHouseId(houseId);

        user.setHouse(house);

        houseRepository.save(house);
        return house;
    }

    private Location createDefaultLocation() {
        Location location = new Location();
        location.setRoomId(0);
        location.setX(0.0f);
        location.setY(0.0f);
        return location;
    }

    @Override
    public ResponseEntity<Void> houseGiveAdminGet(String token, String targetUserUuid) {
        com.epicnerf.hibernate.model.User caller = userRepository.findByToken(token);
        if (caller == null || !caller.getAdmin()) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }

        com.epicnerf.hibernate.model.User target = userRepository.findByUuid(targetUserUuid);
        if (target == null) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }

        if (!target.getHouse().getId().equals(caller.getHouse().getId())) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }

        target.setAccepted(true);
        target.setAdmin(true);
        userRepository.save(target);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @Override
    public ResponseEntity<InitialData> houseJoinGet(String joinToken) {
        com.epicnerf.hibernate.model.House house = houseRepository.findByJoinToken(joinToken);

        com.epicnerf.hibernate.model.User user = new com.epicnerf.hibernate.model.User();
        user.setSuperAdmin(false);
        user.setAdmin(false);
        user.setAccepted(false);
        user.setLocation(createDefaultLocation());

        house.getUsers().add(user);
        user.setHouse(house);
        houseRepository.save(house);

        InitialData data = new InitialData();
        data.setUserToken(user.getToken());
        data.setUserUuid(user.getUuid());
        return ResponseEntity.ok(data);
    }

    private com.epicnerf.hibernate.model.User createSuperAdminUser() {
        com.epicnerf.hibernate.model.User user = new com.epicnerf.hibernate.model.User();
        user.setSuperAdmin(true);
        user.setAdmin(true);
        user.setAccepted(true);
        user.setLocation(createDefaultLocation());
        return user;
    }

    @Override
    public ResponseEntity<Void> houseKickGet(String token, String targetUserUuid) {
        com.epicnerf.hibernate.model.User caller = userRepository.findByToken(token);
        if (caller == null || !caller.getAdmin()) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }

        com.epicnerf.hibernate.model.User target = userRepository.findByUuid(targetUserUuid);
        if (target == null || target.getSuperAdmin()) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }

        if (!target.getHouse().getId().equals(caller.getHouse().getId())) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }

        userRepository.delete(target);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @Override
    public ResponseEntity<InitialData> houseRecoverGet(String recoverToken) {
        com.epicnerf.hibernate.model.House house = houseRepository.findByRecoverToken(recoverToken);
        if (house == null) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }

        com.epicnerf.hibernate.model.User user = createSuperAdminUser();
        house.getUsers().add(user);
        user.setHouse(house);
        houseRepository.save(house);

        InitialData data = new InitialData();
        data.setHouseRecoverToken(house.getRecoverToken());
        data.setUserToken(user.getToken());
        data.setUserUuid(user.getUuid());
        return ResponseEntity.ok(data);
    }

    @Override
    public ResponseEntity<Void> houseRemoveAdminGet(String token, String targetUserUuid) {
        com.epicnerf.hibernate.model.User caller = userRepository.findByToken(token);
        if (caller == null || !caller.getAdmin()) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }

        com.epicnerf.hibernate.model.User target = userRepository.findByUuid(targetUserUuid);
        if (target == null || target.getSuperAdmin()) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }

        if (!target.getHouse().getId().equals(caller.getHouse().getId())) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }

        target.setAdmin(false);
        userRepository.save(target);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @Override
    public ResponseEntity<String> houseResetInviteLinkGet(String token) {
        com.epicnerf.hibernate.model.User caller = userRepository.findByToken(token);
        if (caller == null || !caller.getAdmin()) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }

        caller.getHouse().setJoinToken(UUID.randomUUID().toString());
        houseRepository.save(caller.getHouse());
        return ResponseEntity.ok(caller.getHouse().getJoinToken());
    }

    @Override
    public ResponseEntity<House> houseSyncPost(String token, User user) {
        com.epicnerf.hibernate.model.User caller = userRepository.findByToken(token);
        if (caller == null) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }
        syncUser(caller, user);

        return ResponseEntity.ok(caller.getHouse().toApiModel(caller));
    }

    private void syncUser(com.epicnerf.hibernate.model.User userInDB, com.epicnerf.model.User userFromClient) {
        userInDB.getLocation().setX(userFromClient.getLocation().getX().floatValue());
        userInDB.getLocation().setY(userFromClient.getLocation().getY().floatValue());
        userInDB.getLocation().setRoomId(userInDB.getAccepted() ? userFromClient.getLocation().getRoomId() : 0); //he cannot leave lobby room
        userInDB.setModifyDate(new Date());
        userInDB.setGenericClientData(userFromClient.getGenericClientData());
        userRepository.save(userInDB);
    }
}
