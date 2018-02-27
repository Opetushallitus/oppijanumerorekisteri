package fi.vm.sade.oppijanumerorekisteri.services.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import fi.vm.sade.oppijanumerorekisteri.clients.KayttooikeusClient;
import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloTyyppi;
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
import fi.vm.sade.oppijanumerorekisteri.services.HenkiloService;
import fi.vm.sade.oppijanumerorekisteri.services.UserDetailsHelper;
import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import static java.util.function.Function.identity;
import static java.util.stream.Collectors.toMap;
import java.util.stream.Stream;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import fi.vm.sade.oppijanumerorekisteri.services.OppijaTuontiService;
import static java.util.stream.Collectors.toSet;

@Service
@Transactional
@RequiredArgsConstructor
public class OppijaTuontiServiceImpl implements OppijaTuontiService {

    private final HenkiloService henkiloService;
    private final OrikaConfiguration mapper;
    private final HenkiloRepository henkiloRepository;
    private final TuontiRepository tuontiRepository;
    private final OrganisaatioRepository organisaatioRepository;
    private final KayttooikeusClient kayttooikeusClient;
    private final UserDetailsHelper userDetailsHelper;
    private final ObjectMapper objectMapper;

    @Override
    public OppijaTuontiPerustiedotReadDto create(OppijaTuontiCreateDto dto) {
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
        Set<TuontiRivi> rivit = create(kasiteltavat, kasittelijaOid);

        tuonti.getHenkilot().addAll(rivit);
        tuonti.setKasiteltyja(toIndex);
        tuonti = tuontiRepository.save(tuonti);
        return tuonti.isKasitelty();
    }

    private Set<TuontiRivi> create(List<OppijaTuontiRiviCreateDto> henkilot, String kasittelijaOid) {
        // haetaan käyttäjän organisaatiot (joihin oppijat liitetään)
        Set<Organisaatio> organisaatiot = getOrCreateOrganisaatioByHenkilo(kasittelijaOid);
        if (organisaatiot.isEmpty()) {
            throw new ValidationException(String.format("Henkilöllä %s ei ole yhtään organisaatiota joihin oppijat liitetään", kasittelijaOid));
        }

        // haetaan jo luodut henkilöt
        // oid
        Set<String> oids = henkilot.stream()
                .map(t -> t.getHenkilo().getOid())
                .filter(Objects::nonNull)
                .collect(toSet());
        Map<String, Henkilo> henkilotByOid = henkiloRepository
                .findByOidHenkiloIsIn(oids).stream()
                .collect(toMap(Henkilo::getOidHenkilo, identity()));
        // hetu
        Set<String> hetut = henkilot.stream()
                .map(t -> t.getHenkilo().getHetu())
                .filter(Objects::nonNull)
                .collect(toSet());
        Map<String, Henkilo> henkilotByHetu = henkiloRepository
                .findByHetuIn(hetut).stream()
                .collect(toMap(Henkilo::getHetu, identity()));
        // passinumerot
        Set<String> passinumerot = henkilot.stream()
                .map(t -> t.getHenkilo().getPassinumero())
                .filter(Objects::nonNull)
                .collect(toSet());
        Map<String, Henkilo> henkilotByPassinumero = henkiloRepository
                .findAndMapByPassinumerot(passinumerot);
        // sähköpostit
        Set<String> sahkopostit = henkilot.stream()
                .map(t -> t.getHenkilo().getSahkoposti())
                .filter(Objects::nonNull)
                .collect(toSet());
        Map<String, Henkilo> henkilotBySahkoposti = henkiloRepository
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
            Henkilo henkiloByOid = henkilotByOid.get(oppija.getHenkilo().getOid());
            Henkilo henkiloByHetu = henkilotByHetu.get(oppija.getHenkilo().getHetu());
            Henkilo henkiloByPassinumero = henkilotByPassinumero.get(oppija.getHenkilo().getPassinumero());
            Henkilo henkiloBySahkoposti = henkilotBySahkoposti.get(oppija.getHenkilo().getSahkoposti());

            Henkilo henkilo = Stream.of(henkiloByOid, henkiloByHetu, henkiloByPassinumero, henkiloBySahkoposti)
                    .filter(Objects::nonNull)
                    .findFirst().orElseGet(() -> newHenkilo(oppija));

            // liitetään henkilö organisaatioihin
            organisaatiot.forEach(henkilo::addOrganisaatio);
            henkilo = henkiloService.update(henkilo);

            TuontiRivi rivi = mapper.map(oppija, TuontiRivi.class);
            rivi.setHenkilo(henkilo);
            return rivi;
        }

        private Henkilo newHenkilo(OppijaTuontiRiviCreateDto oppija) {
            Henkilo henkilo = mapper.map(oppija.getHenkilo(), Henkilo.class);
            henkilo.setHenkiloTyyppi(HenkiloTyyppi.OPPIJA);
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
            return henkiloService.createHenkilo(henkilo, kasittelijaOid, false);
        }

    }

    @Override
    public Set<Organisaatio> getOrCreateOrganisaatioByHenkilo(String henkiloOid) {
        // haetaan käyttäjän organisaatiot ja luodaan niistä organisaatio oppijanumerorekisteriin
        Set<String> organisaatioOids = kayttooikeusClient.getAktiivisetOrganisaatioHenkilot(henkiloOid);
        return organisaatioOids.stream()
                .map(organisaatioOid -> organisaatioRepository.findByOid(organisaatioOid)
                .orElseGet(() -> organisaatioRepository.save(new Organisaatio(organisaatioOid))))
                .collect(toSet());
    }

}
