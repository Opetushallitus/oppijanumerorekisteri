// @flow
import React from 'react';
import './InfoPage.css';

type Props = {
    children: any,
    topicLocalised: string,
}

const InfoPage = (props: Props) => <div className="infoPageWrapper">
    <p className="oph-h2 oph-bold">{props.topicLocalised}</p>
    {props.children}
</div>;

export default InfoPage;
