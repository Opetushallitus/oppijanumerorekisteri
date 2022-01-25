/**
 * Haettujen käyttöoikeusryhmien hakulomake.
 */
import React from 'react';
import { connect } from 'react-redux';
import type { RootState } from '../../reducers';
import BooleanRadioButtonGroup from '../common/radiobuttongroup/BooleanRadioButtonGroup';
import './HaetutKayttooikeusRyhmatHakuForm.css';
import DelayedSearchInput from '../henkilohaku/DelayedSearchInput';
import CloseButton from '../common/button/CloseButton';
import OphSelect from '../common/select/OphSelect';
import { fetchOmattiedotOrganisaatios } from '../../actions/omattiedot.actions';
import * as R from 'ramda';
import { Localisations } from '../../types/localisation.type';
import { Locale } from '../../types/locale.type';
import { OrganisaatioSelectModal } from '../common/select/OrganisaatioSelectModal';
import { omattiedotOrganisaatiotToOrganisaatioSelectObject } from '../../utilities/organisaatio.util';
import { OrganisaatioSelectObject } from '../../types/organisaatioselectobject.types';
import { OrganisaatioHenkilo } from '../../types/domain/kayttooikeus/OrganisaatioHenkilo.types';

type OwnProps = {
    onSubmit: (arg0: {}) => void;
};

type StateProps = {
    L: Localisations;
    locale: Locale;
    organisaatios: Array<OrganisaatioHenkilo>;
    isAdmin: boolean;
    isOphVirkailija: boolean;
    haetutKayttooikeusryhmatLoading: boolean;
    ryhmat: { ryhmas: Array<{}> };
    omattiedotOrganisaatiosLoading: boolean;
};

type DispatchProps = {
    fetchOmattiedotOrganisaatios: () => any;
};

type Props = StateProps & DispatchProps & OwnProps;

type State = {
    searchTerm: string;
    naytaKaikki: boolean;
    selectedOrganisaatio: OrganisaatioSelectObject | null | undefined;
    selectedRyhma: string | null | undefined;
};

