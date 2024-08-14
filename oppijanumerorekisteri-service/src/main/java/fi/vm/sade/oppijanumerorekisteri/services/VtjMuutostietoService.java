package fi.vm.sade.oppijanumerorekisteri.services;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.CompletionException;
import java.util.function.Function;
import java.util.function.Predicate;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.validation.BindException;

import com.fasterxml.jackson.databind.JsonNode;
import com.google.common.collect.Lists;

import fi.vm.sade.oppijanumerorekisteri.clients.SlackClient;
import fi.vm.sade.oppijanumerorekisteri.clients.VtjMuutostietoClient;
import fi.vm.sade.oppijanumerorekisteri.clients.model.VtjMuutostietoResponse;
import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloForceReadDto;
import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloForceUpdateDto;
import fi.vm.sade.oppijanumerorekisteri.dto.YhteystiedotRyhmaDto;
import fi.vm.sade.oppijanumerorekisteri.exceptions.UnprocessableEntityException;
import fi.vm.sade.oppijanumerorekisteri.mappers.OrikaConfiguration;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import fi.vm.sade.oppijanumerorekisteri.models.KotikuntaHistoria;
import fi.vm.sade.oppijanumerorekisteri.models.TurvakieltoKotikunta;
import fi.vm.sade.oppijanumerorekisteri.models.TurvakieltoKotikuntaHistoria;
import fi.vm.sade.oppijanumerorekisteri.models.VtjMuutostieto;
import fi.vm.sade.oppijanumerorekisteri.models.VtjMuutostietoKirjausavain;
import fi.vm.sade.oppijanumerorekisteri.models.VtjPerustieto;
import fi.vm.sade.oppijanumerorekisteri.repositories.HenkiloRepository;
import fi.vm.sade.oppijanumerorekisteri.repositories.KotikuntaHistoriaRepository;
import fi.vm.sade.oppijanumerorekisteri.repositories.TurvakieltoKotikuntaHistoriaRepository;
import fi.vm.sade.oppijanumerorekisteri.repositories.TurvakieltoKotikuntaRepository;
import fi.vm.sade.oppijanumerorekisteri.repositories.VtjMuutostietoKirjausavainRepository;
import fi.vm.sade.oppijanumerorekisteri.repositories.VtjMuutostietoRepository;
import fi.vm.sade.oppijanumerorekisteri.services.vtj.MuutostietoMapper;
import fi.vm.sade.oppijanumerorekisteri.services.vtj.PerustietoMapper;
import fi.vm.sade.oppijanumerorekisteri.services.vtj.TietoryhmaMapper;
import fi.vm.sade.oppijanumerorekisteri.validators.VtjMuutostietoValidator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import static fi.vm.sade.oppijanumerorekisteri.services.vtj.TietoryhmaMapper.getStringValue;

@Slf4j
@Service
@RequiredArgsConstructor
public class VtjMuutostietoService {
    private final VtjMuutostietoKirjausavainRepository kirjausavainRepository;
    private final VtjMuutostietoRepository muutostietoRepository;
    private final VtjMuutostietoClient muutostietoClient;
    private final TurvakieltoKotikuntaRepository turvakieltoKotikuntaRepository;
    private final KotikuntaHistoriaRepository kotikuntaHistoriaRepository;
    private final TurvakieltoKotikuntaHistoriaRepository turvakieltoKotikuntaHistoriaRepository;
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

