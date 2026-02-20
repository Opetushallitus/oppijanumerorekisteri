package fi.vm.sade.oppijanumerorekisteri.services;

import com.fasterxml.jackson.databind.ObjectMapper;
import fi.vm.sade.oppijanumerorekisteri.clients.KayttooikeusClient;
import fi.vm.sade.oppijanumerorekisteri.dto.*;
import fi.vm.sade.oppijanumerorekisteri.exceptions.UnprocessableEntityException;
import fi.vm.sade.oppijanumerorekisteri.models.*;
import fi.vm.sade.oppijanumerorekisteri.repositories.HenkiloRepository;
import fi.vm.sade.oppijanumerorekisteri.repositories.HenkiloViiteRepository;
import fi.vm.sade.oppijanumerorekisteri.repositories.YksilointitietoRepository;
import org.springframework.boot.test.context.SpringBootTest;
import software.amazon.awssdk.services.sns.SnsClient;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.stream.Stream;

import static fi.vm.sade.oppijanumerorekisteri.AssertPublished.assertPublished;
import static java.util.Collections.emptySet;
import static java.util.Collections.singleton;
import static java.util.stream.Collectors.toList;
import static java.util.stream.Collectors.toSet;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.catchThrowable;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.when;

@RunWith(SpringRunner.class)
@SpringBootTest
@Sql("/sql/truncate_data.sql")
@Sql("/sql/henkilo-modification-test.sql")
@Transactional
public class HenkiloModificationServiceIntegrationTest {
    @Autowired
    private HenkiloModificationService henkiloModificationService;

    @Autowired
    private HenkiloService henkiloService;

    @MockitoBean
    private KayttooikeusClient kayttooikeusClient;

    @MockitoBean
    private SnsClient snsClient;

    @Autowired
    private HenkiloRepository henkiloRepository;

    @Autowired
    private HenkiloViiteRepository henkiloViiteRepository;

    @Autowired
    private YksilointitietoRepository yksilointitietoRepository;

    @MockitoBean
    private KoodistoService koodistoService;

    @PersistenceContext
    private EntityManager entityManager;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @WithMockUser(roles = "APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA")
    public void updateVtjYksiloityHetuAndVtjYksiloityHasHenkiloHasNewHetu() {
        HenkiloForceUpdateDto henkiloForceUpdateDto = new HenkiloForceUpdateDto();
        henkiloForceUpdateDto.setOidHenkilo("VTJYKSILOITY1");
        henkiloForceUpdateDto.setHetu("111111-1234");
        henkiloForceUpdateDto.setKaikkiHetut(Stream.of("111111-1234", "111111-1233").collect(toSet()));

        HenkiloForceReadDto henkiloForceReadDto = this.henkiloModificationService.forceUpdateHenkilo(henkiloForceUpdateDto);

        assertThat(henkiloForceReadDto)
                .extracting(HenkiloForceReadDto::getOidHenkilo, HenkiloForceReadDto::getHetu, HenkiloForceReadDto::isYksiloityVTJ, HenkiloForceReadDto::getKaikkiHetut)
                .containsExactly("VTJYKSILOITY1", "111111-1234", true, Stream.of("111111-1234", "111111-1233").collect(toSet()));

        Henkilo henkilo = this.henkiloRepository.findByOidHenkilo("VTJYKSILOITY2")
                .orElseThrow(RuntimeException::new);
        assertThat(henkilo)
                .extracting(Henkilo::getOidHenkilo, Henkilo::getHetu, Henkilo::isYksiloityVTJ, Henkilo::getKaikkiHetut)
                .containsExactly("VTJYKSILOITY2", null, false, emptySet());

        List<HenkiloViite> henkiloViiteList = this.henkiloViiteRepository.findByMasterOid("VTJYKSILOITY1");
        assertThat(henkiloViiteList)
                .flatExtracting(HenkiloViite::getMasterOid, HenkiloViite::getSlaveOid)
                .containsExactly("VTJYKSILOITY1", "VTJYKSILOITY2");

        assertPublished(objectMapper, snsClient, 2, "VTJYKSILOITY1", "VTJYKSILOITY2");
    }

