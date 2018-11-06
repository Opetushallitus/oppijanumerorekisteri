package fi.vm.sade.oppijanumerorekisteri.services;

import fi.vm.sade.koodisto.service.types.common.KoodiType;
import fi.vm.sade.oppijanumerorekisteri.IntegrationTest;
import fi.vm.sade.oppijanumerorekisteri.clients.KayttooikeusClient;
import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloForceUpdateDto;
import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloReadDto;
import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloUpdateDto;
import fi.vm.sade.oppijanumerorekisteri.dto.HuoltajaCreateDto;
import fi.vm.sade.oppijanumerorekisteri.exceptions.UnprocessableEntityException;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import fi.vm.sade.oppijanumerorekisteri.models.HenkiloViite;
import fi.vm.sade.oppijanumerorekisteri.models.Kansalaisuus;
import fi.vm.sade.oppijanumerorekisteri.repositories.HenkiloRepository;
import fi.vm.sade.oppijanumerorekisteri.repositories.HenkiloViiteRepository;
import fi.vm.sade.oppijanumerorekisteri.repositories.YksilointitietoRepository;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.transaction.annotation.Transactional;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.stream.Stream;

import static java.util.stream.Collectors.toSet;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.catchThrowable;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;

@RunWith(SpringRunner.class)
@IntegrationTest
@Transactional
@Sql("/sql/henkilo-modification-test.sql")
public class HenkiloModificationServiceIntegrationTest {
    @Autowired
    private HenkiloModificationService henkiloModificationService;

    @Autowired
    private HenkiloService henkiloService;

    @MockBean
    private KayttooikeusClient kayttooikeusClient;

    @Autowired
    private HenkiloRepository henkiloRepository;

    @Autowired
    private HenkiloViiteRepository henkiloViiteRepository;

    @Autowired
    private YksilointitietoRepository yksilointitietoRepository;

    @MockBean
    private KoodistoService koodistoService;

    @PersistenceContext
    private EntityManager entityManager;

    @Test
    @WithMockUser(roles = "APP_HENKILONHALLINTA_OPHREKISTERI")
    public void updateVtjYksiloityHetuAndVtjYksiloityHasHenkiloHasNewHetu() {
        HenkiloForceUpdateDto henkiloForceUpdateDto = new HenkiloForceUpdateDto();
        henkiloForceUpdateDto.setOidHenkilo("VTJYKSILOITY1");
        henkiloForceUpdateDto.setHetu("111111-1234");

        HenkiloReadDto henkiloReadDto = this.henkiloModificationService.forceUpdateHenkilo(henkiloForceUpdateDto);

        assertThat(henkiloReadDto)
                .extracting(HenkiloReadDto::getOidHenkilo, HenkiloReadDto::getHetu, HenkiloReadDto::getYksiloityVTJ)
                .containsExactly("VTJYKSILOITY1", "111111-1234", true);

        Henkilo henkilo = this.henkiloRepository.findByOidHenkilo("VTJYKSILOITY2")
                .orElseThrow(RuntimeException::new);
        assertThat(henkilo)
                .extracting(Henkilo::getOidHenkilo, Henkilo::getHetu, Henkilo::isYksiloityVTJ)
                .containsExactly("VTJYKSILOITY2", null, false);

        List<HenkiloViite> henkiloViiteList = this.henkiloViiteRepository.findByMasterOid("VTJYKSILOITY1");
        assertThat(henkiloViiteList)
                .flatExtracting(HenkiloViite::getMasterOid, HenkiloViite::getSlaveOid)
                .containsExactly("VTJYKSILOITY1", "VTJYKSILOITY2");
    }

    @Test
    @WithMockUser(roles = "APP_HENKILONHALLINTA_OPHREKISTERI")
    public void updateHenkiloTallentaaKutsumanimimuutoksen() {
        HenkiloUpdateDto updateDto = new HenkiloUpdateDto();
        updateDto.setOidHenkilo("VTJYKSILOITY1");
        updateDto.setKutsumanimi("Taneli");

        henkiloModificationService.updateHenkilo(updateDto);
        HenkiloReadDto readDto = henkiloService.getMasterByOid("VTJYKSILOITY1");

        assertThat(readDto.getEtunimet()).isEqualTo("Teppo Taneli");
        assertThat(readDto.getKutsumanimi()).isEqualTo("Taneli");
    }

