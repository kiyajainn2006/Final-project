package com.courtroom.simulation.models;

import lombok.Data;

@Data
public class ChatMessage {
    private String content;
    private String sender;
    private String role;
    private String type; // e.g., "CHAT", "EVIDENCE", "PHASE"
    private String roomId;
    private long timestamp;
}
