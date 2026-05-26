import React, { ReactNode, useMemo, useState } from 'react';

import { useGetKayttooikeudetQuery, useGetKayttooikeusApiDocsQuery } from '../../api/kayttooikeus';
import { useGetKoodistoApiDocsQuery } from '../../api/koodisto';
import { useGetOrganisaatioApiDocsQuery } from '../../api/organisaatio';
import { useGetOppijanumerorekisteriApiDocsQuery } from '../../api/oppijanumerorekisteri';
import { useLocalisations } from '../../selectors';
import { Kayttooikeus } from '../../types/domain/kayttooikeus/palvelukayttooikeus.types';
import { Locale } from '../../types/locale.type';
import { OpenApiDocument, OpenApiHttpMethod, OpenApiOperation } from '../../types/openapi.types';
import { useTitle } from '../../useTitle';
import { OphDsAccordion } from '../design-system/OphDsAccordion';
import { OphDsInput } from '../design-system/OphDsInput';
import { OphDsPage } from '../design-system/OphDsPage';
import { OphDsSpinner } from '../design-system/OphDsSpinner';
import { OphDsTable } from '../design-system/OphDsTable';

import styles from './RajapintaoikeudetPage.module.css';

type AuthorizationPhase = 'PreAuthorize' | 'PostAuthorize';

type ServiceId = 'oppijanumerorekisteri' | 'kayttooikeus' | 'koodisto' | 'organisaatio';

type ServiceDocumentation = {
    id: ServiceId;
    label: string;
    swaggerUiUrl: string;
};

type OpenApiSource = {
    apiDocs?: OpenApiDocument;
    service: ServiceDocumentation;
};

type OpenApiEndpoint = {
    path: string;
    method: string;
    operation: OpenApiOperation;
    service: ServiceDocumentation;
};

type EndpointAccess = {
    serviceId: ServiceId;
    serviceLabel: string;
    path: string;
    method: string;
    summary: string;
    authorizationChecks: AuthorizationCheck[];
    expression: string;
    swaggerUrl: string;
};

type AuthorizationCheck = {
    phase: AuthorizationPhase;
    expression: string;
};

type PermissionRole = {
    fullRole: string;
    palvelu: string;
    kayttooikeus: string;
};

type KayttooikeusGroup = {
    kayttooikeus: string;
    kayttooikeusLabel: string;
    endpoints: EndpointAccess[];
};

type PalveluGroup = {
    palvelu: string;
    palveluLabel: string;
    kayttooikeudet: KayttooikeusGroup[];
    endpointCount: number;
};

type RoleDocumentation = {
    palvelut: PalveluGroup[];
    endpointCount: number;
    kayttooikeusCount: number;
};

type TranslationMaps = {
    palveluLabels: Map<string, string>;
    kayttooikeusLabels: Map<string, string>;
    palveluNames: string[];
    kayttooikeudetByPalvelu: Map<string, string[]>;
};

type LocalizedText = {
    text: string;
    lang: string;
};

type AccordionItem = {
    header: string;
    children: (show: boolean) => ReactNode;
};

type AccordionItemGroups = {
    withEndpoints: AccordionItem[];
    withoutEndpoints: AccordionItem[];
};

