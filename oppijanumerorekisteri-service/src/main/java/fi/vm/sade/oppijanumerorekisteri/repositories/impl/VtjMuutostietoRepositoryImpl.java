package fi.vm.sade.oppijanumerorekisteri.repositories.impl;

import fi.vm.sade.oppijanumerorekisteri.models.VtjMuutostieto;
import fi.vm.sade.oppijanumerorekisteri.repositories.VtjMuutostietoRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Repository
@Transactional
public class VtjMuutostietoRepositoryImpl implements VtjMuutostietoRepository {
    @PersistenceContext
    private EntityManager entityManager;

    @Override
    public VtjMuutostieto save(VtjMuutostieto muutostieto) {
        if (muutostieto.isNew()) {
            Object[] row = (Object[]) entityManager.createNativeQuery("""
                    INSERT INTO vtj_muutostieto (id, version, henkilotunnus, muutospv, tietoryhmat, processed, error)
                    VALUES (nextval('hibernate_sequence'), 0, :henkilotunnus, :muutospv, CAST(:tietoryhmat AS jsonb), :processed, :error)
                    RETURNING id, version
                    """)
                .setParameter("henkilotunnus", muutostieto.getHenkilotunnus())
                .setParameter("muutospv", timestamp(muutostieto.getMuutospv()))
                .setParameter("tietoryhmat", muutostieto.getTietoryhmat())
                .setParameter("processed", timestamp(muutostieto.getProcessed()))
                .setParameter("error", muutostieto.getError())
                .getSingleResult();
            muutostieto.setId(longValue(row[0]));
            muutostieto.setVersion(longValue(row[1]));
            return muutostieto;
        }

        Long currentVersion = muutostieto.getVersion() != null ? muutostieto.getVersion() : 0L;
        Long nextVersion = longValue(entityManager.createNativeQuery("""
                UPDATE vtj_muutostieto
                SET version = version + 1,
                    henkilotunnus = :henkilotunnus,
                    muutospv = :muutospv,
                    tietoryhmat = CAST(:tietoryhmat AS jsonb),
                    processed = :processed,
                    error = :error
                WHERE id = :id
                RETURNING version
                """)
            .setParameter("id", muutostieto.getId())
            .setParameter("henkilotunnus", muutostieto.getHenkilotunnus())
            .setParameter("muutospv", timestamp(muutostieto.getMuutospv()))
            .setParameter("tietoryhmat", muutostieto.getTietoryhmat())
            .setParameter("processed", timestamp(muutostieto.getProcessed()))
            .setParameter("error", muutostieto.getError())
            .getSingleResult());
        muutostieto.setVersion(nextVersion != null ? nextVersion : currentVersion + 1);
        return muutostieto;
    }

    @Override
    public List<VtjMuutostieto> saveAll(Iterable<VtjMuutostieto> muutostiedot) {
        List<VtjMuutostieto> saved = new ArrayList<>();
        for (VtjMuutostieto muutostieto : muutostiedot) {
            saved.add(save(muutostieto));
        }
        return saved;
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<VtjMuutostieto> findById(Long id) {
        List<VtjMuutostieto> result = mapRows(entityManager.createNativeQuery("""
                SELECT id, version, henkilotunnus, muutospv, tietoryhmat::text, processed, error
                FROM vtj_muutostieto
                WHERE id = :id
                """)
            .setParameter("id", id));
        return result.stream().findFirst();
    }

    @Override
    @Transactional(readOnly = true)
    public List<VtjMuutostieto> findAll() {
        return mapRows(entityManager.createNativeQuery("""
                SELECT id, version, henkilotunnus, muutospv, tietoryhmat::text, processed, error
                FROM vtj_muutostieto
                ORDER BY id
                """));
    }

    @Override
    @Transactional(readOnly = true)
    public List<VtjMuutostieto> findByProcessedIsNullOrErrorIsTrueOrderByMuutospvAsc() {
        return mapRows(entityManager.createNativeQuery("""
                SELECT id, version, henkilotunnus, muutospv, tietoryhmat::text, processed, error
                FROM vtj_muutostieto
                WHERE processed IS NULL OR error = true
                ORDER BY muutospv ASC
                """));
    }

    @Override
    @Transactional(readOnly = true)
    public List<VtjMuutostieto> findAllByHenkilotunnusOrderByMuutospvAsc(String henkilotunnus) {
        return mapRows(entityManager.createNativeQuery("""
                SELECT id, version, henkilotunnus, muutospv, tietoryhmat::text, processed, error
                FROM vtj_muutostieto
                WHERE henkilotunnus = :henkilotunnus
                ORDER BY muutospv ASC
                """)
            .setParameter("henkilotunnus", henkilotunnus));
    }

    private List<VtjMuutostieto> mapRows(Query query) {
        @SuppressWarnings("unchecked")
        List<Object[]> rows = query.getResultList();
        List<VtjMuutostieto> result = new ArrayList<>(rows.size());
        for (Object[] row : rows) {
            VtjMuutostieto muutostieto = new VtjMuutostieto();
            muutostieto.setId(longValue(row[0]));
            muutostieto.setVersion(longValue(row[1]));
            muutostieto.setHenkilotunnus((String) row[2]);
            muutostieto.setMuutospv(localDateTime(row[3]));
            muutostieto.setTietoryhmat((String) row[4]);
            muutostieto.setProcessed(localDateTime(row[5]));
            muutostieto.setError((Boolean) row[6]);
            result.add(muutostieto);
        }
        return result;
    }

    private Timestamp timestamp(LocalDateTime value) {
        return value != null ? Timestamp.valueOf(value) : null;
    }

    private LocalDateTime localDateTime(Object value) {
        if (value == null) {
            return null;
        }
        if (value instanceof LocalDateTime localDateTime) {
            return localDateTime;
        }
        if (value instanceof Timestamp timestamp) {
            return timestamp.toLocalDateTime();
        }
        throw new IllegalArgumentException("Unsupported timestamp value " + value.getClass());
    }

    private Long longValue(Object value) {
        return value != null ? ((Number) value).longValue() : null;
    }
}
