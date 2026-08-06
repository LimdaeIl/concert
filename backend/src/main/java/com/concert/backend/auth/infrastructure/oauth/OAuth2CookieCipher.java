package com.concert.backend.auth.infrastructure.oauth;

import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.SecureRandom;
import java.util.Base64;
import javax.crypto.Cipher;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.stereotype.Component;

@Component
public class OAuth2CookieCipher {

    private static final String ALGORITHM = "AES/GCM/NoPadding";
    private static final String KEY_ALGORITHM = "AES";

    private static final int IV_LENGTH_BYTES = 12;
    private static final int AUTH_TAG_LENGTH_BITS = 128;
    private static final byte FORMAT_VERSION = 1;

    private final SecretKey secretKey;
    private final SecureRandom secureRandom;
    private final byte[] associatedData;

    public OAuth2CookieCipher(OAuth2CookieProperties properties) {
        byte[] keyBytes = Base64.getDecoder()
                .decode(properties.encryptionKey());

        this.secretKey = new SecretKeySpec(keyBytes, KEY_ALGORITHM);
        this.secureRandom = new SecureRandom();

        /*
         * 암호문을 이 쿠키 용도에 바인딩한다.
         * 동일한 키가 다른 용도에 실수로 사용돼도 암호문을 재사용하기 어렵게 한다.
         */
        this.associatedData = properties.name()
                .getBytes(StandardCharsets.UTF_8);
    }

    public String encrypt(byte[] plainText) {
        try {
            byte[] iv = new byte[IV_LENGTH_BYTES];
            secureRandom.nextBytes(iv);

            Cipher cipher = Cipher.getInstance(ALGORITHM);
            cipher.init(
                    Cipher.ENCRYPT_MODE,
                    secretKey,
                    new GCMParameterSpec(AUTH_TAG_LENGTH_BITS, iv)
            );
            cipher.updateAAD(associatedData);

            byte[] cipherText = cipher.doFinal(plainText);

            ByteBuffer encoded = ByteBuffer.allocate(
                    1 + IV_LENGTH_BYTES + cipherText.length
            );

            encoded.put(FORMAT_VERSION);
            encoded.put(iv);
            encoded.put(cipherText);

            return Base64.getUrlEncoder()
                    .withoutPadding()
                    .encodeToString(encoded.array());
        } catch (GeneralSecurityException exception) {
            throw new OAuth2CookieException(
                    "OAuth2 인증 요청 쿠키 암호화에 실패했습니다.",
                    exception
            );
        }
    }

    public byte[] decrypt(String encodedValue) {
        try {
            byte[] decoded = Base64.getUrlDecoder().decode(encodedValue);

            if (decoded.length <= 1 + IV_LENGTH_BYTES) {
                throw new OAuth2CookieException(
                        "OAuth2 인증 요청 쿠키 형식이 올바르지 않습니다."
                );
            }

            ByteBuffer buffer = ByteBuffer.wrap(decoded);

            byte version = buffer.get();

            if (version != FORMAT_VERSION) {
                throw new OAuth2CookieException(
                        "지원하지 않는 OAuth2 인증 요청 쿠키 버전입니다."
                );
            }

            byte[] iv = new byte[IV_LENGTH_BYTES];
            buffer.get(iv);

            byte[] cipherText = new byte[buffer.remaining()];
            buffer.get(cipherText);

            Cipher cipher = Cipher.getInstance(ALGORITHM);
            cipher.init(
                    Cipher.DECRYPT_MODE,
                    secretKey,
                    new GCMParameterSpec(AUTH_TAG_LENGTH_BITS, iv)
            );
            cipher.updateAAD(associatedData);

            return cipher.doFinal(cipherText);
        } catch (OAuth2CookieException exception) {
            throw exception;
        } catch (IllegalArgumentException | GeneralSecurityException exception) {
            /*
             * GCM authentication tag 검증 실패도 여기로 들어온다.
             * 변조된 쿠키와 잘못된 키를 동일한 실패로 처리한다.
             */
            throw new OAuth2CookieException(
                    "OAuth2 인증 요청 쿠키가 유효하지 않습니다.",
                    exception
            );
        }
    }
}
