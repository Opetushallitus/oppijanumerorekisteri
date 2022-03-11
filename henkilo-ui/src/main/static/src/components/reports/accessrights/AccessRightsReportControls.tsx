import React from 'react';
import type { Option, Options } from 'react-select';
import { Locale } from '../../../types/locale.type';
import { Localisations } from '../../../types/localisation.type';
import { OrganisaatioHenkilo } from '../../../types/domain/kayttooikeus/OrganisaatioHenkilo.types';
import { OrganisaatioSelectModal } from '../../common/select/OrganisaatioSelectModal';
import ItemList from '../../kayttooikeusryhmat/kayttooikeusryhma/ItemList';
import OphSelect from '../../common/select/OphSelect';
import Button from '../../common/button/Button';
import DownloadIcon from '../../common/icons/DownloadIcon';
import { OrganisaatioSelectObject } from '../../../types/organisaatioselectobject.types';
import { omattiedotOrganisaatiotToOrganisaatioSelectObject } from '../../../utilities/organisaatio.util';
import './AccessRightsReportControls.css';

type Props = {
    locale: Locale;
    L: Localisations;
    organisations: OrganisaatioHenkilo[];
    disabled: boolean;
    filterValues: string[];
    filter: string;
    setFilter: (string) => void;
    setOid: (string) => void;
    dataExport?: () => void;
};

const AccessRightsReportControls: React.FC<Props> = ({
    locale,
    L,
    disabled,
    organisations,
    setOid,
    filter,
    filterValues,
    setFilter,
    dataExport,
}) => {
    const [selectedOrganisation, setSelectedOrganisation] = React.useState<OrganisaatioSelectObject[]>([]);
    const onSelect = (organisaatio: OrganisaatioSelectObject) => setSelectedOrganisation([organisaatio]);

    React.useEffect(() => {
        setOid(selectedOrganisation[0] && selectedOrganisation[0].oid);
    }, [setOid, selectedOrganisation]);

    const filterOptions: Options<string> = filterValues.map((name) => ({ label: name, value: name }));

    return (
        <div>
            <div className="flex-horizontal">
                <div className="flex-item-1 ">
                    <OrganisaatioSelectModal
                        locale={locale}
                        L={L}
                        organisaatiot={omattiedotOrganisaatiotToOrganisaatioSelectObject(organisations, locale)}
                        onSelect={onSelect}
                        disabled={disabled}
                    />
                    <ItemList
                        items={selectedOrganisation}
                        labelPath={['name']}
                        removeAction={() => setSelectedOrganisation([])}
                    />
                </div>
            </div>
            {filterOptions.length > 1 && (
                <div className="flex-horizontal access-right-report-controls-row">
                    <div className="flex-item-1 ">
                        <OphSelect
                            options={filterOptions}
                            placeholder={L['HENKILOHAKU_FILTERS_KAYTTOOIKEUSRYHMA_PLACEHOLDER']}
                            value={filter}
                            clearable
                            onChange={(option: Option) => setFilter(option && option.value)}
                        />
                    </div>
                </div>
            )}
            {dataExport && (
                <div className="flex-horizontal access-right-report-controls-row">
                    <div className="flex-item-1 ">
                        <Button action={dataExport}>
                            {L['KAYTTOOIKEUSRAPORTTI_EXPORT'] || 'KAYTTOOIKEUSRAPORTTI_EXPORT'}
                            <DownloadIcon />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AccessRightsReportControls;
