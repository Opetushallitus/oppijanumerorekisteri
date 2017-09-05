package fi.vm.sade.oppijanumerorekisteri.services.impl;

import fi.vm.sade.oppijanumerorekisteri.clients.KayttooikeusClient;
import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloTyyppi;
import fi.vm.sade.oppijanumerorekisteri.dto.OppijaCreateDto;
import fi.vm.sade.oppijanumerorekisteri.dto.OppijatCreateDto;
import fi.vm.sade.oppijanumerorekisteri.dto.OppijatReadDto;
import fi.vm.sade.oppijanumerorekisteri.exceptions.NotFoundException;
import fi.vm.sade.oppijanumerorekisteri.exceptions.ValidationException;
import fi.vm.sade.oppijanumerorekisteri.mappers.OrikaConfiguration;
import fi.vm.sade.oppijanumerorekisteri.models.Tuonti;
import fi.vm.sade.oppijanumerorekisteri.models.TuontiRivi;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import fi.vm.sade.oppijanumerorekisteri.models.Organisaatio;
import fi.vm.sade.oppijanumerorekisteri.repositories.HenkiloRepository;
import fi.vm.sade.oppijanumerorekisteri.repositories.OrganisaatioRepository;
import fi.vm.sade.oppijanumerorekisteri.services.HenkiloService;
import fi.vm.sade.oppijanumerorekisteri.services.OppijaService;
import java.util.Map;
import static java.util.function.Function.identity;
import static java.util.stream.Collectors.toMap;
import static java.util.stream.Collectors.toSet;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import fi.vm.sade.oppijanumerorekisteri.repositories.TuontiRepository;
import fi.vm.sade.oppijanumerorekisteri.services.UserDetailsHelper;
import java.util.Collection;
import java.util.Set;
import java.util.function.BinaryOperator;

@Service
@Transactional
@RequiredArgsConstructor
public class OppijaServiceImpl implements OppijaService {

    private final HenkiloService henkiloService;
    private final OrikaConfiguration mapper;
    private final HenkiloRepository henkiloRepository;
    private final TuontiRepository tuontiRepository;
    private final OrganisaatioRepository organisaatioRepository;
    private final UserDetailsHelper userDetailsHelper;
    private final KayttooikeusClient kayttooikeusClient;

    @Override
    public OppijatReadDto getOrCreate(OppijatCreateDto dto) {
        // validoidaan että hetut ovat uniikkeja
        Map<String, OppijaCreateDto> oppijatByHetu = mapByHetu(dto.getHenkilot(), (u, v) -> {
            throw new ValidationException(String.format("Duplikaatti hetu %s", u.getHenkilo().getHetu()));
        });

        // haetaan käyttäjän organisaatiot (joihin oppijat liitetään)
        String kayttajaOid = userDetailsHelper.getCurrentUserOid();
        Set<Organisaatio> organisaatiot = getOrCreateOrganisaatioByHenkilo(kayttajaOid, false);
        if (organisaatiot.isEmpty()) {
            throw new ValidationException(String.format("Käyttäjällä (%s) ei ole yhtään organisaatiota joihin oppijat liitetään", kayttajaOid));
        }
        // haetaan jo luodut henkilöt
        Map<String, Henkilo> henkiloByHetu = getAndMapByHetu(oppijatByHetu.keySet());

        Tuonti tuonti = mapper.map(dto, Tuonti.class);
        TuontiRiviHelper tuontiRiviHelper = new TuontiRiviHelper(organisaatiot, henkiloByHetu);
        tuonti.setHenkilot(dto.getHenkilot().stream()
                .map(tuontiRiviHelper::map)
                .collect(toSet()));
        tuonti = tuontiRepository.save(tuonti);
        return mapper.map(tuonti, OppijatReadDto.class);
    }

    private Map<String, OppijaCreateDto> mapByHetu(Collection<OppijaCreateDto> oppijat, BinaryOperator<OppijaCreateDto> mergeFunction) {
        return oppijat.stream().collect(toMap(t -> t.getHenkilo().getHetu(), identity(), mergeFunction));
    }

    private Set<Organisaatio> getOrCreateOrganisaatioByHenkilo(String henkiloOid, boolean passivoitu) {
        // haetaan henkilön organisaatiot ja luodaan niistä organisaatio oppijanumerorekisteriin
        return kayttooikeusClient.getOrganisaatioHenkilot(henkiloOid, passivoitu).stream()
                .map(organisaatio -> organisaatioRepository.findByOid(organisaatio.getOrganisaatioOid())
                        .orElseGet(() -> organisaatioRepository.save(Organisaatio.builder().oid(organisaatio.getOrganisaatioOid()).build())))
                .collect(toSet());
    }

    private Map<String, Henkilo> getAndMapByHetu(Set<String> hetut) {
        return henkiloRepository
                .findByHetuIn(hetut).stream()
                .collect(toMap(henkilo -> henkilo.getHetu(), identity()));
    }

    @RequiredArgsConstructor
    private class TuontiRiviHelper {

        private final Set<Organisaatio> organisaatiot;
        private final Map<String, Henkilo> henkilotByHetu;

        public TuontiRivi map(OppijaCreateDto oppija) {
            Henkilo henkilo = henkilotByHetu.get(oppija.getHenkilo().getHetu());

            // luodaan tarvittaessa uusi henkilö
            if (henkilo == null) {
                henkilo = mapper.map(oppija.getHenkilo(), Henkilo.class);
                henkilo.setHenkiloTyyppi(HenkiloTyyppi.OPPIJA);
                henkilo = henkiloService.createHenkilo(henkilo);
            }

            // liitetään henkilö organisaatioihin
            organisaatiot.stream().forEach(henkilo::addOrganisaatio);
            henkilo = henkiloRepository.save(henkilo);

            TuontiRivi rivi = mapper.map(oppija, TuontiRivi.class);
            rivi.setHenkilo(henkilo);
            return rivi;
        }

    }

    @Override
    @Transactional(readOnly = true)
    public OppijatReadDto getByTuontiId(Long id) {
        return tuontiRepository.findById(id)
                .map(entity -> mapper.map(entity, OppijatReadDto.class))
                .orElseThrow(() -> new NotFoundException("Oppijoiden tuontia ei löytynyt ID:llä " + id));
    }

}
