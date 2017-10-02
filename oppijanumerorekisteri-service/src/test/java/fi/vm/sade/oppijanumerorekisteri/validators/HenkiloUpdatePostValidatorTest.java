package fi.vm.sade.oppijanumerorekisteri.validators;

import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloUpdateDto;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import fi.vm.sade.oppijanumerorekisteri.repositories.HenkiloJpaRepository;
import fi.vm.sade.oppijanumerorekisteri.repositories.HenkiloRepository;
import fi.vm.sade.oppijanumerorekisteri.services.KoodistoService;
import fi.vm.sade.oppijanumerorekisteri.services.UserDetailsHelper;
import java.util.Optional;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import org.mockito.Mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyZeroInteractions;
import static org.mockito.Mockito.when;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.validation.Errors;

@RunWith(MockitoJUnitRunner.StrictStubs.class)
public class HenkiloUpdatePostValidatorTest {

    private HenkiloUpdatePostValidator validator;

    @Mock
    private UserDetailsHelper userDetailsHelper;
    @Mock
    private KoodistoService koodistoService;
    @Mock
    private HenkiloRepository henkiloRepository;
    @Mock
    private HenkiloJpaRepository henkiloJpaRepository;
    @Mock
    private Errors errors;

    @Before
    public void setup() {
        validator = new HenkiloUpdatePostValidator(userDetailsHelper,
                koodistoService, henkiloRepository, henkiloJpaRepository);
    }

    @Test
    public void validateShouldIgnoreUnmodifiedHetuWhenYksiloityVtjIsFalse() {
        HenkiloUpdateDto dto = new HenkiloUpdateDto();
        dto.setHetu("021017A9114");
        Henkilo entity = new Henkilo();
        entity.setHetu("021017A9114");
        entity.setYksiloityVTJ(false);
        when(henkiloRepository.findByOidHenkilo(any())).thenReturn(Optional.of(entity));

        validator.validate(dto, errors);

        verifyZeroInteractions(errors);
    }

    @Test
    public void validateShouldIgnoreUnmodifiedHetuWhenYksiloityVtjIsTrue() {
        HenkiloUpdateDto dto = new HenkiloUpdateDto();
        dto.setHetu("021017A9114");
        Henkilo entity = new Henkilo();
        entity.setHetu("021017A9114");
        entity.setYksiloityVTJ(true);
        when(henkiloRepository.findByOidHenkilo(any())).thenReturn(Optional.of(entity));

        validator.validate(dto, errors);

        verifyZeroInteractions(errors);
    }

    @Test
    public void validateShouldIgnoreModifiedHetuWhenYksiloituVtjIsFalse() {
        HenkiloUpdateDto dto = new HenkiloUpdateDto();
        dto.setHetu("021017A9114");
        Henkilo entity = new Henkilo();
        entity.setHetu("021017A953F");
        entity.setYksiloityVTJ(false);
        when(henkiloRepository.findByOidHenkilo(any())).thenReturn(Optional.of(entity));

        validator.validate(dto, errors);

        verifyZeroInteractions(errors);
    }

    @Test
    public void validateShouldRejectModifiedHetuWhenYksiloituVtjIsTrue() {
        HenkiloUpdateDto dto = new HenkiloUpdateDto();
        dto.setHetu("021017A9114");
        Henkilo entity = new Henkilo();
        entity.setYksiloityVTJ(true);
        entity.setHetu("021017A953F");
        when(henkiloRepository.findByOidHenkilo(any())).thenReturn(Optional.of(entity));

        validator.validate(dto, errors);

        verify(errors).rejectValue(eq("hetu"), eq("socialsecuritynr.already.set"));
    }

    @Test
    public void validateShouldCheckHetuIsUnique() {
        HenkiloUpdateDto dto = new HenkiloUpdateDto();
        dto.setOidHenkilo("oid1");
        dto.setHetu("021017A9114");
        when(henkiloRepository.findByHetu(any())).thenReturn(Optional.empty());

        validator.validate(dto, errors);
        verifyZeroInteractions(errors);

        Henkilo entity = new Henkilo();
        entity.setOidHenkilo("oid1");
        entity.setHetu("021017A9114");
        when(henkiloRepository.findByHetu(any())).thenReturn(Optional.of(entity));

        validator.validate(dto, errors);
        verifyZeroInteractions(errors);

        entity.setOidHenkilo("oid2");

        validator.validate(dto, errors);
        verify(errors).rejectValue(eq("hetu"), eq("socialsecuritynr.already.exists"));
    }

}
