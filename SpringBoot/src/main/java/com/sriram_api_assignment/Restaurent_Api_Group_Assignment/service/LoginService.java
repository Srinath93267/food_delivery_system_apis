package com.sriram_api_assignment.Restaurent_Api_Group_Assignment.service;

import com.sriram_api_assignment.Restaurent_Api_Group_Assignment.dao.Customer_db_repo;
import com.sriram_api_assignment.Restaurent_Api_Group_Assignment.models.Customer;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class LoginService implements LoginServiceInterface {

    @Autowired
    Customer_db_repo customerDbRepo;

    @Autowired
    JwtTokenService jwtTokenService;

    @Autowired
    AuthenticationManager authenticationManager;

    private BCryptPasswordEncoder encoder=new BCryptPasswordEncoder(12);


    public Customer register(Customer customer){
        customer.setPassword(encoder.encode(customer.getPassword()));
        return customerDbRepo.save(customer);
    }

    @Override
    public String verify(Customer customer) {
        Authentication authentication= authenticationManager
                        .authenticate(new UsernamePasswordAuthenticationToken
                                (customer.getUsername(),customer.getPassword()));

        if(authentication.isAuthenticated()) return jwtTokenService.generateJwtToken(customer.getUsername());
        return "failed";

    }


}
