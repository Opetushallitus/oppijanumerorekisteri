package fi.vm.sade.oppijanumerorekisteri.validators;

import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloUpdateDto;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import fi.vm.sade.oppijanumerorekisteri.repositories.HenkiloRepository;
import fi.vm.sade.oppijanumerorekisteri.services.KoodistoService;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.validation.Errors;

import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@RunWith(MockitoJUnitRunner.StrictStubs.class)
public class HenkiloUpdatePostValidatorTest {

    private HenkiloUpdatePostValidator validator;

    @Mock
    private KoodistoService koodistoService;
    @Mock
    private HenkiloRepository henkiloRepository;
    @Mock
    private Errors errors;

    @Before
    public void setup() {
        validator = new HenkiloUpdatePostValidator(koodistoService, henkiloRepository);
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

        verifyNoInteractions(errors);
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

        verifyNoInteractions(errors);
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

        verifyNoInteractions(errors);
    }

    @Test
    public void validateShouldIgnoreEmptyHetuWhenNullSaved() {
        HenkiloUpdateDto dto = new HenkiloUpdateDto();
        dto.setHetu("");
        Henkilo entity = new Henkilo();
        entity.setHetu(null);
        when(henkiloRepository.findByOidHenkilo(any())).thenReturn(Optional.of(entity));

        validator.validate(dto, errors);

        verifyNoInteractions(errors);
        verify(henkiloRepository, never()).findByHetu(any());
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

    // null hetu = not updated
    @Test
    public void validateShouldNotRejectNullHetuWhenYksiloituVtjIsTrue() {
        HenkiloUpdateDto dto = new HenkiloUpdateDto();
        dto.setHetu(null);
        Henkilo entity = new Henkilo();
        entity.setYksiloityVTJ(true);
        entity.setHetu("021017A953F");
        when(henkiloRepository.findByOidHenkilo(any())).thenReturn(Optional.of(entity));

        validator.validate(dto, errors);

        verifyNoInteractions(this.errors);
    }

    @Test
    public void validateShouldRejectEmptyHetuWhenYksiloituVtjIsTrue() {
        HenkiloUpdateDto dto = new HenkiloUpdateDto();
        dto.setHetu("");
        Henkilo entity = new Henkilo();
        entity.setYksiloityVTJ(true);
        entity.setHetu("021017A953F");
        when(henkiloRepository.findByOidHenkilo(any())).thenReturn(Optional.of(entity));

        validator.validate(dto, errors);

        verify(errors).rejectValue(eq("hetu"), eq("socialsecuritynr.already.set"));
    }

    @Test
    public void validateShouldCheckHetuIsUnique() {
        Henkilo entityByOid = new Henkilo();
        entityByOid.setOidHenkilo("oid1");
        entityByOid.setHetu("021017A953F");
        when(henkiloRepository.findByOidHenkilo(any())).thenReturn(Optional.of(entityByOid));
        Henkilo entityByHetu = new Henkilo();
        entityByHetu.setOidHenkilo("oid2");
        entityByHetu.setHetu("021017A9114");
        when(henkiloRepository.findByHetu(any())).thenReturn(Optional.of(entityByHetu));
        HenkiloUpdateDto dto = new HenkiloUpdateDto();
        dto.setOidHenkilo("oid1");
        dto.setHetu("021017A9114");

        validator.validate(dto, errors);

        verify(errors).rejectValue(eq("hetu"), eq("socialsecuritynr.already.exists"));
    }
}
