package fi.vm.sade.oppijanumerorekisteri.services.impl;

import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloCreateDto;
import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloDto;
import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloExistenceCheckDto;
import fi.vm.sade.oppijanumerorekisteri.dto.YleistunnisteDto;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import fi.vm.sade.oppijanumerorekisteri.models.Organisaatio;
import fi.vm.sade.oppijanumerorekisteri.repositories.OrganisaatioRepository;
import fi.vm.sade.oppijanumerorekisteri.services.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.stream.Stream;

import static fi.vm.sade.oppijanumerorekisteri.services.impl.PermissionCheckerImpl.PALVELU_OPPIJANUMEROREKISTERI;
import static fi.vm.sade.oppijanumerorekisteri.services.impl.PermissionCheckerImpl.YLEISTUNNISTE_LUONTI_ACCESS_RIGHT_LITERAL;

@Transactional
@Service
@RequiredArgsConstructor
public class YleistunnisteServiceImpl implements YleistunnisteService {

    private final YksilointiService yksilointiService;

    private final HenkiloService henkiloService;

    private final HenkiloModificationService henkiloModificationService;

    private final PermissionChecker permissionChecker;

    private final OrganisaatioRepository organisaatioRepository;

    @Override
    public YleistunnisteDto hae(HenkiloExistenceCheckDto details) {
        return associateToOrganisations(findOrCreate(details));
    }

    private YleistunnisteDto associateToOrganisations(YleistunnisteDto dto) {
        Henkilo henkilo = henkiloService.getEntityByOid(dto.getOid());
        resolveOrganisations().forEach(henkilo::addOrganisaatio);
        return dto;
    }

    private Stream<Organisaatio> resolveOrganisations() {
        return permissionChecker.getOrganisaatioOidsByKayttaja(PALVELU_OPPIJANUMEROREKISTERI, YLEISTUNNISTE_LUONTI_ACCESS_RIGHT_LITERAL).stream()
                .map(organisaatioOid -> organisaatioRepository.findByOid(organisaatioOid)
                        .orElseGet(() -> organisaatioRepository.save(new Organisaatio(organisaatioOid))));
    }

    private YleistunnisteDto findOrCreate(HenkiloExistenceCheckDto details) {
        Optional<String> oid = yksilointiService.exists(details);
        return oid.isPresent() ? returnOnrDetails(oid.get()) : create(details);
    }

    private YleistunnisteDto returnOnrDetails(String oid) {
        return YleistunnisteDto.builder()
                .oid(oid)
                .oppijanumero(henkiloService.getMasterByOid(oid).getOppijanumero())
                .build();
    }

    private YleistunnisteDto create(HenkiloExistenceCheckDto details) {
        HenkiloDto henkilo = henkiloModificationService.createHenkilo(convert(details));
        return YleistunnisteDto.builder()
                .oid(henkilo.getOidHenkilo())
                .oppijanumero(henkilo.getOidHenkilo())
                .build();
    }

    private HenkiloCreateDto convert(HenkiloExistenceCheckDto details) {
        return HenkiloCreateDto.builder()
                .hetu(details.getHetu())
                .etunimet(details.getEtunimet())
                .kutsumanimi(details.getKutsumanimi())
                .sukunimi(details.getSukunimi())
                .build();
    }
}
