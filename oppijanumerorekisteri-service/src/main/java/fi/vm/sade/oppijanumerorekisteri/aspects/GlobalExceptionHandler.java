package fi.vm.sade.oppijanumerorekisteri.aspects;

import com.querydsl.core.NonUniqueResultException;
import fi.vm.sade.oppijanumerorekisteri.exceptions.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.Errors;
import org.springframework.validation.FieldError;
import org.springframework.validation.ObjectError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import jakarta.validation.ValidationException;
import java.util.Date;
import java.util.LinkedHashMap;
import java.util.Map;

import static java.util.stream.Collectors.toList;

@ControllerAdvice
public class GlobalExceptionHandler {
    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    private ResponseEntity<Map<String, Object>> constructErrorResponse(Exception exception, HttpStatus status, HttpServletRequest request) {
        Map<String, Object> body = constructErrorBody(exception, status, request);
        return ResponseEntity.status(status).body(body);
    }

    private Map<String, Object> constructErrorBody(Exception exception, HttpStatus status, HttpServletRequest request) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", new Date());
        body.put("status", status.value());
        body.put("error", status.getReasonPhrase());
        body.put("exception", exception.getClass().getCanonicalName());
        body.put("message", exception.getMessage());
        body.put("path", request.getRequestURI());
        return body;
    }

    @ResponseStatus(value = HttpStatus.NOT_FOUND, reason = "not_found") // 404 Entity not found by primary key.
    @ExceptionHandler({NotFoundException.class})
    public void notFound() {
    }

    @ResponseStatus(value = HttpStatus.UNAUTHORIZED, reason = "unauthorized") // 401 Not authorized
    @ExceptionHandler(AccessDeniedException.class)
    public void notAuthorized() {
    }

    @ResponseStatus(value = HttpStatus.UNAUTHORIZED, reason = "unauthorized") // 401 Not authorized
    @ExceptionHandler(UnauthorizedException.class)
    public void unauthorized() {
    }

    @ResponseStatus(value = HttpStatus.CONFLICT, reason = "conflict") // 409 Conflict during data processing
    @ExceptionHandler({ConflictException.class})
    public void conflict() {
        // functionality provided via annotations
    }

    @ExceptionHandler(org.hibernate.exception.ConstraintViolationException.class)
    public ResponseEntity<Map<String, Object>> badRequestHibernateConstraintViolatingRequest(ConstraintViolationException e, HttpServletRequest request) {
        logger.error(e.getMessage(), e);
        return constructErrorResponse(e, HttpStatus.BAD_REQUEST, request);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<Map<String, Object>> badRequestJpaConstraintViolationException(ConstraintViolationException e, HttpServletRequest request) {
        logger.error(e.getMessage(), e);
        return constructErrorResponse(e, HttpStatus.BAD_REQUEST, request);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, Object>> badRequestDataIntegrityViolationException(DataIntegrityViolationException e, HttpServletRequest request) {
        logger.error(e.getMessage(), e);
        return constructErrorResponse(e, HttpStatus.BAD_REQUEST, request);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> badRequestMethodArgumentNotValidException(MethodArgumentNotValidException e, HttpServletRequest request) {
        logger.error(e.getMessage(), e);
        return constructErrorResponse(e, HttpStatus.BAD_REQUEST, request);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> badRequestIllegalArgumentException(IllegalArgumentException e, HttpServletRequest request) {
        logger.error(e.getMessage(), e);
        return constructErrorResponse(e, HttpStatus.BAD_REQUEST, request);
    }

    @ExceptionHandler(ValidationException.class)
    public ResponseEntity<Map<String, Object>> badRequestValidationException(ValidationException e, HttpServletRequest request) {
        logger.error(e.getMessage(), e);
        return constructErrorResponse(e, HttpStatus.BAD_REQUEST, request);
    }

    @ExceptionHandler(fi.vm.sade.oppijanumerorekisteri.exceptions.ValidationException.class)
    public ResponseEntity<Map<String, Object>> badRequestServiceValidationException(fi.vm.sade.oppijanumerorekisteri.exceptions.ValidationException ve, HttpServletRequest request) {
        logger.error(ve.getMessage(), ve);
        return constructErrorResponse(ve, HttpStatus.BAD_REQUEST, request);
    }

    @ExceptionHandler(UnprocessableEntityException.class)
    public ResponseEntity<Map<String, Object>> unprocessableEntityException(UnprocessableEntityException exception, HttpServletRequest request) {
        HttpStatus status = HttpStatus.BAD_REQUEST;
        Map<String, Object> body = constructErrorBody(exception, status, request);
        Errors errors = exception.getErrors();
        body.put("globalErrors", errors.getGlobalErrors().stream()
                .map(this::constructObjectError)
                .collect(toList()));
        body.put("fieldErrors", errors.getFieldErrors().stream()
                .map(this::constructFieldError)
                .collect(toList()));
        logger.error(body.toString(), exception);

        return ResponseEntity.status(status).body(body);
    }

    private Map<String, Object> constructObjectError(ObjectError objectError) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("code", objectError.getCode());
        body.put("arguments", objectError.getArguments());
        body.put("message", objectError.getDefaultMessage());
        return body;
    }

    private Map<String, Object> constructFieldError(FieldError fieldError) {
        Map<String, Object> body = constructObjectError(fieldError);
        body.put("field", fieldError.getField());
        body.put("rejectedValue", fieldError.getRejectedValue());
        return body;
    }

    @ExceptionHandler(DataInconsistencyException.class)
    public ResponseEntity<Map<String, Object>> dataInconsistencyException(DataInconsistencyException exception, HttpServletRequest request) {
        logger.error(exception.getMessage(), exception);
        return constructErrorResponse(exception, HttpStatus.INTERNAL_SERVER_ERROR, request);
    }

    @ExceptionHandler(ForbiddenException.class)
    public ResponseEntity<Map<String, Object>> forbiddenException(ForbiddenException exception, HttpServletRequest request) {
        return constructErrorResponse(exception, HttpStatus.FORBIDDEN, request);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<Map<String, Object>> messageNotReadableException(HttpMessageNotReadableException e, HttpServletRequest request) {
        return constructErrorResponse(e, HttpStatus.BAD_REQUEST, request);
    }

    @ExceptionHandler(NonUniqueResultException.class)
    public ResponseEntity<Map<String, Object>> nonUniqueDataException(NonUniqueResultException e, HttpServletRequest request) {
        var status = HttpStatus.CONFLICT;
        var body = constructErrorBody(e, status, request);
        body.put("httpQuery", request.getQueryString());
        return ResponseEntity.status(status).body(body);
    }

}
