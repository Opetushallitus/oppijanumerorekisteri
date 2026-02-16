package fi.vm.sade.oppijanumerorekisteri.services.impl;

import fi.vm.sade.oppijanumerorekisteri.dto.IdentificationDto;
import fi.vm.sade.oppijanumerorekisteri.dto.IdpEntityId;
import fi.vm.sade.oppijanumerorekisteri.exceptions.SuspendableIdentificationException;
import fi.vm.sade.oppijanumerorekisteri.exceptions.ValidationException;
import fi.vm.sade.oppijanumerorekisteri.mappers.OrikaConfiguration;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import fi.vm.sade.oppijanumerorekisteri.models.Identification;
import fi.vm.sade.oppijanumerorekisteri.models.KoodiType;
import fi.vm.sade.oppijanumerorekisteri.models.Yksilointivirhe;
import fi.vm.sade.oppijanumerorekisteri.repositories.HenkiloRepository;
import fi.vm.sade.oppijanumerorekisteri.repositories.YksilointitietoRepository;
import fi.vm.sade.oppijanumerorekisteri.repositories.YksilointivirheRepository;
import fi.vm.sade.oppijanumerorekisteri.services.HenkiloModificationService;
import fi.vm.sade.oppijanumerorekisteri.services.Koodisto;
import fi.vm.sade.oppijanumerorekisteri.services.KoodistoService;
import fi.vm.sade.oppijanumerorekisteri.services.YksilointiService;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.springframework.test.context.junit4.SpringRunner;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.tuple;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.BDDMockito.willThrow;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

@RunWith(SpringRunner.class)
public class IdentificationServiceImplTest {
    @InjectMocks
    private IdentificationServiceImpl identificationService;

    @Mock
    private OrikaConfiguration mapper;

    @Mock
    private YksilointitietoRepository yksilointitietoRepository;

    @Mock
    private YksilointivirheRepository yksilointivirheRepository;

    @Mock
    private HenkiloModificationService henkiloModificationService;

    @Mock
    private HenkiloRepository henkiloRepository;

    @Mock
    private YksilointiService yksilointiService;

    @Mock
    private KoodistoService koodistoService;

    @Test
    public void createIdentificationThrowsWhenInvalidIdpEntityId() throws Exception {
        KoodiType tunnisteKoodiType = new KoodiType();
        tunnisteKoodiType.setKoodiArvo("email");
        given(this.koodistoService.list(eq(Koodisto.HENKILON_TUNNISTETYYPIT))).willReturn(Collections.singleton(tunnisteKoodiType));

        assertThrows(ValidationException.class, () -> this.identificationService
            .create("1.2.3.4.5", IdentificationDto.of(IdpEntityId.eidas, "google")));
    }

    @Test
    public void createIdentificationThrowsWhenEidasIdentification() throws Exception {
        KoodiType eidasKoodiType = new KoodiType();
        eidasKoodiType.setKoodiArvo("eidas");
        given(this.koodistoService.list(eq(Koodisto.HENKILON_TUNNISTETYYPIT))).willReturn(Collections.singleton(eidasKoodiType));

        ValidationException exception = assertThrows(ValidationException.class, () -> this.identificationService
            .create("1.2.3.4.5", IdentificationDto.of(IdpEntityId.eidas, "test-identifier")));

        assertThat(exception.getMessage()).contains("eIDAS-tunnisteiden lisääminen ei ole sallittua");
    }

    @Test
    public void createIdentificationDoesNotCreateWhenIdentificationExists() throws Exception {
        IdentificationDto identificationDto = IdentificationDto.of(IdpEntityId.email, "email");
        Identification identification = Identification.builder().identifier("email").idpEntityId(IdpEntityId.email).build();
        Henkilo henkilo = Henkilo.builder()
                .oidHenkilo("1.2.3.4.5")
                .hetu("nonfakehetu")
                .identifications(Set.of(identification))
                .build();
        given(this.henkiloRepository.findByIdentification(eq("1.2.3.4.5"), any())).willReturn(Optional.of(henkilo));
        KoodiType tunnisteKoodiType = new KoodiType();
        tunnisteKoodiType.setKoodiArvo("email");
        given(this.koodistoService.list(eq(Koodisto.HENKILON_TUNNISTETYYPIT))).willReturn(Collections.singleton(tunnisteKoodiType));
        given(this.mapper.mapAsList(any(Iterable.class), eq(IdentificationDto.class))).willReturn(List.of(identification));

        Iterable<IdentificationDto> identifications = this.identificationService.create("1.2.3.4.5", identificationDto);
        assertThat(identifications).extracting("idpEntityId", "identifier")
            .containsExactlyInAnyOrder(tuple(IdpEntityId.email, "email"));
        verify(this.henkiloModificationService, times(0)).update(any());
    }

    @Test
    public void retriableYksilointivirheIsRespected() {
        Henkilo henkilo = Henkilo.builder()
                .oidHenkilo("1.2.3.4.5")
                .hetu("nonfakehetu")
                .build();
        LocalDateTime localDateTime = LocalDateTime.now().minusDays(1);
        Yksilointivirhe yksilointivirhe = Yksilointivirhe.builder()
                .uudelleenyritysMaara(0)
                .uudelleenyritysAikaleima(Date.from(localDateTime.atZone(ZoneId.systemDefault()).toInstant()))
                .build();

        given(this.yksilointivirheRepository.findByHenkilo(henkilo)).willReturn(Optional.of(yksilointivirhe));
        this.identificationService.identifyHenkilos(List.of(henkilo.getOidHenkilo()), 1L);

        verify(this.yksilointiService, times(1)).yksiloiAutomaattisesti(eq("1.2.3.4.5"));
    }

    @Test
    public void noYksilointivirheIsRespected() {
        Henkilo henkilo = Henkilo.builder()
                .oidHenkilo("1.2.3.4.5")
                .hetu("nonfakehetu")
                .build();
        given(this.yksilointivirheRepository.findByHenkilo(henkilo)).willReturn(Optional.empty());
        this.identificationService.identifyHenkilos(List.of(henkilo.getOidHenkilo()), 1L);

        verify(this.yksilointiService, times(1)).yksiloiAutomaattisesti(eq("1.2.3.4.5"));
    }

    @Test
    public void fakeHetuPassedToYksilointiService() {
        Henkilo henkilo = Henkilo.builder()
                .oidHenkilo("1.2.3.4.5")
                .hetu("fakehet9")
                .build();
        given(this.yksilointivirheRepository.findByHenkilo(henkilo)).willReturn(Optional.empty());
        willThrow(SuspendableIdentificationException.class).given(this.yksilointiService).yksiloiAutomaattisesti(eq("1.2.3.4.5"));
        this.identificationService.identifyHenkilos(List.of(henkilo.getOidHenkilo()), 1L);
        verify(this.yksilointiService, times(1)).yksiloiAutomaattisesti(eq("1.2.3.4.5"));
        verify(this.yksilointiService, times(1)).tallennaYksilointivirhe(eq("1.2.3.4.5"), any());
    }
}
