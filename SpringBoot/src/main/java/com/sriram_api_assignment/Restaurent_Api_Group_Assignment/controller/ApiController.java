package com.sriram_api_assignment.Restaurent_Api_Group_Assignment.controller;


import com.sriram_api_assignment.Restaurent_Api_Group_Assignment.exception.ResourceNotFoundException;
import com.sriram_api_assignment.Restaurent_Api_Group_Assignment.models.*;
import com.sriram_api_assignment.Restaurent_Api_Group_Assignment.service.CustomerServiceInterface;
import org.springframework.http.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;



import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/customer")
public class ApiController {

    @Autowired
    CustomerServiceInterface customerServiceInterface;

    @GetMapping("/")
    public ResponseEntity<List<Customer>> getAllCustomers() {
        List<Customer> customers = customerServiceInterface.getAllCustomers();
        return new ResponseEntity<>(customers, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Customer> getCustomerById(@PathVariable Integer id) {
        return customerServiceInterface.getCustomerById(id)
                .map(customer -> new ResponseEntity<>(customer, HttpStatus.OK))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "customer not found"));
    }

    @GetMapping("/orders")
    public ResponseEntity<List<Restaurant_Order>> getAllRestaurantOrder() {
        List<Restaurant_Order> restaurantOrder = customerServiceInterface.getAllRestaurantOrder();
        return new ResponseEntity<>(restaurantOrder, HttpStatus.OK);
    }


    @GetMapping("/status/{orderId}")
    public String getOrderStatus(@PathVariable Integer orderId) {
        return customerServiceInterface.getOrderStatusById(orderId);
    }


    @PutMapping("/{id}")
    public ResponseEntity<Customer> updateCustomer(@PathVariable Integer id, @RequestBody Customer customerDetails) {
        try {
            Customer updatedCustomer = customerServiceInterface.updateCustomer(id, customerDetails);
            return new ResponseEntity<>(updatedCustomer, HttpStatus.OK);
        } catch (ResourceNotFoundException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage());
        }
    }

    @GetMapping("/view-all-restaurant")
    public String getAllRestaurants() {
        return customerServiceInterface.getAlRestaurants();
    }

    @PostMapping("/filter-restaurant")
    public List<Map<String, Object>> getFilteredMenu(@RequestBody Map<String, Object> filters) {
        return customerServiceInterface.getFilteredMenu(filters);
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteCustomerById(@PathVariable Integer id) {
        try {
            customerServiceInterface.deleteCustomerById(id);
            return new ResponseEntity<>("Customer deleted successfully", HttpStatus.OK);
        } catch (ResourceNotFoundException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage());
        }
    }


    @PostMapping("/")
    public ResponseEntity<Customer> addCustomer(@RequestBody Customer customer) {
        Customer savedCustomer = customerServiceInterface.addCustomer(customer);
        return new ResponseEntity<>(savedCustomer, HttpStatus.CREATED);
    }

    @PostMapping("/create-restaurant-order")
    public ResponseEntity<Restaurant_Order> createNewOrder(@RequestBody Restaurant_Order restaurantOrder) {
        System.out.println(restaurantOrder);

        Restaurant_Order newOrder = customerServiceInterface.createNewRestaurantOrder(restaurantOrder);
        return new ResponseEntity<>(newOrder, HttpStatus.CREATED);
    }

    @DeleteMapping("/order/{orderId}")
    public String cancelOrder(@PathVariable Integer orderId) {
        return customerServiceInterface.deleteOrderIfPending(orderId);
    }
    @GetMapping("/order-history/{customerId}")
    public ResponseEntity<List<Restaurant_Order>> getOrderHistoryByCustomerId(@PathVariable Integer customerId) {
        List<Restaurant_Order> orders = customerServiceInterface.getOrderHistoryByCustomerId(customerId);

        if (orders.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        return new ResponseEntity<>(orders, HttpStatus.OK);
    }

}




