import React from 'react'
import OphSelect from "../../select/OphSelect";

const CKKayttooikeudet = ({kayttooikeusData, selectedList, kayttooikeusAction, close, L, locale}) => {
    const filteredOptions = kayttooikeusData && kayttooikeusData.filter(kayttooikeus =>
        selectedList.indexOf(kayttooikeus.ryhmaId) === -1)
            .map(kayttooikeus => ({
                value: kayttooikeus.ryhmaId,
                label: kayttooikeus.ryhmaNames.texts.filter(text => text.lang.toLowerCase() === locale)[0].text,
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
                    selectedList.map(selected => <div className="oph-alert oph-alert-info">
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
    kayttooikeusData: React.PropTypes.array,
    selectedList: React.PropTypes.array,
    kayttooikeusAction: React.PropTypes.func,
    close: React.PropTypes.func,
    L: React.PropTypes.object,
    locale: React.PropTypes.string,
};

export default CKKayttooikeudet;