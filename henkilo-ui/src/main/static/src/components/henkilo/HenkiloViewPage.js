import './HenkiloViewPage.css'
import React from 'react'
import HenkiloViewUserContent from './HenkiloViewUserContent'
import HenkiloViewContactContent from './HenkiloViewContactContent'
import HenkiloViewOrganisationContent from './HenkiloViewOrganisationContent'

const HenkiloView = React.createClass({
    render: function() {
        const L = this.props.l10n['fi'];
        return (
            <div>
                <div className="wrapper">
                    {
                        this.props.henkilo.henkiloLoading || this.props.henkilo.kayttajatietoLoading
                        || this.props.koodisto.sukupuoliKoodistoLoading || this.props.koodisto.kieliKoodistoLoading
                        || this.props.koodisto.kansalaisuusKoodistoLoading
                            ? L['LADATAAN']
                            : <HenkiloViewUserContent {...this.props} readOnly={true} locale="fi" showPassive={false} />
                    }
                </div>
                <div className="wrapper">
                    {
                        this.props.henkilo.henkiloLoading || this.props.koodisto.yhteystietotyypitKoodistoLoading
                            ? L['LADATAAN']
                            : <HenkiloViewContactContent {...this.props} readOnly={true} locale="fi" />
                    }
                </div>
                <div className="wrapper">
                    {
                        this.props.henkilo.henkiloOrgsLoading
                            ? L['LADATAAN']
                            : <HenkiloViewOrganisationContent {...this.props} readOnly={true} locale="fi" />
                    }
                </div>
            </div>
        )
    },
});

export default HenkiloView;