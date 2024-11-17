package com.sriram_api_assignment.Restaurent_Api_Group_Assignment.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.sql.Timestamp;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "ORDER_DETAILS")
public class Restaurant_Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "OrderID")
    private Integer orderId;

    @Column(name = "CustomerID")
    private Integer customerId;

    @Column(name = "RestaurantID")
    private Integer restaurantId;

    @Column(name = "ZoneID")
    private Integer zoneId;

    @Column(name = "OrderDate")
    private Timestamp orderDate;

    @Column(name = "CustomerName")
    private String customerName;

    @Column(name = "TotalAmount")
    private Float totalAmount;

    @Column(name = "DeliveryAddress")
    private String deliveryAddress;

    @Column(name = "DeliveryFee")
    private Float deliveryFee;

    @Column(name = "PaymentMethod")
    private String paymentMethod;

    @Column(name = "OrderStatus")
    private String orderStatus;

    @Column(name = "Notes")
    private String notes;

    @Column(name = "Created")
    private Timestamp created;

    @Column(name = "LastUpdated")
    private Timestamp lastUpdated;
}
