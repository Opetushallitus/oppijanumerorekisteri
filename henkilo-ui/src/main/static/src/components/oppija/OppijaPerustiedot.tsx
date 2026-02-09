import React, { useId } from 'react';

import { useGetHenkiloQuery } from '../../api/oppijanumerorekisteri';

export const OppijaPerustiedot = ({ oid }: { oid: string }) => {
    const { data: henkilo } = useGetHenkiloQuery(oid);

    const sectionId = useId();

    return (
        <section aria-labelledby={sectionId} className="henkiloViewUserContentWrapper">
            <h2 id={sectionId}>{henkilo?.sukunimi}</h2>
        </section>
    );
};
