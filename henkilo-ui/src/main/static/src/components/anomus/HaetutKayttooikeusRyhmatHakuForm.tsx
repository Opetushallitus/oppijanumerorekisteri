import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import Select, { createFilter } from 'react-select';

import BooleanRadioButtonGroup from '../common/radiobuttongroup/BooleanRadioButtonGroup';
import CloseButton from '../common/button/CloseButton';
import OrganisaatioSelectModal from '../common/select/OrganisaatioSelectModal';
import { OrganisaatioSelectObject } from '../../types/organisaatioselectobject.types';
import { RyhmatState } from '../../reducers/ryhmat.reducer';
import {
    GetHaetutKayttooikeusryhmatRequest,
    useGetKayttooikeusryhmasQuery,
    useGetOmattiedotQuery,
} from '../../api/kayttooikeus';
import { useLocalisations } from '../../selectors';
import { RootState } from '../../store';
import { useDebounce } from '../../useDebounce';
import { parseRyhmaOptions } from '../../utilities/organisaatio.util';
import { FastMenuList, SelectOption } from '../../utilities/select';

import styles from './HaetutKayttooikeusRyhmatHakuForm.module.css';

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
    const { data: kayttooikeusryhmat } = useGetKayttooikeusryhmasQuery({ passiiviset: false });
    const [kayttooikeusryhmaFilter, setKayttooikeusryhmaFilter] = useState('');
    const debouncedKayttooikeusryhmaFilter = useDebounce(kayttooikeusryhmaFilter, 500);

    useEffect(() => {
        onSubmit({ q: debouncedSearchTerm });
    }, [debouncedSearchTerm]);

    useEffect(() => {
        const kayttooikeusRyhmaIds =
            debouncedKayttooikeusryhmaFilter.length < 4
                ? undefined
                : (kayttooikeusryhmat ?? [])
                      .filter((k) =>
                          k.nimi.texts
                              ?.filter((text) => text.lang === locale.toUpperCase())[0]
                              ?.text.toLowerCase()
                              .includes(debouncedKayttooikeusryhmaFilter.toLowerCase())
                      )
                      .map((k) => k.id);
        onSubmit({ kayttooikeusRyhmaIds });
    }, [debouncedKayttooikeusryhmaFilter]);

    const onClearOrganisaatio = (): void => {
        setSelectedOrganisaatio(undefined);
        onSubmit({ organisaatioOids: '' });
    };

    const onOrganisaatioChange = (organisaatio: OrganisaatioSelectObject) => {
        setSelectedOrganisaatio(organisaatio);
        setSelectedRyhma(undefined);
        onSubmit({ organisaatioOids: organisaatio.oid });
    };

    const onRyhmaChange = (ryhma?: SelectOption) => {
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

    const ryhmaOptions = useMemo(() => {
        return parseRyhmaOptions(ryhmat, locale);
    }, [ryhmat, locale]);

    return (
        <form>
            <div className={styles.row}>
                <input
                    className="oph-input"
                    defaultValue={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={L['HAETTU_KAYTTOOIKEUSRYHMA_HAKU_HENKILO']}
                />
                <input
                    className="oph-input"
                    placeholder={L['KAYTTOOIKEUSRYHMAT_HALLINTA_SUODATA']}
                    defaultValue={kayttooikeusryhmaFilter}
                    onChange={(e) => setKayttooikeusryhmaFilter(e.target.value)}
                />
                {omattiedot?.isAdmin && (
                    <BooleanRadioButtonGroup
                        value={naytaKaikki}
                        onChange={onNaytaKaikkiChange}
                        trueLabel={L['HAETTU_KAYTTOOIKEUSRYHMA_HAKU_NAYTA_KAIKKI']}
                        falseLabel={L['HAETTU_KAYTTOOIKEUSRYHMA_HAKU_NAYTA_OPH']}
                        className={styles.viewButtons}
                    />
                )}
            </div>
            <div className={styles.selectRow}>
                <input
                    className="oph-input"
                    type="text"
                    value={selectedOrganisaatio ? selectedOrganisaatio.name : ''}
                    placeholder={L['HAETTU_KAYTTOOIKEUSRYHMA_HAKU_ORGANISAATIO']}
                    readOnly
                />
                <OrganisaatioSelectModal onSelect={onOrganisaatioChange} />
                <CloseButton closeAction={() => onClearOrganisaatio()} />
            </div>

            {(omattiedot?.isAdmin || omattiedot?.isMiniAdmin) && (
                <div className={styles.selectRow}>
                    <Select
                        id="ryhmafilter"
                        options={ryhmaOptions}
                        components={{ MenuList: FastMenuList }}
                        filterOption={createFilter({ ignoreAccents: false })}
                        value={ryhmaOptions.find((o) => o.value === selectedRyhma)}
                        placeholder={L['HAETTU_KAYTTOOIKEUSRYHMA_HAKU_RYHMA']}
                        onChange={onRyhmaChange}
                        isClearable
                    />
                </div>
            )}
        </form>
    );
};

export default HaetutKayttooikeusRyhmatHakuForm;
