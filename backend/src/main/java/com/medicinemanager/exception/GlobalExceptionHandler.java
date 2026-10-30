package com.medicinemanager.exception;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.*;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import java.net.URI;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(NotFoundException.class)
    ProblemDetail notFound(NotFoundException e) {
        return detail(HttpStatus.NOT_FOUND, e.getMessage());
    }

    @ExceptionHandler(ConflictException.class)
    ProblemDetail conflict(ConflictException e) {
        return detail(HttpStatus.CONFLICT, e.getMessage());
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    ProblemDetail integrity(DataIntegrityViolationException e) {
        return detail(HttpStatus.CONFLICT, "Resource violates a uniqueness or integrity constraint");
    }

    @ExceptionHandler({ BusinessRuleException.class, IllegalArgumentException.class })
    ProblemDetail business(RuntimeException e) {
        return detail(HttpStatus.UNPROCESSABLE_ENTITY, e.getMessage());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    ProblemDetail validation(MethodArgumentNotValidException e) {
        return detail(HttpStatus.UNPROCESSABLE_ENTITY, e.getBindingResult().getFieldErrors().stream()
                .map(x -> x.getField() + ": " + x.getDefaultMessage()).collect(Collectors.joining(", ")));
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    ProblemDetail malformed(HttpMessageNotReadableException e) {
        return detail(HttpStatus.UNPROCESSABLE_ENTITY, "Malformed request body");
    }

    @ExceptionHandler(Exception.class)
    ProblemDetail general(Exception e) {
        return detail(HttpStatus.INTERNAL_SERVER_ERROR, "An unexpected error occurred");
    }

    private ProblemDetail detail(HttpStatus s, String m) {
        var p = ProblemDetail.forStatusAndDetail(s, m);
        p.setType(URI.create("https://medicinemanager/errors/" + s.value()));
        return p;
    }
}
