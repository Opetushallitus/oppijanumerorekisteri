package fi.vm.sade.oppijanumerorekisteri.services.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import fi.vm.sade.oppijanumerorekisteri.dto.OppijaTuontiRiviCreateDto;
import fi.vm.sade.oppijanumerorekisteri.dto.OppijaTuontiCreateDto;
import fi.vm.sade.oppijanumerorekisteri.dto.OppijaTuontiPerustiedotReadDto;
import fi.vm.sade.oppijanumerorekisteri.exceptions.DataInconsistencyException;
import fi.vm.sade.oppijanumerorekisteri.exceptions.ValidationException;
import fi.vm.sade.oppijanumerorekisteri.mappers.OrikaConfiguration;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import fi.vm.sade.oppijanumerorekisteri.models.Identification;
import static fi.vm.sade.oppijanumerorekisteri.models.Identification.SAHKOPOSTI_IDP_ENTITY_ID;
import fi.vm.sade.oppijanumerorekisteri.models.Organisaatio;
import fi.vm.sade.oppijanumerorekisteri.models.Tuonti;
import fi.vm.sade.oppijanumerorekisteri.models.TuontiData;
import fi.vm.sade.oppijanumerorekisteri.models.TuontiRivi;
import fi.vm.sade.oppijanumerorekisteri.repositories.HenkiloRepository;
import fi.vm.sade.oppijanumerorekisteri.repositories.OrganisaatioRepository;
import fi.vm.sade.oppijanumerorekisteri.repositories.TuontiRepository;
import fi.vm.sade.oppijanumerorekisteri.services.*;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;

import static fi.vm.sade.oppijanumerorekisteri.services.impl.PermissionCheckerImpl.KAYTTOOIKEUS_OPPIJOIDENTUONTI;
import static fi.vm.sade.oppijanumerorekisteri.services.impl.PermissionCheckerImpl.PALVELU_OPPIJANUMEROREKISTERI;
import static java.util.Collections.emptyMap;
import static java.util.function.Function.identity;
import static java.util.stream.Collectors.toMap;

import java.util.stream.Stream;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import static java.util.stream.Collectors.toSet;

@Service
@Transactional
@RequiredArgsConstructor
public class OppijaTuontiServiceImpl implements OppijaTuontiService {

    private final HenkiloService henkiloService;
    private final HenkiloModificationService henkiloModificationService;
    private final OrikaConfiguration mapper;
    private final HenkiloRepository henkiloRepository;
    private final TuontiRepository tuontiRepository;
    private final OrganisaatioRepository organisaatioRepository;
    private final UserDetailsHelper userDetailsHelper;
    private final PermissionChecker permissionChecker;
    private final ObjectMapper objectMapper;

    @Override
    public OppijaTuontiPerustiedotReadDto create(OppijaTuontiCreateDto dto) {
        Set<Organisaatio> organisaatiot = getOrCreateOrganisaatioByKayttaja();
        if (organisaatiot.isEmpty()) {
            throw new ValidationException(String.format("Käyttäjällä %s ei ole yhtään organisaatiota joihin oppijat liitetään", userDetailsHelper.getCurrentUserOid()));
        }

        final byte[] data;
        try {
            data = objectMapper.writeValueAsBytes(dto);
        } catch (JsonProcessingException ex) {
            throw new RuntimeException(ex);
        }
        TuontiData tuontiData = new TuontiData();
        tuontiData.setData(data);

        Tuonti tuonti = new Tuonti();
        tuonti.setKasittelijaOid(userDetailsHelper.getCurrentUserOid());
        tuonti.setSahkoposti(dto.getSahkoposti());
        tuonti.setData(tuontiData);
        tuonti.setKasiteltavia(dto.getHenkilot().size());
        tuonti.setOrganisaatiot(organisaatiot);
        tuonti = tuontiRepository.save(tuonti);

        return mapper.map(tuonti, OppijaTuontiPerustiedotReadDto.class);
    }

    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public boolean create(long id, int erakoko) {
        Tuonti tuonti = tuontiRepository.findForUpdateById(id)
                .orElseThrow(DataInconsistencyException::new);
        if (tuonti.isKasitelty()) {
            return true;
        }

        Set<Organisaatio> organisaatiot = tuonti.getOrganisaatiot();
        if (organisaatiot.isEmpty()) {
            throw new DataInconsistencyException(String.format("Tuonnissa %s ei ole liitettynä yhtään organisaatiota", tuonti.getId()));
        }

        final OppijaTuontiCreateDto dto;
        try {
            dto = objectMapper.readValue(tuonti.getData().getData(), OppijaTuontiCreateDto.class);
        } catch (IOException ex) {
            throw new RuntimeException(ex);
        }

        int fromIndex = tuonti.getKasiteltyja();
        int toIndex = fromIndex + erakoko;
        int size = dto.getHenkilot().size();
        if (toIndex > size) {
            toIndex = size;
        }

        List<OppijaTuontiRiviCreateDto> kasiteltavat = dto.getHenkilot().subList(fromIndex, toIndex);
        String kasittelijaOid = tuonti.getKasittelijaOid();
        Set<TuontiRivi> rivit = create(kasiteltavat, kasittelijaOid, organisaatiot);

        tuonti.getHenkilot().addAll(rivit);
        tuonti.setKasiteltyja(toIndex);
        tuonti = tuontiRepository.save(tuonti);
        return tuonti.isKasitelty();
    }

