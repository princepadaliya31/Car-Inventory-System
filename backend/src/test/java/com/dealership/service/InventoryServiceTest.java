package com.dealership.service;

import com.dealership.exception.BadRequestException;
import com.dealership.model.Purchase;
import com.dealership.model.User;
import com.dealership.model.Vehicle;
import com.dealership.repository.PurchaseRepository;
import com.dealership.repository.UserRepository;
import com.dealership.repository.VehicleRepository;
import com.dealership.service.impl.InventoryServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@SuppressWarnings("null")
public class InventoryServiceTest {

    @Mock
    private VehicleRepository vehicleRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private PurchaseRepository purchaseRepository;

    private InventoryService inventoryService;

    @BeforeEach
    void setUp() {
        inventoryService = new InventoryServiceImpl(vehicleRepository, userRepository, purchaseRepository);
    }

    @Test
    void purchaseVehicle_Success() {
        String vehicleId = "vehicle123";
        String userEmail = "buyer@example.com";
        
        Vehicle vehicle = Vehicle.builder().id(vehicleId).quantity(10).price(20000.0).build();
        User user = User.builder().id("user123").email(userEmail).build();
        Purchase expectedPurchase = Purchase.builder().id("purchase123").userId("user123").vehicleId(vehicleId).quantity(2).build();

        when(vehicleRepository.findById(vehicleId)).thenReturn(Optional.of(vehicle));
        when(userRepository.findByEmail(userEmail)).thenReturn(Optional.of(user));
        when(purchaseRepository.save(any(Purchase.class))).thenReturn(expectedPurchase);

        Purchase result = inventoryService.purchaseVehicle(vehicleId, userEmail, 2);

        assertNotNull(result);
        assertEquals(8, vehicle.getQuantity()); // Stock reduced by 2
        verify(vehicleRepository, times(1)).save(vehicle);
        verify(purchaseRepository, times(1)).save(any(Purchase.class));
    }

    @Test
    void purchaseVehicle_ThrowsBadRequestException_ForInsufficientStock() {
        String vehicleId = "vehicle123";
        String userEmail = "buyer@example.com";
        
        Vehicle vehicle = Vehicle.builder().id(vehicleId).quantity(1).price(20000.0).build();
        User user = User.builder().id("user123").email(userEmail).build();

        when(vehicleRepository.findById(vehicleId)).thenReturn(Optional.of(vehicle));
        when(userRepository.findByEmail(userEmail)).thenReturn(Optional.of(user));

        assertThrows(BadRequestException.class, () -> inventoryService.purchaseVehicle(vehicleId, userEmail, 5));
        verify(vehicleRepository, never()).save(any(Vehicle.class));
        verify(purchaseRepository, never()).save(any(Purchase.class));
    }

    @Test
    void restockVehicle_Success() {
        String vehicleId = "vehicle123";
        Vehicle vehicle = Vehicle.builder().id(vehicleId).quantity(5).build();

        when(vehicleRepository.findById(vehicleId)).thenReturn(Optional.of(vehicle));
        when(vehicleRepository.save(vehicle)).thenReturn(vehicle);

        Vehicle result = inventoryService.restockVehicle(vehicleId, 10);

        assertNotNull(result);
        assertEquals(15, result.getQuantity()); // Stock increased by 10
        verify(vehicleRepository, times(1)).save(vehicle);
    }
}
