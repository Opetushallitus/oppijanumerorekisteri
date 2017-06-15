import React from 'react';
import HenkiloViewOpenKayttooikeusanomus from "../common/henkilo/HenkiloViewOpenKayttooikeusanomus";

class AnomusPage extends React.Component {
    render() {
        return (
          <div>
            <HenkiloViewOpenKayttooikeusanomus {...this.props}></HenkiloViewOpenKayttooikeusanomus>
          </div>
        );
    }
};

export default AnomusPage;