    private Set<TuontiRivi> create(List<OppijaTuontiRiviCreateDto> henkilot, String kasittelijaOid, Set<Organisaatio> organisaatiot) {
        // haetaan jo luodut henkilöt
        // oid
        Set<String> oids = henkilot.stream()
                .map(t -> t.getHenkilo().getOid())
                .filter(Objects::nonNull)
                .collect(toSet());
        Map<String, Henkilo> henkilotByOid = oids.isEmpty() ? emptyMap() : henkiloRepository
                .findByOidHenkiloIsIn(oids).stream()
                .collect(toMap(Henkilo::getOidHenkilo, identity()));
        // hetu
        Set<String> hetut = henkilot.stream()
                .map(t -> t.getHenkilo().getHetu())
                .filter(Objects::nonNull)
                .collect(toSet());
        Map<String, Henkilo> henkilotByHetu = hetut.isEmpty() ? emptyMap() : henkiloRepository
                .findByHetuIn(hetut).stream()
                .collect(toMap(Henkilo::getHetu, identity()));
        // passinumerot
        Set<String> passinumerot = henkilot.stream()
                .map(t -> t.getHenkilo().getPassinumero())
                .filter(Objects::nonNull)
                .collect(toSet());
        Map<String, Henkilo> henkilotByPassinumero = passinumerot.isEmpty() ? emptyMap() : henkiloRepository
                .findAndMapByPassinumerot(passinumerot);
        // sähköpostit
        Set<String> sahkopostit = henkilot.stream()
                .map(t -> t.getHenkilo().getSahkoposti())
                .filter(Objects::nonNull)
                .collect(toSet());
        Map<String, Henkilo> henkilotBySahkoposti = sahkopostit.isEmpty() ? emptyMap() : henkiloRepository
                .findAndMapByIdentifiers(SAHKOPOSTI_IDP_ENTITY_ID, sahkopostit);

        TuontiRiviMapper tuontiRiviMapper = new TuontiRiviMapper(kasittelijaOid, organisaatiot, henkilotByOid, henkilotByHetu, henkilotByPassinumero, henkilotBySahkoposti);
        return henkilot.stream()
                .map(tuontiRiviMapper::map)
                .collect(toSet());
    }

    @RequiredArgsConstructor
    private class TuontiRiviMapper {

        private final String kasittelijaOid;
        private final Set<Organisaatio> organisaatiot;
        private final Map<String, Henkilo> henkilotByOid;
        private final Map<String, Henkilo> henkilotByHetu;
        private final Map<String, Henkilo> henkilotByPassinumero;
        private final Map<String, Henkilo> henkilotBySahkoposti;

        public TuontiRivi map(OppijaTuontiRiviCreateDto oppija) {
            Optional<Henkilo> henkiloByOid = Optional.ofNullable(oppija.getHenkilo().getOid())
                    .flatMap(oid -> Optional.ofNullable(henkilotByOid.get(oid)));
            Optional<Henkilo> henkiloByHetu = Optional.ofNullable(oppija.getHenkilo().getHetu())
                    .flatMap(hetu -> Optional.ofNullable(henkilotByHetu.get(hetu)));
            Optional<Henkilo> henkiloByPassinumero = Optional.ofNullable(oppija.getHenkilo().getPassinumero())
                    .flatMap(passinumero -> Optional.ofNullable(henkilotByPassinumero.get(passinumero)));
            Optional<Henkilo> henkiloBySahkoposti = Optional.ofNullable(oppija.getHenkilo().getSahkoposti())
                    .flatMap(sahkoposti -> Optional.ofNullable(henkilotBySahkoposti.get(sahkoposti)));

            Henkilo henkilo = Stream.of(henkiloByOid, henkiloByHetu, henkiloByPassinumero, henkiloBySahkoposti)
                    .filter(Optional::isPresent)
                    .map(Optional::get)
                    .findFirst()
                    .map(this::updateHenkilo)
                    .orElseGet(() -> createHenkilo(oppija));

            TuontiRivi rivi = mapper.map(oppija, TuontiRivi.class);
            rivi.setHenkilo(henkilo);
            return rivi;
        }

        private Henkilo createHenkilo(OppijaTuontiRiviCreateDto oppija) {
            Henkilo henkilo = mapper.map(oppija.getHenkilo(), Henkilo.class);
            organisaatiot.forEach(henkilo::addOrganisaatio);
            if (oppija.getHenkilo().getPassinumero() != null) {
                henkilo.setPassinumerot(Stream.of(oppija.getHenkilo().getPassinumero()).collect(toSet()));
            }
            if (oppija.getHenkilo().getSahkoposti() != null) {
                henkilo.setIdentifications(Stream.of(Identification.builder()
                        .idpEntityId(SAHKOPOSTI_IDP_ENTITY_ID)
                        .identifier(oppija.getHenkilo().getSahkoposti())
                        .build()).collect(toSet())
                );
            }
            return henkiloModificationService.createHenkilo(henkilo, kasittelijaOid, false);
        }

        private Henkilo updateHenkilo(Henkilo henkilo) {
            // liitetään henkilö vain organisaatioihin jos henkilö löytyi jo ennestään
            organisaatiot.forEach(henkilo::addOrganisaatio);
            return henkiloModificationService.update(henkilo);
        }

    }

    @Override
    public Set<String> getOrganisaatioOidsByKayttaja() {
        return permissionChecker.getOrganisaatioOids(PALVELU_OPPIJANUMEROREKISTERI, KAYTTOOIKEUS_OPPIJOIDENTUONTI);
    }

    @Override
    public Set<Organisaatio> getOrCreateOrganisaatioByKayttaja() {
        // haetaan käyttäjän organisaatiot ja luodaan niistä organisaatio oppijanumerorekisteriin
        Set<String> organisaatioOids = getOrganisaatioOidsByKayttaja();
        return organisaatioOids.stream()
                .map(organisaatioOid -> organisaatioRepository.findByOid(organisaatioOid)
                .orElseGet(() -> organisaatioRepository.save(new Organisaatio(organisaatioOid))))
                .collect(toSet());
    }

}
