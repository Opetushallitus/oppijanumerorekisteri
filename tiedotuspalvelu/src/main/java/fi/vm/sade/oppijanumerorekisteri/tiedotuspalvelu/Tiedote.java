package fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "tiedote")
@Builder
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class Tiedote {

  @Id
  @GeneratedValue(strategy = GenerationType.AUTO)
  private UUID id;

  @Column(nullable = false)
  private String oppijanumero;

  @Column(nullable = false)
  private String url;
}
