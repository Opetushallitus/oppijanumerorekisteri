package fi.vm.sade.oppijanumerorekisteri.repositories;

import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloTyyppi;
import fi.vm.sade.oppijanumerorekisteri.mappers.EntityUtils;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import fi.vm.sade.oppijanumerorekisteri.repositories.criteria.YhteystietoCriteria;
import fi.vm.sade.oppijanumerorekisteri.repositories.dto.YhteystietoHakuDto;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.transaction.annotation.Transactional;

import javax.validation.ConstraintViolationException;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.Optional;

import static fi.vm.sade.oppijanumerorekisteri.dto.YhteystietoRyhma.KOTIOSOITE;
import static fi.vm.sade.oppijanumerorekisteri.dto.YhteystietoRyhma.TYOOSOITE;
import static fi.vm.sade.oppijanumerorekisteri.models.YhteystietoTyyppi.*;
import static fi.vm.sade.oppijanumerorekisteri.repositories.populator.HenkiloPopulator.henkilo;
import static fi.vm.sade.oppijanumerorekisteri.repositories.populator.YhteystiedotRyhmaPopulator.ryhma;
import static org.assertj.core.api.Assertions.assertThat;

@RunWith(SpringRunner.class)
@DataJpaTest
@Transactional(readOnly = true)
public class HenkiloRepositoryTests extends AbstractRepositoryTest {
    @Autowired
    private HenkiloHibernateRepository jpaRepository;

    @Autowired
    private HenkiloRepository dataRepository;

    @Autowired
    private TestEntityManager testEntityManager;

    @Test
    public void findHetuByOidTest() {
        Henkilo henkilo = EntityUtils.createHenkilo("arpa", "arpa", "kuutio", "123456-9999", "1.2.3.4.5", false,
                HenkiloTyyppi.OPPIJA, "fi", "suomi", "246", new Date());
        this.testEntityManager.persist(henkilo);
        Optional<String> hetu = this.jpaRepository.findHetuByOid("1.2.3.4.5");
        assertThat(hetu.orElse("")).isEqualTo("123456-9999");
    }

    @Test
    public void findHetuByOidNoHetuTest() {
        Henkilo henkilo = EntityUtils.createHenkilo("arpa", "arpa", "kuutio", "", "1.2.3.4.5", false,
                HenkiloTyyppi.OPPIJA, "fi", "suomi", "246", new Date());
        this.testEntityManager.persist(henkilo);
        Optional<String> hetu = this.jpaRepository.findHetuByOid("1.2.3.4.5");
        assertThat(hetu.orElse("").isEmpty());
    }

    @Test
    public void findOidByHetuTest() {
        Henkilo henkilo = EntityUtils.createHenkilo("arpa", "arpa", "kuutio", "123456-9999", "1.2.3.4.5", false,
                HenkiloTyyppi.OPPIJA, "fi", "suomi", "246", new Date());
        this.testEntityManager.persist(henkilo);
        Optional<String> oid = this.jpaRepository.findOidByHetu("123456-9999");
        assertThat(oid.orElse("")).isEqualTo("1.2.3.4.5");
    }

    @Test
    public void userOidNotInDbTest() {
        Optional<String> hetu = this.jpaRepository.findHetuByOid("unknown oid");
        assertThat(hetu.isPresent()).isFalse();
    }

    @Test(expected = DataIntegrityViolationException.class)
    public void createUserWithNullOidTest() {
        Henkilo henkiloWithNullOid = EntityUtils.createHenkilo("arpa", "arpa", "kuutio", "123456-9999", null, false,
                HenkiloTyyppi.OPPIJA, "fi", "suomi", "246", new Date());
        this.dataRepository.save(henkiloWithNullOid);
    }

    @Test(expected = ConstraintViolationException.class)
    public void createUserWithNullLuontiPvmTest() {
        Henkilo henkiloWithNullLuontiPvm = EntityUtils.createHenkilo("arpa", "arpa", "kuutio", "123456-9999", "1.2.3.4.5",
                false, HenkiloTyyppi.OPPIJA, "fi", "suomi", "246", new Date());
        henkiloWithNullLuontiPvm.setLuontiPvm(null);
        testEntityManager.persist(henkiloWithNullLuontiPvm);
    }

    @Test
    public void findByOidhenkiloIsInTest() {
        Date luontiMuokkausPvm = new Date();
        Henkilo henkilo = EntityUtils.createHenkilo("arpa", "arpa", "kuutio", "123456-9999", "1.2.3.4.5", false,
                HenkiloTyyppi.OPPIJA, "fi", "suomi", "246", luontiMuokkausPvm);
        Henkilo persistedHenkilo = EntityUtils.createHenkilo("arpa", "arpa", "kuutio", "123456-9999", "1.2.3.4.5", false,
                HenkiloTyyppi.OPPIJA, "fi", "suomi", "246", luontiMuokkausPvm);
        this.testEntityManager.persist(persistedHenkilo);
        List<Henkilo> resultHenkiloList = this.dataRepository.findByOidhenkiloIsIn(Collections.singletonList("1.2.3.4.5"));
        persistedHenkilo = resultHenkiloList.get(0);
        assertThat(persistedHenkilo).isEqualToIgnoringGivenFields(henkilo, "id", "version");
    }

