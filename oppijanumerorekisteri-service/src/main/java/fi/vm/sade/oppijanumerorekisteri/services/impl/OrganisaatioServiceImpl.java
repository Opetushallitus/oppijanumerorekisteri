package fi.vm.sade.oppijanumerorekisteri.services.impl;

import fi.vm.sade.oppijanumerorekisteri.clients.OrganisaatioClient;
import fi.vm.sade.oppijanumerorekisteri.dto.OrganisaatioTilat;
import fi.vm.sade.oppijanumerorekisteri.exceptions.ValidationException;
import fi.vm.sade.oppijanumerorekisteri.models.Organisaatio;
import fi.vm.sade.oppijanumerorekisteri.repositories.OrganisaatioRepository;
import fi.vm.sade.oppijanumerorekisteri.services.OrganisaatioService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;

@Service
@Transactional
@RequiredArgsConstructor
public class OrganisaatioServiceImpl implements OrganisaatioService {

    private final OrganisaatioRepository organisaatioRepository;
    private final OrganisaatioClient organisaatioClient;

    @Override
    public Organisaatio create(String oid) {
        if (!organisaatioClient.exists(oid)) {
            throw new ValidationException(String.format("Organisaatiota ei löydy OID:lla %s organisaatiopalvelusta", oid));
        }
        return organisaatioRepository.save(Organisaatio.builder().oid(oid).build());
    }

    @Override
    public Set<String> getChildOids(String oid, boolean rekursiivisesti, OrganisaatioTilat tilat) {
        return organisaatioClient.getChildOids(oid, rekursiivisesti, tilat);
    }

}
