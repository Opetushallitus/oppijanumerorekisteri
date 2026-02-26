import React from 'react';
import Select from 'react-select';

import OrganisaatioSelectModal from '../../common/select/OrganisaatioSelectModal';
import ItemList from '../../kayttooikeusryhmat/kayttooikeusryhma/ItemList';
import Button from '../../common/button/Button';
import DownloadIcon from '../../common/icons/DownloadIcon';
import { OrganisaatioSelectObject } from '../../../types/organisaatioselectobject.types';
import { useLocalisations } from '../../../selectors';

import './AccessRightsReportControls.css';

type Props = {
    disabled: boolean;
    filterValues: string[];
    filter: string | undefined;
    setFilter: (name?: string) => void;
    setOid: (oid?: string) => void;
    dataExport?: () => void;
};

const AccessRightsReportControls: React.FC<Props> = ({
    disabled,
    setOid,
    filter,
    filterValues,
    setFilter,
    dataExport,
}) => {
    const [selectedOrganisation, setSelectedOrganisation] = React.useState<OrganisaatioSelectObject[]>([]);
    const onSelect = (organisaatio: OrganisaatioSelectObject) => setSelectedOrganisation([organisaatio]);
    const { L } = useLocalisations();

    React.useEffect(() => {
        setOid(selectedOrganisation[0]?.oid);
    }, [setOid, selectedOrganisation]);

    const filterOptions = filterValues.map((name) => ({ label: name, value: name }));

    return (
        <div>
            <div className="flex-horizontal">
                <div className="flex-item-1 ">
                    <OrganisaatioSelectModal onSelect={onSelect} disabled={disabled} />
                    <ItemList
                        items={selectedOrganisation}
                        getItemName={(o) => o.name}
                        removeAction={() => setSelectedOrganisation([])}
                    />
                </div>
            </div>
            {filterOptions.length > 1 && (
                <div className="flex-horizontal access-right-report-controls-row">
                    <div className="flex-item-1 ">
                        <Select
                            options={filterOptions}
                            placeholder={L('HENKILOHAKU_FILTERS_KAYTTOOIKEUSRYHMA_PLACEHOLDER')}
                            value={filterOptions.find((o) => o.value === filter)}
                            onChange={(option) => option && setFilter(option.value)}
                            isClearable
                        />
                    </div>
                </div>
            )}
            {dataExport && (
                <div className="flex-horizontal access-right-report-controls-row">
                    <div className="flex-item-1 ">
                        <Button action={dataExport}>
                            {L('KAYTTOOIKEUSRAPORTTI_EXPORT')}
                            <DownloadIcon />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AccessRightsReportControls;
