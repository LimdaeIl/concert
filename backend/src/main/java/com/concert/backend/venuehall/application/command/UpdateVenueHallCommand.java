package com.concert.backend.venuehall.application.command;

public record UpdateVenueHallCommand(
        String name,
        String floor,
        Integer capacity
) {
}
