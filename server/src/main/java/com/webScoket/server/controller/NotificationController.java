package com.webScoket.server.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.webScoket.server.dto.NotificationUpdateRequest;
import com.webScoket.server.entity.NotificationEntity;
import com.webScoket.server.service.NotificationService;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/api/notifications")
public class NotificationController {
    
    @Autowired
    private NotificationService notificationService;
    
    @GetMapping
    public ResponseEntity<?> getNotificationTime() {
        NotificationEntity notification = notificationService.getNotificationTime();
        if (notification == null) {
            return ResponseEntity.ok().body(new Object() {
                public String message = "No notification time set";
            });
        }
        return ResponseEntity.ok(notification);
    }
    
    @PutMapping
    public ResponseEntity<NotificationEntity> updateNotificationTime(
            @RequestBody NotificationUpdateRequest request) {
        NotificationEntity updated = notificationService.updateNotificationTime(
            request.getNotificationTime(),
            request.getIsRemember()
        );
        return ResponseEntity.ok(updated);
    }
    
}
