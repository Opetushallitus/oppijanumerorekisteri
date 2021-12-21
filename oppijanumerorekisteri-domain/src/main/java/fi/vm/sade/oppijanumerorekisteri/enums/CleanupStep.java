package fi.vm.sade.oppijanumerorekisteri.enums;

/**
 * Defines types of cleanup tasks which are run on dead persons.
 * Person is considered dead when <code>Henkilo.getKuolinpaiva()</code>
 * is set.
 * These tasks are run in order and retried until successfully run.
 * Order of task is deducted by ordinal of this enumeration, thus
 * use extreme caution if changing the existing order.
 * If new cleanup needs arise, append those to the end of this enumeration.
 */
public enum CleanupStep {
    INITIATED, // NOP operation acting as a sentry
    CLEAR_MUNICIPALITY
}