const OPEN_API_METHODS: OpenApiHttpMethod[] = ['get', 'put', 'post', 'delete', 'options', 'head', 'patch', 'trace'];
const ROLE_FUNCTIONS = ['hasRole', 'hasAnyRole', 'hasAuthority', 'hasAnyAuthority'];
const RELEVANT_PALVELUT = new Set([
    'KOODISTO',
    'ORGANISAATIOHALLINTA',
    'OMATTIEDOT',
    'OSOITE',
    'KAYTTOOIKEUS',
    'OPPIJANUMEROREKISTERI',
    'HENKILOTIETOMUUTOS',
    'YKSITYISTEN_REKISTEROITYMINEN',
    'ORGANISAATIOIDEN_REKISTEROITYMINEN',
    'VIESTINVALITYS',
]);
const OPPIJANUMEROREKISTERI_SERVICE_DOCUMENTATION: ServiceDocumentation = {
    id: 'oppijanumerorekisteri',
    label: 'Oppijanumerorekisteri',
    swaggerUiUrl: '/oppijanumerorekisteri-service/swagger-ui/index.html',
};
const KAYTTOOIKEUS_SERVICE_DOCUMENTATION: ServiceDocumentation = {
    id: 'kayttooikeus',
    label: 'Käyttöoikeus',
    swaggerUiUrl: '/kayttooikeus-service/swagger-ui/index.html',
};
const KOODISTO_SERVICE_DOCUMENTATION: ServiceDocumentation = {
    id: 'koodisto',
    label: 'Koodisto',
    swaggerUiUrl: '/koodisto-service/swagger-ui/index.html',
};
const ORGANISAATIO_SERVICE_DOCUMENTATION: ServiceDocumentation = {
    id: 'organisaatio',
    label: 'Organisaatio',
    swaggerUiUrl: '/organisaatio-service/swagger-ui/index.html',
};

