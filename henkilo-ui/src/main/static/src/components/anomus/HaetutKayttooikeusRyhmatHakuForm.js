/**
 * Haettujen käyttöoikeusryhmien hakulomake.
 */
import React from 'react';
import PropTypes from 'prop-types';
import BooleanRadioButtonGroup from '../common/radiobuttongroup/BooleanRadioButtonGroup'
import './HaetutKayttooikeusRyhmatHakuForm.css';
import DelayedSearchInput from "../henkilohaku/DelayedSearchInput";
import CloseButton from "../common/button/CloseButton";
import OrganisaatioSelection from "../common/select/OrganisaatioSelection";
import OphSelect from "../common/select/OphSelect";
import R from 'ramda';

class HaetutKayttooikeusRyhmatHakuForm extends React.Component {
    constructor(props) {
        super(props);

        this.L = this.props.l10n[this.props.locale];

        this.state = {
            hakutermi: '',
            naytaKaikki: false,
            selectedOrganisaatio: undefined,
            selectedRyhma: undefined
        };
    };

    static propTypes = {
        onSubmit: PropTypes.func.isRequired,
        locale: PropTypes.string.isRequired,
        l10n: PropTypes.array.isRequired,
        organisaatiot: PropTypes.array.isRequired,
        haetutKayttooikeusryhmatLoading: PropTypes.bool.isRequired,
        omattiedot: PropTypes.object.isRequired
    };

    render() {
        return (
            <form>
                <div className="flex-horizontal flex-align-center">
                    <div className="flex-item-1 haetut-kayttooikeusryhmat-form-item">
                        <DelayedSearchInput setSearchQueryAction={this.onHakutermiChange.bind(this)}
                                            defaultNameQuery={this.state.searchTerm}
                                            placeholder={this.L['HAETTU_KAYTTOOIKEUSRYHMA_HAKU_HENKILO']}
                                            loading={this.props.haetutKayttooikeusryhmatLoading}/>
                    </div>
                    <div className="flex-item-1 haetut-kayttooikeusryhmat-form-item flex-inline">
                        <span className="flex-item-1">
                            <OrganisaatioSelection id="organisaatiofilter"
                                                   L={this.L}
                                                   locale={this.props.locale}
                                                   organisaatios={this.props.omattiedot.organisaatios}
                                                   selectOrganisaatio={this.onOrganisaatioChange.bind(this)}
                                                   selectedOrganisaatioOid={this.state.selectedOrganisaatio}>
                            </OrganisaatioSelection>
                        </span>
                        <span className="haetut-kayttooikeusryhmat-close-button">
                            <CloseButton closeAction={() => this.onOrganisaatioChange(undefined)}></CloseButton>
                        </span>
                    </div>
                    {this.props.omattiedot.isAdmin || this.props.omattiedot.isOphVirkailija ?
                        <div className="flex-item-1 haetut-kayttooikeusryhmat-form-item flex-inline">
                            <span className="flex-item-1">
                                <OphSelect id="ryhmafilter"
                                           options={this._parseRyhmas(this.props.ryhmat)}
                                           value={this.state.selectedRyhma}
                                           placeholder={this.L['HAETTU_KAYTTOOIKEUSRYHMA_HAKU_RYHMA']}
                                           onChange={this.onRyhmaChange.bind(this)}>
                                </OphSelect>
                            </span>
                            <span className="haetut-kayttooikeusryhmat-close-button">
                                <CloseButton closeAction={() => this.onRyhmaChange(undefined)}></CloseButton>
                            </span>
                        </div>
                        : null}

                    {this.props.omattiedot.isAdmin &&
                    <div className="haetut-kayttooikeusryhmat-form-item">
                        <BooleanRadioButtonGroup value={this.state.naytaKaikki}
                                                 onChange={this.onNaytaKaikkiChange}
                                                 trueLabel={this.L['HAETTU_KAYTTOOIKEUSRYHMA_HAKU_NAYTA_KAIKKI']}
                                                 falseLabel={this.L['HAETTU_KAYTTOOIKEUSRYHMA_HAKU_NAYTA_OPH']}/>
                    </div>
                    }
                </div>
            </form>
        );
    }

    // Find users organisaatios from all organisaatios
    parseUserOrganisaatios(allOrganisaatios) {
        const omatOrganisaatiot = this.props.omattiedot.organisaatios;
        const organisaatioOids = [];
        omatOrganisaatiot.forEach(organisaatio => {
            this.parseChild(organisaatio.organisaatio, organisaatioOids)
        });
        return allOrganisaatios.filter(organisaatio => organisaatioOids.includes(organisaatio.oid));
    }

    parseChild(organisaatio, organisaatioOids) {
        organisaatioOids.push(organisaatio.oid);
        if (organisaatio.children.length > 0) {
            organisaatio.children.forEach(organisaatio => this.parseChild(organisaatio, organisaatioOids));
        }
    }

    _parseRyhmas(ryhmatState) {
        const ryhmat = R.path(['ryhmas'], ryhmatState);
        return ryhmat ? ryhmat.map(ryhma => ({
            label: ryhma.nimi[this.props.locale],
            value: ryhma.oid
        })) : [];
    }

    onHakutermiChange = (event) => {
        const hakutermi = event.value;
        this.setState({searchTerm: hakutermi});
        if (hakutermi.length === 0 || hakutermi.length >= 3) {
            this.props.onSubmit({q: hakutermi});
        }
    };

    onOrganisaatioChange = (organisaatioSelection) => {
        const organisaatioOid = organisaatioSelection ? organisaatioSelection.value : undefined;
        this.setState({selectedOrganisaatio: organisaatioOid, selectedRyhma: undefined});
        this.props.onSubmit({organisaatioOids: organisaatioOid});
    };

    onRyhmaChange = (ryhma) => {
        const ryhmaOid = ryhma ? ryhma.value : undefined;
        this.setState({selectedRyhma: ryhmaOid, selectedOrganisaatio: undefined});
        this.props.onSubmit({organisaatioOids: ryhmaOid});
    };

    onNaytaKaikkiChange = (naytaKaikki) => {
        this.setState({selectedOrganisaatio: null, naytaKaikki: naytaKaikki});
        this.props.onSubmit({adminView: !naytaKaikki});
    };
}

HaetutKayttooikeusRyhmatHakuForm.propTypes = {
    onSubmit: PropTypes.func.isRequired,
    organisaatiot: PropTypes.array.isRequired,
    rootOrganisaatioOid: PropTypes.string.isRequired,
    locale: PropTypes.string.isRequired,
    l10n: PropTypes.object.isRequired,
};

export default HaetutKayttooikeusRyhmatHakuForm;
