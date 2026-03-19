package ru.gamesphere.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.gamesphere.config.JwtConfig;
import ru.gamesphere.dto.request.LoginRequest;
import ru.gamesphere.dto.request.RefreshTokenRequest;
import ru.gamesphere.dto.request.RegisterRequest;
import ru.gamesphere.dto.response.AuthResponse;
import ru.gamesphere.entity.RefreshToken;
import ru.gamesphere.entity.User;
import ru.gamesphere.enums.NotificationTemplate;
import ru.gamesphere.enums.Role;
import ru.gamesphere.exception.BadRequestException;
import ru.gamesphere.exception.ConflictException;
import ru.gamesphere.mapper.UserMapper;
import ru.gamesphere.repository.RefreshTokenRepository;
import ru.gamesphere.repository.UserRepository;
import ru.gamesphere.security.JwtTokenProvider;

import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final JwtConfig jwtConfig;
    private final NotificationService notificationService;
    private final UserMapper userMapper;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (!request.getPassword().equals(request.getPasswordConfirmation())) {
            throw new BadRequestException("VALIDATION_ERROR", "Пароли не совпадают");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ConflictException("EMAIL_ALREADY_EXISTS", "Пользователь с таким email уже существует.");
        }

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(Role.PLAYER)
                .build();
        user = userRepository.save(user);

        notificationService.sendAsync(null, user, NotificationTemplate.WELCOME);

        String accessToken = jwtTokenProvider.generateAccessToken(user.getEmail());
        String refreshToken = createRefreshToken(user).getToken();

        return buildAuthResponse(accessToken, refreshToken, user);
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

        User user = userRepository.findByEmail(request.getEmail()).orElseThrow();

        String accessToken = jwtTokenProvider.generateAccessToken(authentication);
        String refreshToken = createRefreshToken(user).getToken();

        return buildAuthResponse(accessToken, refreshToken, user);
    }

    @Transactional
    public AuthResponse refresh(RefreshTokenRequest request) {
        return refreshByToken(request.getRefreshToken());
    }

    @Transactional
    public AuthResponse refreshByToken(String token) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(token)
                .orElseThrow(() -> new BadRequestException("INVALID_REFRESH_TOKEN", "Refresh-токен недействителен или истёк"));

        if (refreshToken.getExpiresAt().isBefore(Instant.now())) {
            refreshTokenRepository.delete(refreshToken);
            throw new BadRequestException("INVALID_REFRESH_TOKEN", "Refresh-токен недействителен или истёк");
        }

        User user = refreshToken.getUser();
        refreshTokenRepository.delete(refreshToken);

        String newAccessToken = jwtTokenProvider.generateAccessToken(user.getEmail());
        String newRefreshToken = createRefreshToken(user).getToken();

        return buildAuthResponse(newAccessToken, newRefreshToken, user);
    }

    @Transactional
    public void logout(String email) {
        userRepository.findByEmail(email)
                .ifPresent(user -> refreshTokenRepository.deleteAllByUserId(user.getId()));
    }

    private RefreshToken createRefreshToken(User user) {
        RefreshToken refreshToken = RefreshToken.builder()
                .user(user)
                .token(UUID.randomUUID().toString())
                .expiresAt(Instant.now().plusMillis(jwtConfig.getRefreshTokenExpirationMs()))
                .build();
        return refreshTokenRepository.save(refreshToken);
    }

    private AuthResponse buildAuthResponse(String accessToken, String refreshToken, User user) {
        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(jwtConfig.getAccessTokenExpirationMs() / 1000)
                .user(userMapper.toUserResponse(user))
                .build();
    }
}
