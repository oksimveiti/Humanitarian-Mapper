package com.semihcetin.project.humapperbackend.auth;

import com.semihcetin.project.humapperbackend.user.UserRepository;
import com.semihcetin.project.humapperbackend.user.User;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.*;

import org.springframework.security.core.AuthenticationException;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository users;
    private final JwtService jwtService;
    private final AuthService authService;

    public AuthController(AuthenticationManager authenticationManager, UserRepository users, JwtService jwtService, AuthService authService) {
        this.authenticationManager = authenticationManager;
        this.users = users;
        this.jwtService = jwtService;
        this.authService = authService;
    }

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password())
        );

        User user = users.findByEmail(request.email()).orElseThrow();

        return new LoginResponse(jwtService.generateToken(user));
    }

    @PostMapping("/activate")
    @ResponseStatus(HttpStatus.OK)
    public void activate(@Valid @RequestBody ActivateRequest request) {
        authService.activate(request.token(), request.newPassword());
    }

    @ExceptionHandler(AuthenticationException.class)
    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    public void handleAuthFailure(){}
}
