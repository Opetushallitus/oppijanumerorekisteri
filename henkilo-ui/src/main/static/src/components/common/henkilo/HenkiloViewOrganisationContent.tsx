import React, { useState } from 'react';
import { useSelector } from 'react-redux';

import { useAppDispatch, type RootState } from '../../../store';
import StaticUtils from '../StaticUtils';
import { toLocalizedText } from '../../../localizabletext';
import { passivoiHenkiloOrg } from '../../../actions/henkilo.actions';
import { HenkiloState } from '../../../reducers/henkilo.reducer';
import { StoreOrganisaatio } from '../../../types/domain/organisaatio/organisaatio.types';
import { useLocalisations } from '../../../selectors';
import ConfirmButton from '../button/ConfirmButton';
import Button from '../button/Button';

import './HenkiloViewOrganisationContent.css';

type OrganisaatioFlat = {
    name: string;
    typesFlat: string;
    passive: boolean;
    id: string;
};

export const HenkiloViewOrganisationContent = () => {
    const { L, locale } = useLocalisations();
    const [showPassive, setShowPassive] = useState(false);
    const henkilo = useSelector<RootState, HenkiloState>((state) => state.henkilo);
    const dispatch = useAppDispatch();

    function passivoiHenkiloOrganisation(organisationOid: string) {
        dispatch<any>(passivoiHenkiloOrg(henkilo.henkilo.oidHenkilo, organisationOid));
    }

    function flatOrganisations(organisations: Array<StoreOrganisaatio>): Array<OrganisaatioFlat> {
        return organisations.map((organisation) => {
            const typesFlat = organisation.tyypit ? organisationTypesFlat(organisation.tyypit) : '';
            return {
                name: toLocalizedText(locale, organisation.nimi),
                typesFlat: typesFlat,
                passive: organisation.passivoitu,
                id: organisation.oid,
            };
        });
    }

    function organisationTypesFlat(tyypit: string[]) {
        return tyypit.length ? '(' + StaticUtils.flatArray(tyypit) + ')' : '';
    }

    return (
        <div className="henkiloViewUserContentWrapper">
            <h2>{L['HENKILO_ORGANISAATIOT_OTSIKKO']}</h2>
            <label className="oph-checkable" htmlFor="showPassive">
                <input
                    id="showPassive"
                    type="checkbox"
                    className="oph-checkable-input"
                    onChange={() => setShowPassive(!showPassive)}
                />
                <span className="oph-checkable-text"> {L['HENKILO_NAYTA_PASSIIVISET_TEKSTI']}</span>
            </label>
            <div className="organisationContentWrapper">
                {flatOrganisations(henkilo.henkiloOrgs).map((values, idx) =>
                    !values.passive || showPassive ? (
                        <div key={idx}>
                            <div>
                                <span className="oph-bold">
                                    {values.name} {values.typesFlat}
                                </span>
                            </div>
                            <div className="labelValue">
                                <span className="oph-bold">{L['HENKILO_ORGTUNNISTE']}:</span>
                                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                <span>{values.id}</span>
                            </div>
                            <div className="labelValue">
                                {!values.passive ? (
                                    <ConfirmButton
                                        key="passivoiOrg"
                                        action={() => passivoiHenkiloOrganisation(values.id)}
                                        confirmLabel={L['HENKILO_ORG_PASSIVOI_CONFIRM']}
                                        normalLabel={L['HENKILO_ORG_PASSIVOI']}
                                        id={values.id}
                                    />
                                ) : (
                                    <Button disabled>{L['HENKILO_ORG_PASSIVOITU']}</Button>
                                )}
                            </div>
                        </div>
                    ) : null
                )}
            </div>
        </div>
    );
};
