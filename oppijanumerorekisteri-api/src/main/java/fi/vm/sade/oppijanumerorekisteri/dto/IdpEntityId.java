package fi.vm.sade.oppijanumerorekisteri.dto;

// hardcoded values for koodisto 'henkilontunnistetyypit'
public enum IdpEntityId {
  oppijaToken("oppijaToken"),
  google("google"),
  email("email"),
  eidas("eidas");

  private String idpEntityId;

  IdpEntityId(String idpEntityId) {
    this.idpEntityId = idpEntityId;
  }

  public String getIdpEntityId() {
    return idpEntityId;
  }
}