    @Test
    @WithMockUser(roles = "APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA")
    public void updateHenkiloTallentaaKutsumanimimuutoksen() {
        HenkiloUpdateDto updateDto = new HenkiloUpdateDto();
        updateDto.setOidHenkilo("VTJYKSILOITY1");
        updateDto.setKutsumanimi("Taneli");

        henkiloModificationService.updateHenkilo(updateDto);
        HenkiloDto readDto = henkiloService.getMasterByOid("VTJYKSILOITY1");

        assertThat(readDto.getEtunimet()).isEqualTo("Teppo Taneli");
        assertThat(readDto.getKutsumanimi()).isEqualTo("Taneli");
        assertPublished(objectMapper, snsClient, 1, updateDto.getOidHenkilo());
    }

    @Test
    @WithMockUser(roles = "APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA")
    public void kaikkiHetutAdded() {
        HenkiloForceUpdateDto updateDto = new HenkiloForceUpdateDto();
        updateDto.setOidHenkilo("VTJYKSILOITY1");
        updateDto.setKaikkiHetut(Stream.of("111111-985K", "170775-973B").collect(toSet()));

        henkiloModificationService.forceUpdateHenkilo(updateDto);
        Henkilo henkilo = this.entityManager
                .createQuery("SELECT h FROM Henkilo h WHERE h.oidHenkilo='VTJYKSILOITY1'", Henkilo.class)
                .getSingleResult();

        assertThat(henkilo)
                .extracting(Henkilo::getOidHenkilo, Henkilo::getHetu, Henkilo::isYksilointiYritetty)
                .containsExactly("VTJYKSILOITY1", "111111-985K", false);
        assertThat(henkilo.getKaikkiHetut()).containsExactlyInAnyOrder("111111-985K", "170775-973B");
        assertPublished(objectMapper, snsClient, 1, henkilo.getOidHenkilo());
    }

    @Test
    @WithMockUser(roles = "APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA")
    public void kaikkiHetutNotModified() {
        HenkiloForceUpdateDto updateDto = new HenkiloForceUpdateDto();
        updateDto.setOidHenkilo("VTJYKSILOITY1");
        updateDto.setKaikkiHetut(null);

        henkiloModificationService.forceUpdateHenkilo(updateDto);
        Henkilo henkilo = this.entityManager
                .createQuery("SELECT h FROM Henkilo h WHERE h.oidHenkilo='VTJYKSILOITY1'", Henkilo.class)
                .getSingleResult();

        assertThat(henkilo)
                .extracting(Henkilo::getOidHenkilo, Henkilo::getHetu, Henkilo::isYksilointiYritetty)
                .containsExactly("VTJYKSILOITY1", "111111-985K", false);
        assertThat(henkilo.getKaikkiHetut()).containsExactlyInAnyOrder("111111-985K");
        assertPublished(objectMapper, snsClient, 1, henkilo.getOidHenkilo());
    }

    @Test
    @WithMockUser(roles = "APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA")
    public void kaikkiHetutAddedOnHetuChange() {
        HenkiloForceUpdateDto updateDto = new HenkiloForceUpdateDto();
        updateDto.setOidHenkilo("VTJYKSILOITY1");
        updateDto.setHetu("170775-973B");

        henkiloModificationService.forceUpdateHenkilo(updateDto);
        Henkilo henkilo = this.entityManager
                .createQuery("SELECT h FROM Henkilo h WHERE h.oidHenkilo='VTJYKSILOITY1'", Henkilo.class)
                .getSingleResult();

        assertThat(henkilo)
                .extracting(Henkilo::getOidHenkilo, Henkilo::getHetu, Henkilo::isYksilointiYritetty)
                .containsExactly("VTJYKSILOITY1", "170775-973B", false);
        assertThat(henkilo.getKaikkiHetut()).containsExactlyInAnyOrder("111111-985K", "170775-973B");
        assertPublished(objectMapper, snsClient, 1, henkilo.getOidHenkilo());
    }

