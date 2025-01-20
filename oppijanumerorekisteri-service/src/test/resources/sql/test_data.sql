INSERT INTO kielisyys (id, version, kielikoodi, kielityyppi) VALUES
    (nextval('hibernate_sequence'), 0, 'fi', 'suomi'),
    (nextval('hibernate_sequence'), 0, 'en', 'English'),
    (nextval('hibernate_sequence'), 0, 'sv', 'svenska');

INSERT INTO kansalaisuus (id, version, kansalaisuuskoodi) VALUES
    (nextval('hibernate_sequence'), 0, '152'), -- Chile
    (nextval('hibernate_sequence'), 0, '250'), -- Ranska
    (nextval('hibernate_sequence'), 0, '246'), -- Suomi
    (nextval('hibernate_sequence'), 0, '729'), -- Sudan
    (nextval('hibernate_sequence'), 0, '123'),
    (nextval('hibernate_sequence'), 0, '456');
