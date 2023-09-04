package fi.vm.sade.oppijanumerorekisteri.validators;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;

import java.util.Collections;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;

import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloForceReadDto;
import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloForceUpdateDto;
import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloUpdateDto;
import fi.vm.sade.oppijanumerorekisteri.dto.HuoltajaCreateDto;
import fi.vm.sade.oppijanumerorekisteri.dto.KansalaisuusDto;
import fi.vm.sade.oppijanumerorekisteri.dto.KielisyysDto;
import fi.vm.sade.oppijanumerorekisteri.services.Koodisto;

import static fi.vm.sade.oppijanumerorekisteri.validators.VtjMuutostietoValidator.*;
import static org.assertj.core.api.Assertions.assertThat;

@RunWith(MockitoJUnitRunner.class)
public class VtjMuutostietoValidatorTest {
    @InjectMocks
    private VtjMuutostietoValidator validator;
    @Mock
    private KoodiValidator koodiValidator;

    @Test
    public void testNullValues() {
        HenkiloForceUpdateDto henkiloForceUpdateDto = new HenkiloForceUpdateDto();
        validator.validateAndCorrectErrors(new HenkiloForceReadDto(), henkiloForceUpdateDto);
        assertThat(henkiloForceUpdateDto)
                .extracting(HenkiloForceUpdateDto::getHuoltajat, HenkiloForceUpdateDto::getKotikunta, HenkiloUpdateDto::getAidinkieli, HenkiloUpdateDto::getKansalaisuus)
                .containsExactly(null, null, null, null);
    }

    @Test
    public void testHuoltajaNullValues() {
        HenkiloForceUpdateDto henkiloForceUpdateDto = new HenkiloForceUpdateDto();
        henkiloForceUpdateDto.setHuoltajat(Collections.singleton(new HuoltajaCreateDto()));
        validator.validateAndCorrectErrors(new HenkiloForceReadDto(), henkiloForceUpdateDto);
        assertThat(henkiloForceUpdateDto.getHuoltajat())
                .extracting(HuoltajaCreateDto::getKansalaisuusKoodi)
                .containsNull();
    }

    @Test
    public void testAllValuesInvalid() {
        try (MockedStatic<KoodiValidator> utilities = Mockito.mockStatic(KoodiValidator.class)) {
            HenkiloForceUpdateDto henkiloForceUpdateDto = new HenkiloForceUpdateDto();
            henkiloForceUpdateDto.setKotikunta("invalid");
            KansalaisuusDto invalidKansalaisuus = new KansalaisuusDto();
            invalidKansalaisuus.setKansalaisuusKoodi("invalid");
            henkiloForceUpdateDto.setKansalaisuus(Collections.singleton(invalidKansalaisuus));
            KielisyysDto invalidKielisyys = new KielisyysDto();
            invalidKielisyys.setKieliKoodi("invalid");
            henkiloForceUpdateDto.setAidinkieli(invalidKielisyys);
            HuoltajaCreateDto huoltajaCreateDto = new HuoltajaCreateDto();
            huoltajaCreateDto.setKansalaisuusKoodi(Collections.singleton("invalid"));
            henkiloForceUpdateDto.setHuoltajat(Collections.singleton(huoltajaCreateDto));

            validator.validateAndCorrectErrors(new HenkiloForceReadDto(), henkiloForceUpdateDto);

            assertThat(henkiloForceUpdateDto)
                    .extracting(HenkiloForceUpdateDto::getKotikunta, updateDto -> updateDto.getAidinkieli().getKieliKoodi())
                    .containsExactly(KUNTAKOODI_TUNTEMATON, KIELIKOODI_TUNTEMATON);
            assertThat(henkiloForceUpdateDto.getKansalaisuus())
                    .extracting(KansalaisuusDto::getKansalaisuusKoodi)
                    .containsExactly(KANSALAISUUSKOODI_TUNTEMATON);
            assertThat(henkiloForceUpdateDto.getHuoltajat())
                    .extracting(HuoltajaCreateDto::getKansalaisuusKoodi)
                    .containsExactly(Collections.singleton(KANSALAISUUSKOODI_TUNTEMATON));
        }
    }

    @Test
    public void testAllValuesValid() {
        try (MockedStatic<KoodiValidator> utilities = Mockito.mockStatic(KoodiValidator.class)) {
            utilities.when(() -> KoodiValidator.isValid(any(), eq(Koodisto.KUNTA), eq("validKunta")))
                .thenReturn(true);
            utilities.when(() -> KoodiValidator.isValid(any(), eq(Koodisto.MAAT_JA_VALTIOT_2), eq("validMaa")))
                .thenReturn(true);
            utilities.when(() -> KoodiValidator.isValid(any(), eq(Koodisto.KIELI), eq("validKieli")))
                .thenReturn(true);
            HenkiloForceUpdateDto henkiloForceUpdateDto = new HenkiloForceUpdateDto();
            henkiloForceUpdateDto.setKotikunta("validKunta");
            KansalaisuusDto invalidKansalaisuus = new KansalaisuusDto();
            invalidKansalaisuus.setKansalaisuusKoodi("validMaa");
            henkiloForceUpdateDto.setKansalaisuus(Collections.singleton(invalidKansalaisuus));
            KielisyysDto invalidKielisyys = new KielisyysDto();
            invalidKielisyys.setKieliKoodi("validKieli");
            henkiloForceUpdateDto.setAidinkieli(invalidKielisyys);
            HuoltajaCreateDto huoltajaCreateDto = new HuoltajaCreateDto();
            huoltajaCreateDto.setKansalaisuusKoodi(Collections.singleton("validMaa"));
            henkiloForceUpdateDto.setHuoltajat(Collections.singleton(huoltajaCreateDto));

            validator.validateAndCorrectErrors(new HenkiloForceReadDto(), henkiloForceUpdateDto);

            assertThat(henkiloForceUpdateDto)
                    .extracting(HenkiloForceUpdateDto::getKotikunta, updateDto -> updateDto.getAidinkieli().getKieliKoodi())
                    .containsExactly("validKunta", "validKieli");
            assertThat(henkiloForceUpdateDto.getKansalaisuus())
                    .extracting(KansalaisuusDto::getKansalaisuusKoodi)
                    .containsExactly("validMaa");
            assertThat(henkiloForceUpdateDto.getHuoltajat())
                    .extracting(HuoltajaCreateDto::getKansalaisuusKoodi)
                    .containsExactly(Collections.singleton("validMaa"));
        }
    }
}
