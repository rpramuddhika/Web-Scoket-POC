package com.webScoket.server.dto;

import java.time.LocalTime;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class NotificationUpdateRequest {
    private LocalTime notificationTime;
    private Boolean isRemember;
}
