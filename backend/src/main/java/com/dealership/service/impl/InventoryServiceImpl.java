package com.dealership.service.impl;

import com.dealership.exception.BadRequestException;
import com.dealership.exception.ResourceNotFoundException;
import com.dealership.model.Purchase;
import com.dealership.model.User;
import com.dealership.model.Vehicle;
import com.dealership.repository.PurchaseRepository;
import com.dealership.repository.UserRepository;
import com.dealership.repository.VehicleRepository;
import com.dealership.service.InventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class InventoryServiceImpl implements InventoryService {

    private final VehicleRepository vehicleRepository;
    private final UserRepository userRepository;
    private final PurchaseRepository purchaseRepository;

    @Override
    public Purchase purchaseVehicle(String vehicleId, String userEmail, Integer quantity) {
        if (quantity == null || quantity <= 0) {
            throw new BadRequestException("Quantity must be greater than zero");
        }

        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with id: " + vehicleId));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + userEmail));

        if (vehicle.getQuantity() < quantity) {
            throw new BadRequestException("Insufficient stock available for purchase. Requested: " + quantity + ", Available: " + vehicle.getQuantity());
        }

        // Reduce stock
        vehicle.setQuantity(vehicle.getQuantity() - quantity);
        vehicleRepository.save(vehicle);

        // Record purchase
        Purchase purchase = Purchase.builder()
                .userId(user.getId())
                .vehicleId(vehicle.getId())
                .quantity(quantity)
                .purchasedAt(LocalDateTime.now())
                .build();

        return purchaseRepository.save(purchase);
    }

    @Override
    public Vehicle restockVehicle(String vehicleId, Integer quantity) {
        if (quantity == null || quantity <= 0) {
            throw new BadRequestException("Restock quantity must be greater than zero");
        }

        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with id: " + vehicleId));

        vehicle.setQuantity(vehicle.getQuantity() + quantity);
        return vehicleRepository.save(vehicle);
    }
}
