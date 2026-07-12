package com.dealership.service;

import com.dealership.dto.VehicleRequest;
import com.dealership.exception.ResourceNotFoundException;
import com.dealership.model.Vehicle;
import com.dealership.repository.VehicleRepository;
import com.dealership.service.impl.VehicleServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Query;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@SuppressWarnings("null")
public class VehicleServiceTest {

    @Mock
    private VehicleRepository vehicleRepository;

    @Mock
    private MongoTemplate mongoTemplate;

    private VehicleService vehicleService;

    @BeforeEach
    void setUp() {
        vehicleService = new VehicleServiceImpl(vehicleRepository, mongoTemplate);
    }

    @Test
    void addVehicle_Success() {
        VehicleRequest request = new VehicleRequest("Tesla", "Model S", "Electric", 80000.0, 5);
        Vehicle vehicle = Vehicle.builder()
                .id("vehicleId123")
                .make("Tesla")
                .model("Model S")
                .category("Electric")
                .price(80000.0)
                .quantity(5)
                .build();
        
        when(vehicleRepository.save(any(Vehicle.class))).thenReturn(vehicle);
        
        Vehicle result = vehicleService.addVehicle(request);
        
        assertNotNull(result);
        assertEquals("Tesla", result.getMake());
        assertEquals(80000.0, result.getPrice());
        verify(vehicleRepository, times(1)).save(any(Vehicle.class));
    }

    @Test
    void getVehicleById_Success() {
        Vehicle vehicle = Vehicle.builder().id("id123").make("Toyota").build();
        
        when(vehicleRepository.findById("id123")).thenReturn(Optional.of(vehicle));
        
        Vehicle result = vehicleService.getVehicleById("id123");
        
        assertNotNull(result);
        assertEquals("Toyota", result.getMake());
    }

    @Test
    void getVehicleById_ThrowsResourceNotFoundException() {
        when(vehicleRepository.findById("invalid")).thenReturn(Optional.empty());
        
        assertThrows(ResourceNotFoundException.class, () -> vehicleService.getVehicleById("invalid"));
    }

    @Test
    void searchVehicles_Success() {
        Vehicle vehicle = Vehicle.builder().make("Honda").model("Civic").price(25000.0).build();
        List<Vehicle> expectedList = Collections.singletonList(vehicle);
        
        when(mongoTemplate.find(any(Query.class), eq(Vehicle.class))).thenReturn(expectedList);
        
        List<Vehicle> result = vehicleService.searchVehicles("Honda", "Civic", null, null, null, null);
        
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("Honda", result.get(0).getMake());
    }
}
