package fi.vm.sade.oppijanumerorekisteri.validations;

import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloTyyppi;
import fi.vm.sade.oppijanumerorekisteri.mappers.EntityUtils;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import fi.vm.sade.oppijanumerorekisteri.models.Kielisyys;
import fi.vm.sade.oppijanumerorekisteri.repositories.KielisyysRepository;
import org.hibernate.validator.internal.constraintvalidators.bv.NotNullValidator;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.springframework.test.context.junit4.SpringRunner;

import javax.validation.*;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Matchers.any;

@RunWith(SpringRunner.class)
public class HenkiloConstraintValidatorTest implements ConstraintValidatorFactory {
    @Mock
    private KielisyysRepository kielisyysRepository;

    private Validator validator;

    @Override
    public <T extends ConstraintValidator<?, ?>> T getInstance(Class<T> key) {
        if (key == KielisyysConstraintValidator.class) {
            return (T) new KielisyysConstraintValidator(this.kielisyysRepository);
        }
        if (key == NotNullValidator.class) {
            return (T) new NotNullValidator();
        }
        throw new IllegalArgumentException("expecting KielisyysConstraintValidator!");
    }

    @Override
    public void releaseInstance(ConstraintValidator<?, ?> instance) {

    }

    @Before
    public void setup() throws Exception {
        Configuration<?> config = Validation.byDefaultProvider().configure();
        config.constraintValidatorFactory(this);

        ValidatorFactory factory = config.buildValidatorFactory();

        this.validator = factory.getValidator();
    }

    @Test
    public void HenkiloValidation() {
        Henkilo henkilo = EntityUtils.createHenkilo("arpa", "arpa", "kuutio", "123456-9999", "1.2.3.4.5", false,
                HenkiloTyyppi.OPPIJA, "fi", "suomi", "246", new Date(), new Date(), "1.2.3.4.1", "arpa@kuutio.fi");
        Mockito.when(this.kielisyysRepository.findByKielikoodi(any())).thenReturn(Optional.of(new Kielisyys()));
        Set<ConstraintViolation<Henkilo>> constraintViolations = validator.validate(henkilo);
        assertThat(constraintViolations).isEmpty();
    }

    @Test
    public void HenkiloValidationInvalidKielisyys() {
        Henkilo henkilo = EntityUtils.createHenkilo("arpa", "arpa", "kuutio", "123456-9999", "1.2.3.4.5", false,
                HenkiloTyyppi.OPPIJA, "fi", "suomi", "246", new Date(), new Date(), "1.2.3.4.1", "arpa@kuutio.fi");
        Mockito.when(this.kielisyysRepository.findByKielikoodi(any())).thenReturn(Optional.empty());
        List<ConstraintViolation<Henkilo>> constraintViolations = validator.validate(henkilo)
                .stream().sorted((c1, c2) -> c1.getPropertyPath().toString().compareTo(c2.getPropertyPath().toString()))
                .collect(Collectors.toList());
        assertThat(constraintViolations.size()).isEqualTo(2);
        assertThat(constraintViolations.get(0).getPropertyPath().toString()).isEqualTo("aidinkieli");
        assertThat(constraintViolations.get(1).getPropertyPath().toString()).isEqualTo("asiointikieli");
    }

    @Test
    public void HenkiloValidationInvalidLuontipvmAndMuokkausPvm() {
        Henkilo henkilo = EntityUtils.createHenkilo("arpa", "arpa", "kuutio", "123456-9999", "1.2.3.4.5", false,
                HenkiloTyyppi.OPPIJA, "fi", "suomi", "246", null, null, "1.2.3.4.1", "arpa@kuutio.fi");
        Mockito.when(this.kielisyysRepository.findByKielikoodi(any())).thenReturn(Optional.of(new Kielisyys()));
        List<ConstraintViolation<Henkilo>> constraintViolations = validator.validate(henkilo)
                .stream().sorted((c1, c2) -> c1.getPropertyPath().toString().compareTo(c2.getPropertyPath().toString()))
                .collect(Collectors.toList());
        assertThat(constraintViolations.size()).isEqualTo(2);
        assertThat(constraintViolations.get(0).getPropertyPath().toString()).isEqualTo("luontiPvm");
        assertThat(constraintViolations.get(1).getPropertyPath().toString()).isEqualTo("muokkausPvm");
    }


}
