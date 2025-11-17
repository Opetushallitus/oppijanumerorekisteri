insert into eidastunniste (id, version, henkilo_id, tunniste, createdby, created)
    select nextval('hibernate_sequence'), 0, henkilo_id, identifier, 'migration', now()
    from identification
    where idpentityid = 'eidas';

update henkilo
    set yksiloityeidas = true, yksiloity = false
    where yksiloityvtj = false
      and hetu is null
      and id in (select distinct henkilo_id from eidastunniste);

delete from identification where idpentityid = 'eidas';