    @Test
    @WithMockUser(roles = "APP_HENKILONHALLINTA_OPHREKISTERI")
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
    }

    @Test
    @WithMockUser(roles = "APP_HENKILONHALLINTA_OPHREKISTERI")
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
    }

    @Test
    @WithMockUser(roles = "APP_HENKILONHALLINTA_OPHREKISTERI")
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
    }

    @Test
    @WithMockUser(roles = "APP_HENKILONHALLINTA_OPHREKISTERI")
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
    }

    @Test
    @WithMockUser(roles = "APP_HENKILONHALLINTA_OPHREKISTERI")
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
    }

    @Test
    @WithMockUser(roles = "APP_HENKILONHALLINTA_OPHREKISTERI")
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
    }

    @Test
    @WithMockUser(roles = "APP_HENKILONHALLINTA_OPHREKISTERI")
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
    }

    @Test
    @WithMockUser(roles = "APP_HENKILONHALLINTA_OPHREKISTERI")
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
    }

    @Test
    @WithMockUser(roles = "APP_HENKILONHALLINTA_OPHREKISTERI")
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
    }

    @Test
    @WithMockUser(roles = "APP_HENKILONHALLINTA_OPHREKISTERI")
    public void updateHenkiloValidoiKutsumanimimuutoksen() {
        HenkiloUpdateDto updateDto = new HenkiloUpdateDto();
        updateDto.setOidHenkilo("VTJYKSILOITY1");
        updateDto.setKutsumanimi("Seppo");

        Throwable throwable = catchThrowable(() -> henkiloModificationService.updateHenkilo(updateDto));

        assertThat(throwable).isInstanceOf(UnprocessableEntityException.class);
    }

    @Test
    @WithMockUser(roles = "APP_HENKILONHALLINTA_OPHREKISTERI")
    public void forceUpdateHenkiloTallentaaKutsumanimimuutoksen() {
        HenkiloForceUpdateDto updateDto = new HenkiloForceUpdateDto();
        updateDto.setOidHenkilo("VTJYKSILOITY1");
        updateDto.setKutsumanimi("Taneli");

        HenkiloReadDto readDto = henkiloModificationService.forceUpdateHenkilo(updateDto);

        assertThat(readDto.getEtunimet()).isEqualTo("Teppo Taneli");
        assertThat(readDto.getKutsumanimi()).isEqualTo("Taneli");
    }

    @Test
    @WithMockUser(roles = "APP_HENKILONHALLINTA_OPHREKISTERI")
    public void forceUpdateHenkiloValidoiKutsumanimimuutoksen() {
        HenkiloForceUpdateDto updateDto = new HenkiloForceUpdateDto();
        updateDto.setOidHenkilo("VTJYKSILOITY1");
        updateDto.setKutsumanimi("Seppo");

        Throwable throwable = catchThrowable(() -> henkiloModificationService.forceUpdateHenkilo(updateDto));

        assertThat(throwable).isInstanceOf(UnprocessableEntityException.class);
    }

    @Test
    @WithMockUser(roles = "APP_HENKILONHALLINTA_OPHREKISTERI")
    public void huoltajaCreateValidoiHuoltajanHuoltajatyyppi() {
        KoodiType koodiType = new KoodiType();
        koodiType.setKoodiArvo("03");
        given(this.koodistoService.list(eq(Koodisto.HUOLTAJUUSTYYPPI))).willReturn(Collections.singleton(koodiType));

        HuoltajaCreateDto huoltajaCreateDto = HuoltajaCreateDto.builder()
                .hetu("hetu")
                .huoltajuustyyppiKoodi("VÄÄRÄ TYYPPI")
                .kansalaisuusKoodi(Collections.singleton("246"))
                .build();

        Throwable throwable = catchThrowable(() -> henkiloModificationService.createHenkilo(huoltajaCreateDto));

        assertThat(throwable).isInstanceOf(UnprocessableEntityException.class);
    }

    @Test
    @WithMockUser(roles = "APP_HENKILONHALLINTA_OPHREKISTERI")
    public void huoltajaCreateValidoiHuoltajanKansalaisuus() {
        KoodiType huoltajuustyyppi = new KoodiType();
        huoltajuustyyppi.setKoodiArvo("03");
        KoodiType kansalaisuustyyppi = new KoodiType();
        kansalaisuustyyppi.setKoodiArvo("246");
        given(this.koodistoService.list(eq(Koodisto.HUOLTAJUUSTYYPPI))).willReturn(Collections.singleton(huoltajuustyyppi));
        given(this.koodistoService.list(eq(Koodisto.MAAT_JA_VALTIOT_2))).willReturn(Collections.singleton(kansalaisuustyyppi));

        HuoltajaCreateDto huoltajaCreateDto = HuoltajaCreateDto.builder()
                .hetu("hetu")
                .huoltajuustyyppiKoodi("03")
                .kansalaisuusKoodi(Collections.singleton("VÄÄRÄ TYYPPI"))
                .build();

        Throwable throwable = catchThrowable(() -> henkiloModificationService.createHenkilo(huoltajaCreateDto));

        assertThat(throwable).isInstanceOf(UnprocessableEntityException.class);
    }

    @Test
    @WithMockUser(roles = "APP_HENKILONHALLINTA_OPHREKISTERI")
    public void huoltajaCreate() {
        KoodiType huoltajuustyyppi = new KoodiType();
        huoltajuustyyppi.setKoodiArvo("03");
        KoodiType kansalaisuustyyppi = new KoodiType();
        kansalaisuustyyppi.setKoodiArvo("246");
        given(this.koodistoService.list(eq(Koodisto.HUOLTAJUUSTYYPPI))).willReturn(Collections.singleton(huoltajuustyyppi));
        given(this.koodistoService.list(eq(Koodisto.MAAT_JA_VALTIOT_2))).willReturn(Collections.singleton(kansalaisuustyyppi));

        HuoltajaCreateDto huoltajaCreateDto = HuoltajaCreateDto.builder()
                .hetu("hetu")
                .huoltajuustyyppiKoodi("03")
                .kansalaisuusKoodi(Collections.singleton("246"))
                .build();

        Henkilo huoltaja = henkiloModificationService.createHenkilo(huoltajaCreateDto);
        assertThat(huoltaja).extracting(Henkilo::getHetu).containsExactly("hetu");
        assertThat(huoltaja.getKansalaisuus()).extracting(Kansalaisuus::getKansalaisuusKoodi).containsExactly("246");
    }

    @Test
    @WithMockUser(roles = "APP_HENKILONHALLINTA_OPHREKISTERI")
    public void huoltajaCreateWithEmptyHetu() {
        KoodiType huoltajuustyyppi = new KoodiType();
        huoltajuustyyppi.setKoodiArvo("03");
        KoodiType kansalaisuustyyppi = new KoodiType();
        kansalaisuustyyppi.setKoodiArvo("246");
        given(this.koodistoService.list(eq(Koodisto.HUOLTAJUUSTYYPPI))).willReturn(Collections.singleton(huoltajuustyyppi));
        given(this.koodistoService.list(eq(Koodisto.MAAT_JA_VALTIOT_2))).willReturn(Collections.singleton(kansalaisuustyyppi));

        HuoltajaCreateDto huoltajaCreateDto = HuoltajaCreateDto.builder()
                .hetu("")
                .etunimet("huoltaja")
                .sukunimi("tyhjallahetulla")
                .syntymaaika(LocalDate.of(1950, 2, 2))
                .huoltajuustyyppiKoodi("03")
                .kansalaisuusKoodi(Collections.singleton("246"))
                .build();

        Henkilo huoltaja = henkiloModificationService.createHenkilo(huoltajaCreateDto);
        assertThat(huoltaja)
                .extracting(Henkilo::getHetu, Henkilo::getEtunimet, Henkilo::getKutsumanimi, Henkilo::getSukunimi, Henkilo::getSyntymaaika)
                .containsExactly(null, "huoltaja", "huoltaja", "tyhjallahetulla", LocalDate.of(1950, 2, 2));
        assertThat(huoltaja.getKansalaisuus()).extracting(Kansalaisuus::getKansalaisuusKoodi).containsExactly("246");
    }

}
