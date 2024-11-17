package com.sriram_api_assignment.Restaurent_Api_Group_Assignment.models;

import jakarta.persistence.*;
import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Table(name="Customer")
@Entity
public class Customer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    private String name;
    private String address;
    private String phone;
    private String email;
    private String pincode;
    private String cardNumber;
    private String password;
    private String username;
}