export const RajapintaoikeudetPage = () => {
    const [filter, setFilter] = useState('');
    const { locale } = useLocalisations();
    const oppijanumerorekisteriApiDocs = useGetOppijanumerorekisteriApiDocsQuery();
    const kayttooikeusApiDocs = useGetKayttooikeusApiDocsQuery();
    const koodistoApiDocs = useGetKoodistoApiDocsQuery();
    const organisaatioApiDocs = useGetOrganisaatioApiDocsQuery();
    const kayttooikeudet = useGetKayttooikeudetQuery();

    useTitle('Rajapintaoikeudet');

    const apiDocsSources = useMemo<OpenApiSource[]>(
        () => [
            {
                apiDocs: oppijanumerorekisteriApiDocs.data,
                service: OPPIJANUMEROREKISTERI_SERVICE_DOCUMENTATION,
            },
            {
                apiDocs: kayttooikeusApiDocs.data,
                service: KAYTTOOIKEUS_SERVICE_DOCUMENTATION,
            },
            {
                apiDocs: koodistoApiDocs.data,
                service: KOODISTO_SERVICE_DOCUMENTATION,
            },
            {
                apiDocs: organisaatioApiDocs.data,
                service: ORGANISAATIO_SERVICE_DOCUMENTATION,
            },
        ],
        [kayttooikeusApiDocs.data, koodistoApiDocs.data, oppijanumerorekisteriApiDocs.data, organisaatioApiDocs.data]
    );
    const translationMaps = useMemo(
        () => buildTranslationMaps(kayttooikeudet.data, locale),
        [kayttooikeudet.data, locale]
    );
    const documentation = useMemo(
        () => buildRoleDocumentation(apiDocsSources, translationMaps),
        [apiDocsSources, translationMaps]
    );
    const normalizedFilter = filter.trim();
    const isFilterActive = normalizedFilter.length >= 3;
    const visiblePalvelut = useMemo(
        () => (isFilterActive ? filterPalvelut(documentation.palvelut, normalizedFilter) : documentation.palvelut),
        [documentation.palvelut, isFilterActive, normalizedFilter]
    );
    const accordionItemGroups = useMemo(() => toAccordionItemGroups(visiblePalvelut), [visiblePalvelut]);

    const hasAnyApiDocs = apiDocsSources.some(({ apiDocs }) => apiDocs);
    const apiDocsCount = apiDocsSources.length;
    const loadedApiDocsCount = apiDocsSources.filter(({ apiDocs }) => apiDocs).length;
    const isFetching =
        oppijanumerorekisteriApiDocs.isFetching ||
        kayttooikeusApiDocs.isFetching ||
        koodistoApiDocs.isFetching ||
        organisaatioApiDocs.isFetching ||
        kayttooikeudet.isFetching;
    const isApiDocsError =
        oppijanumerorekisteriApiDocs.isError ||
        kayttooikeusApiDocs.isError ||
        koodistoApiDocs.isError ||
        organisaatioApiDocs.isError;

    return (
        <OphDsPage header="Rajapintaoikeudet">
            <div className={styles.toolbar}>
                <OphDsInput
                    id="endpoint-filter"
                    label="Hae rajapinnoista tai kuvauksista"
                    onChange={setFilter}
                    placeholder="Hae..."
                    icon="search"
                    isClearable
                    debounceTimeout={200}
                />
                <div className={styles.summary} aria-live="polite">
                    <SummaryItem label="Palvelua" value={documentation.palvelut.length} />
                    <SummaryItem label="Käyttöoikeutta" value={documentation.kayttooikeusCount} />
                    <SummaryItem label="Rajapintaa" value={documentation.endpointCount} />
                </div>
            </div>

            {isFetching && !hasAnyApiDocs ? (
                <div>
                    <OphDsSpinner />
                </div>
            ) : isApiDocsError && !hasAnyApiDocs ? (
                <div className="oph-ds-error">Rajapintadokumentaation haku epäonnistui.</div>
            ) : (
                <>
                    {isFetching ? (
                        <div className={styles.loadingNotice} aria-live="polite">
                            <span className={styles.loadingSpinner}>
                                <OphDsSpinner />
                            </span>
                            <span>{getLoadingStatusText(loadedApiDocsCount, apiDocsCount)}</span>
                        </div>
                    ) : null}
                    {isApiDocsError ? (
                        <div className="oph-ds-error">Osa rajapintadokumentaatioista jäi hakematta.</div>
                    ) : null}
                    {kayttooikeudet.isError ? (
                        <div className="oph-ds-error">
                            Käyttöoikeuksien nimien haku epäonnistui. Näytetään tekniset tunnisteet.
                        </div>
                    ) : null}
                    {documentation.kayttooikeusCount === 0 && isFetching ? null : documentation.kayttooikeusCount ===
                      0 ? (
                        <div className={styles.empty}>
                            OpenAPI-dokumentaatioista ei löytynyt rooleihin kohdistuvaa x-preauthorize- tai
                            x-postauthorize-tietoa.
                        </div>
                    ) : visiblePalvelut.length > 0 ? (
                        <>
                            {accordionItemGroups.withEndpoints.length > 0 ? (
                                <OphDsAccordion items={accordionItemGroups.withEndpoints} openAll={isFilterActive} />
                            ) : null}
                            {accordionItemGroups.withoutEndpoints.length > 0 ? (
                                <>
                                    <h2 className={styles.unusedKayttooikeudetTitle}>
                                        Käyttöoikeudet, joita ei suoraan käytetä rajapinnoissa
                                    </h2>
                                    <OphDsAccordion
                                        items={accordionItemGroups.withoutEndpoints}
                                        openAll={isFilterActive}
                                    />
                                </>
                            ) : null}
                        </>
                    ) : (
                        <div className={styles.empty}>Hakuehdolla ei löytynyt palveluja tai käyttöoikeuksia.</div>
                    )}
                </>
            )}
        </OphDsPage>
    );
};

function getLoadingStatusText(loadedApiDocsCount: number, apiDocsCount: number): string {
    return loadedApiDocsCount < apiDocsCount
        ? `Haetaan ja käsitellään rajapintadokumentaatioita (${loadedApiDocsCount}/${apiDocsCount}).`
        : 'Käsitellään käyttöoikeustietoja.';
}

const SummaryItem = ({ label, value }: { label: string; value: number }) => (
    <div className={styles.summaryItem}>
        <span className={styles.summaryValue}>{value}</span>
        <span className={styles.summaryLabel}>{label}</span>
    </div>
);

