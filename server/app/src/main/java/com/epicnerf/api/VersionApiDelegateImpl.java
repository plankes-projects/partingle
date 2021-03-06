package com.epicnerf.api;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

@Service
public class VersionApiDelegateImpl implements VersionApiDelegate {

    @Override
    public ResponseEntity<String> versionGet() {
        return  ResponseEntity.ok("0.0.1");
    }

}
