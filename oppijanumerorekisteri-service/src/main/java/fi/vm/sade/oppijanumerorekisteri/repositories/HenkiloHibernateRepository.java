package fi.vm.sade.oppijanumerorekisteri.repositories;

import fi.vm.sade.oppijanumerorekisteri.repositories.criteria.YhteystietoCriteria;
import fi.vm.sade.oppijanumerorekisteri.repositories.dto.YhteystietoHakuDto;
import org.springframework.stereotype.Repository;

import java.util.List;

// High speed repository for jpa queries with querydsl.
@Repository
public interface HenkiloHibernateRepository {
    String getHetuByOid(String henkiloOid);
    String getOidByHetu(String hetu);
    
    List<YhteystietoHakuDto> findYhteystiedot(YhteystietoCriteria criteria);
}