function buildRoleDocumentation(apiDocsSources: OpenApiSource[], translations: TranslationMaps): RoleDocumentation {
    const palveluMap = new Map<string, Map<string, Map<string, EndpointAccess>>>();
    const endpointKeys = new Set<string>();

    apiDocsSources.forEach(({ apiDocs, service }) => {
        getOpenApiEndpoints(apiDocs, service).forEach((endpoint) => {
            const authorizationChecks = getAuthorizationChecks(endpoint);

            authorizationChecks.forEach((authorizationCheck) => {
                const permissionRoles = extractPermissionRoles(
                    authorizationCheck.expression,
                    translations.palveluNames
                );
                if (permissionRoles.length === 0) {
                    return;
                }

                endpointKeys.add(getEndpointIdentity(authorizationCheck));
                permissionRoles.forEach((permissionRole) => {
                    const kayttooikeusMap = palveluMap.get(permissionRole.palvelu) ?? new Map();
                    const endpointMap = kayttooikeusMap.get(permissionRole.kayttooikeus) ?? new Map();
                    const endpointKey = getEndpointKey(authorizationCheck);
                    const existingEndpoint = endpointMap.get(endpointKey);
                    endpointMap.set(
                        endpointKey,
                        existingEndpoint
                            ? mergeEndpointAccess(existingEndpoint, authorizationCheck)
                            : authorizationCheck
                    );
                    kayttooikeusMap.set(permissionRole.kayttooikeus, endpointMap);
                    palveluMap.set(permissionRole.palvelu, kayttooikeusMap);
                });
            });
        });
    });

    translations.kayttooikeudetByPalvelu.forEach((kayttooikeudet, palvelu) => {
        const kayttooikeusMap = palveluMap.get(palvelu) ?? new Map<string, Map<string, EndpointAccess>>();
        kayttooikeudet.forEach((kayttooikeus) => {
            if (!kayttooikeusMap.has(kayttooikeus)) {
                kayttooikeusMap.set(kayttooikeus, new Map());
            }
        });
        palveluMap.set(palvelu, kayttooikeusMap);
    });

    const palvelut = Array.from(palveluMap.entries())
        .map(([palvelu, kayttooikeusMap]) => {
            const kayttooikeudet = Array.from(kayttooikeusMap.entries())
                .map(([kayttooikeus, endpointMap]) => ({
                    kayttooikeus,
                    kayttooikeusLabel: getKayttooikeusLabel(translations, palvelu, kayttooikeus),
                    endpoints: Array.from(endpointMap.values()).sort(compareEndpointAccess),
                }))
                .sort(compareKayttooikeusGroups);

            return {
                palvelu,
                palveluLabel: getPalveluLabel(translations, palvelu),
                kayttooikeudet,
                endpointCount: countUniqueEndpoints(kayttooikeudet.flatMap(({ endpoints }) => endpoints)),
            };
        })
        .sort(comparePalveluGroups);

    return {
        palvelut,
        endpointCount: endpointKeys.size,
        kayttooikeusCount: palvelut.reduce((sum, palvelu) => sum + palvelu.kayttooikeudet.length, 0),
    };
}

function buildTranslationMaps(kayttooikeudet: Kayttooikeus[] | undefined, locale: Locale): TranslationMaps {
    const palveluLabels = new Map<string, string>();
    const kayttooikeusLabels = new Map<string, string>();
    const palveluNames = new Set<string>();
    const kayttooikeudetByPalvelu = new Map<string, Set<string>>();

    kayttooikeudet?.forEach((kayttooikeus) => {
        if (!isRelevantPalvelu(kayttooikeus.palveluName)) {
            return;
        }

        const palveluLabel = localizeTexts(kayttooikeus.palveluTexts, locale);
        const kayttooikeusLabel = localizeTexts(kayttooikeus.rooliTexts, locale);

        if (kayttooikeus.palveluName) {
            palveluNames.add(kayttooikeus.palveluName);
        }
        if (kayttooikeus.rooli) {
            const palvelunKayttooikeudet = kayttooikeudetByPalvelu.get(kayttooikeus.palveluName) ?? new Set<string>();
            palvelunKayttooikeudet.add(kayttooikeus.rooli);
            kayttooikeudetByPalvelu.set(kayttooikeus.palveluName, palvelunKayttooikeudet);
        }
        setTranslation(palveluLabels, kayttooikeus.palveluName, palveluLabel);
        setTranslation(
            kayttooikeusLabels,
            getPermissionKey(kayttooikeus.palveluName, kayttooikeus.rooli),
            kayttooikeusLabel
        );
    });

    return {
        palveluLabels,
        kayttooikeusLabels,
        palveluNames: Array.from(palveluNames).sort((a, b) => b.length - a.length || a.localeCompare(b)),
        kayttooikeudetByPalvelu: new Map(
            Array.from(kayttooikeudetByPalvelu.entries()).map(([palvelu, palvelunKayttooikeudet]) => [
                palvelu,
                Array.from(palvelunKayttooikeudet).sort((a, b) => a.localeCompare(b)),
            ])
        ),
    };
}

