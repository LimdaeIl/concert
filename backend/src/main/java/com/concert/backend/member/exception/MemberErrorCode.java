package com.concert.backend.member.exception;


import com.concert.backend.common.exception.ErrorCode;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum MemberErrorCode implements ErrorCode {

    EMAIL_REQUIRED(HttpStatus.BAD_REQUEST, "이메일 필수값입니다."),
    PHONE_NUMBER_REQUIRED(HttpStatus.BAD_REQUEST, "휴대전화번호는 필수값입니다."),
    PASSWORD_REQUIRED(HttpStatus.BAD_REQUEST, "비밀번호는 필수값입니다."),
    NAME_REQUIRED(HttpStatus.BAD_REQUEST, "이름은 필수값입니다."),
    DUPLICATE_EMAIL(HttpStatus.BAD_REQUEST, "이미 사용 중인 이메일입니다."),
    DUPLICATE_PHONE(HttpStatus.BAD_REQUEST, "이미 사용 중인 휴대전화번호입니다."),
    DUPLICATE_NAME(HttpStatus.BAD_REQUEST, "이미 사용 중인 이름입니다."),
    ALREADY_DEACTIVATED_MEMBER(HttpStatus.BAD_REQUEST, "이미 탈퇴된 회원입니다."),
    MEMBER_NOT_FOUND(HttpStatus.NOT_FOUND, "회원 정보를 찾을 수 없습니다."),
    VALIDATE_FIELD(HttpStatus.BAD_REQUEST, "%s는 null 또는 공백일 수 없습니다."),
    MEMBER_NOT_ACTIVE(HttpStatus.BAD_REQUEST, "회원이 활성화 상태가 아닙니다."),
    ALREADY_WITHDRAWN_MEMBER(HttpStatus.BAD_REQUEST, "이미 탈퇴된 회원입니다."),
    NO_PROFILE_CHANGES(HttpStatus.BAD_REQUEST, "프로필 변경 사항이 없습니다."),
    INVALID_PASSWORD(HttpStatus.BAD_REQUEST, "비밀번호가 올바르지 않습니다."),
    PASSWORD_CHANGE_NOT_AVAILABLE(HttpStatus.BAD_REQUEST, "비밀번호 로그인을 사용하는 회원만 비밀번호를 변경할 수 있습니다."),
    SAME_AS_CURRENT_PASSWORD(HttpStatus.BAD_REQUEST, "새 비밀번호는 현재 비밀번호와 달라야 합니다."),
    SAME_AS_CURRENT_EMAIL(HttpStatus.BAD_REQUEST, "새 이메일은 현재 이메일과 달라야 합니다."),
    SAME_AS_CURRENT_PHONE(HttpStatus.BAD_REQUEST, "새 휴대전화번호는 현재 번호와 달라야 합니다."),
    PHONE_REQUIRED(HttpStatus.BAD_REQUEST, "휴대전화번호는 필수값입니다."),
    PROFILE_IMAGE_KEY_REQUIRED(HttpStatus.BAD_REQUEST, "프로필 이미지 키는 필수값입니다."),
    INVALID_PROFILE_IMAGE_KEY(HttpStatus.BAD_REQUEST, "올바르지 않은 프로필 이미지 경로입니다."),
    PROFILE_IMAGE_NOT_FOUND(HttpStatus.BAD_REQUEST, "업로드된 프로필 이미지를 찾을 수 없습니다."),
    ADDRESS_REQUIRED(HttpStatus.BAD_REQUEST, "주소는 필수값입니다.");

    private final HttpStatus status;
    private final String message;

    @Override
    public HttpStatus status() {
        return status;
    }

    @Override
    public String message() {
        return message;
    }

}

