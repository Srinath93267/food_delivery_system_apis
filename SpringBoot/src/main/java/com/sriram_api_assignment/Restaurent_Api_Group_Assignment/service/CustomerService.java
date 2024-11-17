package com.sriram_api_assignment.Restaurent_Api_Group_Assignment.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sriram_api_assignment.Restaurent_Api_Group_Assignment.dao.Customer_db_repo;
import com.sriram_api_assignment.Restaurent_Api_Group_Assignment.dao.Restaurant_Order_repo;
import com.sriram_api_assignment.Restaurent_Api_Group_Assignment.exception.ResourceNotFoundException;
import com.sriram_api_assignment.Restaurent_Api_Group_Assignment.models.Customer;
import com.sriram_api_assignment.Restaurent_Api_Group_Assignment.models.Restaurant_Order;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.jdbc.core.JdbcTemplate;

import java.util.*;

@Service
public class CustomerService implements CustomerServiceInterface {
    @Autowired
    Customer_db_repo customerDbRepo;
    @Autowired
    Restaurant_Order_repo restaurantOrderRepo;
    @Autowired
    JdbcTemplate jdbcTemplate;

    @Override
    public Customer addCustomer(Customer customer) {
        return customerDbRepo.save(customer);
    }

    @Override
    public List<Customer> getAllCustomers() {
        return customerDbRepo.findAll();
    }

    @Override
    public Optional<Customer> getCustomerById(Integer id) {
        return customerDbRepo.findById(id);
    }

    @Override
    public Restaurant_Order createNewRestaurantOrder(Restaurant_Order restaurantOrder) {
        return restaurantOrderRepo.save(restaurantOrder);
    }

    @Override
    public Customer updateCustomer(Integer id, Customer customerDetails) {
        Customer customer = customerDbRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + id));
        customer.setName(customerDetails.getName());
        customer.setAddress(customerDetails.getAddress());
        customer.setPhone(customerDetails.getPhone());
        customer.setEmail(customerDetails.getEmail());
        customer.setPincode(customerDetails.getPincode());
        customer.setCardNumber(customerDetails.getCardNumber());
        return customerDbRepo.save(customer);
    }

    @Override
    public void deleteCustomerById(Integer id) {
        Customer customer = customerDbRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + id));
        customerDbRepo.delete(customer);
    }

    @Override
    public List<Restaurant_Order> getAllRestaurantOrder() {
        return restaurantOrderRepo.findAll();
    }

    @Override
    public String deleteOrderIfPending(Integer orderId) {
        Optional<Restaurant_Order> orderOpt = restaurantOrderRepo.findById(orderId);
        if (orderOpt.isPresent()) {
            Restaurant_Order order = orderOpt.get();
            if ("Pending".equalsIgnoreCase(order.getOrderStatus()) || order.getOrderStatus() == null || order.getOrderStatus().equals("")) {
                // Proceed with deletion
                restaurantOrderRepo.delete(order);
                return "Order with ID " + orderId + " has been cancelled successfully.";
            } else {
                return "Cannot cancel the order, as the restaurant accepted the order.";
            }
        } else {
            return "Order not found.";
        }
    }

    @Override
    public String getOrderStatusById(Integer orderId) {
        Optional<Restaurant_Order> order = restaurantOrderRepo.findById(orderId);

        if (order.isPresent()) {
            String restaurant_payload = "Restaurant Status : " + order.get().getOrderStatus();
            String sql = "SELECT OrderStatus FROM DELIVERYORDERS WHERE orderid = ?";
            Map<String, Object> result = jdbcTemplate.queryForMap(sql, orderId);
            if (result != null && !result.isEmpty()) {
                String orderStatus = (String) result.get("OrderStatus");
                return restaurant_payload + " \ndeliveryStatus : " + orderStatus;
            } else {
                return restaurant_payload + "\nDelivery Not yet assigned for Order ID: " + orderId + "\" }";
            }
        } else {

            return "No Order exists with ID: " + orderId;
        }
    }

    @Override
    public String getAlRestaurants() {
        String sql = "SELECT RestaurantID, RestaurantName FROM RESTAURANTS";
        List<Map<String, Object>> results = jdbcTemplate.queryForList(sql);

        if (results != null && !results.isEmpty()) {
            try {
                ObjectMapper objectMapper = new ObjectMapper();
                return objectMapper.writeValueAsString(results); // Convert list to JSON string
            } catch (Exception e) {
                return "Error converting results to JSON: " + e.getMessage();
            }
        } else {
            return "Cannot fetch any restaurants at the moment.";
        }
    }

    @Override
    public List<Map<String, Object>> getFilteredMenu(Map<String, Object> filters) {
        StringBuilder sql = new StringBuilder(
                "SELECT TOP (1000) [SNo], [RestaurantID], [RestaurantName], [FoodID], [FoodName], " +
                        "[Description], [Price], [Type], [Availability], [Created], [LastUpdated] " +
                        "FROM [dbo].[MENU] WHERE 1=1"
        );

        List<Object> parameters = new ArrayList<>();

        // Normalize keys to lowercase for consistent matching
        Map<String, Object> normalizedFilters = new HashMap<>();
        filters.forEach((key, value) -> normalizedFilters.put(key.toLowerCase(), value));

        // Apply filters based on normalized keys
        if (normalizedFilters.containsKey("restaurantname") && normalizedFilters.get("restaurantname") != null) {
            sql.append(" AND RestaurantName = ?");
            parameters.add(normalizedFilters.get("restaurantname"));
        }
        if (normalizedFilters.containsKey("restaurantid") && normalizedFilters.get("restaurantid") != null) {
            sql.append(" AND RestaurantID = ?");
            parameters.add(normalizedFilters.get("restaurantid"));
        }
        if (normalizedFilters.containsKey("foodname") && normalizedFilters.get("foodname") != null) {
            sql.append(" AND FoodName LIKE ?");
            parameters.add("%" + normalizedFilters.get("foodname") + "%");
        }
        if (normalizedFilters.containsKey("type") && normalizedFilters.get("type") != null) {
            sql.append(" AND Type = ?");
            parameters.add(normalizedFilters.get("type"));
        }
        if (normalizedFilters.containsKey("price") && normalizedFilters.get("price") != null) {
            sql.append(" AND Price <= ?");
            parameters.add(normalizedFilters.get("price"));
        }

        if (normalizedFilters.containsKey("availability") && normalizedFilters.get("availability") != null) {
            sql.append(" AND UPPER(Availability) = UPPER(?)");
            parameters.add(normalizedFilters.get("availability"));
        }

        return jdbcTemplate.queryForList(sql.toString(), parameters.toArray());
    }

    public List<Restaurant_Order> getOrderHistoryByCustomerId(Integer customerId) {

        return restaurantOrderRepo.findByCustomerId(customerId);
    }
}


