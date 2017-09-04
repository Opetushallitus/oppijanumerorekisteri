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
import fi.vm.sade.oppijanumerorekisteri.services.OrganisaatioService;
import fi.vm.sade.oppijanumerorekisteri.services.UserDetailsHelper;
import java.util.Set;

@Service
@Transactional
@RequiredArgsConstructor
public class OppijaServiceImpl implements OppijaService {

    private final OrganisaatioService organisaatioService;
    private final HenkiloService henkiloService;
    private final OrikaConfiguration mapper;
    private final HenkiloRepository henkiloRepository;
    private final TuontiRepository tuontiRepository;
    private final UserDetailsHelper userDetailsHelper;
    private final KayttooikeusClient kayttooikeusClient;

    @Override
    public OppijatReadDto getOrCreate(OppijatCreateDto dto) {
        // haetaan käyttäjän organisaatiot (joihin oppijat liitetään)
        String kayttajaOid = userDetailsHelper.getCurrentUserOid();
        boolean passivoitu = false;
        Set<Organisaatio> organisaatiot = kayttooikeusClient.getOrganisaatioHenkilot(kayttajaOid, passivoitu).stream()
                .map(organisaatio -> organisaatioService.getByOid(organisaatio.getOrganisaatioOid())
                        .orElseGet(() -> organisaatioService.create(organisaatio.getOrganisaatioOid())))
                .collect(toSet());
        if (organisaatiot.isEmpty()) {
            throw new ValidationException(String.format("Käyttäjällä (%s) ei ole yhtään organisaatiota joihin oppijat liitetään", kayttajaOid));
        }

        // validoidaan että hetut ovat uniikkeja
        Map<String, OppijaCreateDto> oppijatByHetu = dto.getHenkilot().stream()
                .collect(toMap(t -> t.getHenkilo().getHetu(), identity(), (u, v) -> {
                    throw new ValidationException(String.format("Duplikaatti hetu %s", u.getHenkilo().getHetu()));
                }));
        // haetaan jo luodut henkilöt
        Map<String, Henkilo> henkilot = henkiloRepository
                .findByHetuIn(oppijatByHetu.keySet()).stream()
                .collect(toMap(henkilo -> henkilo.getHetu(), identity()));

        Tuonti tuonti = mapper.map(dto, Tuonti.class);
        tuonti.setHenkilot(dto.getHenkilot().stream()
                .map(oppija -> getOrCreate(oppija, henkilot.get(oppija.getHenkilo().getHetu()), organisaatiot))
                .collect(toSet()));
        tuonti = tuontiRepository.save(tuonti);
        return mapper.map(tuonti, OppijatReadDto.class);
    }

    private TuontiRivi getOrCreate(OppijaCreateDto oppija, Henkilo henkilo, Set<Organisaatio> organisaatiot) {
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

    @Override
    @Transactional(readOnly = true)
    public OppijatReadDto getByTuontiId(Long id) {
        return tuontiRepository.findById(id)
                .map(entity -> mapper.map(entity, OppijatReadDto.class))
                .orElseThrow(() -> new NotFoundException("Oppijoiden tuontia ei löytynyt ID:llä " + id));
    }

}
