package fi.vm.sade.oppijanumerorekisteri.mappers;

import fi.vm.sade.oppijanumerorekisteri.dto.*;
import fi.vm.sade.oppijanumerorekisteri.models.*;
import fi.vm.sade.oppijanumerorekisteri.repositories.KansalaisuusRepository;
import fi.vm.sade.oppijanumerorekisteri.repositories.TuontiRepository;
import fi.vm.sade.oppijanumerorekisteri.services.KoodistoService;
import ma.glasnost.orika.MapperFacade;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@SpringBootTest
public class OppijaMappersTest {
    @Autowired
    private MapperFacade mapper;

    @MockitoBean
    private KansalaisuusRepository kansalaisuusRepository;

    @MockitoBean
    private TuontiRepository tuontiRepository;

    @MockitoBean
    private KoodistoService koodistoService;

    @Test
    public void mapperShouldMapOid() {
        TuontiRivi entity = TuontiRivi.builder()
                .henkilo(Henkilo.builder().oidHenkilo("oid123").passivoitu(true).build())
                .build();

        when(koodistoService.list(any())).thenReturn(List.of());
        OppijaTuontiRiviReadDto dto = mapper.map(entity, OppijaTuontiRiviReadDto.class);

        assertThat(dto.getHenkilo().getOid()).isEqualTo("oid123");
        assertThat(dto.getHenkilo().isPassivoitu()).isTrue();
    }

    @Test
    public void mapperShouldMapAidinkieliUppercaseToDto() {
        TuontiRivi entity = TuontiRivi.builder()
                .henkilo(Henkilo.builder().aidinkieli(new Kielisyys("fi")).build())
                .build();

        when(koodistoService.list(any())).thenReturn(List.of());
        OppijaTuontiRiviReadDto dto = mapper.map(entity, OppijaTuontiRiviReadDto.class);

        assertThat(dto.getHenkilo().getAidinkieli().getKoodi()).isEqualTo("FI");
    }

    @Test
    public void mapperShouldMapAidinkieliLowercaseToEntity() {
        OppijaTuontiRiviCreateDto.OppijaTuontiRiviHenkiloCreateDto dto = new OppijaTuontiRiviCreateDto.OppijaTuontiRiviHenkiloCreateDto();
        dto.setAidinkieli(new KoodiUpdateDto("FI"));

        when(koodistoService.list(any())).thenReturn(List.of());
        Henkilo entity = mapper.map(dto, Henkilo.class);

        assertThat(entity.getAidinkieli().getKieliKoodi()).isEqualTo("fi");
    }

    @Test
    public void duplicateMapper() {
        Henkilo henkilo = getHenkilo();

        when(koodistoService.list(any())).thenReturn(List.of());
        HenkiloDuplicateDto dto = mapper.map(henkilo, HenkiloDuplicateDto.class);

        assertThat(dto).isNotNull();
        assertThat(dto.getOidHenkilo()).isEqualTo("oid");
        assertThat(dto.getHetu()).isEqualTo("hetu");
        assertThat(dto.getEmails()).hasSize(1).contains("email");
        assertThat(dto.getKansalaisuus()).hasSize(1);
        assertThat(dto.getPassinumerot()).contains("passinumero");
    }

    private Henkilo getHenkilo() {
        return Henkilo.builder()
                .oidHenkilo("oid")
                .etunimet("etunimet")
                .kutsumanimi("kutsumanimi")
                .sukunimi("sukunimi")
                .sukupuoli("sukupuoli")
                .hetu("hetu")
                .syntymaaika(LocalDate.EPOCH)
                .passivoitu(false)
                .aidinkieli(Kielisyys.builder().kieliKoodi("fi").build())
                .asiointiKieli(Kielisyys.builder().kieliKoodi("fi").build())
                .yhteystiedotRyhma(Set.of(
                        YhteystiedotRyhma.builder().ryhmaKuvaus("ryhmakuvaus")
                                .ryhmaAlkuperaTieto("alkupera")
                                .build(),
                        YhteystiedotRyhma.builder()
                                .ryhmaKuvaus("ryhmakuvaus")
                                .ryhmaAlkuperaTieto("alkupera")
                                .yhteystieto(Yhteystieto.builder(YhteystietoTyyppi.YHTEYSTIETO_SAHKOPOSTI, "email").build())
                                .build()
                ))
                .kansalaisuus(Set.of(new Kansalaisuus("kansalaisuus")))
                .passinumerot(Set.of("passinumero"))
                .build();
    }
}
