package fi.vm.sade.oppijanumerorekisteri.services;

import com.fasterxml.jackson.databind.JsonNode;
import com.google.common.collect.Lists;
import fi.vm.sade.oppijanumerorekisteri.clients.SlackClient;
import fi.vm.sade.oppijanumerorekisteri.clients.VtjMuutostietoClient;
import fi.vm.sade.oppijanumerorekisteri.clients.model.VtjMuutostietoResponse;
import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloForceReadDto;
import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloForceUpdateDto;
import fi.vm.sade.oppijanumerorekisteri.exceptions.UnprocessableEntityException;
import fi.vm.sade.oppijanumerorekisteri.mappers.OrikaConfiguration;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import fi.vm.sade.oppijanumerorekisteri.models.VtjMuutostieto;
import fi.vm.sade.oppijanumerorekisteri.models.VtjMuutostietoKirjausavain;
import fi.vm.sade.oppijanumerorekisteri.models.VtjPerustieto;
import fi.vm.sade.oppijanumerorekisteri.repositories.*;
import fi.vm.sade.oppijanumerorekisteri.services.vtj.*;
import fi.vm.sade.oppijanumerorekisteri.validators.VtjMuutostietoValidator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.validation.BindException;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.concurrent.CompletionException;

import static fi.vm.sade.oppijanumerorekisteri.services.vtj.MuutostietoMapper.getStringValue;

@Slf4j
@Service
@RequiredArgsConstructor
public class VtjMuutostietoService {
    private final VtjMuutostietoKirjausavainRepository kirjausavainRepository;
    private final VtjMuutostietoRepository muutostietoRepository;
    private final VtjMuutostietoClient muutostietoClient;
    private final KotikuntaHistoriaRepository kotikuntaHistoriaRepository;
    private final HenkiloRepository henkiloRepository;
    private final HenkiloModificationService henkiloModificationService;
    private final OrikaConfiguration mapper;
    private final KoodistoService koodistoService;
    private final SlackClient slackClient;
    private final PerustietoMapper perustietoMapper;
    private final MuutostietoMapper muutostietoMapper;

    @Autowired
    private TransactionTemplate transaction;

    private VtjMuutostietoKirjausavain fetchNewKirjausavain(long id) {
        try {
            long avain = muutostietoClient.fetchMuutostietoKirjausavain();
            VtjMuutostietoKirjausavain kirjausavain = new VtjMuutostietoKirjausavain(id, avain, LocalDateTime.now());
            kirjausavainRepository.save(kirjausavain);
            return kirjausavain;
        } catch (InterruptedException ie) {
            log.error("interrupted fetching a new kirjausavain", ie);
            Thread.currentThread().interrupt();
            throw new CompletionException(ie);
        } catch (Exception e) {
            throw new CompletionException(e);
        }
    }

    protected boolean fetchMuutostietoBatchForBucket(long bucketId, List<String> hetus) {
        try {
            VtjMuutostietoKirjausavain kirjausavain = kirjausavainRepository.findById(bucketId)
                    .orElseGet(() -> fetchNewKirjausavain(bucketId));
            log.info("using kirjausavain " + kirjausavain.getAvain() + " for bucket " + bucketId);
            VtjMuutostietoResponse response = muutostietoClient.fetchHenkiloMuutostieto(kirjausavain.getAvain(),
                    hetus);
            muutostietoRepository.saveAll(response.getMuutokset());
            kirjausavain.setAvain(response.getViimeisinKirjausavain());
            kirjausavain.setUpdatedAt(LocalDateTime.now());
            kirjausavainRepository.save(kirjausavain);
            return response.getAjanTasalla();
        } catch (InterruptedException ie) {
            log.error("interrupted while fetching muutostieto for bucket " + bucketId, ie);
            Thread.currentThread().interrupt();
            return true;
        } catch (MuutostietoRetryException mre) {
            log.error("muutostieto fetch failed after retries", mre);
            return true;
        } catch (Exception e) {
            log.error("exception while fetching muutostieto for bucket " + bucketId, e);
            slackClient.sendToSlack("Virhe VTJ-muutostietojen haussa", e.getMessage());
            return true;
        }
    }

    private String findYhteystietoLocale(HenkiloForceReadDto read, JsonNode tietoryhmat) {
        if (read.getAsiointiKieli() != null) {
            return read.getAsiointiKieli().getKieliKoodi();
        }
        if (read.getAidinkieli() != null) {
            return read.getAidinkieli().getKieliKoodi();
        }
        for (JsonNode tietoryhma : tietoryhmat) {
            if ("AIDINKIELI".equals(getStringValue(tietoryhma, "tietoryhma"))) {
                return "swe".equals(getStringValue(tietoryhma, "kielikoodiISO6392")) ? "sv" : "fi";
            }
        }
        return "fi";
    }

