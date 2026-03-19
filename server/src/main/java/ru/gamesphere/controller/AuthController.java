package ru.gamesphere.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import ru.gamesphere.config.JwtConfig;
import ru.gamesphere.dto.request.LoginRequest;
import ru.gamesphere.dto.request.RegisterRequest;
import ru.gamesphere.dto.response.ApiResponse;
import ru.gamesphere.dto.response.AuthResponse;
import ru.gamesphere.dto.response.UserResponse;
import ru.gamesphere.service.AuthService;
import ru.gamesphere.service.UserService;

import java.util.Arrays;

@Tag(name = "Auth", description = "Регистрация и авторизация")
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final UserService userService;
    private final JwtConfig jwtConfig;

    @Operation(summary = "Регистрация нового пользователя", operationId = "registerUser")
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(
            @Valid @RequestBody RegisterRequest request,
            HttpServletResponse response) {
        AuthResponse authResponse = authService.register(request);
        setTokenCookies(response, authResponse);
        authResponse.clearTokens();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Регистрация прошла успешно. Проверьте почту.", authResponse));
    }

    @Operation(summary = "Авторизация пользователя", operationId = "loginUser")
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletResponse response) {
        AuthResponse authResponse = authService.login(request);
        setTokenCookies(response, authResponse);
        authResponse.clearTokens();
        return ResponseEntity.ok(ApiResponse.ok(authResponse));
    }

    @Operation(summary = "Обновление access-токена", operationId = "refreshToken")
    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<AuthResponse>> refresh(
            HttpServletRequest request,
            HttpServletResponse response) {
        String refreshToken = extractCookie(request, "refresh_token");
        if (refreshToken == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("INVALID_REFRESH_TOKEN", "Refresh-токен отсутствует"));
        }
        AuthResponse authResponse = authService.refreshByToken(refreshToken);
        setTokenCookies(response, authResponse);
        authResponse.clearTokens();
        return ResponseEntity.ok(ApiResponse.ok(authResponse));
    }

    @Operation(summary = "Текущий пользователь", operationId = "getCurrentAuthUser")
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> me(
            @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("UNAUTHORIZED", "Не авторизован"));
        }
        return ResponseEntity.ok(ApiResponse.ok(userService.getCurrentUser(userDetails.getUsername())));
    }

    @Operation(summary = "Выход из системы", operationId = "logoutUser")
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(
            @AuthenticationPrincipal UserDetails userDetails,
            HttpServletResponse response) {
        if (userDetails != null) {
            authService.logout(userDetails.getUsername());
        }
        clearTokenCookies(response);
        return ResponseEntity.ok(ApiResponse.ok("Вы успешно вышли из системы", null));
    }

    private void setTokenCookies(HttpServletResponse response, AuthResponse authResponse) {
        Cookie accessCookie = new Cookie("access_token", authResponse.getAccessToken());
        accessCookie.setHttpOnly(true);
        accessCookie.setSecure(false);
        accessCookie.setPath("/api/v1");
        accessCookie.setMaxAge((int) (jwtConfig.getAccessTokenExpirationMs() / 1000));

        Cookie refreshCookie = new Cookie("refresh_token", authResponse.getRefreshToken());
        refreshCookie.setHttpOnly(true);
        refreshCookie.setSecure(false);
        refreshCookie.setPath("/api/v1/auth");
        refreshCookie.setMaxAge((int) (jwtConfig.getRefreshTokenExpirationMs() / 1000));

        response.addCookie(accessCookie);
        response.addCookie(refreshCookie);
    }

    private void clearTokenCookies(HttpServletResponse response) {
        Cookie accessCookie = new Cookie("access_token", "");
        accessCookie.setHttpOnly(true);
        accessCookie.setPath("/api/v1");
        accessCookie.setMaxAge(0);

        Cookie refreshCookie = new Cookie("refresh_token", "");
        refreshCookie.setHttpOnly(true);
        refreshCookie.setPath("/api/v1/auth");
        refreshCookie.setMaxAge(0);

        response.addCookie(accessCookie);
        response.addCookie(refreshCookie);
    }

    private String extractCookie(HttpServletRequest request, String name) {
        if (request.getCookies() == null) return null;
        return Arrays.stream(request.getCookies())
                .filter(c -> name.equals(c.getName()))
                .map(Cookie::getValue)
                .findFirst()
                .orElse(null);
    }
}