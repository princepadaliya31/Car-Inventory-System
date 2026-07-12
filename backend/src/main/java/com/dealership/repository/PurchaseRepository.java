package com.dealership.repository;

import com.dealership.model.Purchase;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PurchaseRepository extends MongoRepository<Purchase, String> {
    List<Purchase> findByUserId(String userId);
}
