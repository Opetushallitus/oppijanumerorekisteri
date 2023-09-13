package fi.vm.sade.oppijanumerorekisteri.services;

import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.CompletionException;

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
import fi.vm.sade.oppijanumerorekisteri.exceptions.UnprocessableEntityException;
import fi.vm.sade.oppijanumerorekisteri.mappers.OrikaConfiguration;
import fi.vm.sade.oppijanumerorekisteri.models.VtjMuutostieto;
import fi.vm.sade.oppijanumerorekisteri.models.VtjMuutostietoKirjausavain;
import fi.vm.sade.oppijanumerorekisteri.models.VtjPerustieto;
import fi.vm.sade.oppijanumerorekisteri.repositories.HenkiloRepository;
import fi.vm.sade.oppijanumerorekisteri.repositories.VtjMuutostietoKirjausavainRepository;
import fi.vm.sade.oppijanumerorekisteri.repositories.VtjMuutostietoRepository;
import fi.vm.sade.oppijanumerorekisteri.services.vtj.MuutostietoMapper;
import fi.vm.sade.oppijanumerorekisteri.services.vtj.PerustietoMapper;
import fi.vm.sade.oppijanumerorekisteri.services.vtj.TietoryhmaMapper;
import fi.vm.sade.oppijanumerorekisteri.validators.VtjMuutostietoValidator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class VtjMuutostietoService {
    private final VtjMuutostietoKirjausavainRepository kirjausavainRepository;
    private final VtjMuutostietoRepository muutostietoRepository;
    private final VtjMuutostietoClient muutostietoClient;
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
            return true;
        }
    }

    private void fetchMuutostietos() {
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
    }

    private String findYhteystietoLocale(HenkiloForceReadDto read, JsonNode tietoryhmat) {
        if (read.getAsiointiKieli() != null) {
            return read.getAsiointiKieli().getKieliKoodi();
        }
        if (read.getAidinkieli() != null) {
            return read.getAidinkieli().getKieliKoodi();
        }
        for (JsonNode tietoryhma : tietoryhmat) {
            if ("AIDINKIELI".equals(TietoryhmaMapper.getStringValue(tietoryhma, "tietoryhma"))) {
                return "swe".equals(TietoryhmaMapper.getStringValue(tietoryhma, "kielikoodiISO6392")) ? "sv" : "fi";
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

    private boolean isHenkilotunnusKorjaus(JsonNode tietoryhmat) {
        for (JsonNode tietoryhma : tietoryhmat) {
            if ("HENKILOTUNNUS_KORJAUS".equals(TietoryhmaMapper.getStringValue(tietoryhma, "tietoryhma"))) {
                return true;
            }
        }
        return false;
    }

    protected Void savePerustieto(VtjPerustieto perustieto) {
        henkiloRepository.findByHetu(perustieto.henkilotunnus).ifPresent(henkilo -> {
            if (isHenkilotunnusKorjaus(perustieto.tietoryhmat)) {
                slackClient.sendToSlack(String.format(
                        "VTJ-perustietojen tallennus käyttäjälle %s estetty HENKILOTUNNUS_KORJAUS-tietoryhmän vuoksi",
                        henkilo.getOidHenkilo()), null);
                return;
            }

            HenkiloForceReadDto read = mapper.map(henkilo, HenkiloForceReadDto.class);
            HenkiloForceUpdateDto update = mapToUpdateDto(read, perustieto.tietoryhmat, perustietoMapper);
            henkiloModificationService.forceUpdateHenkilo(update);
            henkilo.setVtjBucket(henkilo.getId() % 100);
            henkiloRepository.save(henkilo);
        });
        return null;
    }

    private void savePerustietoForNewHetus() {
        List<String> hetusWithoutBucket = henkiloRepository.findHetusWithoutVtjBucket();
        log.info("found " + hetusWithoutBucket.size() + " hetus without vtj bucket");

        List<List<String>> partitioned = Lists.partition(hetusWithoutBucket, 100);
        for (List<String> partition : partitioned) {
            try {
                List<VtjPerustieto> perustiedot = muutostietoClient.fetchHenkiloPerustieto(partition);
                perustiedot.stream().forEach(
                        perustieto -> transaction.execute(status -> savePerustieto(perustieto)));
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
    }

    protected Void saveMuutostieto(VtjMuutostieto muutostieto) {
        henkiloRepository.findByHetu(muutostieto.henkilotunnus).ifPresent(henkilo -> {
            if (henkilo.isPassivoitu()) {
                log.debug("did not update passivoitu henkilö {} with VTJ muutostieto", henkilo.getOidHenkilo());
                return;
            }

            try {
                HenkiloForceReadDto read = mapper.map(henkilo, HenkiloForceReadDto.class);
                HenkiloForceUpdateDto update = mapToUpdateDto(read, muutostieto.tietoryhmat, muutostietoMapper);
                henkiloModificationService.forceUpdateHenkilo(update);
            } catch (UnprocessableEntityException uee) {
                BindException be = (BindException) uee.getErrors();
                log.error("exception while processing muutostieto for henkilo " + henkilo.getOidHenkilo(), be);
                slackClient.sendToSlack("Virhe VTJ-muutostietojen päivityksessä", be.getMessage());
                muutostieto.setError(true);
            } catch (Exception e) {
                log.error("failed to handle muutostieto for henkilo " + henkilo.getOidHenkilo(), e);
                slackClient.sendToSlack("Virhe muutostiedon käsittelyssä", e.getMessage());
                muutostieto.setError(true);
            }
        });
        muutostieto.setProcessed(LocalDateTime.now());
        muutostietoRepository.save(muutostieto);
        return null;
    }

    private void saveMuutostietos() {
        List<VtjMuutostieto> muutostietos = muutostietoRepository.findByProcessedIsNullOrderByMuutospvAsc();
        log.info("found " + muutostietos.size() + " unprocessed muutostietos");
        muutostietos.stream().forEach(muutostieto -> {
            try {
                transaction.execute(status -> saveMuutostieto(muutostieto));
            } catch (Exception e) {
                muutostieto.setError(true);
                muutostieto.setProcessed(LocalDateTime.now());
                muutostietoRepository.save(muutostieto);
            }
        });
    }

    public void handleMuutostietoTask() {
        log.info("starting muutostieto task");

        savePerustietoForNewHetus();
        fetchMuutostietos();
        saveMuutostietos();

        log.info("finishing muutostieto task");
    }
}
