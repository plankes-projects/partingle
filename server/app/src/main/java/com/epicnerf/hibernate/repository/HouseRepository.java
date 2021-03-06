package com.epicnerf.hibernate.repository;

import com.epicnerf.hibernate.model.House;
import org.springframework.data.repository.CrudRepository;

public interface HouseRepository extends CrudRepository<House, Integer> {
    House findByJoinToken(String joinToken);

    House findByRecoverToken(String recoverToken);
}