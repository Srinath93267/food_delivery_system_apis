package com.sriram_api_assignment.Restaurent_Api_Group_Assignment.service;

import com.sriram_api_assignment.Restaurent_Api_Group_Assignment.models.Customer;
import com.sriram_api_assignment.Restaurent_Api_Group_Assignment.models.Restaurant_Order;

import java.util.List;
import java.util.Map;
import java.util.Optional;

public interface CustomerServiceInterface {
    Customer addCustomer(Customer customer);

    List<Customer> getAllCustomers();

    Optional<Customer> getCustomerById(Integer id);

    Restaurant_Order createNewRestaurantOrder(Restaurant_Order restaurantOrder);

    Customer updateCustomer(Integer id, Customer customerDetails);

    void deleteCustomerById(Integer id);

    List<Restaurant_Order> getAllRestaurantOrder();

    String deleteOrderIfPending(Integer orderId);

    String getOrderStatusById(Integer orderId);

    String getAlRestaurants();

    List<Map<String, Object>> getFilteredMenu(Map<String, Object> filters);

    List<Restaurant_Order> getOrderHistoryByCustomerId(Integer customerId);
}
