package fi.vm.sade.oppijanumerorekisteri.services.impl;

import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloCreateDto;
import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloDto;
import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloExistenceCheckDto;
import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloReadDto;
import fi.vm.sade.oppijanumerorekisteri.exceptions.ConflictException;
import fi.vm.sade.oppijanumerorekisteri.exceptions.NotFoundException;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import fi.vm.sade.oppijanumerorekisteri.repositories.OrganisaatioRepository;
import fi.vm.sade.oppijanumerorekisteri.services.HenkiloModificationService;
import fi.vm.sade.oppijanumerorekisteri.services.HenkiloService;
import fi.vm.sade.oppijanumerorekisteri.services.PermissionChecker;
import fi.vm.sade.oppijanumerorekisteri.services.YksilointiService;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

@SpringBootTest
class YleistunnisteServiceImplTest {

    private static final String OID = "1.2.3.4.5";

    @InjectMocks
    YleistunnisteServiceImpl yleistunnisteService;

    @Mock
    YksilointiService yksilointiService;

    @Mock
    HenkiloService henkiloService;

    @Mock
    HenkiloModificationService henkiloModificationService;

    @Mock
    PermissionChecker permissionChecker;

    @Mock
    OrganisaatioRepository organisaatioRepository;

    @Test
    void testNotFound() {
        given(yksilointiService.exists(any(HenkiloExistenceCheckDto.class))).willThrow(NotFoundException.class);

        assertThrows(NotFoundException.class, () -> yleistunnisteService.hae(mock(HenkiloExistenceCheckDto.class)));
    }

    @Test
    void testConflict() {
        given(yksilointiService.exists(any(HenkiloExistenceCheckDto.class))).willThrow(ConflictException.class);

        assertThrows(ConflictException.class, () -> yleistunnisteService.hae(mock(HenkiloExistenceCheckDto.class)));
    }

    @Test
    void testFoundFromOnr() {
        HenkiloReadDto henkilo = mock(HenkiloReadDto.class);
        when(henkilo.getOppijanumero()).thenReturn(OID);
        given(yksilointiService.exists(any(HenkiloExistenceCheckDto.class))).willReturn(Optional.of(OID));
        given(henkiloService.getMasterByOid(OID)).willReturn(henkilo);
        given(henkiloService.getEntityByOid(OID)).willReturn(mock(Henkilo.class));
        given(permissionChecker.getOrganisaatioOidsByKayttaja(any(), any())).willReturn(Set.of("organisaatio"));

        assertThat(yleistunnisteService.hae(HenkiloExistenceCheckDto.builder().build())).hasFieldOrPropertyWithValue("oppijanumero", OID);
    }

    @Test
    void testFoundFromVtj() {
        HenkiloDto henkilo = mock(HenkiloDto.class);
        when(henkilo.getOidHenkilo()).thenReturn(OID);
        given(yksilointiService.exists(any(HenkiloExistenceCheckDto.class))).willReturn(Optional.empty());
        given(henkiloModificationService.createHenkilo(any(HenkiloCreateDto.class))).willReturn(henkilo);
        given(henkiloService.getEntityByOid(OID)).willReturn(mock(Henkilo.class));
        given(permissionChecker.getOrganisaatioOidsByKayttaja(any(), any())).willReturn(Set.of("organisaatio"));

        assertThat(yleistunnisteService.hae(HenkiloExistenceCheckDto.builder().build())).hasFieldOrPropertyWithValue("oppijanumero", OID);
    }
}