    @Test
    @WithMockUser(roles = "APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA")
    public void yksilointivirheRemovedOnHetuChange() {
        HenkiloUpdateDto updateDto = new HenkiloUpdateDto();
        updateDto.setOidHenkilo("YKSILOINNISSAVIRHE");
        updateDto.setHetu("170775-941A");

        henkiloModificationService.updateHenkilo(updateDto);
        Henkilo henkilo = this.entityManager
                .createQuery("SELECT h FROM Henkilo h WHERE h.oidHenkilo='YKSILOINNISSAVIRHE'", Henkilo.class)
                .getSingleResult();

        assertThat(henkilo)
                .extracting(Henkilo::getOidHenkilo, Henkilo::getHetu, Henkilo::isYksilointiYritetty)
                .containsExactly("YKSILOINNISSAVIRHE", "170775-941A", false);
        assertThat(henkilo.getYksilointivirheet()).isEmpty();
        assertPublished(objectMapper, snsClient, 1, henkilo.getOidHenkilo());
    }

    @Test
    @WithMockUser(roles = "APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA")
    public void yksilointivirheRemovedOnHetuToEmpty() {
        HenkiloUpdateDto updateDto = new HenkiloUpdateDto();
        updateDto.setOidHenkilo("YKSILOINNISSAVIRHE");
        updateDto.setHetu("");

        henkiloModificationService.updateHenkilo(updateDto);
        Henkilo henkilo = this.entityManager
                .createQuery("SELECT h FROM Henkilo h WHERE h.oidHenkilo='YKSILOINNISSAVIRHE'", Henkilo.class)
                .getSingleResult();

        assertThat(henkilo)
                .extracting(Henkilo::getOidHenkilo, Henkilo::getHetu, Henkilo::isYksilointiYritetty)
                .containsExactly("YKSILOINNISSAVIRHE", null, false);
        assertThat(henkilo.getYksilointivirheet()).isEmpty();
        assertPublished(objectMapper, snsClient, 1, henkilo.getOidHenkilo());
    }

    @Test
    @WithMockUser(roles = "APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA")
    public void yksilointivirheRemainsOnHetuToNull() {
        HenkiloUpdateDto updateDto = new HenkiloUpdateDto();
        updateDto.setOidHenkilo("YKSILOINNISSAVIRHE");
        updateDto.setHetu(null);

        henkiloModificationService.updateHenkilo(updateDto);
        Henkilo henkilo = this.entityManager
                .createQuery("SELECT h FROM Henkilo h WHERE h.oidHenkilo='YKSILOINNISSAVIRHE'", Henkilo.class)
                .getSingleResult();

        assertThat(henkilo)
                .extracting(Henkilo::getOidHenkilo, Henkilo::getHetu, Henkilo::isYksilointiYritetty)
                .containsExactly("YKSILOINNISSAVIRHE", "170798-9330", true);
        assertThat(henkilo.getYksilointivirheet()).hasSize(1);
        assertPublished(objectMapper, snsClient, 1, henkilo.getOidHenkilo());
    }

    @Test
    @WithMockUser(roles = "APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA")
    public void yksilointitietoRemovedOnHetuChange() {
        HenkiloUpdateDto updateDto = new HenkiloUpdateDto();
        updateDto.setOidHenkilo("YKSILOINNISSANIMIPIELESSA");
        updateDto.setHetu("170775-989V");

        henkiloModificationService.updateHenkilo(updateDto);
        Henkilo henkilo = this.entityManager
                .createQuery("SELECT h FROM Henkilo h WHERE h.oidHenkilo='YKSILOINNISSANIMIPIELESSA'", Henkilo.class)
                .getSingleResult();

        assertThat(henkilo)
                .extracting(Henkilo::getOidHenkilo, Henkilo::getHetu, Henkilo::isYksilointiYritetty)
                .containsExactly("YKSILOINNISSANIMIPIELESSA", "170775-989V", false);
        assertThat(yksilointitietoRepository.findByHenkilo(henkilo)).isEmpty();
        assertPublished(objectMapper, snsClient, 1, henkilo.getOidHenkilo());
    }

