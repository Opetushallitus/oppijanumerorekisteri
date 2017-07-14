import React from 'react'
import PropTypes from 'prop-types'
import OphSelect from "../../select/OphSelect";
import StaticUtils from "../../StaticUtils";

const CKKayttooikeudet = ({kayttooikeusData, selectedList, kayttooikeusAction, close, L, locale}) => {
    const filteredOptions = kayttooikeusData && kayttooikeusData.filter(kayttooikeus =>
        selectedList.indexOf(kayttooikeus.ryhmaId) === -1)
            .map(kayttooikeus => ({
                value: kayttooikeus.ryhmaId,
                label: StaticUtils.getLocalisedText(kayttooikeus.ryhmaNames.texts, locale),
            }));
    return <tr key="kayttooikeusKayttooikeudetField">
        <td>
            <span className="oph-bold">{L['HENKILO_LISAA_KAYTTOOIKEUDET_MYONNETTAVAT']}</span>:
        </td>
        <td>
            <div>
                <div>
                    <OphSelect disabled={kayttooikeusData === undefined}
                               options={filteredOptions}
                               onChange={kayttooikeusAction} />
                </div>
            </div>
            <div>
                {
                    selectedList.map((selected, idx) =>
                        <div key={idx} className="oph-alert oph-alert-info">
                            <div className="oph-alert-container">
                                <div className="oph-alert-title">{selected.label}</div>
                                <button className="oph-button oph-button-close"
                                        type="button"
                                        title={L['POISTA']}
                                        aria-label="Close" onClick={() => close(selected.value)}>
                                    <span aria-hidden="true">×</span>
                                </button>
                            </div>
                        </div>)
                }
            </div>
        </td>
        <td />
    </tr>;
};

CKKayttooikeudet.propTypes = {
    kayttooikeusData: PropTypes.array,
    selectedList: PropTypes.array,
    kayttooikeusAction: PropTypes.func,
    close: PropTypes.func,
    L: PropTypes.object,
    locale: PropTypes.string,
};

export default CKKayttooikeudet;