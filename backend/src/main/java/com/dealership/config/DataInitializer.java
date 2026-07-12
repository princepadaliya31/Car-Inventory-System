package com.dealership.config;

import com.dealership.model.Vehicle;
import com.dealership.repository.VehicleRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private final VehicleRepository vehicleRepository;

    public DataInitializer(VehicleRepository vehicleRepository) {
        this.vehicleRepository = vehicleRepository;
    }

    @Override
    @SuppressWarnings("null")
    public void run(String... args) throws Exception {
        // Clear existing vehicles to seed exactly 12 Indian vehicles permanently
        vehicleRepository.deleteAll();

        List<Vehicle> initialVehicles = Arrays.asList(
            Vehicle.builder()
                .make("Mahindra")
                .model("Thar")
                .category("SUV")
                .price(18500.0)
                .quantity(5)
                .color("Red Rage")
                .year(2024)
                .mileage(0)
                .unsplashId("https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Mahindra_Thar.jpg/1280px-Mahindra_Thar.jpg")
                .createdAt(LocalDateTime.now())
                .build(),
            Vehicle.builder()
                .make("Tata")
                .model("Safari")
                .category("SUV")
                .price(25000.0)
                .quantity(3)
                .color("Orcus White")
                .year(2024)
                .mileage(1200)
                .unsplashId("https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/Tata_Safari_II_front_-_PSM_2009.jpg/1280px-Tata_Safari_II_front_-_PSM_2009.jpg")
                .createdAt(LocalDateTime.now())
                .build(),
            Vehicle.builder()
                .make("Maruti Suzuki")
                .model("Swift")
                .category("Sedan")
                .price(9500.0)
                .quantity(10)
                .color("Fire Red")
                .year(2023)
                .mileage(4500)
                .unsplashId("https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/2021_Suzuki_Swift_Sport_1.4_AT_red_front_view_in_Brunei.jpg/1280px-2021_Suzuki_Swift_Sport_1.4_AT_red_front_view_in_Brunei.jpg")
                .createdAt(LocalDateTime.now())
                .build(),
            Vehicle.builder()
                .make("Hyundai")
                .model("Creta")
                .category("SUV")
                .price(16500.0)
                .quantity(8)
                .color("Phantom Black")
                .year(2024)
                .mileage(0)
                .unsplashId("https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/2024_Hyundai_Creta_1.5_MPi_SX%28O%29_%28India%29_front_view.png/1280px-2024_Hyundai_Creta_1.5_MPi_SX%28O%29_%28India%29_front_view.png")
                .createdAt(LocalDateTime.now())
                .build(),
            Vehicle.builder()
                .make("Honda")
                .model("City")
                .category("Sedan")
                .price(17000.0)
                .quantity(4)
                .color("Radiant Red")
                .year(2024)
                .mileage(0)
                .unsplashId("https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/2018_Honda_City_1.5_VX_Navi_in_Ruby_Red_Pearl%2C_08-09-2024.jpg/1280px-2018_Honda_City_1.5_VX_Navi_in_Ruby_Red_Pearl%2C_08-09-2024.jpg")
                .createdAt(LocalDateTime.now())
                .build(),
            Vehicle.builder()
                .make("Toyota")
                .model("Fortuner")
                .category("SUV")
                .price(42000.0)
                .quantity(2)
                .color("Super White")
                .year(2023)
                .mileage(15000)
                .unsplashId("https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/2022_Toyota_Fortuner_2.8_Legender_4WD_60th_Anniversary.jpg/1280px-2022_Toyota_Fortuner_2.8_Legender_4WD_60th_Anniversary.jpg")
                .createdAt(LocalDateTime.now())
                .build(),
            Vehicle.builder()
                .make("Tata")
                .model("Nexon EV")
                .category("Electric")
                .price(19500.0)
                .quantity(6)
                .color("Teal Blue")
                .year(2024)
                .mileage(0)
                .unsplashId("https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/2020_Tata_Nexon_EV_%28India%29_front_view.png/1280px-2020_Tata_Nexon_EV_%28India%29_front_view.png")
                .createdAt(LocalDateTime.now())
                .build(),
            Vehicle.builder()
                .make("Mahindra")
                .model("XUV700")
                .category("SUV")
                .price(26000.0)
                .quantity(3)
                .color("Midnight Black")
                .year(2024)
                .mileage(0)
                .unsplashId("https://upload.wikimedia.org/wikipedia/commons/f/ff/A_black_Mahindra_XUV700_SUV_in_Ashiana_Brahmananda%2C_Jamshedpur%2C_India_%28Ank_Kumar%2C_Infosys_Limited%29_03.jpg")
                .createdAt(LocalDateTime.now())
                .build(),
            Vehicle.builder()
                .make("Kia")
                .model("Seltos")
                .category("SUV")
                .price(18000.0)
                .quantity(7)
                .color("Intense Red")
                .year(2024)
                .mileage(100)
                .unsplashId("https://upload.wikimedia.org/wikipedia/commons/thumb/1/16/Kia_Seltos.jpg/1280px-Kia_Seltos.jpg")
                .createdAt(LocalDateTime.now())
                .build(),
            Vehicle.builder()
                .make("Maruti Suzuki")
                .model("Baleno")
                .category("Coupe")
                .price(11000.0)
                .quantity(9)
                .color("Nexa Blue")
                .year(2023)
                .mileage(8900)
                .unsplashId("https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/2022_Maruti_Suzuki_Baleno_Alpha_%28India%29_front_view_02.jpg/1280px-2022_Maruti_Suzuki_Baleno_Alpha_%28India%29_front_view_02.jpg")
                .createdAt(LocalDateTime.now())
                .build(),
            Vehicle.builder()
                .make("Hyundai")
                .model("i20 N Line")
                .category("Sports")
                .price(14500.0)
                .quantity(4)
                .color("Thunder Blue")
                .year(2024)
                .mileage(0)
                .unsplashId("https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Hyundai_i20_1.0_T-GDI_N_Line_%28III%2C_Facelift%29_%E2%80%93_f_01032025.jpg/1280px-Hyundai_i20_1.0_T-GDI_N_Line_%28III%2C_Facelift%29_%E2%80%93_f_01032025.jpg")
                .createdAt(LocalDateTime.now())
                .build(),
            Vehicle.builder()
                .make("Skoda")
                .model("Slavia")
                .category("Sedan")
                .price(15500.0)
                .quantity(5)
                .color("Crystal Blue")
                .year(2024)
                .mileage(0)
                .unsplashId("https://upload.wikimedia.org/wikipedia/commons/b/b5/2021_%C5%A0koda_Slavia_1.5_TSI_Style_%28India%29_front_view.png")
                .createdAt(LocalDateTime.now())
                .build()
        );

        vehicleRepository.saveAll(initialVehicles);
        System.out.println(">> Database initialized with 12 Indian Vehicles successfully!");
    }
}