function isRelevantPalvelu(palveluName?: string): boolean {
    return palveluName ? RELEVANT_PALVELUT.has(palveluName.toUpperCase()) : false;
}

function setTranslation(map: Map<string, string>, key: string, value?: string) {
    if (!value) {
        return;
    }
    [key, key.toUpperCase()].forEach((candidate) => {
        if (candidate && !map.has(candidate)) {
            map.set(candidate, value);
        }
    });
}

function localizeTexts(texts: LocalizedText[] | undefined, locale: Locale): string | undefined {
    const preferredLanguage = locale.toUpperCase();
    return (
        texts?.find((text) => text.lang.toUpperCase() === preferredLanguage)?.text ??
        texts?.find((text) => text.lang.toUpperCase() === 'FI')?.text ??
        texts?.find((text) => text.lang.toUpperCase() === 'EN')?.text ??
        texts?.[0]?.text
    );
}

function getPalveluLabel(translations: TranslationMaps, palvelu: string): string {
    return translations.palveluLabels.get(palvelu) ?? translations.palveluLabels.get(palvelu.toUpperCase()) ?? palvelu;
}

function getKayttooikeusLabel(translations: TranslationMaps, palvelu: string, kayttooikeus: string): string {
    const key = getPermissionKey(palvelu, kayttooikeus);
    return (
        translations.kayttooikeusLabels.get(key) ??
        translations.kayttooikeusLabels.get(key.toUpperCase()) ??
        kayttooikeus
    );
}

function getPermissionKey(palvelu: string, kayttooikeus: string): string {
    return `${palvelu}_${kayttooikeus}`;
}

function filterPalvelut(palvelut: PalveluGroup[], filter: string): PalveluGroup[] {
    const normalizedFilter = filter.trim().toLowerCase();
    if (!normalizedFilter) {
        return palvelut;
    }

    return palvelut
        .map((palvelu) => {
            const kayttooikeudet = palvelu.kayttooikeudet
                .map((kayttooikeus) => ({
                    ...kayttooikeus,
                    endpoints: kayttooikeus.endpoints.filter((endpoint) =>
                        matchesFilter(normalizedFilter, endpoint.path, endpoint.summary)
                    ),
                }))
                .filter((kayttooikeus) => kayttooikeus.endpoints.length > 0);

            return {
                ...palvelu,
                kayttooikeudet,
                endpointCount: countUniqueEndpoints(kayttooikeudet.flatMap(({ endpoints }) => endpoints)),
            };
        })
        .filter((palvelu) => palvelu.kayttooikeudet.length > 0);
}

function matchesFilter(filter: string, ...values: string[]): boolean {
    return values.some((value) => value.toLowerCase().includes(filter));
}

function getOpenApiEndpoints(apiDocs: OpenApiDocument | undefined, service: ServiceDocumentation): OpenApiEndpoint[] {
    return Object.entries(apiDocs?.paths ?? {}).flatMap(([path, pathItem]) =>
        OPEN_API_METHODS.flatMap((method) => {
            const operation = pathItem[method];
            if (!operation) {
                return [];
            }
            return [{ path, method: method.toUpperCase(), operation, service }];
        })
    );
}

