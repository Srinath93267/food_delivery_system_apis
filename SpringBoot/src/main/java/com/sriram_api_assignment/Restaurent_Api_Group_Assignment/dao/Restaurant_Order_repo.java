package com.sriram_api_assignment.Restaurent_Api_Group_Assignment.dao;

import com.sriram_api_assignment.Restaurent_Api_Group_Assignment.models.Restaurant_Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface Restaurant_Order_repo extends JpaRepository<Restaurant_Order,Integer> {
    List<Restaurant_Order> findByCustomerId(Integer customerId);
}