    @Test
    @WithMockUser(roles = "APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA")
    public void yksilointitietoRemovedOnHetuToEmpty() {
        HenkiloUpdateDto updateDto = new HenkiloUpdateDto();
        updateDto.setOidHenkilo("YKSILOINNISSANIMIPIELESSA");
        updateDto.setHetu("");

        henkiloModificationService.updateHenkilo(updateDto);
        Henkilo henkilo = this.entityManager
                .createQuery("SELECT h FROM Henkilo h WHERE h.oidHenkilo='YKSILOINNISSANIMIPIELESSA'", Henkilo.class)
                .getSingleResult();

        assertThat(henkilo)
                .extracting(Henkilo::getOidHenkilo, Henkilo::getHetu, Henkilo::isYksilointiYritetty)
                .containsExactly("YKSILOINNISSANIMIPIELESSA", null, false);
        assertThat(yksilointitietoRepository.findByHenkilo(henkilo)).isEmpty();
        assertPublished(objectMapper, snsClient, 1, henkilo.getOidHenkilo());
    }

    @Test
    @WithMockUser(roles = "APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA")
    public void yksilointitietoRemainsOnHetuToNull() {
        HenkiloUpdateDto updateDto = new HenkiloUpdateDto();
        updateDto.setOidHenkilo("YKSILOINNISSANIMIPIELESSA");
        updateDto.setHetu(null);

        henkiloModificationService.updateHenkilo(updateDto);
        Henkilo henkilo = this.entityManager
                .createQuery("SELECT h FROM Henkilo h WHERE h.oidHenkilo='YKSILOINNISSANIMIPIELESSA'", Henkilo.class)
                .getSingleResult();

        assertThat(henkilo)
                .extracting(Henkilo::getOidHenkilo, Henkilo::getHetu, Henkilo::isYksilointiYritetty)
                .containsExactly("YKSILOINNISSANIMIPIELESSA", "170798-915D", true);
        assertThat(yksilointitietoRepository.findByHenkilo(henkilo)).isNotEmpty();
        assertPublished(objectMapper, snsClient, 1, henkilo.getOidHenkilo());
    }

    @Test
    @WithMockUser(roles = "APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA")
    public void updateHenkiloValidoiKutsumanimimuutoksen() {
        HenkiloUpdateDto updateDto = new HenkiloUpdateDto();
        updateDto.setOidHenkilo("VTJYKSILOITY1");
        updateDto.setKutsumanimi("Seppo");

        Throwable throwable = catchThrowable(() -> henkiloModificationService.updateHenkilo(updateDto));

        assertThat(throwable).isInstanceOf(UnprocessableEntityException.class);
        assertPublished(objectMapper, snsClient, 0);
    }

    @Test
    @WithMockUser(roles = "APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA")
    public void forceUpdateHenkiloTallentaaKutsumanimimuutoksen() {
        HenkiloForceUpdateDto updateDto = new HenkiloForceUpdateDto();
        updateDto.setOidHenkilo("VTJYKSILOITY1");
        updateDto.setKutsumanimi("Taneli");

        HenkiloForceReadDto readDto = henkiloModificationService.forceUpdateHenkilo(updateDto);

        assertThat(readDto.getEtunimet()).isEqualTo("Teppo Taneli");
        assertThat(readDto.getKutsumanimi()).isEqualTo("Taneli");
        assertPublished(objectMapper, snsClient, 1, updateDto.getOidHenkilo());
    }

    @Test
    @WithMockUser(roles = "APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA")
    public void forceUpdateHenkiloValidoiKutsumanimimuutoksen() {
        HenkiloForceUpdateDto updateDto = new HenkiloForceUpdateDto();
        updateDto.setOidHenkilo("VTJYKSILOITY1");
        updateDto.setKutsumanimi("Seppo");

        Throwable throwable = catchThrowable(() -> henkiloModificationService.forceUpdateHenkilo(updateDto));

        assertThat(throwable).isInstanceOf(UnprocessableEntityException.class);
        assertPublished(objectMapper, snsClient, 0);
    }

