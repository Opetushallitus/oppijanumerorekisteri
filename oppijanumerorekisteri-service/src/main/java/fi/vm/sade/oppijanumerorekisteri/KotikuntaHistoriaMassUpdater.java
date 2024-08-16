package fi.vm.sade.oppijanumerorekisteri;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.validation.BindException;

import com.fasterxml.jackson.databind.JsonNode;

import fi.vm.sade.oppijanumerorekisteri.clients.SlackClient;
import fi.vm.sade.oppijanumerorekisteri.clients.VtjMuutostietoClient;
import fi.vm.sade.oppijanumerorekisteri.exceptions.UnprocessableEntityException;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import fi.vm.sade.oppijanumerorekisteri.models.KotikuntaHistoria;
import fi.vm.sade.oppijanumerorekisteri.models.TurvakieltoKotikunta;
import fi.vm.sade.oppijanumerorekisteri.models.TurvakieltoKotikuntaHistoria;
import fi.vm.sade.oppijanumerorekisteri.models.VtjPerustieto;
import fi.vm.sade.oppijanumerorekisteri.repositories.HenkiloRepository;
import fi.vm.sade.oppijanumerorekisteri.repositories.KotikuntaHistoriaRepository;
import fi.vm.sade.oppijanumerorekisteri.repositories.TurvakieltoKotikuntaHistoriaRepository;
import fi.vm.sade.oppijanumerorekisteri.repositories.TurvakieltoKotikuntaRepository;
import fi.vm.sade.oppijanumerorekisteri.services.vtj.TietoryhmaMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import static fi.vm.sade.oppijanumerorekisteri.services.vtj.TietoryhmaMapper.getStringValue;

@Slf4j
@Service
@RequiredArgsConstructor
public class KotikuntaHistoriaMassUpdater {
    private final VtjMuutostietoClient muutostietoClient;
    private final KotikuntaHistoriaRepository kotikuntaHistoriaRepository;
    private final TurvakieltoKotikuntaHistoriaRepository turvakieltoKotikuntaHistoriaRepository;
    private final TurvakieltoKotikuntaRepository turvakieltoKotikuntaRepository;
    private final HenkiloRepository henkiloRepository;
    private final SlackClient slackClient;
    private final JdbcTemplate jdbcTemplate;

    @Autowired
    private TransactionTemplate transaction;

    public void task() {
        log.info("starting kotikuntahistoria task");
        List<String> hetus = henkiloRepository.findHetusWithoutKotikuntaHistoriaMassUpdate(1000);
        try {
            List<VtjPerustieto> perustietoList = muutostietoClient.fetchEdellinenKotikuntaPerustieto(hetus);
            if (perustietoList.size() > 0) {
                perustietoList.stream().forEach(perustieto -> transaction.execute(status -> handlePerustieto(perustieto)));
            } else {
                log.info("found 0 henkilos without kotikuntahistoria mass update");
            }
        } catch (InterruptedException ie) {
            log.error("interrupted while fetching kotikuntahistoria", ie);
            Thread.currentThread().interrupt();
        } catch (UnprocessableEntityException uee) {
            BindException bindException = (BindException) uee.getErrors();
            log.error("exception while processing kotikuntahistoria", bindException);
            slackClient.sendToSlack("Virhe kotikuntahistoria päivityksessä", bindException.getMessage());
        } catch (Exception e) {
            log.error("exception while fetching kotikuntahistoria", e);
            slackClient.sendToSlack("Virhe kotikuntahistoria tallennuksessa", e.getMessage());
        }
        log.info("finishing kotikuntahistoria task");
    }

    private void updateKotikunta(Henkilo henkilo, JsonNode tietoryhmat) {
        for (JsonNode tietoryhma : tietoryhmat) {
            if ("KOTIKUNTA".equals(getStringValue(tietoryhma, "tietoryhma"))) {
                String kotikunta = getStringValue(tietoryhma, "kuntakoodi");
                if (!kotikunta.equals(henkilo.getKotikunta())) {
                    log.warn("updating kotikunta " + henkilo.getKotikunta() + " to " + kotikunta + " for henkilo " + henkilo.getOidHenkilo());
                    henkilo.setKotikunta(kotikunta);
                    henkilo.setModified(new Date());
                    henkiloRepository.save(henkilo);
                }
            }
        }
    }

