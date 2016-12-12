package fi.vm.sade.oppijanumerorekisteri.dto;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.function.Function;
import java.util.function.Predicate;

import static java.util.Arrays.asList;
import static java.util.Comparator.comparing;

public class HenkilonYhteystiedotByPriorityOrderDto implements ReadableYhteystiedot {
    private final Predicate<YhteystietoRyhmaKuvaus> predicate;
    private final List<YhteystietoRyhmaKuvaus> ryhmat;
    private final Map<YhteystietoRyhmaKuvaus, YhteystiedotDto> yhteystiedot;
    private final Comparator<YhteystietoRyhmaKuvaus> comparator;

    public HenkilonYhteystiedotByPriorityOrderDto(Map<YhteystietoRyhmaKuvaus, YhteystiedotDto> yhteystiedot,
                                                  boolean includeNonListed, YhteystietoRyhmaKuvaus... ryhmat) {
        this.yhteystiedot = yhteystiedot;
        this.ryhmat = asList(ryhmat);
        this.predicate = includeNonListed ? any -> true : this.ryhmat::contains;
        if (ryhmat.length < 1) {
            this.comparator = comparing(YhteystietoRyhmaKuvaus::ordinal);
        } else {
            this.comparator = comparing(t -> {
                int index = this.ryhmat.indexOf(t);
                return index < 0 ? this.ryhmat.size() : index;
            } );
        }
    }

    private static boolean nonEmpty(String val) {
        return val != null && !val.isEmpty();
    }
    
    private String findFirst(Function<ReadableYhteystiedot, String> fun) {
        return yhteystiedot.entrySet().stream().filter(kv -> predicate.test(kv.getKey()))
                .filter(kv -> nonEmpty(fun.apply(kv.getValue())))
                .sorted(comparing(Entry::getKey, comparator)).map(kv -> fun.apply(kv.getValue()))
                .findFirst().orElse(null);
    }
    
    @Override
    public String getSahkoposti() {
        return findFirst(ReadableYhteystiedot::getSahkoposti);
    }

    @Override
    public String getPuhelinnumero() {
        return findFirst(ReadableYhteystiedot::getPuhelinnumero);
    }

    @Override
    public String getMatkapuhelinnumero() {
        return findFirst(ReadableYhteystiedot::getMatkapuhelinnumero);
    }

    @Override
    public String getKatuosoite() {
        return findFirst(ReadableYhteystiedot::getKatuosoite);
    }

    @Override
    public String getKunta() {
        return findFirst(ReadableYhteystiedot::getKunta);
    }

    @Override
    public String getPostinumero() {
        return findFirst(ReadableYhteystiedot::getPuhelinnumero);
    }

    @Override
    public String getKaupunki() {
        return findFirst(ReadableYhteystiedot::getKaupunki);
    }

    @Override
    public String getMaa() {
        return findFirst(ReadableYhteystiedot::getMaa);
    }
}
