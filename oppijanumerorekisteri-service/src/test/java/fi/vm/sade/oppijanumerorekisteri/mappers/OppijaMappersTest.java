package fi.vm.sade.oppijanumerorekisteri.mappers;

import fi.vm.sade.oppijanumerorekisteri.KoodistoServiceMock;
import fi.vm.sade.oppijanumerorekisteri.dto.*;
import fi.vm.sade.oppijanumerorekisteri.models.*;
import fi.vm.sade.oppijanumerorekisteri.repositories.KansalaisuusRepository;
import fi.vm.sade.oppijanumerorekisteri.repositories.TuontiRepository;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.junit4.SpringRunner;

import java.time.LocalDate;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

@RunWith(SpringRunner.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.NONE, classes = {OrikaConfiguration.class, KoodistoServiceMock.class})
public class OppijaMappersTest {

    @Autowired
    private OrikaConfiguration mapper;

    @MockBean
    private KansalaisuusRepository kansalaisuusRepository;

    @MockBean
    private TuontiRepository tuontiRepository;

    @Test
    public void mapperShouldMapOid() {
        TuontiRivi entity = TuontiRivi.builder()
                .henkilo(Henkilo.builder().oidHenkilo("oid123").passivoitu(true).build())
                .build();

        OppijaTuontiRiviReadDto dto = mapper.map(entity, OppijaTuontiRiviReadDto.class);

        assertThat(dto.getHenkilo().getOid()).isEqualTo("oid123");
        assertThat(dto.getHenkilo().isPassivoitu()).isTrue();
    }

    @Test
    public void mapperShouldMapAidinkieliUppercaseToDto() {
        TuontiRivi entity = TuontiRivi.builder()
                .henkilo(Henkilo.builder().aidinkieli(new Kielisyys("fi")).build())
                .build();

        OppijaTuontiRiviReadDto dto = mapper.map(entity, OppijaTuontiRiviReadDto.class);

        assertThat(dto.getHenkilo().getAidinkieli().getKoodi()).isEqualTo("FI");
    }

    @Test
    public void mapperShouldMapAidinkieliLowercaseToEntity() {
        OppijaTuontiRiviCreateDto.OppijaTuontiRiviHenkiloCreateDto dto = new OppijaTuontiRiviCreateDto.OppijaTuontiRiviHenkiloCreateDto();
        dto.setAidinkieli(new KoodiUpdateDto("FI"));

        Henkilo entity = mapper.map(dto, Henkilo.class);

        assertThat(entity.getAidinkieli().getKieliKoodi()).isEqualTo("fi");
    }

    @Test
    public void duplicateMapper() {
        Henkilo henkilo = getHenkilo();

        HenkiloDuplicateDto dto = mapper.map(henkilo, HenkiloDuplicateDto.class);

        assertThat(dto).isNotNull();
        assertThat(dto.getOidHenkilo()).isEqualTo("oid");
        assertThat(dto.getHetu()).isEqualTo("hetu");
        assertThat(dto.getEmails()).hasSize(1).contains("email");
        assertThat(dto.getKansalaisuus()).hasSize(1);
        assertThat(dto.getPassinumerot()).contains("passinumero");
    }

    @Test
    public void duplicateMasterMapper() {
        Henkilo henkilo = getHenkilo();

        HenkiloReadDto dto = mapper.map(henkilo, HenkiloReadDto.class);

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