class HaetutKayttooikeusRyhmatHakuForm extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            searchTerm: '',
            naytaKaikki: false,
            selectedOrganisaatio: null,
            selectedRyhma: undefined,
        };
    }

    componentDidMount() {
        this.props.fetchOmattiedotOrganisaatios();
    }

    render() {
        return (
            <form>
                <div className="flex-horizontal flex-align-center">
                    <div
                        id="kayttooikeusryhmaHenkiloHakuWrapper"
                        className="flex-item-1 haetut-kayttooikeusryhmat-form-item"
                    >
                        <DelayedSearchInput
                            setSearchQueryAction={this.onHakutermiChange.bind(this)}
                            defaultNameQuery={this.state.searchTerm}
                            placeholder={this.props.L['HAETTU_KAYTTOOIKEUSRYHMA_HAKU_HENKILO']}
                            loading={this.props.haetutKayttooikeusryhmatLoading}
                        />
                    </div>
                    <div className="flex-item-1 haetut-kayttooikeusryhmat-form-item flex-inline large-kayttooikeus-filter">
                        <input
                            className="oph-input flex-item-1 anomus-organisaatiosuodatus"
                            type="text"
                            value={this.state.selectedOrganisaatio ? this.state.selectedOrganisaatio.name : ''}
                            placeholder={this.props.L['HAETTU_KAYTTOOIKEUSRYHMA_HAKU_ORGANISAATIO']}
                            readOnly
                        />
                        <OrganisaatioSelectModal
                            L={this.props.L}
                            locale={this.props.locale}
                            disabled={
                                this.props.omattiedotOrganisaatiosLoading || this.props.organisaatios.length === 0
                            }
                            onSelect={this.onOrganisaatioChange.bind(this)}
                            organisaatiot={omattiedotOrganisaatiotToOrganisaatioSelectObject(
                                this.props.organisaatios,
                                this.props.locale
                            )}
                        ></OrganisaatioSelectModal>
                        <span className="haetut-kayttooikeusryhmat-close-button">
                            <CloseButton closeAction={() => this.onClearOrganisaatio()} />
                        </span>
                    </div>
                </div>
                <div className="flex-horizontal flex-align-center margin-top-5">
                    {this.props.isAdmin || this.props.isOphVirkailija ? (
                        <div className="flex-item-1 haetut-kayttooikeusryhmat-form-item flex-inline large-kayttooikeus-filter">
                            <span className="flex-item-1">
                                <OphSelect
                                    id="ryhmafilter"
                                    options={this._parseRyhmas(this.props.ryhmat)}
                                    value={this.state.selectedRyhma}
                                    placeholder={this.props.L['HAETTU_KAYTTOOIKEUSRYHMA_HAKU_RYHMA']}
                                    onChange={this.onRyhmaChange.bind(this)}
                                    maxHeight={400}
                                    optionHeight={(object) => {
                                        const length = object.option.label.length;
                                        return 25 + (length / 50) * 20;
                                    }}
                                ></OphSelect>
                            </span>
                            <span className="haetut-kayttooikeusryhmat-close-button">
                                <CloseButton closeAction={() => this.onRyhmaChange(undefined)} />
                            </span>
                        </div>
                    ) : null}

                    {this.props.isAdmin && (
                        <div id="kayttooikeusryhmaRadioButtonWrapper" className="haetut-kayttooikeusryhmat-form-item">
                            <BooleanRadioButtonGroup
                                value={this.state.naytaKaikki}
                                onChange={this.onNaytaKaikkiChange}
                                trueLabel={this.props.L['HAETTU_KAYTTOOIKEUSRYHMA_HAKU_NAYTA_KAIKKI']}
                                falseLabel={this.props.L['HAETTU_KAYTTOOIKEUSRYHMA_HAKU_NAYTA_OPH']}
                            />
                        </div>
                    )}
                </div>
            </form>
        );
    }

    _parseRyhmas(ryhmatState: { ryhmas: Array<{}> }): Array<{ label: string; value: string }> {
        const ryhmat = R.path(['ryhmas'], ryhmatState);
        return ryhmat
            ? ryhmat
                  .map((ryhma) => ({
                      label:
                          ryhma.nimi[this.props.locale] ||
                          ryhma.nimi['fi'] ||
                          ryhma.nimi['sv'] ||
                          ryhma.nimi['en'] ||
                          '',
                      value: ryhma.oid,
                  }))
                  .sort((a, b) => a.label.localeCompare(b.label))
            : [];
    }

    onHakutermiChange = (event: HTMLInputElement) => {
        const hakutermi = event.value;
        this.setState({ searchTerm: hakutermi });
        if (hakutermi.length === 0 || hakutermi.length >= 3) {
            this.props.onSubmit({ q: hakutermi });
        }
    };

    onClearOrganisaatio = (): void => {
        this.setState({ selectedOrganisaatio: null });
        this.props.onSubmit({ organisaatioOids: '' });
    };

    onOrganisaatioChange = (organisaatio: OrganisaatioSelectObject) => {
        this.setState({
            selectedOrganisaatio: organisaatio,
            selectedRyhma: undefined,
        });
        this.props.onSubmit({ organisaatioOids: organisaatio.oid });
    };

    onRyhmaChange = (ryhma: { label: string; value: string } | null | undefined) => {
        const ryhmaOid = ryhma ? ryhma.value : undefined;
        this.setState({ selectedRyhma: ryhmaOid, selectedOrganisaatio: null });
        this.props.onSubmit({ organisaatioOids: ryhmaOid });
    };

    onNaytaKaikkiChange = (naytaKaikki: boolean) => {
        this.setState({ selectedOrganisaatio: null, naytaKaikki: naytaKaikki });
        this.props.onSubmit({ adminView: !naytaKaikki });
    };
}

const mapStateToProps = (state: RootState): StateProps => ({
    L: state.l10n.localisations[state.locale],
    locale: state.locale,
    organisaatios: state.omattiedot.organisaatios,
    omattiedotOrganisaatiosLoading: state.omattiedot.omattiedotOrganisaatiosLoading,
    isAdmin: state.omattiedot.isAdmin,
    isOphVirkailija: state.omattiedot.isOphVirkailija,
    haetutKayttooikeusryhmatLoading: state.haetutKayttooikeusryhmat.isLoading,
    ryhmat: state.ryhmatState,
});

export default connect<StateProps, DispatchProps>(mapStateToProps, {
    fetchOmattiedotOrganisaatios,
})(HaetutKayttooikeusRyhmatHakuForm);
