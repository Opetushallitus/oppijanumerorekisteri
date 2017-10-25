// @flow
import React from 'react';
import {connect} from 'react-redux';

type Props = {
    
}

class KayttooikeusryhmatMuokkaaContainer extends React.Component<Props> {

    render() {
        return <div className="wrapper">
            <h3>muokkaa container</h3>
        </div>
    }

}

const mapStateToProps = (state) => ({
    L: state.l10n.localisations[state.locale]
});

export default connect(mapStateToProps, {})(KayttooikeusryhmatMuokkaaContainer)