package com.parking_reservation.service;

import com.parking_reservation.dto.request.LoginRequest;
import com.parking_reservation.dto.request.RegisterRequest;
import com.parking_reservation.dto.response.AuthResponse;
import com.parking_reservation.dto.response.UserResponse;
import com.parking_reservation.entity.Role;
import com.parking_reservation.entity.RoleType;
import com.parking_reservation.entity.User;
import com.parking_reservation.repository.RoleRepository;
import com.parking_reservation.repository.UserRepository;
import com.parking_reservation.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already registered");
        }

        Role userRole = roleRepository.findByName(RoleType.USER)
                .orElseGet(() -> roleRepository.save(new Role(RoleType.USER)));

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.getRoles().add(userRole);
        userRepository.save(user);

        return buildAuthResponse(user);
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));

        if (user.getPassword() == null) {
            throw new IllegalArgumentException("This account uses Google login. Please sign in with Google.");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Invalid email or password");
        }

        if (!user.isActive()) {
            throw new IllegalArgumentException("Account has been deactivated");
        }

        return buildAuthResponse(user);
    }

    private AuthResponse buildAuthResponse(User user) {
        String roles = user.getRoles().stream()
                .map(r -> r.getName().name())
                .collect(Collectors.joining(","));

        String token = jwtUtil.generateToken(user.getId(), user.getEmail(), roles);
        return new AuthResponse(token, UserResponse.from(user));
    }
}
