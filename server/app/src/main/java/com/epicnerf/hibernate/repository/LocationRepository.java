package com.epicnerf.hibernate.repository;

import com.epicnerf.hibernate.model.Location;
import org.springframework.data.repository.CrudRepository;

public interface LocationRepository extends CrudRepository<Location, Integer> {

}