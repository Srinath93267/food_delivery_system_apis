package com.sriram_api_assignment.Restaurent_Api_Group_Assignment.controller;

import com.sriram_api_assignment.Restaurent_Api_Group_Assignment.models.Customer;
import com.sriram_api_assignment.Restaurent_Api_Group_Assignment.service.LoginServiceInterface;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/customer")
public class LoginController {

    @Autowired
    LoginServiceInterface loginServiceInterface;

    @PostMapping("/register")
    public Customer register(@RequestBody Customer customer){
    return loginServiceInterface.register(customer);
    }

    @PostMapping("/login")
    public String login(@RequestBody Customer customer){return loginServiceInterface.verify(customer);}

}