    @Test
    public void findByOidhenkiloInTest() {
        Date luontiMuokkausPvm = new Date();
        Henkilo henkilo = EntityUtils.createHenkilo("arpa", "arpa", "kuutio", "123456-9999", "1.2.3.4.5", false,
                HenkiloTyyppi.OPPIJA, "fi", "suomi", "246", luontiMuokkausPvm);
        Henkilo persistedHenkilo = EntityUtils.createHenkilo("arpa", "arpa", "kuutio", "123456-9999", "1.2.3.4.5", false,
                HenkiloTyyppi.OPPIJA, "fi", "suomi", "246", luontiMuokkausPvm);
        this.testEntityManager.persist(persistedHenkilo);
        List<Henkilo> resultHenkiloList = this.dataRepository.findByOidhenkiloIn(Collections.singletonList("1.2.3.4.5"));
        persistedHenkilo = resultHenkiloList.get(0);
        assertThat(persistedHenkilo).isEqualToIgnoringGivenFields(henkilo, "id", "version");
    }

    @Test
    public void findByHetuTest() {
        Date luontiMuokkausPvm = new Date();
        Henkilo henkilo = EntityUtils.createHenkilo("arpa", "arpa", "kuutio", "123456-9999", "1.2.3.4.5", false,
                HenkiloTyyppi.OPPIJA, "fi", "suomi", "246", luontiMuokkausPvm);
        Henkilo persistedHenkilo = EntityUtils.createHenkilo("arpa", "arpa", "kuutio", "123456-9999", "1.2.3.4.5", false,
                HenkiloTyyppi.OPPIJA, "fi", "suomi", "246", luontiMuokkausPvm);
        this.testEntityManager.persist(persistedHenkilo);
        persistedHenkilo = this.dataRepository.findByHetu("123456-9999").orElse(null);
        assertThat(persistedHenkilo).isEqualToIgnoringGivenFields(henkilo, "id", "version");
    }

    @Test
    public void findHenkiloOidHetuNimisByEtunimetOrSukunimiTest() {
        Date luontiMuokkausPvm = new Date();
        Henkilo henkilo = EntityUtils.createHenkilo("arpa", "arpa", "kuutio", "123456-9999", "1.2.3.4.5", false,
                HenkiloTyyppi.OPPIJA, "fi", "suomi", "246", luontiMuokkausPvm);
        Henkilo persistedHenkilo = EntityUtils.createHenkilo("arpa", "arpa", "kuutio", "123456-9999", "1.2.3.4.5", false,
                HenkiloTyyppi.OPPIJA, "fi", "suomi", "246", luontiMuokkausPvm);
        this.testEntityManager.persist(persistedHenkilo);
        List<Henkilo> persistedHenkiloList = this.jpaRepository.findHenkiloOidHetuNimisByEtunimetOrSukunimi(Collections.singletonList("arpa"), "kuutio");
        persistedHenkilo = persistedHenkiloList.get(0);
        assertThat(persistedHenkilo).isEqualToComparingOnlyGivenFields(henkilo, "etunimet", "kutsumanimi", "sukunimi",
                "oidhenkilo", "hetu");
    }



    @Test
    public void findYhteystiedotTest() {
        populate(henkilo("1.2.3.4.5")
            .withYhteystieto(ryhma(KOTIOSOITE)
                .tieto(YHTEYSTIETO_KATUOSOITE, "Kotikatu 3")
                .tieto(YHTEYSTIETO_POSTINUMERO, "12345")
                .tieto(YHTEYSTIETO_KAUPUNKI, "Toijala")
            )
            .withYhteystieto(ryhma(TYOOSOITE).alkupera("alkuperä")
                .tieto(YHTEYSTIETO_SAHKOPOSTI, "tyo@osoite.com")
            )
        );
        
        List<YhteystietoHakuDto> tiedot = this.jpaRepository.findYhteystiedot(new YhteystietoCriteria());
        assertThat(tiedot.size()).isEqualTo(4);

        tiedot = this.jpaRepository.findYhteystiedot(new YhteystietoCriteria().withHenkiloOid("non-existing"));
        assertThat(tiedot.size()).isEqualTo(0);

        tiedot = this.jpaRepository.findYhteystiedot(new YhteystietoCriteria().withHenkiloOid("1.2.3.4.5"));
        assertThat(tiedot.size()).isEqualTo(4);

        tiedot = this.jpaRepository.findYhteystiedot(new YhteystietoCriteria().withHenkiloOid("1.2.3.4.5")
                    .withRyhma(TYOOSOITE));
        assertThat(tiedot.size()).isEqualTo(1);
        assertThat(tiedot.get(0).getArvo()).isEqualTo("tyo@osoite.com");
        assertThat(tiedot.get(0).getHenkiloOid()).isEqualTo("1.2.3.4.5");
        assertThat(tiedot.get(0).getRyhmaAlkuperaTieto()).isEqualTo("alkuperä");
        assertThat(tiedot.get(0).getRyhmaKuvaus()).isEqualTo(TYOOSOITE.getRyhmanKuvaus());
        assertThat(tiedot.get(0).getHenkiloOid()).isEqualTo("1.2.3.4.5");
    }


}