function getAuthorizationChecks(endpoint: OpenApiEndpoint): EndpointAccess[] {
    return [
        toEndpointAccess(endpoint, 'PreAuthorize', getAuthorizationExpression(endpoint.operation, 'PreAuthorize')),
        toEndpointAccess(endpoint, 'PostAuthorize', getAuthorizationExpression(endpoint.operation, 'PostAuthorize')),
    ].filter((access): access is EndpointAccess => access !== undefined);
}

function getAuthorizationExpression(operation: OpenApiOperation, phase: AuthorizationPhase): string | undefined {
    const kebabKey = phase === 'PreAuthorize' ? 'x-preauthorize' : 'x-postauthorize';
    const camelKey = phase === 'PreAuthorize' ? 'xPreauthorize' : 'xPostauthorize';
    return (
        toStringValue(operation[kebabKey]) ??
        toStringValue(operation[camelKey]) ??
        toStringValue(operation.extensions?.[kebabKey]) ??
        readAuthorizationExpressionFromDescription(operation.description, phase)
    );
}

function toStringValue(value: unknown): string | undefined {
    return typeof value === 'string' && value.length > 0 ? value : undefined;
}

function readAuthorizationExpressionFromDescription(
    description: string | undefined,
    phase: AuthorizationPhase
): string | undefined {
    const match = description?.match(new RegExp(`\\*\\*${phase}:\\*\\*\\s+\`([^\`]+)\``));
    return match?.[1];
}

function toEndpointAccess(
    endpoint: OpenApiEndpoint,
    phase: AuthorizationPhase,
    expression?: string
): EndpointAccess | undefined {
    if (!expression) {
        return undefined;
    }

    return {
        serviceId: endpoint.service.id,
        serviceLabel: endpoint.service.label,
        path: endpoint.path,
        method: endpoint.method,
        summary:
            endpoint.operation.summary ??
            sanitizeDescription(endpoint.operation.description) ??
            endpoint.operation.operationId ??
            '',
        authorizationChecks: [{ phase, expression }],
        expression: formatAuthorizationChecks([{ phase, expression }]),
        swaggerUrl: getSwaggerUrl(endpoint.operation, endpoint.service),
    };
}

function mergeEndpointAccess(existingEndpoint: EndpointAccess, endpoint: EndpointAccess): EndpointAccess {
    const authorizationChecks = [...existingEndpoint.authorizationChecks];
    endpoint.authorizationChecks.forEach((authorizationCheck) => {
        if (
            !authorizationChecks.some(
                (existingAuthorizationCheck) =>
                    existingAuthorizationCheck.phase === authorizationCheck.phase &&
                    existingAuthorizationCheck.expression === authorizationCheck.expression
            )
        ) {
            authorizationChecks.push(authorizationCheck);
        }
    });

    return {
        ...existingEndpoint,
        authorizationChecks,
        expression: formatAuthorizationChecks(authorizationChecks),
    };
}

function formatAuthorizationChecks(authorizationChecks: AuthorizationCheck[]): string {
    return [...authorizationChecks]
        .sort((a, b) => compareAuthorizationPhase(a.phase, b.phase) || a.expression.localeCompare(b.expression))
        .map((authorizationCheck) => `${authorizationCheck.phase}: ${authorizationCheck.expression}`)
        .join('\n\n');
}

function compareAuthorizationPhase(a: AuthorizationPhase, b: AuthorizationPhase): number {
    const order: Record<AuthorizationPhase, number> = { PreAuthorize: 0, PostAuthorize: 1 };
    return order[a] - order[b];
}

function sanitizeDescription(description: string | undefined): string | undefined {
    const sanitizedDescription = description
        ?.split(/\r?\n\r?\n/)
        .filter((paragraph) => !paragraph.trim().match(/^\*\*(?:PreAuthorize|PostAuthorize):\*\*/))
        .join('\n\n')
        .trim();
    return sanitizedDescription ? sanitizedDescription : undefined;
}

