package fi.vm.sade.oppijanumerorekisteri;

import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;

public class FilesystemHelper {

    public static String getFixture(String fileName) throws Exception {
        return Files.readString(Paths.get(FilesystemHelper.class.getResource(fileName).toURI()), StandardCharsets.UTF_8);
    }
}
