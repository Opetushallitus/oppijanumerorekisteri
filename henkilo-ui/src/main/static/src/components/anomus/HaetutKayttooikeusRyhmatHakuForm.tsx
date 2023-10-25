import React, { useEffect, useState } from 'react';
import type { Option } from 'react-select';
import { useSelector } from 'react-redux';

import BooleanRadioButtonGroup from '../common/radiobuttongroup/BooleanRadioButtonGroup';
import './HaetutKayttooikeusRyhmatHakuForm.css';
import CloseButton from '../common/button/CloseButton';
import OphSelect from '../common/select/OphSelect';
import OrganisaatioSelectModal from '../common/select/OrganisaatioSelectModal';
import { OrganisaatioSelectObject } from '../../types/organisaatioselectobject.types';
import { RyhmatState } from '../../reducers/ryhmat.reducer';
import { GetHaetutKayttooikeusryhmatRequest, useGetOmattiedotQuery } from '../../api/kayttooikeus';
import { useLocalisations } from '../../selectors';
import { RootState } from '../../store';
import { useDebounce } from '../../useDebounce';

type OwnProps = {
    onSubmit: (criteria: Partial<GetHaetutKayttooikeusryhmatRequest>) => void;
};

const HaetutKayttooikeusRyhmatHakuForm = ({ onSubmit }: OwnProps) => {
    const { L, locale } = useLocalisations();
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 500);
    const [naytaKaikki, setNaytaKaikki] = useState(false);
    const [selectedOrganisaatio, setSelectedOrganisaatio] = useState<OrganisaatioSelectObject>();
    const [selectedRyhma, setSelectedRyhma] = useState<string>();
    const ryhmat = useSelector<RootState, RyhmatState>((state) => state.ryhmatState);
    const { data: omattiedot } = useGetOmattiedotQuery();

    function _parseRyhmas(ryhmatState: RyhmatState): Array<{ label: string; value: string }> {
        const ryhmat = ryhmatState?.ryhmas;
        return ryhmat
            ? ryhmat
                  .map((ryhma) => ({
                      label: ryhma.nimi[locale] || ryhma.nimi['fi'] || ryhma.nimi['sv'] || ryhma.nimi['en'] || '',
                      value: ryhma.oid,
                  }))
                  .sort((a, b) => a.label.localeCompare(b.label))
            : [];
    }

    useEffect(() => {
        onSubmit({ q: debouncedSearchTerm });
    }, [debouncedSearchTerm]);

    const onClearOrganisaatio = (): void => {
        setSelectedOrganisaatio(undefined);
        onSubmit({ organisaatioOids: '' });
    };

    const onOrganisaatioChange = (organisaatio: OrganisaatioSelectObject) => {
        setSelectedOrganisaatio(organisaatio);
        setSelectedRyhma(undefined);
        onSubmit({ organisaatioOids: organisaatio.oid });
    };

    const onRyhmaChange = (ryhma: Option<string>) => {
        const ryhmaOid = ryhma ? ryhma.value : undefined;
        setSelectedOrganisaatio(undefined);
        setSelectedRyhma(ryhmaOid);
        onSubmit({ organisaatioOids: ryhmaOid });
    };

    const onNaytaKaikkiChange = (naytaKaikki: boolean) => {
        setSelectedOrganisaatio(undefined);
        setNaytaKaikki(naytaKaikki);
        onSubmit({ adminView: String(!naytaKaikki) });
    };

    return (
        <form>
            <div className="flex-horizontal flex-align-center">
                <div
                    id="kayttooikeusryhmaHenkiloHakuWrapper"
                    className="flex-item-1 haetut-kayttooikeusryhmat-form-item"
                >
                    <input
                        className="oph-input"
                        defaultValue={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder={L['HAETTU_KAYTTOOIKEUSRYHMA_HAKU_HENKILO']}
                    />
                </div>
                <div className="flex-item-1 haetut-kayttooikeusryhmat-form-item flex-inline large-kayttooikeus-filter">
                    <input
                        className="oph-input flex-item-1 anomus-organisaatiosuodatus"
                        type="text"
                        value={selectedOrganisaatio ? selectedOrganisaatio.name : ''}
                        placeholder={L['HAETTU_KAYTTOOIKEUSRYHMA_HAKU_ORGANISAATIO']}
                        readOnly
                    />
                    <OrganisaatioSelectModal onSelect={onOrganisaatioChange}></OrganisaatioSelectModal>
                    <span className="haetut-kayttooikeusryhmat-close-button">
                        <CloseButton closeAction={() => onClearOrganisaatio()} />
                    </span>
                </div>
            </div>
            <div className="flex-horizontal flex-align-center margin-top-5">
                {omattiedot.isAdmin || omattiedot.isMiniAdmin ? (
                    <div className="flex-item-1 haetut-kayttooikeusryhmat-form-item flex-inline large-kayttooikeus-filter">
                        <span className="flex-item-1">
                            <OphSelect
                                id="ryhmafilter"
                                options={_parseRyhmas(ryhmat)}
                                value={selectedRyhma}
                                placeholder={L['HAETTU_KAYTTOOIKEUSRYHMA_HAKU_RYHMA']}
                                onChange={onRyhmaChange}
                                maxHeight={400}
                            />
                        </span>
                        <span className="haetut-kayttooikeusryhmat-close-button">
                            <CloseButton closeAction={() => onRyhmaChange(undefined)} />
                        </span>
                    </div>
                ) : null}

                {omattiedot.isAdmin && (
                    <div id="kayttooikeusryhmaRadioButtonWrapper" className="haetut-kayttooikeusryhmat-form-item">
                        <BooleanRadioButtonGroup
                            value={naytaKaikki}
                            onChange={onNaytaKaikkiChange}
                            trueLabel={L['HAETTU_KAYTTOOIKEUSRYHMA_HAKU_NAYTA_KAIKKI']}
                            falseLabel={L['HAETTU_KAYTTOOIKEUSRYHMA_HAKU_NAYTA_OPH']}
                        />
                    </div>
                )}
            </div>
        </form>
    );
};

export default HaetutKayttooikeusRyhmatHakuForm;