function getSwaggerUrl(operation: OpenApiOperation, service: ServiceDocumentation): string {
    const tag = operation.tags?.[0];
    if (!tag || !operation.operationId) {
        return service.swaggerUiUrl;
    }
    return `${service.swaggerUiUrl}#/${encodeURIComponent(tag)}/${encodeURIComponent(operation.operationId)}`;
}

function extractPermissionRoles(expression: string, palveluNames: string[]): PermissionRole[] {
    const permissionRoles = new Map<string, PermissionRole>();
    extractRoles(expression).forEach((role) => {
        const permissionRole = splitRole(role, palveluNames);
        if (permissionRole) {
            permissionRoles.set(permissionRole.fullRole, permissionRole);
        }
    });
    return Array.from(permissionRoles.values()).sort(
        (a, b) =>
            a.palvelu.localeCompare(b.palvelu) ||
            a.kayttooikeus.localeCompare(b.kayttooikeus) ||
            a.fullRole.localeCompare(b.fullRole)
    );
}

function splitRole(role: string, palveluNames: string[]): PermissionRole | undefined {
    const normalizedRole = role.toUpperCase();
    const palvelu = palveluNames.find((palveluName) => normalizedRole.startsWith(`${palveluName.toUpperCase()}_`));
    if (!palvelu) {
        return undefined;
    }

    return {
        fullRole: role,
        palvelu,
        kayttooikeus: role.slice(palvelu.length + 1),
    };
}

function extractRoles(expression: string): string[] {
    const roles = [...extractRoleFunctionRoles(expression), ...extractPermissionMapRoles(expression)]
        .map(normalizeRole)
        .filter((role) => role.length > 0);

    return Array.from(new Set(roles)).sort((a, b) => a.localeCompare(b));
}

function extractRoleFunctionRoles(expression: string): string[] {
    const roles: string[] = [];

    ROLE_FUNCTIONS.forEach((functionName) => {
        let searchIndex = 0;
        while (searchIndex < expression.length) {
            const functionIndex = expression.indexOf(`${functionName}(`, searchIndex);
            if (functionIndex === -1) {
                break;
            }

            const openParenthesisIndex = functionIndex + functionName.length;
            const argumentString = readParenthesizedContent(expression, openParenthesisIndex);
            if (argumentString) {
                roles.push(...extractQuotedStrings(argumentString));
                roles.push(...extractStaticRoleReferences(argumentString));
            }
            searchIndex = openParenthesisIndex + 1;
        }
    });

    return roles;
}

function extractStaticRoleReferences(expression: string): string[] {
    return Array.from(expression.matchAll(/\b(?:ROLE_)?APP_[A-Za-z0-9_-]+\b/g))
        .map((match) => match[0])
        .filter((value): value is string => value !== undefined && value.length > 0);
}

function extractPermissionMapRoles(expression: string): string[] {
    return Array.from(expression.matchAll(/'([A-Za-z0-9_-]+)'\s*:\s*\{([^}]+)\}/g)).flatMap((match) => {
        const palvelu = match[1];
        const kayttooikeudet = match[2];
        if (!palvelu || !kayttooikeudet) {
            return [];
        }
        return extractQuotedStrings(kayttooikeudet).map((kayttooikeus) => `${palvelu}_${kayttooikeus}`);
    });
}

function readParenthesizedContent(expression: string, openParenthesisIndex: number): string | undefined {
    let depth = 0;
    let inString = false;

    for (let index = openParenthesisIndex; index < expression.length; index += 1) {
        const character = expression[index];
        const previousCharacter = expression[index - 1];

        if (character === "'" && previousCharacter !== '\\') {
            inString = !inString;
        }

        if (!inString) {
            if (character === '(') {
                depth += 1;
            } else if (character === ')') {
                depth -= 1;
                if (depth === 0) {
                    return expression.slice(openParenthesisIndex + 1, index);
                }
            }
        }
    }

    return undefined;
}

function extractQuotedStrings(expression: string): string[] {
    return Array.from(expression.matchAll(/'([^']*)'/g))
        .map((match) => match[1])
        .filter((value): value is string => value !== undefined && value.length > 0);
}