    private Void handlePerustieto(VtjPerustieto perustieto) {
        henkiloRepository.findByHetu(perustieto.henkilotunnus).ifPresent(henkilo -> {
            try {
                boolean isTurvakielto = isTurvakielto(perustieto.tietoryhmat);
                saveKotikuntaHistoria(henkilo.getId(), perustieto.tietoryhmat, isTurvakielto);
                updateKotikunta(henkilo, perustieto.tietoryhmat);
                jdbcTemplate.update("delete from kotikunta_historia_mass_update where henkilo_id = ?", henkilo.getId());
                log.info(henkilo.getOidHenkilo() + " updated with kotikuntahistoria");
            } catch (Exception e) {
                log.error("failed to save kotikuntahistoria for henkilo " + henkilo.getOidHenkilo(), e);
                slackClient.sendToSlack("Virhe kotikuntahistorian tallennuksessa henkilölle " + henkilo.getOidHenkilo(), e.getMessage());
            }
        });
        return null;
    }

    private void saveKotikuntaHistoria(Long henkiloId, JsonNode tietoryhmat, boolean turvakielto) {
        kotikuntaHistoriaRepository.findAllByHenkiloId(henkiloId)
            .stream()
            .forEach(historia -> kotikuntaHistoriaRepository.delete(historia));
        turvakieltoKotikuntaHistoriaRepository.findAllByHenkiloId(henkiloId)
            .stream()
            .forEach(historia -> turvakieltoKotikuntaHistoriaRepository.delete(historia));

        List<KotikuntaHistoria> kotikuntaHistoriaList = new ArrayList<>();
        for (JsonNode tietoryhma : tietoryhmat) {
            if ("EDELLINEN_KOTIKUNTA".equals(getStringValue(tietoryhma, "tietoryhma"))) {
                kotikuntaHistoriaList.add(KotikuntaHistoria.builder()
                    .henkiloId(henkiloId)
                    .kotikunta(getStringValue(tietoryhma, "kuntakoodi"))
                    .kuntaanMuuttopv(TietoryhmaMapper.parseDate(tietoryhma.get("kuntaanMuuttopv")))
                    .kunnastaPoisMuuttopv(TietoryhmaMapper.parseDate(tietoryhma.get("kunnastaPoisMuuttopv")))
                    .build());
            } else if ("KOTIKUNTA".equals(getStringValue(tietoryhma, "tietoryhma"))) {
                if (turvakielto) {
                    var currentKotikuntaHistoria = TurvakieltoKotikuntaHistoria.builder()
                        .henkiloId(henkiloId)
                        .kotikunta(getStringValue(tietoryhma, "kuntakoodi"))
                        .kuntaanMuuttopv(TietoryhmaMapper.parseDate(tietoryhma.get("kuntaanMuuttopv")))
                        .build();
                    turvakieltoKotikuntaHistoriaRepository.save(currentKotikuntaHistoria);

                    turvakieltoKotikuntaRepository.findByHenkiloId(henkiloId)
                        .stream()
                        .forEach(kotikunta -> turvakieltoKotikuntaRepository.delete(kotikunta));

                    var turvakieltoKotikunta = TurvakieltoKotikunta.builder()
                        .henkiloId(henkiloId)
                        .kotikunta(getStringValue(tietoryhma, "kuntakoodi"))
                        .build();
                    turvakieltoKotikuntaRepository.save(turvakieltoKotikunta);
                } else {
                    var currentKotikuntaHistoria = KotikuntaHistoria.builder()
                        .henkiloId(henkiloId)
                        .kotikunta(getStringValue(tietoryhma, "kuntakoodi"))
                        .kuntaanMuuttopv(TietoryhmaMapper.parseDate(tietoryhma.get("kuntaanMuuttopv")))
                        .build();
                    kotikuntaHistoriaList.add(currentKotikuntaHistoria);
                }
            }
        }
        kotikuntaHistoriaRepository.saveAll(kotikuntaHistoriaList);
    }

    private boolean isTurvakielto(JsonNode tietoryhmat) {
        for (JsonNode tietoryhma : tietoryhmat) {
            if ("TURVAKIELTO".equals(getStringValue(tietoryhma, "tietoryhma"))) {
                return tietoryhma.get("turvakieltoAktiivinen").asBoolean();
            }
        }
        return false;
    }
}