    private HenkiloForceUpdateDto mapToUpdateDto(HenkiloForceReadDto read, JsonNode tietoryhmat, TietoryhmaMapper mapper) {
        HenkiloForceUpdateDto update = new HenkiloForceUpdateDto();
        update.setOidHenkilo(read.getOidHenkilo());
        update.setTurvakielto(read.getTurvakielto());
        update.setYhteystiedotRyhma(read.getYhteystiedotRyhma());
        update.setHuoltajat(read.getHuoltajat());
        update.setKaikkiHetut(read.getKaikkiHetut());
        update.setKotikunta(read.getKotikunta());
        String locale = findYhteystietoLocale(read, tietoryhmat);
        for (JsonNode tietoryhma : tietoryhmat) {
            mapper.mutateUpdateDto(update, tietoryhma, locale);
        }
        VtjMuutostietoValidator validator = new VtjMuutostietoValidator(koodistoService);
        validator.validateAndCorrectErrors(read, update);
        return update;
    }

    private boolean isHenkilotunnusKorjaus(JsonNode tietoryhmat, Henkilo henkilo) {
        for (JsonNode tietoryhma : tietoryhmat) {
            if ("HENKILOTUNNUS_KORJAUS".equals(getStringValue(tietoryhma, "tietoryhma"))
                    && !henkilo.getHetu().equals(getStringValue(tietoryhma, "aktiivinenHenkilotunnus"))) {
                return true;
            }
        }
        return false;
    }

    protected Void savePerustieto(VtjPerustieto perustieto) {
        henkiloRepository.findByHetu(perustieto.henkilotunnus).ifPresent(henkilo -> {
            try {
                if (isHenkilotunnusKorjaus(perustieto.tietoryhmat, henkilo)) {
                    slackClient.sendToSlack(String.format(
                            "VTJ-perustietojen tallennus käyttäjälle %s estetty HENKILOTUNNUS_KORJAUS-tietoryhmän vuoksi",
                            henkilo.getOidHenkilo()), null);
                    return;
                }

                log.info("Transforming VTJ perustieto into Henkilo changes");
                HenkiloForceReadDto read = mapper.map(henkilo, HenkiloForceReadDto.class);
                HenkiloForceUpdateDto update = mapToUpdateDto(read, perustieto.tietoryhmat, perustietoMapper);
                henkiloModificationService.forceUpdateHenkilo(update);
                henkilo.setVtjBucket(henkilo.getId() % 100);
                henkiloRepository.save(henkilo);

                log.info("Transforming VTJ perustieto into Kotikuntahistoria changes");
                kotikuntaHistoriaRepository.deleteAllByHenkiloId(henkilo.getId());
                var kotikuntahistoriaChanges = perustietoMapper.mapToKotikuntahistoriaChanges(henkilo, perustieto.tietoryhmat, new ArrayList<>());
                kotikuntaHistoriaRepository.saveAll(kotikuntahistoriaChanges.updates());
                kotikuntaHistoriaRepository.deleteAll(kotikuntahistoriaChanges.deletes());

                log.info(henkilo.getOidHenkilo() + " updated with perustieto");
            } catch (Exception e) {
                log.error("failed to save perustieto for henkilo " + henkilo.getOidHenkilo(), e);
                slackClient.sendToSlack("Virhe VTJ-perustietojen tallennuksessa henkilölle " + henkilo.getOidHenkilo(), e.getMessage());
            }
        });
        return null;
    }

    protected Void updateHenkilo(VtjMuutostieto muutostieto) {
        henkiloRepository.findByHetu(muutostieto.henkilotunnus).ifPresent(henkilo -> {
            if (henkilo.isPassivoitu()) {
                log.debug("did not update passivoitu henkilö {} with VTJ muutostieto", henkilo.getOidHenkilo());
                return;
            }

            try {
                log.info("Transforming VTJ muutostieto into Henkilo changes");
                HenkiloForceReadDto read = mapper.map(henkilo, HenkiloForceReadDto.class);
                HenkiloForceUpdateDto update = mapToUpdateDto(read, muutostieto.tietoryhmat, muutostietoMapper);
                henkiloModificationService.forceUpdateHenkilo(update);
                henkiloRepository.save(henkilo);

                log.info("Transforming VTJ muutostieto into Kotikuntahistoria changes");
                var kotikuntahistoria = kotikuntaHistoriaRepository.findAllByHenkiloId(henkilo.getId());
                var kotikuntahistoriaChanges = muutostietoMapper.mapToKotikuntahistoriaChanges(henkilo, muutostieto.tietoryhmat, kotikuntahistoria);
                kotikuntaHistoriaRepository.saveAll(kotikuntahistoriaChanges.updates());
                kotikuntaHistoriaRepository.deleteAll(kotikuntahistoriaChanges.deletes());

                log.info("muutostieto processed successfully for henkilo {}", henkilo.getOidHenkilo());
            } catch (UnprocessableEntityException uee) {
                BindException be = (BindException) uee.getErrors();
                log.error("exception while processing muutostieto for henkilo " + henkilo.getOidHenkilo(), be);
                slackClient.sendToSlack("Virhe VTJ-muutostietojen päivityksessä henkilölle " + henkilo.getOidHenkilo(), be.getMessage());
                muutostieto.setError(true);
            } catch (Exception e) {
                log.error("failed to handle muutostieto for henkilo " + henkilo.getOidHenkilo(), e);
                slackClient.sendToSlack("Virhe muutostiedon käsittelyssä henkilölle " + henkilo.getOidHenkilo(), e.getMessage());
                muutostieto.setError(true);
            }
        });
        muutostieto.setProcessed(LocalDateTime.now());
        muutostietoRepository.save(muutostieto);
        return null;
    }

