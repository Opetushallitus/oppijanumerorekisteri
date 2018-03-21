package fi.vm.sade.oppijanumerorekisteri.validation;

import static java.util.Arrays.asList;
import java.util.Collection;
import static java.util.Collections.emptyList;
import java.util.List;
import javax.validation.ConstraintValidatorContext;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;
import static org.assertj.core.api.AssertionsForClassTypes.assertThat;
import org.hibernate.validator.internal.util.annotation.AnnotationDescriptor;
import org.hibernate.validator.internal.util.annotation.AnnotationFactory;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Answers;
import org.mockito.Mock;
import org.springframework.test.context.junit4.SpringRunner;

import static org.mockito.ArgumentMatchers.contains;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyZeroInteractions;

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
        AnnotationDescriptor.Builder<ValidateAtLeastOneNotNull> builder = new AnnotationDescriptor.Builder(ValidateAtLeastOneNotNull.class);
        builder.setAttribute("value", value.toArray(new String[value.size()]));
        AnnotationDescriptor<ValidateAtLeastOneNotNull> descriptor = builder.build();
//        descriptor.setValue("value", value.toArray(new String[value.size()]));
        return AnnotationFactory.create(descriptor);
    }

    @Test
    public void isValidShouldReturnTrueWhenNullValue() {
        List<String> fields = asList("stringValue");
        validator.initialize(createAnnotation(fields));

        boolean valid = validator.isValid(null, contextMock);

        assertThat(valid).isTrue();
        verifyZeroInteractions(contextMock);
    }

    @Test
    public void isValidShouldReturnTrueWhenEmptyAnnotationValue() {
        List<String> fields = emptyList();
        validator.initialize(createAnnotation(fields));

        boolean valid = validator.isValid(TestClass.builder().build(), contextMock);

        assertThat(valid).isTrue();
        verifyZeroInteractions(contextMock);
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
        verifyZeroInteractions(contextMock);
    }

    @Test
    public void isValidShouldReturnTrueWhenAnyNonNull() {
        List<String> fields = asList("integerValue", "booleanValue");
        validator.initialize(createAnnotation(fields));

        boolean valid = validator.isValid(TestClass.builder().integerValue(764).build(), contextMock);

        assertThat(valid).isTrue();
        verifyZeroInteractions(contextMock);
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