    @Test
    @WithMockUser(roles = "APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA")
    public void forceUpdateHenkiloPalauttaaHuoltajanJaPaivittaaSuhteen() {
        when(koodistoService.list(eq(Koodisto.MAAT_JA_VALTIOT_2))).thenReturn(Stream.of("246")
                .map(koodi -> new KoodiType() {{ setKoodiArvo(koodi); }}).collect(toList()));
        HenkiloForceUpdateDto updateDto = new HenkiloForceUpdateDto();
        updateDto.setOidHenkilo("YKSILOINNISSANIMIPIELESSA");
        HuoltajaCreateDto huoltaja1 = henkiloRepository.findByOidHenkilo("HUOLTAJA")
                .map(huoltaja -> new HuoltajaCreateDto(huoltaja.getHetu(), huoltaja.getEtunimet(),
                        huoltaja.getKutsumanimi(),
                        huoltaja.getSukunimi(), huoltaja.getSyntymaaika(), huoltaja.isYksiloityVTJ(),
                        huoltaja.getKansalaisuus().stream().map(Kansalaisuus::getKansalaisuusKoodi).collect(toSet()),
                        emptySet(), LocalDate.now(), LocalDate.of(2038, 1, 1)))
                .orElseThrow(IllegalArgumentException::new);
        updateDto.setHuoltajat(singleton(huoltaja1));

        HenkiloForceReadDto readDto = henkiloModificationService.forceUpdateHenkilo(updateDto);
        HenkiloHuoltajaSuhde suhde = this.entityManager
                .createQuery("SELECT s FROM HenkiloHuoltajaSuhde s JOIN s.lapsi h WHERE h.oidHenkilo='YKSILOINNISSANIMIPIELESSA'", HenkiloHuoltajaSuhde.class)
                .getSingleResult();
        assertThat(readDto.getHuoltajat())
                .extracting(HuoltajaCreateDto::getHetu)
                .containsExactly(huoltaja1.getHetu());
        assertThat(suhde.getUpdated())
                .isNotNull();
        assertPublished(objectMapper, snsClient, 2, "YKSILOINNISSANIMIPIELESSA", "HUOLTAJA");
    }

    @Test
    @WithMockUser(roles = "APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA")
    public void huoltajaCreateValidoiHuoltajanHuoltajatyyppi() {
        HuoltajaCreateDto huoltajaCreateDto = HuoltajaCreateDto.builder()
                .hetu("hetu")
                .kansalaisuusKoodi(Collections.singleton("246"))
                .build();

        Throwable throwable = catchThrowable(() -> henkiloModificationService.createHenkilo(huoltajaCreateDto));

        assertThat(throwable).isInstanceOf(UnprocessableEntityException.class);
        assertPublished(objectMapper, snsClient, 0);
    }

    @Test
    @WithMockUser(roles = "APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA")
    public void huoltajaCreateValidoiHuoltajanKansalaisuus() {
        KoodiType kansalaisuustyyppi = new KoodiType();
        kansalaisuustyyppi.setKoodiArvo("246");
        given(this.koodistoService.list(eq(Koodisto.MAAT_JA_VALTIOT_2))).willReturn(Collections.singleton(kansalaisuustyyppi));

        HuoltajaCreateDto huoltajaCreateDto = HuoltajaCreateDto.builder()
                .hetu("hetu")
                .kansalaisuusKoodi(Collections.singleton("VÄÄRÄ TYYPPI"))
                .build();

        Throwable throwable = catchThrowable(() -> henkiloModificationService.createHenkilo(huoltajaCreateDto));

        assertThat(throwable).isInstanceOf(UnprocessableEntityException.class);
        assertPublished(objectMapper, snsClient, 0);
    }

