-- Initial user
INSERT INTO kielisyys VALUES (nextval('public.hibernate_sequence'), 1, 'fi', 'suomi');

INSERT INTO henkilo (id, version, etunimet, hetu, kutsumanimi, oidhenkilo, sukunimi, sukupuoli, turvakielto, eisuomalaistahetua, asiointikieli_id, passivoitu, yksiloityvtj)
VALUES (nextval('public.hibernate_sequence'), 1, 'ROOT', '111111-985K', 'ROOT', '1.2.246.562.24.00000000001', 'USER', '1', false, false, (SELECT max(id) FROM kielisyys), false, true);

