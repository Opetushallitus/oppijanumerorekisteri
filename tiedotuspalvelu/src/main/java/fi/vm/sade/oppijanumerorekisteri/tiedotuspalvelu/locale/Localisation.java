package fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu.locale;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.Table;
import java.io.Serializable;
import java.time.OffsetDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "localisation")
@IdClass(Localisation.LocalisationId.class)
@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Localisation {

  @Id
  @Column(nullable = false)
  private String key;

  @Id
  @Column(nullable = false)
  private String locale;

  @Column(nullable = false)
  private String value;

  @Column(nullable = false)
  private OffsetDateTime updated;

  @NoArgsConstructor
  @AllArgsConstructor
  @Getter
  @Setter
  public static class LocalisationId implements Serializable {
    private String key;
    private String locale;

    @Override
    public boolean equals(Object o) {
      if (this == o) return true;
      if (!(o instanceof LocalisationId that)) return false;
      return key.equals(that.key) && locale.equals(that.locale);
    }

    @Override
    public int hashCode() {
      return 31 * key.hashCode() + locale.hashCode();
    }
  }
}
