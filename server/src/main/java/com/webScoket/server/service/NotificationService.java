package com.webScoket.server.service;

import java.time.LocalTime;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.webScoket.server.entity.NotificationEntity;
import com.webScoket.server.repository.NotificationRepository;

@Service
public class NotificationService {
    
    @Autowired
    private NotificationRepository notificationRepository;
    
    public NotificationEntity getNotificationTime() {
        List<NotificationEntity> notifications = notificationRepository.findAll();
        if (notifications.isEmpty()) {
            return null;
        }
        return notifications.get(0);
    }
    

    public NotificationEntity updateNotificationTime(LocalTime time, Boolean isRemember) {
        List<NotificationEntity> existing = notificationRepository.findAll();
        
        NotificationEntity notification;
        if (existing.size() == 1) {
            // Update the existing one
            notification = existing.get(0);
            notification.setNotificationTime(time);
            notification.setIsRemember(isRemember);
        } else {
            // Delete all and create new
            notificationRepository.deleteAll();
            notification = new NotificationEntity();
            notification.setNotificationTime(time);
            notification.setIsRemember(isRemember);
        }
        
        return notificationRepository.save(notification);
    }
}
