package com.dealership.controller;

import com.dealership.model.Purchase;
import com.dealership.model.Vehicle;
import com.dealership.service.InventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/vehicles")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryService inventoryService;

    @PostMapping("/{id}/purchase")
    public ResponseEntity<Purchase> purchaseVehicle(
            @PathVariable String id,
            @RequestParam(defaultValue = "1") Integer quantity,
            Principal principal) {
        
        String email = principal.getName();
        Purchase purchase = inventoryService.purchaseVehicle(id, email, quantity);
        return ResponseEntity.ok(purchase);
    }

    @PostMapping("/{id}/restock")
    public ResponseEntity<Vehicle> restockVehicle(
            @PathVariable String id,
            @RequestParam Integer quantity) {
        
        Vehicle vehicle = inventoryService.restockVehicle(id, quantity);
        return ResponseEntity.ok(vehicle);
    }
}
