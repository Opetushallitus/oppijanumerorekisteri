package fi.vm.sade.oppijanumerorekisteri.services;

import fi.vm.sade.oppijanumerorekisteri.IntegrationTest;
import fi.vm.sade.oppijanumerorekisteri.vtjkysely.VtjKyselyClient;
import fi.vm.sade.oppijanumerorekisteri.vtjkysely.jaxb.TeeHenkilonTunnusKyselyResponse;
import fi.vm.sade.oppijanumerorekisteri.vtjkysely.jaxb.VTJHenkiloVastaussanoma;
import fi.vm.sade.rajapinnat.vtj.api.YksiloityHenkilo;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.junit4.SpringRunner;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Optional;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;
import static org.mockito.Mockito.*;

@RunWith(SpringRunner.class)
@IntegrationTest
public class VtjServiceTest {
    @MockBean
    private VtjKyselyClient vtjKyselyClient;
    @Autowired
    private VtjService vtjService;

    @Test
    public void testHenkilonTunnusKysely0000() {
        String hetu = "111111-1111";

        TeeHenkilonTunnusKyselyResponse result =
                Mockito.mock(TeeHenkilonTunnusKyselyResponse.class);
        TeeHenkilonTunnusKyselyResponse.TeeHenkilonTunnusKyselyResult r =
                Mockito.mock(TeeHenkilonTunnusKyselyResponse.TeeHenkilonTunnusKyselyResult.class);
        when(result.getTeeHenkilonTunnusKyselyResult()).thenReturn(r);
        when(r.getContent())
                .thenReturn(new ArrayList<>(Arrays.asList(createVastausSanomaWithPaluukoodi0000(hetu))));

        when(vtjKyselyClient.teeHenkilonTunnusKysely(hetu))
                .thenReturn(result);

        YksiloityHenkilo yksiloityHenkilo = vtjService.teeHenkiloKysely(hetu).get();

        assertEquals(yksiloityHenkilo.getHetu(), "111111-1111");
    }

    @Test
    public void testHenkilonTunnusKysely0001() {
        TeeHenkilonTunnusKyselyResponse result =
                Mockito.mock(TeeHenkilonTunnusKyselyResponse.class);
        TeeHenkilonTunnusKyselyResponse.TeeHenkilonTunnusKyselyResult r =
                Mockito.mock(TeeHenkilonTunnusKyselyResponse.TeeHenkilonTunnusKyselyResult.class);
        when(result.getTeeHenkilonTunnusKyselyResult()).thenReturn(r);
        when(r.getContent())
                .thenReturn(new ArrayList<Object>(Arrays.asList(createVastausSanomaWithPaluukoodi0001())));

        when(vtjKyselyClient.teeHenkilonTunnusKysely("111111-1111"))
                .thenReturn(result);

        VtjService vtjService = new VtjService(vtjKyselyClient);
        Optional<YksiloityHenkilo> yksiloityHenkilo = vtjService.teeHenkiloKysely("111111-1111");

        assertTrue(yksiloityHenkilo.isEmpty());
    }

    @Test
    public void testHenkilonTunnusKysely0002NoNewHetu() {
        String hetu = "111111-1111";

        TeeHenkilonTunnusKyselyResponse result =
                Mockito.mock(TeeHenkilonTunnusKyselyResponse.class);
        TeeHenkilonTunnusKyselyResponse.TeeHenkilonTunnusKyselyResult r =
                Mockito.mock(TeeHenkilonTunnusKyselyResponse.TeeHenkilonTunnusKyselyResult.class);
        when(result.getTeeHenkilonTunnusKyselyResult()).thenReturn(r);
        when(r.getContent())
                .thenReturn(new ArrayList<Object>(Arrays.asList(createVastausSanomaWithPaluukoodi0002(hetu))));

        when(vtjKyselyClient.teeHenkilonTunnusKysely(hetu))
                .thenReturn(result);

        VtjService vtjService = new VtjService(vtjKyselyClient);
        YksiloityHenkilo yksiloityHenkilo = vtjService.teeHenkiloKysely(hetu).get();

        assertTrue(yksiloityHenkilo.isPassivoitu());
    }