    @Test
    @WithMockUser(roles = "APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA")
    public void huoltajaCreate() {
        KoodiType kansalaisuustyyppi = new KoodiType();
        kansalaisuustyyppi.setKoodiArvo("246");
        given(this.koodistoService.list(eq(Koodisto.MAAT_JA_VALTIOT_2))).willReturn(Collections.singleton(kansalaisuustyyppi));

        HuoltajaCreateDto huoltajaCreateDto = HuoltajaCreateDto.builder()
                .hetu("271198-9197")
                .kansalaisuusKoodi(Collections.singleton("246"))
                .build();

        Henkilo huoltaja = henkiloModificationService.createHenkilo(huoltajaCreateDto);
        assertThat(huoltaja).extracting(Henkilo::getHetu).isEqualTo("271198-9197");
        assertThat(huoltaja.getKansalaisuus()).extracting(Kansalaisuus::getKansalaisuusKoodi).containsExactly("246");
        assertPublished(objectMapper, snsClient, 1, huoltaja.getOidHenkilo());
    }

    @Test
    @WithMockUser(roles = "APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA")
    public void huoltajaUpdateExisting() {
        KoodiType kansalaisuustyyppi = new KoodiType();
        kansalaisuustyyppi.setKoodiArvo("246");
        given(this.koodistoService.list(eq(Koodisto.MAAT_JA_VALTIOT_2))).willReturn(Collections.singleton(kansalaisuustyyppi));

        HuoltajaCreateDto huoltajaCreateDto = HuoltajaCreateDto.builder()
                .hetu("111298-917M")
                .kansalaisuusKoodi(Collections.singleton("246"))
                .yksiloityVTJ(true)
                .yhteystiedotRyhma(Collections.singleton(YhteystiedotRyhmaDto.builder()
                        .yhteystieto(YhteystietoDto.builder()
                                .yhteystietoArvo("Y")
                                .yhteystietoTyyppi(YhteystietoTyyppi.YHTEYSTIETO_SAHKOPOSTI)
                                .build())
                        .ryhmaKuvaus("kuvaus")
                        .ryhmaAlkuperaTieto("alkupera")
                        .build()))
                .build();
        Henkilo lapsi = this.henkiloRepository.findByOidHenkilo("YKSILOINNISSANIMIPIELESSA").orElseThrow(IllegalStateException::new);

        Henkilo huoltaja = henkiloModificationService.findOrCreateHuoltaja(huoltajaCreateDto, lapsi);
        assertThat(huoltaja)
                .extracting(Henkilo::getHetu).isEqualTo("111298-917M");
        assertThat(huoltaja.getKansalaisuus()).extracting(Kansalaisuus::getKansalaisuusKoodi).containsExactly("246");
        assertThat(huoltaja.getYhteystiedotRyhma()).hasSize(1)
                .flatExtracting(YhteystiedotRyhma::getYhteystieto)
                .extracting(Yhteystieto::getYhteystietoArvo)
                .containsExactlyInAnyOrder("Y");
        assertPublished(objectMapper, snsClient, 1, huoltaja.getOidHenkilo());
    }

    @Test
    @WithMockUser(roles = "APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA")
    public void huoltajaCreateWithEmptyHetu() {
        KoodiType kansalaisuustyyppi = new KoodiType();
        kansalaisuustyyppi.setKoodiArvo("246");
        given(this.koodistoService.list(eq(Koodisto.MAAT_JA_VALTIOT_2))).willReturn(Collections.singleton(kansalaisuustyyppi));

        HuoltajaCreateDto huoltajaCreateDto = HuoltajaCreateDto.builder()
                .hetu("")
                .etunimet("huoltaja")
                .kutsumanimi("huoltaja")
                .sukunimi("tyhjallahetulla")
                .syntymaaika(LocalDate.of(1950, 2, 2))
                .kansalaisuusKoodi(Collections.singleton("246"))
                .build();

        Henkilo huoltaja = henkiloModificationService.createHenkilo(huoltajaCreateDto);
        assertThat(huoltaja)
                .extracting(Henkilo::getHetu, Henkilo::getEtunimet, Henkilo::getKutsumanimi, Henkilo::getSukunimi, Henkilo::getSyntymaaika)
                .containsExactly(null, "huoltaja", "huoltaja", "tyhjallahetulla", LocalDate.of(1950, 2, 2));
        assertThat(huoltaja.getKansalaisuus()).extracting(Kansalaisuus::getKansalaisuusKoodi).containsExactly("246");
        assertPublished(objectMapper, snsClient, 1, huoltaja.getOidHenkilo());
    }
}
