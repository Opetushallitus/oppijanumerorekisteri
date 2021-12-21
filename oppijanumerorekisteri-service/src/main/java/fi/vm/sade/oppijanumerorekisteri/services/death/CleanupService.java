package fi.vm.sade.oppijanumerorekisteri.services.death;

import fi.vm.sade.oppijanumerorekisteri.enums.CleanupStep;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import fi.vm.sade.oppijanumerorekisteri.repositories.HenkiloRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collection;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import java.util.function.Predicate;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import static java.util.stream.Collectors.groupingBy;
import static java.util.stream.Collectors.summingInt;

@Slf4j
@RequiredArgsConstructor
@Component
public class CleanupService {

    /**
     * Magic value used for tracking which step should be run
     * on subject next. Logic: difference between two adjacent
     * enum ordinals.
     */
    private static final int STEPSIZE = -1;

    private final HenkiloRepository henkiloDataRepository;

    private Map<CleanupStep, CleanupTask> steps;

    @Autowired
    public void setSteps(final Collection<CleanupTask> steps) {
        this.steps = steps.stream()
                .collect(Collectors.toMap(
                        CleanupTask::getCleanupStep,
                        Function.identity()));
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void run() {
        final Collection<Henkilo> deadPersons = resolveIncompleteCleanups();
        getCleanupSteps().forEach(step -> applyStep(deadPersons, step));
    }

    protected Collection<Henkilo> resolveIncompleteCleanups() {
        return henkiloDataRepository.findDeadWithIncompleteCleanup(resolveFinalCleanupStep());
    }

    private CleanupStep resolveFinalCleanupStep() {
        return getCleanupSteps().reduce((a, b) -> b).orElse(CleanupStep.INITIATED);
    }

    private Stream<CleanupStep> getCleanupSteps() {
        return Stream.of(CleanupStep.values());
    }

    protected void applyStep(final Collection<Henkilo> subjects, final CleanupStep step) {
        Map<Boolean, Integer> report = resolveSubjectsNeedingStep(subjects, step).stream()
                .map(subject -> steps.containsKey(step) && steps.get(step).applyTo(subject))
                .collect(groupingBy(Boolean::booleanValue, summingInt(result -> 1)));
        output(report, step);
    }

    protected Collection<Henkilo> resolveSubjectsNeedingStep(final Collection<Henkilo> subjects, final CleanupStep step) {
        return subjects.stream()
                .filter(notApplied(step))
                .collect(Collectors.toList());
    }

    private Predicate<Henkilo> notApplied(CleanupStep step) {
        return subject -> Optional.ofNullable(subject.getCleanupStep())
                .map(Enum::ordinal)
                .orElse(STEPSIZE) - step.ordinal() == STEPSIZE;
    }

    protected void output(Map<Boolean, Integer> report, CleanupStep step) {
        if (!report.isEmpty()) {
            log.info("Run death cleanup step {}. {} success, {} failures",
                    step.name(),
                    report.getOrDefault(true, 0),
                    report.getOrDefault(false, 0));
        }
        if (report.containsKey(false)) {
            log.error("There was errors running cleanup process. Please check the logs");
        }
    }
}
