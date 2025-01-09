import React from 'react';
import type { Option, Options } from 'react-select';
import OrganisaatioSelectModal from '../../common/select/OrganisaatioSelectModal';
import ItemList from '../../kayttooikeusryhmat/kayttooikeusryhma/ItemList';
import OphSelect from '../../common/select/OphSelect';
import Button from '../../common/button/Button';
import DownloadIcon from '../../common/icons/DownloadIcon';
import { OrganisaatioSelectObject } from '../../../types/organisaatioselectobject.types';
import './AccessRightsReportControls.css';
import { useLocalisations } from '../../../selectors';

type Props = {
    disabled: boolean;
    filterValues: string[];
    filter: string;
    setFilter: (name: string) => void;
    setOid: (oid: string) => void;
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
        setOid(selectedOrganisation[0] && selectedOrganisation[0].oid);
    }, [setOid, selectedOrganisation]);

    const filterOptions: Options<string> = filterValues.map((name) => ({ label: name, value: name }));

    return (
        <div>
            <div className="flex-horizontal">
                <div className="flex-item-1 ">
                    <OrganisaatioSelectModal onSelect={onSelect} disabled={disabled} />
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
                            onChange={(option: Option<string>) => setFilter(option && option.value)}
                        />
                    </div>
                </div>
            )}
            {dataExport && (
                <div className="flex-horizontal access-right-report-controls-row">
                    <div className="flex-item-1 ">
                        <Button action={dataExport}>
                            {L['KAYTTOOIKEUSRAPORTTI_EXPORT']}
                            <DownloadIcon />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AccessRightsReportControls;
