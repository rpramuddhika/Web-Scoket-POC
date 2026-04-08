package com.webScoket.server.scheduler;

import java.time.LocalTime;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.webScoket.server.entity.NotificationEntity;
import com.webScoket.server.service.NotificationService;

@Component
public class NotificationScheduler {

    private static final Logger log = LoggerFactory.getLogger(NotificationScheduler.class);

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    // Runs at the start of every minute (seconds=0)
    @Scheduled(cron = "0 * * * * *")
    public void checkAndSendNotification() {
        NotificationEntity notification = notificationService.getNotificationTime();

        if (notification == null
                || notification.getNotificationTime() == null
                || !Boolean.TRUE.equals(notification.getIsRemember())) {
            return;
        }

        LocalTime now = LocalTime.now().withSecond(0).withNano(0);
        LocalTime scheduled = notification.getNotificationTime().withSecond(0).withNano(0);

        if (now.equals(scheduled)) {
            log.info("Sending notification at {}", now);
            messagingTemplate.convertAndSend("/topic/notifications", notification);
        }
    }
}
