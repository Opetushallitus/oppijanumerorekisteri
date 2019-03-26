package fi.vm.sade.oppijanumerorekisteri.util.batchprocessing;

import java.util.List;

public interface BatchingProcess<T, R> {
    public List<R> process( List<T> batch );
}
