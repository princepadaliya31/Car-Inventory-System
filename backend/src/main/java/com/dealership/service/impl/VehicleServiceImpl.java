package com.dealership.service.impl;

import com.dealership.dto.VehicleRequest;
import com.dealership.exception.ResourceNotFoundException;
import com.dealership.model.Vehicle;
import com.dealership.repository.VehicleRepository;
import com.dealership.service.VehicleService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class VehicleServiceImpl implements VehicleService {

    private final VehicleRepository vehicleRepository;
    private final MongoTemplate mongoTemplate;

    @Override
    public Vehicle addVehicle(VehicleRequest request) {
        Vehicle vehicle = Vehicle.builder()
                .make(request.getMake())
                .model(request.getModel())
                .category(request.getCategory())
                .price(request.getPrice())
                .quantity(request.getQuantity())
                .color(request.getColor())
                .year(request.getYear())
                .mileage(request.getMileage())
                .unsplashId(request.getUnsplashId())
                .createdAt(LocalDateTime.now())
                .build();
        return vehicleRepository.save(vehicle);
    }

    @Override
    public List<Vehicle> getAllVehicles() {
        return vehicleRepository.findAll();
    }

    @Override
    public Vehicle getVehicleById(String id) {
        return vehicleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with id: " + id));
    }

    @Override
    public Vehicle updateVehicle(String id, VehicleRequest request) {
        Vehicle vehicle = getVehicleById(id);
        vehicle.setMake(request.getMake());
        vehicle.setModel(request.getModel());
        vehicle.setCategory(request.getCategory());
        vehicle.setPrice(request.getPrice());
        vehicle.setQuantity(request.getQuantity());
        vehicle.setColor(request.getColor());
        vehicle.setYear(request.getYear());
        vehicle.setMileage(request.getMileage());
        vehicle.setUnsplashId(request.getUnsplashId());
        return vehicleRepository.save(vehicle);
    }

    @Override
    public void deleteVehicle(String id) {
        Vehicle vehicle = getVehicleById(id);
        vehicleRepository.delete(vehicle);
    }

    @Override
    public List<Vehicle> searchVehicles(String make, String model, String category, Integer year, Double minPrice, Double maxPrice) {
        Query query = new Query();
        List<Criteria> criteriaList = new ArrayList<>();

        if (make != null && !make.trim().isEmpty()) {
            criteriaList.add(Criteria.where("make").regex(make.trim(), "i"));
        }
        if (model != null && !model.trim().isEmpty()) {
            criteriaList.add(Criteria.where("model").regex(model.trim(), "i"));
        }
        if (category != null && !category.trim().isEmpty()) {
            criteriaList.add(Criteria.where("category").regex(category.trim(), "i"));
        }
        if (year != null) {
            criteriaList.add(Criteria.where("year").is(year));
        }
        
        if (minPrice != null && maxPrice != null) {
            criteriaList.add(Criteria.where("price").gte(minPrice).lte(maxPrice));
        } else if (minPrice != null) {
            criteriaList.add(Criteria.where("price").gte(minPrice));
        } else if (maxPrice != null) {
            criteriaList.add(Criteria.where("price").lte(maxPrice));
        }

        if (!criteriaList.isEmpty()) {
            query.addCriteria(new Criteria().andOperator(criteriaList.toArray(new Criteria[0])));
        }

        return mongoTemplate.find(query, Vehicle.class);
    }
}