    @Test
    public void testHenkilonTunnusKysely0002NewHetu() {
        String oldHetu = "111111-1111";
        String newHetu = "222222-2222";
        TeeHenkilonTunnusKyselyResponse oldResult =
                Mockito.mock(TeeHenkilonTunnusKyselyResponse.class);
        TeeHenkilonTunnusKyselyResponse.TeeHenkilonTunnusKyselyResult r =
                Mockito.mock(TeeHenkilonTunnusKyselyResponse.TeeHenkilonTunnusKyselyResult.class);
        when(oldResult.getTeeHenkilonTunnusKyselyResult()).thenReturn(r);
        when(r.getContent())
                .thenReturn(new ArrayList<Object>(Arrays.asList(createVastausSanomaWithPaluukoodi0002(newHetu))));

        when(vtjKyselyClient.teeHenkilonTunnusKysely(oldHetu))
                .thenReturn(oldResult);

                TeeHenkilonTunnusKyselyResponse newResult =
                Mockito.mock(TeeHenkilonTunnusKyselyResponse.class);
        TeeHenkilonTunnusKyselyResponse.TeeHenkilonTunnusKyselyResult newr =
                Mockito.mock(TeeHenkilonTunnusKyselyResponse.TeeHenkilonTunnusKyselyResult.class);
        when(newResult.getTeeHenkilonTunnusKyselyResult()).thenReturn(newr);
        when(newr.getContent())
                .thenReturn(new ArrayList<Object>(Arrays.asList(createVastausSanomaWithPaluukoodi0000(newHetu))));

        when(vtjKyselyClient.teeHenkilonTunnusKysely(newHetu))
                .thenReturn(newResult);

        VtjService vtjService = new VtjService(vtjKyselyClient);
        vtjService = spy(vtjService);

        YksiloityHenkilo yksiloityHenkilo = vtjService.teeHenkiloKysely(oldHetu).get();

        verify(vtjService, times(1)).teeHenkiloKysely(oldHetu);
        verify(vtjService, times(1)).getVtjHenkiloVastaussanoma(oldHetu, false);
        verify(vtjService, times(1)).getVtjHenkiloVastaussanoma(newHetu, true);

        assertEquals(yksiloityHenkilo.getHetu(), newHetu);
    }

    @Test(expected = RuntimeException.class)
    public void testHenkilonTunnusKysely0002NewActiveHetuQueryProducesAnotherNewActiveHetu() {
        String oldHetu = "111111-1111";
        String newHetu = "222222-2222";
        String anotherNewHetu = "333333-3333";

        TeeHenkilonTunnusKyselyResponse result =
                Mockito.mock(TeeHenkilonTunnusKyselyResponse.class);
        TeeHenkilonTunnusKyselyResponse.TeeHenkilonTunnusKyselyResult r =
                Mockito.mock(TeeHenkilonTunnusKyselyResponse.TeeHenkilonTunnusKyselyResult.class);
        when(result.getTeeHenkilonTunnusKyselyResult()).thenReturn(r);
        when(r.getContent())
                .thenReturn(new ArrayList<Object>(Arrays.asList(createVastausSanomaWithPaluukoodi0002(newHetu))))
                .thenReturn(new ArrayList<Object>(Arrays.asList(createVastausSanomaWithPaluukoodi0002(anotherNewHetu))));

        when(vtjKyselyClient.teeHenkilonTunnusKysely(oldHetu))
                .thenReturn(result);

        when(vtjKyselyClient.teeHenkilonTunnusKysely(newHetu))
                .thenReturn(result);

        VtjService vtjService = new VtjService(vtjKyselyClient);
        vtjService = spy(vtjService);

        vtjService.teeHenkiloKysely(oldHetu);

        verify(vtjService, times(1)).teeHenkiloKysely(oldHetu);
        verify(vtjService, times(1)).getVtjHenkiloVastaussanoma(oldHetu, false);
        verify(vtjService, times(1)).getVtjHenkiloVastaussanoma(newHetu, true);
    }

