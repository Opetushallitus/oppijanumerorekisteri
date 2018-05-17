update identification i
set henkilo_id = h1.id
from henkiloviite hv
  join henkilo h1 on h1.oidhenkilo = hv.master_oid
  join henkilo h2 on h2.oidhenkilo = hv.slave_oid
where i.henkilo_id = h2.id
  and i.idpentityid = 'email';
