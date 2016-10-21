package fi.vm.sade.oppijanumerorekisteri;

import org.apache.commons.io.IOUtils;
import org.intellij.lang.annotations.Language;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;

import java.io.IOException;

public abstract class AbstractTest {
    @Autowired
    private ApplicationContext applicationContext;

    /**
     * @see #resource(String)
     * Version annotated to return JSON
     */
    @Language("JSON")
    protected String jsonResource(@Language("spring-resource-reference") String classpathResource) {
        return resource(classpathResource);
    }

    /**
     * Convenience method for loading classpath resources. In Spring's form for IDEA link/refactoring support.
     * @param resource in Spring's resource form, e.g. classpath:/some-file
     * @return resource contents as a string
     */
    protected String resource(@Language("spring-resource-reference") String resource) {
        try {
            return IOUtils.toString(applicationContext.getResource(resource).getInputStream());
        } catch (IOException e) {
            throw new IllegalArgumentException("Could not load resource: " + resource + ", cause: " + e.getMessage(), e);
        }
    }
}