    @Test(expected = RuntimeException.class)
    public void testHenkilonTunnusKyselyTuntematon() {
        TeeHenkilonTunnusKyselyResponse result =
                Mockito.mock(TeeHenkilonTunnusKyselyResponse.class);
        TeeHenkilonTunnusKyselyResponse.TeeHenkilonTunnusKyselyResult r =
                Mockito.mock(TeeHenkilonTunnusKyselyResponse.TeeHenkilonTunnusKyselyResult.class);
        when(result.getTeeHenkilonTunnusKyselyResult()).thenReturn(r);
        when(r.getContent())
                .thenReturn(new ArrayList<Object>(Arrays.asList(createVastausSanomaWithPaluukoodi("tuntematon"))));

        when(vtjKyselyClient.teeHenkilonTunnusKysely("111111-1111"))
                .thenReturn(result);

        VtjService vtjService = new VtjService(vtjKyselyClient);
        vtjService.teeHenkiloKysely("111111-1111");
    }

    private VTJHenkiloVastaussanoma createVastausSanomaWithPaluukoodi(String tuntematon) {
        VTJHenkiloVastaussanoma.Paluukoodi paluukoodi = new VTJHenkiloVastaussanoma.Paluukoodi();
        paluukoodi.setKoodi(tuntematon);

        VTJHenkiloVastaussanoma vtjHenkiloVastaussanoma = new VTJHenkiloVastaussanoma();
        vtjHenkiloVastaussanoma.setPaluukoodi(paluukoodi);

        return vtjHenkiloVastaussanoma;
    }

    private VTJHenkiloVastaussanoma createVastausSanomaWithPaluukoodi0000(String hetu) {
        VTJHenkiloVastaussanoma.Paluukoodi paluukoodi = new VTJHenkiloVastaussanoma.Paluukoodi();
        paluukoodi.setKoodi("0000");


        VTJHenkiloVastaussanoma.Henkilo.Henkilotunnus henkiloTunnus = new VTJHenkiloVastaussanoma.Henkilo.Henkilotunnus();
        henkiloTunnus.setValue(hetu);

        VTJHenkiloVastaussanoma.Henkilo.NykyisetEtunimet nykyisetEtunimet = new VTJHenkiloVastaussanoma.Henkilo.NykyisetEtunimet();
        nykyisetEtunimet.setEtunimet("");

        VTJHenkiloVastaussanoma.Henkilo.NykyinenSukunimi nykyinenSukunimi= new VTJHenkiloVastaussanoma.Henkilo.NykyinenSukunimi();
        nykyinenSukunimi.setSukunimi("");

        VTJHenkiloVastaussanoma.Henkilo.NykyinenKutsumanimi nykyinenKutsumanimi = new VTJHenkiloVastaussanoma.Henkilo.NykyinenKutsumanimi();
        nykyinenKutsumanimi.setKutsumanimi("");

        VTJHenkiloVastaussanoma.Henkilo.Turvakielto turvakielto = new VTJHenkiloVastaussanoma.Henkilo.Turvakielto();
        turvakielto.setTurvakieltoTieto("1");

        VTJHenkiloVastaussanoma.Henkilo.Sukupuoli sukupuoli = new VTJHenkiloVastaussanoma.Henkilo.Sukupuoli();
        sukupuoli.setSukupuolikoodi("");

        VTJHenkiloVastaussanoma.Henkilo.Aidinkieli aidinkieli = new VTJHenkiloVastaussanoma.Henkilo.Aidinkieli();
        aidinkieli.setKielikoodi("");

        VTJHenkiloVastaussanoma.Henkilo henkilo = new VTJHenkiloVastaussanoma.Henkilo();
        henkilo.setHenkilotunnus(henkiloTunnus);
        henkilo.setNykyisetEtunimet(nykyisetEtunimet);
        henkilo.setNykyinenSukunimi(nykyinenSukunimi);
        henkilo.setNykyinenKutsumanimi(nykyinenKutsumanimi);
        henkilo.setTurvakielto(turvakielto);
        henkilo.setSukupuoli(sukupuoli);
        henkilo.setAidinkieli(aidinkieli);

        VTJHenkiloVastaussanoma vtjHenkiloVastaussanoma = new VTJHenkiloVastaussanoma();
        vtjHenkiloVastaussanoma.setPaluukoodi(paluukoodi);
        vtjHenkiloVastaussanoma.setHenkilo(henkilo);

        return vtjHenkiloVastaussanoma;
    }

