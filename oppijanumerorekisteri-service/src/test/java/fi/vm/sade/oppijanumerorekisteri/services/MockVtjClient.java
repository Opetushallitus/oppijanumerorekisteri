package fi.vm.sade.oppijanumerorekisteri.services;

import com.google.gson.Gson;
import fi.vm.sade.oppijanumerorekisteri.clients.VtjClient;
import fi.vm.sade.rajapinnat.vtj.api.YksiloityHenkilo;

import java.io.InputStreamReader;


public class MockVtjClient implements VtjClient {

    private Gson gson = new Gson();
    private String usedFixture;

    public void setUsedFixture(String usedFixture) {
        this.usedFixture = usedFixture;
    }

    @Override
    public YksiloityHenkilo fetchHenkilo(String hetu) {
        if (usedFixture == null) {
            throw new IllegalArgumentException("Used fixture not provided!");
        }
        return gson.fromJson(new InputStreamReader(getClass().getResourceAsStream(usedFixture)), YksiloityHenkilo.class);
    }
}
