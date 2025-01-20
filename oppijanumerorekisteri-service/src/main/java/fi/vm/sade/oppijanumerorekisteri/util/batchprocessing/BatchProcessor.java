package fi.vm.sade.oppijanumerorekisteri.util.batchprocessing;

import java.util.ArrayList;
import java.util.List;

public class BatchProcessor {

    public static final int postgreSqlMaxBindVariables = 15000;

    public static <T, R> List<R> execute (List<T> list, int batchsize, BatchingProcess<T, R> process) {
        List<R> results = new ArrayList<>();

        for (int i = 0; i < list.size(); i += batchsize) {
            results.addAll (
                process.process(list.subList(i, Math.min(list.size(), i + batchsize)))
            );
        }
        return results;
    }
}
