package com.dealership.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "vehicles")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Vehicle {
    @Id
    private String id;
    private String make;
    private String model;
    private String category;
    private Double price;
    private Integer quantity;
    private String color;
    private Integer year;
    private Integer mileage;
    private String unsplashId;
    private LocalDateTime createdAt;
}