    private VTJHenkiloVastaussanoma createVastausSanomaWithPaluukoodi0001() {
        VTJHenkiloVastaussanoma.Paluukoodi paluukoodi = new VTJHenkiloVastaussanoma.Paluukoodi();
        paluukoodi.setKoodi("0001");

        VTJHenkiloVastaussanoma vtjHenkiloVastaussanoma = new VTJHenkiloVastaussanoma();
        vtjHenkiloVastaussanoma.setPaluukoodi(paluukoodi);

        return vtjHenkiloVastaussanoma;
    }

    private VTJHenkiloVastaussanoma createVastausSanomaWithPaluukoodi0002(String hetu) {
        VTJHenkiloVastaussanoma.Paluukoodi paluukoodi = new VTJHenkiloVastaussanoma.Paluukoodi();
        paluukoodi.setKoodi("0002");

        VTJHenkiloVastaussanoma.Henkilo.Henkilotunnus henkiloTunnus = new VTJHenkiloVastaussanoma.Henkilo.Henkilotunnus();
        henkiloTunnus.setValue(hetu);

        VTJHenkiloVastaussanoma.Henkilo.NykyisetEtunimet nykyisetEtunimet = new VTJHenkiloVastaussanoma.Henkilo.NykyisetEtunimet();
        nykyisetEtunimet.setEtunimet("");

        VTJHenkiloVastaussanoma.Henkilo.NykyinenSukunimi nykyinenSukunimi= new VTJHenkiloVastaussanoma.Henkilo.NykyinenSukunimi();
        nykyinenSukunimi.setSukunimi("");

        VTJHenkiloVastaussanoma.Henkilo.NykyinenKutsumanimi nykyinenKutsumanimi = new VTJHenkiloVastaussanoma.Henkilo.NykyinenKutsumanimi();
        nykyinenKutsumanimi.setKutsumanimi("");

        VTJHenkiloVastaussanoma.Henkilo.Turvakielto turvakielto = new VTJHenkiloVastaussanoma.Henkilo.Turvakielto();
        turvakielto.setTurvakieltoTieto("1");

        VTJHenkiloVastaussanoma.Henkilo.Sukupuoli sukupuoli = new VTJHenkiloVastaussanoma.Henkilo.Sukupuoli();
        sukupuoli.setSukupuolikoodi("");

        VTJHenkiloVastaussanoma.Henkilo.Aidinkieli aidinkieli = new VTJHenkiloVastaussanoma.Henkilo.Aidinkieli();
        aidinkieli.setKielikoodi("");

        VTJHenkiloVastaussanoma.Henkilo henkilo = new VTJHenkiloVastaussanoma.Henkilo();
        henkilo.setHenkilotunnus(henkiloTunnus);
        henkilo.setNykyisetEtunimet(nykyisetEtunimet);
        henkilo.setNykyinenSukunimi(nykyinenSukunimi);
        henkilo.setNykyinenKutsumanimi(nykyinenKutsumanimi);
        henkilo.setTurvakielto(turvakielto);
        henkilo.setSukupuoli(sukupuoli);
        henkilo.setAidinkieli(aidinkieli);

        VTJHenkiloVastaussanoma vtjHenkiloVastaussanoma = new VTJHenkiloVastaussanoma();
        vtjHenkiloVastaussanoma.setPaluukoodi(paluukoodi);
        vtjHenkiloVastaussanoma.setHenkilo(henkilo);

        return vtjHenkiloVastaussanoma;
    }
}

