package ru.gamesphere.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import ru.gamesphere.dto.response.NotificationResponse;
import ru.gamesphere.entity.EmailNotification;

@Mapper(componentModel = "spring")
public interface NotificationMapper {

    @Mapping(source = "id", target = "notificationId")
    @Mapping(source = "booking.id", target = "bookingId")
    @Mapping(source = "user.id", target = "userId")
    NotificationResponse toNotificationResponse(EmailNotification notification);
}
