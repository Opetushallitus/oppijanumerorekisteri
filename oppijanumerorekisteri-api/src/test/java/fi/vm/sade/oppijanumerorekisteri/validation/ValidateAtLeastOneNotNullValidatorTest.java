package fi.vm.sade.oppijanumerorekisteri.validation;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Answers;
import org.mockito.Mock;
import org.springframework.test.context.junit4.SpringRunner;

import jakarta.validation.ConstraintValidatorContext;
import java.lang.annotation.Annotation;
import java.util.Collection;
import java.util.List;

import static java.util.Arrays.asList;
import static java.util.Collections.emptyList;
import static org.assertj.core.api.AssertionsForClassTypes.assertThat;
import static org.mockito.ArgumentMatchers.contains;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;

@RunWith(SpringRunner.class)
public class ValidateAtLeastOneNotNullValidatorTest {

    private ValidateAtLeastOneNotNullValidator validator;

    @Mock(answer = Answers.RETURNS_DEEP_STUBS)
    private ConstraintValidatorContext contextMock;

    @Before
    public void setup() {
        validator = new ValidateAtLeastOneNotNullValidator();
    }

    @Getter
    @Setter
    @Builder
    @ToString
    private static class TestClass {

        private String stringValue;
        private Integer integerValue;
        private Boolean booleanValue;

    }

    private ValidateAtLeastOneNotNull createAnnotation(Collection<String> value) {
        return new ValidateAtLeastOneNotNull() {
            @Override
            public String[] value() {
                return value.toArray(new String[0]);
            }

            @Override
            public String message() {
                return "";
            }

            @Override
            public Class<?>[] groups() {
                return new Class[0];
            }

            @Override
            public Class<? extends jakarta.validation.Payload>[] payload() {
                return new Class[0];
            }

            @Override
            public Class<? extends Annotation> annotationType() {
                return ValidateAtLeastOneNotNull.class;
            }
        };
    }

    @Test
    public void isValidShouldReturnTrueWhenNullValue() {
        List<String> fields = asList("stringValue");
        validator.initialize(createAnnotation(fields));

        boolean valid = validator.isValid(null, contextMock);

        assertThat(valid).isTrue();
        verifyNoInteractions(contextMock);
    }

    @Test
    public void isValidShouldReturnTrueWhenEmptyAnnotationValue() {
        List<String> fields = emptyList();
        validator.initialize(createAnnotation(fields));

        boolean valid = validator.isValid(TestClass.builder().build(), contextMock);

        assertThat(valid).isTrue();
        verifyNoInteractions(contextMock);
    }

    @Test
    public void isValidShouldReturnFalseWhenNullSingleValue() {
        List<String> fields = asList("stringValue");
        validator.initialize(createAnnotation(fields));

        boolean valid = validator.isValid(TestClass.builder().build(), contextMock);

        assertThat(valid).isFalse();
        verify(contextMock).buildConstraintViolationWithTemplate(contains("stringValue"));
    }

    @Test
    public void isValidShouldReturnTrueWhenNonNullSingleValue() {
        List<String> fields = asList("integerValue");
        validator.initialize(createAnnotation(fields));

        boolean valid = validator.isValid(TestClass.builder().integerValue(235).build(), contextMock);

        assertThat(valid).isTrue();
        verifyNoInteractions(contextMock);
    }

    @Test
    public void isValidShouldReturnTrueWhenAnyNonNull() {
        List<String> fields = asList("integerValue", "booleanValue");
        validator.initialize(createAnnotation(fields));

        boolean valid = validator.isValid(TestClass.builder().integerValue(764).build(), contextMock);

        assertThat(valid).isTrue();
        verifyNoInteractions(contextMock);
    }

    @Test
    public void isValidShouldReturnFalseWhenAllNonNull() {
        List<String> fields = asList("stringValue", "integerValue");
        validator.initialize(createAnnotation(fields));

        boolean valid = validator.isValid(TestClass.builder().booleanValue(false).build(), contextMock);

        assertThat(valid).isFalse();
        verify(contextMock).buildConstraintViolationWithTemplate(contains("stringValue/integerValue"));
    }

}