    private HenkiloForceUpdateDto mapToUpdateDto(HenkiloForceReadDto read, JsonNode tietoryhmat,
            TietoryhmaMapper mapper) {
        HenkiloForceUpdateDto update = new HenkiloForceUpdateDto();
        update.setOidHenkilo(read.getOidHenkilo());
        update.setTurvakielto(read.getTurvakielto());
        update.setYhteystiedotRyhma(read.getYhteystiedotRyhma());
        update.setHuoltajat(read.getHuoltajat());
        update.setKaikkiHetut(read.getKaikkiHetut());
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

    private boolean isTurvakieltoAdded(JsonNode tietoryhmat) {
        for (JsonNode tietoryhma : tietoryhmat) {
            if ("TURVAKIELTO".equals(getStringValue(tietoryhma, "tietoryhma"))) {
                return tietoryhma.get("turvakieltoAktiivinen").asBoolean();
            }
        }
        return false;
    }

    private boolean isTurvakieltoRemoved(JsonNode tietoryhmat) {
        for (JsonNode tietoryhma : tietoryhmat) {
            if ("TURVAKIELTO".equals(getStringValue(tietoryhma, "tietoryhma"))) {
                return !tietoryhma.get("turvakieltoAktiivinen").asBoolean();
            }
        }
        return false;
    }

    private JsonNode getTietoryhma(JsonNode tietoryhmat, String tietoryhmaNimi) {
        for (JsonNode tietoryhma : tietoryhmat) {
            if (tietoryhmaNimi.equals(getStringValue(tietoryhma, "tietoryhma"))) {
                return tietoryhma;
            }
        }
        return null;
    }

    private void saveTurvakieltoKotikuntaHistoria(Long henkiloId, String kotikunta, LocalDate muuttopv) {
        try {
            TurvakieltoKotikuntaHistoria kotikuntaHistoria = TurvakieltoKotikuntaHistoria.builder()
                    .henkiloId(henkiloId)
                    .kotikunta(kotikunta)
                    .kuntaanMuuttopv(muuttopv)
                    .build();
            turvakieltoKotikuntaHistoriaRepository.save(kotikuntaHistoria);
        } catch (Exception e) {
            log.error("failed to save turvakieltokotikuntahistoria for henkilo " + henkiloId, e);
            slackClient.sendToSlack("Virhe turvakieltokotikuntahistorian tallennuksessa henkilölle " + henkiloId, e.getMessage());
        }
    }

    private void setKunnastaPoisMuuttopv(Long henkiloId, LocalDate muuttopv) {
        Optional<KotikuntaHistoria> existingKotikuntaHistoria = kotikuntaHistoriaRepository.findByHenkiloIdAndKunnastaPoisMuuttopvIsNull(henkiloId);
        existingKotikuntaHistoria.ifPresent(existing -> {
            existing.setKunnastaPoisMuuttopv(muuttopv);
            kotikuntaHistoriaRepository.save(existing);
        });
        Optional<TurvakieltoKotikuntaHistoria> existingTurvakieltoKotikuntaHistoria = turvakieltoKotikuntaHistoriaRepository.findByHenkiloIdAndKunnastaPoisMuuttopvIsNull(henkiloId);
        existingTurvakieltoKotikuntaHistoria.ifPresent(existing -> {
            existing.setKunnastaPoisMuuttopv(muuttopv);
            turvakieltoKotikuntaHistoriaRepository.save(existing);
        });
    }

    private void insertOrUpdateTurvakieltoKotikunta(Long henkiloId, String kotikunta, LocalDate muuttopv) {
        try {
            turvakieltoKotikuntaRepository.findByHenkiloId(henkiloId)
                .or(() -> Optional.of(TurvakieltoKotikunta.builder().henkiloId(henkiloId).build()))
                .ifPresent(turvakieltoKotikunta -> {
                    turvakieltoKotikunta.setKotikunta(kotikunta);
                    turvakieltoKotikuntaRepository.save(turvakieltoKotikunta);
                });
            setKunnastaPoisMuuttopv(henkiloId, muuttopv.minusDays(1));
            saveTurvakieltoKotikuntaHistoria(henkiloId, kotikunta, muuttopv);
        } catch (Exception e) {
            log.error("failed to save turvakieltokotikunta for henkilo " + henkiloId, e);
            slackClient.sendToSlack("Virhe turvakieltokotikunnan tallennuksessa henkilölle " + henkiloId, e.getMessage());
        }
    }

    private String handleKotikuntaPoistettu(Long henkiloId, JsonNode tietoryhmat) {
        try {
            var kotikuntaHistoriaList = kotikuntaHistoriaRepository.findAllByHenkiloId(henkiloId);
            getKotikuntaPoistettuTietoryhma(tietoryhmat).ifPresent(tietoryhma -> {
                var poistettuKotikunta = getStringValue(tietoryhma, "kuntakoodi");
                var poistettuMuuttopv = TietoryhmaMapper.parseDate(tietoryhma.get("kuntaanMuuttopv"));

                var voimassaolevatTiedot = tietoryhma.get("voimassaolevatTiedot").get(0);
                var voimassaolevaKotikunta = getStringValue(voimassaolevatTiedot, "kuntakoodi");
                var voimassaolevaMuttopv = TietoryhmaMapper.parseDate(voimassaolevatTiedot.get("kuntaanMuuttopv"));

                kotikuntaHistoriaList.stream()
                        .filter(x -> x.getKotikunta().equals(poistettuKotikunta) && x.getKuntaanMuuttopv().equals(poistettuMuuttopv))
                        .findFirst()
                        .ifPresent(historia -> {
                            log.info("Deleting kotikuntahistoria entry for henkilo {} with kotikunta {} and muuttopv {}", henkiloId, historia.getKotikunta(), historia.getKuntaanMuuttopv());
                            kotikuntaHistoriaRepository.delete(historia);
                        });
                kotikuntaHistoriaList.stream()
                        .filter(x -> x.getKotikunta().equals(voimassaolevaKotikunta) && x.getKuntaanMuuttopv().equals(voimassaolevaMuttopv))
                        .findFirst()
                        .ifPresent(historia -> {
                            log.info("Updating kotikuntahistoria entry for henkilo {} with kotikunta {} and muuttopv {}", henkiloId, historia.getKotikunta(), historia.getKuntaanMuuttopv());
                            historia.setKunnastaPoisMuuttopv(null);
                            kotikuntaHistoriaRepository.save(historia);
                        });
            });
        } catch (Exception e) {
            log.error("failed to handle KOTIKUNTA POISTETTU tietoryhma for henkilo " + henkiloId, e);
            slackClient.sendToSlack("Virhe kotikuntahistorian päivityksessä henkilölle " + henkiloId, e.getMessage());
        }
        return null;
    }

    private Optional<JsonNode> getKotikuntaPoistettuTietoryhma(JsonNode tietoryhmat) {
        for (JsonNode tietoryhma : tietoryhmat) {
            if ("KOTIKUNTA".equals(getStringValue(tietoryhma, "tietoryhma")) && MuutostietoMapper.isPoistettu(tietoryhma)) {
                return Optional.of(tietoryhma);
            }
        }
        return Optional.empty();
    }

    private String saveCurrentKotikuntaToKotikuntaHistoria(Long henkiloId, JsonNode tietoryhmat, Function<JsonNode, Boolean> tietoryhmaValidator) {
        try {
            JsonNode tietoryhma = getTietoryhma(tietoryhmat, "KOTIKUNTA");
            if (tietoryhma != null && tietoryhma.has("kuntakoodi")
                    && (tietoryhmaValidator == null || tietoryhmaValidator.apply(tietoryhma))) {
                String kotikunta = getStringValue(tietoryhma, "kuntakoodi");
                LocalDate muuttopv = TietoryhmaMapper.parseDate(tietoryhma.get("kuntaanMuuttopv"));
                setKunnastaPoisMuuttopv(henkiloId, muuttopv.minusDays(1));
                KotikuntaHistoria kotikuntaHistoria = KotikuntaHistoria.builder().henkiloId(henkiloId).kotikunta(kotikunta).kuntaanMuuttopv(muuttopv).build();
                kotikuntaHistoriaRepository.save(kotikuntaHistoria);
                return kotikunta;
            }
        } catch (Exception e) {
            log.error("failed to save kotikuntahistoria for henkilo " + henkiloId, e);
            slackClient.sendToSlack("Virhe kotikuntahistorian tallennuksessa henkilölle " + henkiloId, e.getMessage());
        }
        return null;
    }

    private void saveEdellinenKotikuntaHistoria(Long henkiloId, JsonNode tietoryhmat) {
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
            }
        }
        kotikuntaHistoriaRepository.saveAll(kotikuntaHistoriaList);
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
                HenkiloForceReadDto read = mapper.map(henkilo, HenkiloForceReadDto.class);
                HenkiloForceUpdateDto update = mapToUpdateDto(read, perustieto.tietoryhmat, perustietoMapper);
                saveEdellinenKotikuntaHistoria(henkilo.getId(), perustieto.tietoryhmat);
                if (isTurvakieltoAdded(perustieto.tietoryhmat)) {
                    update.setKotikunta(null);
                    JsonNode tietoryhma = getTietoryhma(perustieto.tietoryhmat, "KOTIKUNTA");
                    if (tietoryhma != null && tietoryhma.has("kuntakoodi")) {
                        String kotikunta = getStringValue(tietoryhma, "kuntakoodi");
                        LocalDate muuttopv = TietoryhmaMapper.parseDate(tietoryhma.get("kuntaanMuuttopv"));
                        insertOrUpdateTurvakieltoKotikunta(henkilo.getId(), kotikunta, muuttopv);
                    }
                } else {
                    saveCurrentKotikuntaToKotikuntaHistoria(henkilo.getId(), perustieto.tietoryhmat, null);
                }
                henkiloModificationService.forceUpdateHenkilo(update);
                henkilo.setVtjBucket(henkilo.getId() % 100);
                henkiloRepository.save(henkilo);
                log.info(henkilo.getOidHenkilo() + " updated with perustieto");
            } catch (Exception e) {
                log.error("failed to save perustieto for henkilo " + henkilo.getOidHenkilo(), e);
                slackClient.sendToSlack("Virhe VTJ-perustietojen tallennuksessa henkilölle " + henkilo.getOidHenkilo(), e.getMessage());
            }
        });
        return null;
    }

    private void updateTurvakieltoKotikunta(Henkilo henkilo, JsonNode tietoryhmat) {
        try {
            for (JsonNode tietoryhma : tietoryhmat) {
                if ("KOTIKUNTA".equals(getStringValue(tietoryhma, "tietoryhma"))
                        && MuutostietoMapper.isDataUpdate(tietoryhma)
                        && tietoryhma.has("kuntakoodi")) {
                    String kotikunta = getStringValue(tietoryhma, "kuntakoodi");
                    LocalDate muuttopv = TietoryhmaMapper.parseDate(tietoryhma.get("kuntaanMuuttopv"));
                    TurvakieltoKotikunta turvakieltoKotikunta = turvakieltoKotikuntaRepository.findByHenkiloId(henkilo.getId())
                        .orElse(TurvakieltoKotikunta.builder().henkiloId(henkilo.getId()).build());
                    turvakieltoKotikunta.setKotikunta(kotikunta);
                    turvakieltoKotikuntaRepository.save(turvakieltoKotikunta);
                    setKunnastaPoisMuuttopv(henkilo.getId(), muuttopv.minusDays(1));
                    saveTurvakieltoKotikuntaHistoria(henkilo.getId(), kotikunta, muuttopv);
                }
            }
        } catch (Exception e) {
            log.error("failed to save turvakieltokotikunta for henkilo " + henkilo.getId(), e);
        }
    }

    private String removeTurvakieltoKotikunta(Henkilo henkilo, VtjMuutostieto muutostieto) {
        Optional<TurvakieltoKotikunta> turvakieltoKotikunta = turvakieltoKotikuntaRepository.findByHenkiloId(henkilo.getId());
        if (turvakieltoKotikunta.isPresent()) {
            turvakieltoKotikuntaRepository.delete(turvakieltoKotikunta.get());
        }

        JsonNode kotikuntaTietoryhma = getTietoryhma(muutostieto.tietoryhmat, "KOTIKUNTA");
        if (kotikuntaTietoryhma != null && MuutostietoMapper.isDataUpdate(kotikuntaTietoryhma)) {
            return saveCurrentKotikuntaToKotikuntaHistoria(henkilo.getId(), muutostieto.tietoryhmat, MuutostietoMapper::isDataUpdate);
        } else if (turvakieltoKotikunta.isPresent()) {
            String kotikunta = turvakieltoKotikunta.get().getKotikunta();
            LocalDate muuttopv = muutostieto.muutospv.toLocalDate();
            setKunnastaPoisMuuttopv(henkilo.getId(), muuttopv.minusDays(1));
            KotikuntaHistoria kotikuntaHistoria = KotikuntaHistoria.builder().henkiloId(henkilo.getId()).kotikunta(kotikunta).kuntaanMuuttopv(muuttopv).build();
            kotikuntaHistoriaRepository.save(kotikuntaHistoria);
            return kotikunta;
        }

        return null;
    }

    private void addTurvakieltoKotikunta(Henkilo henkilo, VtjMuutostieto muutostieto) {
        JsonNode kotikuntaTietoryhma = getTietoryhma(muutostieto.tietoryhmat, "KOTIKUNTA");
        if (kotikuntaTietoryhma != null && MuutostietoMapper.isDataUpdate(kotikuntaTietoryhma)) {
            String kotikunta = getStringValue(kotikuntaTietoryhma, "kuntakoodi");
            LocalDate muuttopv = TietoryhmaMapper.parseDate(kotikuntaTietoryhma.get("kuntaanMuuttopv"));
            insertOrUpdateTurvakieltoKotikunta(henkilo.getId(), kotikunta, muuttopv);
        } else if (henkilo.getKotikunta() != null) {
            String kotikunta = henkilo.getKotikunta();
            LocalDate muuttopv = muutostieto.muutospv.toLocalDate();
            insertOrUpdateTurvakieltoKotikunta(henkilo.getId(), kotikunta, muuttopv);
        }
    }

    private Predicate<YhteystiedotRyhmaDto> isVtjYhteystietoryhma = ytr -> "alkupera1".equals(ytr.getRyhmaAlkuperaTieto());

    private void handleKotikuntaChanges(HenkiloForceUpdateDto update, Henkilo henkilo, VtjMuutostieto muutostieto) {
        if (isTurvakieltoAdded(muutostieto.tietoryhmat)) {
            addTurvakieltoKotikunta(henkilo, muutostieto);
            update.getYhteystiedotRyhma().removeIf(isVtjYhteystietoryhma);
            update.setKotikunta(null);
        } else if (isTurvakieltoRemoved(muutostieto.tietoryhmat)) {
            String kotikunta = removeTurvakieltoKotikunta(henkilo, muutostieto);
            if (kotikunta == null) {
                log.warn("could not find kotikunta when removing turvakielto for henkilo " + henkilo.getOidHenkilo());
            }
            update.setKotikunta(kotikunta);
        } else if (henkilo.isTurvakielto()) {
            updateTurvakieltoKotikunta(henkilo, muutostieto.tietoryhmat);
            update.getYhteystiedotRyhma().removeIf(isVtjYhteystietoryhma);
            update.setKotikunta(null);
        } else {
            handleKotikuntaPoistettu(henkilo.getId(), muutostieto.tietoryhmat);
            saveCurrentKotikuntaToKotikuntaHistoria(henkilo.getId(), muutostieto.tietoryhmat, MuutostietoMapper::isDataUpdate);
        }
    }

    protected Void updateHenkilo(VtjMuutostieto muutostieto) {
        henkiloRepository.findByHetu(muutostieto.henkilotunnus).ifPresent(henkilo -> {
            if (henkilo.isPassivoitu()) {
                log.debug("did not update passivoitu henkilö {} with VTJ muutostieto", henkilo.getOidHenkilo());
                return;
            }

            try {
                HenkiloForceReadDto read = mapper.map(henkilo, HenkiloForceReadDto.class);
                HenkiloForceUpdateDto update = mapToUpdateDto(read, muutostieto.tietoryhmat, muutostietoMapper);
                handleKotikuntaChanges(update, henkilo, muutostieto);
                henkiloModificationService.forceUpdateHenkilo(update);
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
        List<VtjMuutostieto> muutostietos = muutostietoRepository.findByProcessedIsNullOrderByMuutospvAsc();
        log.info("found " + muutostietos.size() + " unprocessed muutostietos");
        muutostietos.stream().forEach(muutostieto -> {
            try {
                transaction.execute(status -> updateHenkilo(muutostieto));
            } catch (Exception e) {
                muutostieto.setError(true);
                muutostieto.setProcessed(LocalDateTime.now());
                muutostietoRepository.save(muutostieto);
            }
        });
        log.info("finishing muutostieto task");
    }
}
