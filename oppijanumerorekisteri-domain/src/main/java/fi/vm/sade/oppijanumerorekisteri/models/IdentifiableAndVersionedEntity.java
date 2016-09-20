package fi.vm.sade.oppijanumerorekisteri.models;

import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.TypeDef;
import org.hibernate.annotations.TypeDefs;

import javax.persistence.*;

@Getter
@Setter
@MappedSuperclass
@TypeDefs({
        @TypeDef(name = "localTime", typeClass = org.jadira.usertype.dateandtime.joda.PersistentLocalTime.class),
        @TypeDef(name = "localDate", typeClass = org.jadira.usertype.dateandtime.joda.PersistentLocalDate.class),
        @TypeDef(name = "dateTime", typeClass = org.jadira.usertype.dateandtime.joda.PersistentDateTime.class,
                parameters = {@org.hibernate.annotations.Parameter(name = "databaseZone", value = "jvm")})
})
public class IdentifiableAndVersionedEntity {
    @Id
    @Column(name = "id", unique = true, nullable = false)
    @GeneratedValue
    private Long id;
    
    @Version
    @Column(name = "version", nullable = false)
    private Long version;
}
