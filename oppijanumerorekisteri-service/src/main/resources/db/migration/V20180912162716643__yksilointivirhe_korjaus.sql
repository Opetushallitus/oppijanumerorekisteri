delete from yksilointivirhe where henkilo_id in (select henkiloid from yksilointitieto);
