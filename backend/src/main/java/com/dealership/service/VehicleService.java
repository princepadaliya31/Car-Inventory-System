package com.dealership.service;

import com.dealership.dto.VehicleRequest;
import com.dealership.model.Vehicle;

import java.util.List;

public interface VehicleService {
    Vehicle addVehicle(VehicleRequest request);
    List<Vehicle> getAllVehicles();
    Vehicle getVehicleById(String id);
    Vehicle updateVehicle(String id, VehicleRequest request);
    void deleteVehicle(String id);
    List<Vehicle> searchVehicles(String make, String model, String category, Integer year, Double minPrice, Double maxPrice);
}
