package ru.gamesphere.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import ru.gamesphere.entity.EmailNotification;
import ru.gamesphere.enums.NotificationStatus;
import ru.gamesphere.enums.NotificationTemplate;

import java.util.UUID;

public interface EmailNotificationRepository extends JpaRepository<EmailNotification, UUID> {

    @Query("SELECT n FROM EmailNotification n WHERE " +
            "(:status IS NULL OR n.status = :status) " +
            "AND (:template IS NULL OR n.template = :template)")
    Page<EmailNotification> findWithFilters(
            @Param("status") NotificationStatus status,
            @Param("template") NotificationTemplate template,
            Pageable pageable);
}
