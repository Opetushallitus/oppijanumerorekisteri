package fi.vm.sade.oppijanumerorekisteri.aspects;

import fi.vm.sade.oppijanumerorekisteri.exceptions.DuplicateHetuException;
import fi.vm.sade.oppijanumerorekisteri.exceptions.NotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.BindException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;

import javax.validation.ConstraintViolationException;
import javax.validation.ValidationException;

@ControllerAdvice
public class GlobalExceptionHandler {
    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ResponseStatus(value = HttpStatus.NOT_FOUND, reason = "not_found") // 404 Entity not found by primary key.
    @ExceptionHandler({NotFoundException.class})
    public void notFound() {
    }

    @ResponseStatus(value = HttpStatus.UNAUTHORIZED, reason = "unauthorized") // 401 Not authorized
    @ExceptionHandler(AccessDeniedException.class)
    public void notAuthorized() {
    }

    @ResponseStatus(value = HttpStatus.BAD_REQUEST, reason = "bad_request_hibernate_constraint") // 400 Bad request.
    @ExceptionHandler(org.hibernate.exception.ConstraintViolationException.class)
    public void badRequestHibernateConstraintViolatingRequest() {
    }

    @ResponseStatus(value = HttpStatus.BAD_REQUEST, reason = "bad_request_jpa_constraint") // 400 Bad request.
    @ExceptionHandler(ConstraintViolationException.class)
    public void badRequestJpaConstraintViolationException() {
    }

    @ResponseStatus(value = HttpStatus.BAD_REQUEST, reason = "bad_request_persistence") // 400 Bad Request
    @ExceptionHandler(DataIntegrityViolationException.class)
    public void badRequestDataIntegrityViolationException() {
    }

    @ResponseStatus(value = HttpStatus.BAD_REQUEST, reason = "bad_request_method_argument") // 400 Bad Request
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public void badRequestMethodArgumentNotValidException() {
    }

    @ResponseStatus(value = HttpStatus.BAD_REQUEST, reason = "bad_request_illegal_argument") // 400 Bad Request
    @ExceptionHandler(IllegalArgumentException.class)
    public void badRequestIllegalArgumentException() {
    }

    @ResponseStatus(value = HttpStatus.BAD_REQUEST, reason = "illegal_argument_value") // 400 Bad Request
    @ExceptionHandler(ValidationException.class)
    public void badRequestValidationException() {
    }

    // 400 Bad Request
    @ExceptionHandler(fi.vm.sade.oppijanumerorekisteri.exceptions.ValidationException.class)
    public ResponseEntity badRequestServiceValidationException(fi.vm.sade.oppijanumerorekisteri.exceptions.ValidationException ve) {
        ve.setStackTrace(new StackTraceElement[0]);
        return ResponseEntity.badRequest().body(ve);
    }

    @ResponseStatus(value = HttpStatus.INTERNAL_SERVER_ERROR, reason = "duplicate_hetu_undeterministic_behaviour")
    @ExceptionHandler(DuplicateHetuException.class)
    public void internalErrorDuplicateHetuException() {
    }

}
