package fi.vm.sade.oppijanumerorekisteri.models;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.SourceType;

import java.time.ZonedDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "eidastunniste")
@Entity
public class EidasTunniste extends IdentifiableAndVersionedEntity {
    @Column(name = "tunniste", nullable = false, unique = true)
    private String tunniste;

    @Column(name = "created")
    @CreationTimestamp(source = SourceType.DB)
    private ZonedDateTime created;

    @Column(name = "createdby", nullable = true)
    private String createdBy;
}