    private void reportMissingPerustieto(List<String> requestedHetus, List<VtjPerustieto> receivedPerustietos) {
        Set<String> requested = new HashSet<>(requestedHetus);
        Set<String> received = new HashSet<>(receivedPerustietos.stream().map(perustieto -> perustieto.henkilotunnus).toList());
        requested.removeAll(received);
        if (!requested.isEmpty()) {
            log.warn("did not get perustieto for all hetus");
            slackClient.sendToSlack("Perustietoja ei löytynyt kaikille henkilötunnuksille", null);
        }
    }

    public void handlePerustietoTask() {
        log.info("starting perustieto task");
        List<String> hetusWithoutBucket = henkiloRepository.findHetusWithoutVtjBucket();
        if (hetusWithoutBucket.isEmpty()) {
            log.info("did not find any hetus without vtj bucket. ending task.");
            return;
        }

        log.info("found " + hetusWithoutBucket.size() + " hetus without vtj bucket");
        List<List<String>> partitioned = Lists.partition(hetusWithoutBucket, 100);
        for (List<String> partition : partitioned) {
            try {
                List<VtjPerustieto> perustietoList = muutostietoClient.fetchHenkiloPerustieto(partition);
                reportMissingPerustieto(partition, perustietoList);
                perustietoList.stream().forEach(perustieto -> transaction.execute(status -> savePerustieto(perustieto)));
            } catch (InterruptedException ie) {
                log.error("interrupted while fetching perustieto", ie);
                Thread.currentThread().interrupt();
            } catch (UnprocessableEntityException uee) {
                BindException bindException = (BindException) uee.getErrors();
                log.error("exception while processing perustieto", bindException);
                slackClient.sendToSlack("Virhe VTJ-perustietojen päivityksessä", bindException.getMessage());
            } catch (MuutostietoRetryException mre) {
                log.error("perustieto fetch failed after retries", mre);
            } catch (Exception e) {
                log.error("exception while fetching perustieto", e);
                slackClient.sendToSlack("Virhe VTJ-perustietojen tallennuksessa", e.getMessage());
            }
        }
        log.info("finishing perustieto task");
    }

    public void handleMuutostietoFetchTask() {
        log.info("starting muutostieto fetch task");
        for (int i = 0; i < 100; i++) {
            final int bucketId = i;
            log.info("fetching muutostieto for bucket " + bucketId);
            long start = System.currentTimeMillis();

            boolean ajanTasalla;
            List<String> hetus = henkiloRepository.findHetusInVtjBucket(bucketId);
            log.info("bucket " + bucketId + " size is " + hetus.size());
            do {
                ajanTasalla = transaction.execute(status -> fetchMuutostietoBatchForBucket(bucketId, hetus));
            } while (!ajanTasalla);

            long duration = System.currentTimeMillis() - start;
            log.info("fetching muutostieto for bucket took " + duration + "ms");
        }
        log.info("finishing muutostieto fetch task");
    }

    public void handleMuutostietoTask() {
        log.info("starting muutostieto task");
        List<VtjMuutostieto> muutostietos = muutostietoRepository.findByProcessedIsNullOrErrorIsTrueOrderByMuutospvAsc();
        log.info("found " + muutostietos.size() + " unprocessed muutostietos");
        var skipSet = new HashSet<String>();
        muutostietos.stream().forEach(muutostieto -> {
            try {
                if (skipSet.contains(muutostieto.henkilotunnus)) {
                    log.info("skipping muutostieto " + muutostieto.getId() + " because of a prior error");
                } else {
                    if (Boolean.TRUE == muutostieto.getError()) {
                        log.info("retrying muutostieto " + muutostieto.getId() + " because of a prior error");
                        muutostieto.setProcessed(null);
                        muutostieto.setError(false);
                    }

                    transaction.execute(status -> updateHenkilo(muutostieto));

                    if (Boolean.TRUE == muutostieto.getError()) {
                        skipSet.add(muutostieto.henkilotunnus);
                    }
                }
            } catch (Exception e) {
                skipSet.add(muutostieto.henkilotunnus);
                muutostieto.setError(true);
                muutostieto.setProcessed(LocalDateTime.now());
                muutostietoRepository.save(muutostieto);
            }
        });
        log.info("finishing muutostieto task");
    }
}
