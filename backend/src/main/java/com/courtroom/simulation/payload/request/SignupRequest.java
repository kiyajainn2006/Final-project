package com.courtroom.simulation.payload.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SignupRequest {
    @NotBlank
    private String username;

    @NotBlank
    private String password;
    
    private String role; // e.g. "JUDGE", "PROSECUTOR"
}
