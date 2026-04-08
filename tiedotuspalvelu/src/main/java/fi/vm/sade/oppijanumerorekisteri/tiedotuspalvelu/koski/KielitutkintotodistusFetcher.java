package fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu.koski;

public interface KielitutkintotodistusFetcher {
  byte[] fetchPdf(String bucketName, String objectKey);
}