function normalizeRole(role: string): string {
    return role
        .trim()
        .replace(/^ROLE_/, '')
        .replace(/^APP_/, '');
}

function getEndpointKey(endpoint: EndpointAccess): string {
    return getEndpointIdentity(endpoint);
}

function getEndpointIdentity(endpoint: EndpointAccess): string {
    return `${endpoint.serviceId} ${endpoint.method} ${endpoint.path}`;
}

function countUniqueEndpoints(endpoints: EndpointAccess[]): number {
    return new Set(endpoints.map(getEndpointIdentity)).size;
}

function compareEndpointAccess(a: EndpointAccess, b: EndpointAccess): number {
    return (
        a.serviceLabel.localeCompare(b.serviceLabel) ||
        a.path.localeCompare(b.path) ||
        a.method.localeCompare(b.method) ||
        a.expression.localeCompare(b.expression)
    );
}

function comparePalveluGroups(a: PalveluGroup, b: PalveluGroup): number {
    return a.palveluLabel.localeCompare(b.palveluLabel) || a.palvelu.localeCompare(b.palvelu);
}

function compareKayttooikeusGroups(a: KayttooikeusGroup, b: KayttooikeusGroup): number {
    return a.kayttooikeusLabel.localeCompare(b.kayttooikeusLabel) || a.kayttooikeus.localeCompare(b.kayttooikeus);
}

function toAccordionItemGroups(palvelut: PalveluGroup[]): AccordionItemGroups {
    const items = palvelut.flatMap((palvelu) =>
        palvelu.kayttooikeudet.map((kayttooikeus) => ({ palvelu, kayttooikeus }))
    );

    return {
        withEndpoints: items
            .filter(({ kayttooikeus }) => kayttooikeus.endpoints.length > 0)
            .sort(compareAccordionItems)
            .map(toAccordionItem),
        withoutEndpoints: items
            .filter(({ kayttooikeus }) => kayttooikeus.endpoints.length === 0)
            .sort(compareAccordionItems)
            .map(toAccordionItem),
    };
}

function toAccordionItem({
    palvelu,
    kayttooikeus,
}: {
    palvelu: PalveluGroup;
    kayttooikeus: KayttooikeusGroup;
}): AccordionItem {
    return {
        header: `${palvelu.palveluLabel} / ${kayttooikeus.kayttooikeusLabel} (${palvelu.palvelu}_${kayttooikeus.kayttooikeus}) - ${countUniqueEndpoints(kayttooikeus.endpoints)} rajapintaa`,
        children: (show: boolean): ReactNode =>
            show && kayttooikeus.endpoints.length > 0 ? (
                <OphDsTable
                    headers={['API', 'Rajapinta', 'Kuvaus', 'Ehto']}
                    isFetching={false}
                    rows={toTableRows(kayttooikeus.endpoints)}
                />
            ) : show ? (
                <div className={styles.empty}>Käyttöoikeutta ei käytetä rajapinnoissa.</div>
            ) : null,
    };
}

function compareAccordionItems(
    a: { palvelu: PalveluGroup; kayttooikeus: KayttooikeusGroup },
    b: { palvelu: PalveluGroup; kayttooikeus: KayttooikeusGroup }
): number {
    return comparePalveluGroups(a.palvelu, b.palvelu) || compareKayttooikeusGroups(a.kayttooikeus, b.kayttooikeus);
}

function toTableRows(endpoints: EndpointAccess[]): ReactNode[][] {
    return endpoints.map((endpoint) => [
        <span key="service">{endpoint.serviceLabel}</span>,
        <a
            key="path"
            className={`oph-ds-link ${styles.path}`}
            href={endpoint.swaggerUrl}
            target="_blank"
            rel="noreferrer"
        >
            {endpoint.method} {endpoint.path}
        </a>,
        <span key="summary">{endpoint.summary}</span>,
        <code key="expression" className={styles.expression}>
            {endpoint.expression}
        </code>,
    ]);
}
