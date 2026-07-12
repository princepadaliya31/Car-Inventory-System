package com.dealership.service;

import com.dealership.model.Purchase;
import com.dealership.model.Vehicle;

public interface InventoryService {
    Purchase purchaseVehicle(String vehicleId, String userEmail, Integer quantity);
    Vehicle restockVehicle(String vehicleId, Integer quantity);
}
