package ru.gamesphere.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.gamesphere.dto.response.NotificationResponse;
import ru.gamesphere.entity.Booking;
import ru.gamesphere.entity.EmailNotification;
import ru.gamesphere.entity.User;
import ru.gamesphere.enums.NotificationStatus;
import ru.gamesphere.enums.NotificationTemplate;
import ru.gamesphere.exception.BadRequestException;
import ru.gamesphere.exception.ResourceNotFoundException;
import ru.gamesphere.mapper.NotificationMapper;
import ru.gamesphere.repository.EmailNotificationRepository;

import java.time.Instant;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final EmailNotificationRepository emailNotificationRepository;
    private final JavaMailSender mailSender;
    private final NotificationMapper notificationMapper;

    @Lazy @Autowired
    private NotificationService self;

    public Page<NotificationResponse> getNotifications(NotificationStatus status,
                                                        NotificationTemplate template,
                                                        Pageable pageable) {
        return emailNotificationRepository.findWithFilters(status, template, pageable)
                .map(notificationMapper::toNotificationResponse);
    }

    @Transactional
    public void sendAsync(Booking booking, User user, NotificationTemplate template) {
        EmailNotification notification = EmailNotification.builder()
                .booking(booking)
                .user(user)
                .template(template)
                .build();
        notification = emailNotificationRepository.save(notification);
        final UUID notificationId = notification.getId();
        org.springframework.transaction.support.TransactionSynchronizationManager
                .registerSynchronization(new org.springframework.transaction.support.TransactionSynchronization() {
                    @Override
                    public void afterCommit() {
                        self.sendEmailAsync(notificationId);
                    }
                });
    }

    @Async
    @Transactional
    public void sendEmailAsync(UUID notificationId) {
        emailNotificationRepository.findById(notificationId).ifPresent(this::doSend);
    }

    @Transactional
    public NotificationResponse retryNotification(UUID id) {
        EmailNotification notification = emailNotificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", id));

        if (notification.getStatus() == NotificationStatus.SENT) {
            throw new BadRequestException("ALREADY_SENT", "Уведомление уже было успешно отправлено");
        }

        notification.setStatus(NotificationStatus.QUEUED);
        notification = emailNotificationRepository.save(notification);

        doSend(notification);

        return notificationMapper.toNotificationResponse(notification);
    }

    private void doSend(EmailNotification notification) {
        try {
            String recipientEmail = notification.getUser() != null ? notification.getUser().getEmail() : null;
            if (recipientEmail == null) {
                log.warn("Cannot send notification {}: no user email", notification.getId());
                notification.setStatus(NotificationStatus.FAILED);
                emailNotificationRepository.save(notification);
                return;
            }

            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(recipientEmail);
            message.setSubject(getSubject(notification.getTemplate()));
            message.setText(getBody(notification.getTemplate()));
            mailSender.send(message);

            notification.setStatus(NotificationStatus.SENT);
            notification.setSentAt(Instant.now());
        } catch (Exception e) {
            log.error("Failed to send notification {}: {}", notification.getId(), e.getMessage());
            notification.setStatus(NotificationStatus.FAILED);
        }
        emailNotificationRepository.save(notification);
    }

    private String getSubject(NotificationTemplate template) {
        return switch (template) {
            case WELCOME -> "Добро пожаловать в GameSphere!";
            case BOOKING_CREATED -> "Бронирование подтверждено — GameSphere";
            case BOOKING_CANCELLED -> "Бронирование отменено — GameSphere";
            case REMINDER_24H -> "Напоминание о бронировании — GameSphere";
        };
    }

    private String getBody(NotificationTemplate template) {
        return switch (template) {
            case WELCOME -> "Спасибо за регистрацию в GameSphere! Ждём вас в нашем клубе настольных игр.";
            case BOOKING_CREATED -> "Ваше бронирование успешно создано. Ждём вас!";
            case BOOKING_CANCELLED -> "Ваше бронирование было отменено.";
            case REMINDER_24H -> "Напоминаем, что завтра у вас бронирование в GameSphere.";
        };
    }
}