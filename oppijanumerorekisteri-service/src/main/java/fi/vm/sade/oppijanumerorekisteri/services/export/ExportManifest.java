package fi.vm.sade.oppijanumerorekisteri.services.export;

import java.util.List;

public record ExportManifest(List<ExportFileDetails> exportFiles) {}
