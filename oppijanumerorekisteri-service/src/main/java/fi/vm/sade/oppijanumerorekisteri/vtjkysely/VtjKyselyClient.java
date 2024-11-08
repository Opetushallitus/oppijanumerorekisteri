package fi.vm.sade.oppijanumerorekisteri.vtjkysely;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.ws.client.core.support.WebServiceGatewaySupport;

import fi.vm.sade.oppijanumerorekisteri.vtjkysely.jaxb.TeeHenkilonTunnusKysely;
import fi.vm.sade.oppijanumerorekisteri.vtjkysely.jaxb.TeeHenkilonTunnusKyselyResponse;

public class VtjKyselyClient extends WebServiceGatewaySupport {
    @Value("${oppijanumerorekisteri.vtjkysely.username}")
    private String kayttajatunnus;

    @Value("${oppijanumerorekisteri.vtjkysely.password}")
    private String salasana;

    private String loppukayttaja = "oppijanumerorekisteri";

    public TeeHenkilonTunnusKyselyResponse teeHenkilonTunnusKysely(String hetu) {
        TeeHenkilonTunnusKysely request = new TeeHenkilonTunnusKysely();
        request.setHenkilotunnus(hetu);
        request.setSoSoNimi("OPHREK");
        request.setKayttajatunnus(kayttajatunnus);
        request.setSalasana(salasana);
        request.setLoppukayttaja(loppukayttaja);

        TeeHenkilonTunnusKyselyResponse response = (TeeHenkilonTunnusKyselyResponse) getWebServiceTemplate()
          .marshalSendAndReceive(request);
        return response;
    }
}