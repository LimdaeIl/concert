package com.concert.backend.venuehall.application.command;

public record CreateVenueHallCommand(
        String name,
        String floor,
        Integer capacity
) {
}
