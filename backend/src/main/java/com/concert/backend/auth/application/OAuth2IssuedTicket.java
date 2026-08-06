package com.concert.backend.auth.application;

public record OAuth2IssuedTicket(
        Type type,
        String value
) {

    public enum Type {
        LOGIN,
        SIGNUP
    }

    public static OAuth2IssuedTicket login(String value) {
        return new OAuth2IssuedTicket(Type.LOGIN, value);
    }

    public static OAuth2IssuedTicket signup(String value) {
        return new OAuth2IssuedTicket(Type.SIGNUP, value);
    }

    public boolean isLogin() {
        return type == Type.LOGIN;
    }
}
