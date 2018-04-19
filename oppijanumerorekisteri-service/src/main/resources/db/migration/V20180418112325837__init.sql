--
-- PostgreSQL database dump
--

-- Dumped from database version 9.5.10
-- Dumped by pg_dump version 9.5.12

SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: plpgsql; Type: EXTENSION; Schema: -; Owner:
--

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;


--
-- Name: EXTENSION plpgsql; Type: COMMENT; Schema: -; Owner:
--

COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';


--
-- Name: pg_trgm; Type: EXTENSION; Schema: -; Owner:
--

CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA public;


--
-- Name: EXTENSION pg_trgm; Type: COMMENT; Schema: -; Owner:
--

COMMENT ON EXTENSION pg_trgm IS 'text similarity measurement and index searching based on trigrams';


--
-- Name: arkistoi_arvosana_deltat(integer); Type: FUNCTION; Schema: public; Owner: oph
--

CREATE FUNCTION public.arkistoi_arvosana_deltat(amount integer) RETURNS integer
    LANGUAGE plpgsql
    AS $$
DECLARE
  _resource_id varchar(200);
  _inserted bigint;
  _count int := 0;
  delta record;
BEGIN
  FOR delta IN
    SELECT resource_id, inserted FROM arvosana
    EXCEPT
    SELECT resource_id, inserted FROM v_arvosana
    LIMIT amount
  LOOP
    INSERT INTO a_arvosana SELECT * FROM arvosana WHERE resource_id = delta.resource_id AND inserted = delta.inserted;
    DELETE FROM arvosana WHERE resource_id = delta.resource_id AND inserted = delta.inserted;
    _count := _count + 1;
    RAISE NOTICE '%: archived delta: %, %', _count, delta.resource_id, delta.inserted;
  END LOOP;

  RETURN _count;
END;
$$;


ALTER FUNCTION public.arkistoi_arvosana_deltat(amount integer) OWNER TO oph;

--
-- Name: insertpalvelu(character varying, character varying); Type: FUNCTION; Schema: public; Owner: oph
--

CREATE FUNCTION public.insertpalvelu(character varying, character varying) RETURNS integer
    LANGUAGE plpgsql
    AS $_$
DECLARE
    role_name ALIAS FOR $1;
    role_text_fi ALIAS FOR $2;
    _role_exists bigint;
    _textgroup_id bigint;
    _palvelu_id bigint;
    _kayttooikeus_id bigint;
    r rooli%ROWTYPE;
    o organisaatiohenkilo%ROWTYPE;

BEGIN

    SELECT count(1) INTO _role_exists FROM palvelu WHERE name = role_name;

    IF _role_exists = 0 THEN
        SELECT nextval('public.hibernate_sequence') INTO _textgroup_id;
        SELECT nextval('public.hibernate_sequence') INTO _palvelu_id;

        INSERT INTO text_group (id, version) VALUES (_textgroup_id, 1);

        INSERT INTO text (id, version, lang, text, textgroup_id)
            SELECT nextval('public.hibernate_sequence'), 1, 'FI', role_text_fi, _textgroup_id;

        INSERT INTO text (id, version, lang, text, textgroup_id)
            SELECT nextval('public.hibernate_sequence'), 1, 'SV', role_text_fi, _textgroup_id;

        INSERT INTO text (id, version, lang, text, textgroup_id)
            SELECT nextval('public.hibernate_sequence'), 1, 'EN', role_text_fi, _textgroup_id;

        INSERT INTO palvelu (id, version, name, palvelutyyppi, textgroup_id, kokoelma_id)
            SELECT _palvelu_id, 1, role_name, 'YKSITTAINEN', _textgroup_id, NULL;

        FOR r IN
            SELECT *
                FROM rooli
        LOOP
            SELECT nextval('public.hibernate_sequence') INTO _kayttooikeus_id;
            INSERT INTO kayttooikeus (id, version, palvelu_id, rooli_id) SELECT _kayttooikeus_id, 0, _palvelu_id, r.id;

            FOR o IN
            SELECT *
                FROM organisaatiohenkilo WHERE henkilo_id IN (SELECT id FROM henkilo WHERE lower(kayttajatunnus) IN ('ophadmin', 'portaladmin'))
            LOOP
                INSERT INTO myonnetty_kayttooikeus (id, version, voimassaalkupvm, voimassaloppupvm, kayttooikeus_id, organisaatiohenkilo_id)
                SELECT nextval('public.hibernate_sequence'), 0, '2000-01-01', '2999-01-01', _kayttooikeus_id, o.id;
            END LOOP;

            INSERT INTO kayttooikeusryhma_kayttooikeus (kayttooikeusryhma_id, kayttooikeus_id)
                SELECT kr.id, _kayttooikeus_id FROM kayttooikeusryhma kr WHERE kr.name LIKE 'Rekisterinpitäjä%' AND r.name = 'CRUD';

        END LOOP;

    END IF;

    RETURN 1;

END;

$_$;


ALTER FUNCTION public.insertpalvelu(character varying, character varying) OWNER TO oph;

SET default_tablespace = '';

SET default_with_oids = false;


--
-- Name: asiayhteys_hakemus; Type: TABLE; Schema: public; Owner: oph
--

CREATE TABLE public.asiayhteys_hakemus (
    id bigint NOT NULL,
    version bigint NOT NULL,
    hakemus_oid character varying(255) NOT NULL,
    loppupaivamaara date NOT NULL,
    henkilo_id bigint NOT NULL
);


ALTER TABLE public.asiayhteys_hakemus OWNER TO oph;

--
-- Name: asiayhteys_kayttooikeus; Type: TABLE; Schema: public; Owner: oph
--

CREATE TABLE public.asiayhteys_kayttooikeus (
    id bigint NOT NULL,
    version bigint NOT NULL,
    loppupaivamaara date NOT NULL,
    henkilo_id bigint NOT NULL
);


ALTER TABLE public.asiayhteys_kayttooikeus OWNER TO oph;

--
-- Name: asiayhteys_palvelu; Type: TABLE; Schema: public; Owner: oph
--

CREATE TABLE public.asiayhteys_palvelu (
    id bigint NOT NULL,
    version bigint NOT NULL,
    luotu timestamp without time zone NOT NULL,
    palvelutunniste character varying(255) NOT NULL,
    henkilo_id bigint NOT NULL
);


ALTER TABLE public.asiayhteys_palvelu OWNER TO oph;

--
-- Name: externalid; Type: TABLE; Schema: public; Owner: oph
--

CREATE TABLE public.externalid (
    id bigint NOT NULL,
    version bigint NOT NULL,
    externalid character varying(255) NOT NULL,
    henkilo_id bigint NOT NULL
);


ALTER TABLE public.externalid OWNER TO oph;


--
-- Name: henkilo; Type: TABLE; Schema: public; Owner: oph
--

CREATE TABLE public.henkilo (
    id bigint NOT NULL,
    version bigint NOT NULL,
    etunimet character varying(255),
    hetu character varying(255),
    kotikunta character varying(255),
    kutsumanimi character varying(255),
    oidhenkilo character varying(255) NOT NULL,
    sukunimi character varying(255),
    sukupuoli character varying(255),
    turvakielto boolean,
    eisuomalaistahetua boolean,
    asiointikieli_id bigint,
    passivoitu boolean DEFAULT false NOT NULL,
    yksiloity boolean DEFAULT false NOT NULL,
    oppijanumero character varying(255),
    syntymaaika date,
    duplicate boolean DEFAULT false NOT NULL,
    aidinkieli_id bigint,
    yksilointi_yritetty boolean DEFAULT false NOT NULL,
    created timestamp without time zone DEFAULT now() NOT NULL,
    modified timestamp without time zone DEFAULT now() NOT NULL,
    kasittelija character varying(255),
    yksiloityvtj boolean DEFAULT false NOT NULL,
    huoltaja_id bigint,
    vtjsync_timestamp timestamp with time zone,
    ei_yksiloida boolean DEFAULT false NOT NULL,
    kuolinpaiva date,
    vtj_register boolean DEFAULT false NOT NULL
)
WITH (autovacuum_vacuum_scale_factor='0.0', autovacuum_vacuum_threshold='1000', autovacuum_analyze_scale_factor='0.0', autovacuum_analyze_threshold='1000');


ALTER TABLE public.henkilo OWNER TO oph;

--
-- Name: henkilo_aud; Type: TABLE; Schema: public; Owner: oph
--

CREATE TABLE public.henkilo_aud (
    id bigint NOT NULL,
    rev integer NOT NULL,
    revtype smallint,
    created timestamp without time zone,
    duplicate boolean,
    eisuomalaistahetua boolean,
    ei_yksiloida boolean,
    etunimet character varying(255),
    hetu character varying(255),
    kasittelija character varying(255),
    kotikunta character varying(255),
    kuolinpaiva date,
    kutsumanimi character varying(255),
    modified timestamp without time zone,
    oidhenkilo character varying(255),
    oppijanumero character varying(255),
    passivoitu boolean,
    sukunimi character varying(255),
    sukupuoli character varying(255),
    syntymaaika date,
    turvakielto boolean,
    vtj_register boolean DEFAULT false,
    vtjsync_timestamp timestamp without time zone,
    yksilointi_yritetty boolean,
    yksiloity boolean,
    yksiloityvtj boolean,
    aidinkieli_id bigint,
    asiointikieli_id bigint,
    huoltaja_id bigint
);


ALTER TABLE public.henkilo_aud OWNER TO oph;


--
-- Name: henkilo_kansalaisuus; Type: TABLE; Schema: public; Owner: oph
--

CREATE TABLE public.henkilo_kansalaisuus (
    henkilo_id bigint NOT NULL,
    kansalaisuus_id bigint NOT NULL
)
WITH (autovacuum_vacuum_scale_factor='0.0', autovacuum_vacuum_threshold='1000', autovacuum_analyze_scale_factor='0.0', autovacuum_analyze_threshold='1000');


ALTER TABLE public.henkilo_kansalaisuus OWNER TO oph;

--
-- Name: henkilo_kansalaisuus_aud; Type: TABLE; Schema: public; Owner: oph
--

CREATE TABLE public.henkilo_kansalaisuus_aud (
    rev integer NOT NULL,
    henkilo_id bigint NOT NULL,
    kansalaisuus_id bigint NOT NULL,
    revtype smallint
);


ALTER TABLE public.henkilo_kansalaisuus_aud OWNER TO oph;

--
-- Name: henkilo_kielisyys; Type: TABLE; Schema: public; Owner: oph
--

CREATE TABLE public.henkilo_kielisyys (
    henkilo_id bigint NOT NULL,
    kielisyys_id bigint NOT NULL
);


ALTER TABLE public.henkilo_kielisyys OWNER TO oph;

--
-- Name: henkilo_kielisyys_aud; Type: TABLE; Schema: public; Owner: oph
--

CREATE TABLE public.henkilo_kielisyys_aud (
    rev integer NOT NULL,
    henkilo_id bigint NOT NULL,
    kielisyys_id bigint NOT NULL,
    revtype smallint
);


ALTER TABLE public.henkilo_kielisyys_aud OWNER TO oph;

--
-- Name: henkilo_organisaatio; Type: TABLE; Schema: public; Owner: oph
--

CREATE TABLE public.henkilo_organisaatio (
    henkilo_id bigint NOT NULL,
    organisaatio_id bigint NOT NULL
);


ALTER TABLE public.henkilo_organisaatio OWNER TO oph;

--
-- Name: henkilo_organisaatio_aud; Type: TABLE; Schema: public; Owner: oph
--

CREATE TABLE public.henkilo_organisaatio_aud (
    rev integer NOT NULL,
    henkilo_id bigint NOT NULL,
    organisaatio_id bigint NOT NULL,
    revtype smallint
);


ALTER TABLE public.henkilo_organisaatio_aud OWNER TO oph;

--
-- Name: henkilo_passinumero; Type: TABLE; Schema: public; Owner: oph
--

CREATE TABLE public.henkilo_passinumero (
    henkilo_id bigint NOT NULL,
    passinumero character varying(255) NOT NULL
);


ALTER TABLE public.henkilo_passinumero OWNER TO oph;

--
-- Name: henkilo_passinumero_aud; Type: TABLE; Schema: public; Owner: oph
--

CREATE TABLE public.henkilo_passinumero_aud (
    rev integer NOT NULL,
    henkilo_id bigint NOT NULL,
    passinumero character varying(255) NOT NULL,
    revtype smallint
);


ALTER TABLE public.henkilo_passinumero_aud OWNER TO oph;

--
-- Name: henkiloviite; Type: TABLE; Schema: public; Owner: oph
--

CREATE TABLE public.henkiloviite (
    id bigint NOT NULL,
    version bigint NOT NULL,
    master_oid character varying(255) NOT NULL,
    slave_oid character varying(255) NOT NULL
)
WITH (autovacuum_vacuum_scale_factor='0.0', autovacuum_vacuum_threshold='1000', autovacuum_analyze_scale_factor='0.0', autovacuum_analyze_threshold='1000');


ALTER TABLE public.henkiloviite OWNER TO oph;

--
-- Name: hibernate_sequence; Type: SEQUENCE; Schema: public; Owner: oph
--

CREATE SEQUENCE public.hibernate_sequence
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.hibernate_sequence OWNER TO oph;

--
-- Name: identification; Type: TABLE; Schema: public; Owner: oph
--

CREATE TABLE public.identification (
    id bigint NOT NULL,
    version bigint NOT NULL,
    authtoken character varying(255),
    email character varying(255),
    identifier character varying(255) NOT NULL,
    idpentityid character varying(255) NOT NULL,
    henkilo_id bigint NOT NULL,
    expiration_date timestamp without time zone
)
WITH (autovacuum_vacuum_scale_factor='0.0', autovacuum_vacuum_threshold='1000', autovacuum_analyze_scale_factor='0.0', autovacuum_analyze_threshold='1000');


ALTER TABLE public.identification OWNER TO oph;

--
-- Name: kansalaisuus; Type: TABLE; Schema: public; Owner: oph
--

CREATE TABLE public.kansalaisuus (
    id bigint NOT NULL,
    version bigint NOT NULL,
    kansalaisuuskoodi character varying(255) NOT NULL
);


ALTER TABLE public.kansalaisuus OWNER TO oph;


--
-- Name: kielisyys; Type: TABLE; Schema: public; Owner: oph
--

CREATE TABLE public.kielisyys (
    id bigint NOT NULL,
    version bigint NOT NULL,
    kielikoodi character varying(255),
    kielityyppi character varying(255)
);


ALTER TABLE public.kielisyys OWNER TO oph;


--
-- Name: organisaatio; Type: TABLE; Schema: public; Owner: oph
--

CREATE TABLE public.organisaatio (
    id bigint NOT NULL,
    version bigint NOT NULL,
    oid character varying(255) NOT NULL
);


ALTER TABLE public.organisaatio OWNER TO oph;


--
-- Name: revinfo; Type: TABLE; Schema: public; Owner: oph
--

CREATE TABLE public.revinfo (
    rev integer NOT NULL,
    revtstmp bigint
);


ALTER TABLE public.revinfo OWNER TO oph;

--
-- Name: scheduled_tasks; Type: TABLE; Schema: public; Owner: oph
--

CREATE TABLE public.scheduled_tasks (
    task_name text NOT NULL,
    task_instance text NOT NULL,
    task_data bytea,
    execution_time timestamp with time zone NOT NULL,
    picked boolean NOT NULL,
    picked_by text,
    last_success timestamp with time zone,
    last_failure timestamp with time zone,
    last_heartbeat timestamp with time zone,
    version bigint NOT NULL
);


ALTER TABLE public.scheduled_tasks OWNER TO oph;


--
-- Name: spring_session; Type: TABLE; Schema: public; Owner: oph
--

CREATE TABLE public.spring_session (
    primary_id character(36) NOT NULL,
    session_id character(36) NOT NULL,
    creation_time bigint NOT NULL,
    last_access_time bigint NOT NULL,
    max_inactive_interval integer NOT NULL,
    expiry_time bigint NOT NULL,
    principal_name character varying(100)
);


ALTER TABLE public.spring_session OWNER TO oph;

--
-- Name: spring_session_attributes; Type: TABLE; Schema: public; Owner: oph
--

CREATE TABLE public.spring_session_attributes (
    session_primary_id character(36) NOT NULL,
    attribute_name character varying(200) NOT NULL,
    attribute_bytes bytea NOT NULL
);


ALTER TABLE public.spring_session_attributes OWNER TO oph;


--
-- Name: tuonti; Type: TABLE; Schema: public; Owner: oph
--

CREATE TABLE public.tuonti (
    id bigint NOT NULL,
    version bigint NOT NULL,
    sahkoposti character varying(255),
    kasiteltavia integer NOT NULL,
    kasiteltyja integer NOT NULL,
    kasittelija_oid character varying(255),
    data_id bigint
);


ALTER TABLE public.tuonti OWNER TO oph;

--
-- Name: tuonti_data; Type: TABLE; Schema: public; Owner: oph
--

CREATE TABLE public.tuonti_data (
    id bigint NOT NULL,
    version bigint NOT NULL,
    data oid NOT NULL
);


ALTER TABLE public.tuonti_data OWNER TO oph;

--
-- Name: tuonti_rivi; Type: TABLE; Schema: public; Owner: oph
--

CREATE TABLE public.tuonti_rivi (
    id bigint NOT NULL,
    version bigint NOT NULL,
    tunniste character varying(255),
    henkilo_id bigint NOT NULL,
    tuonti_id bigint NOT NULL
);


ALTER TABLE public.tuonti_rivi OWNER TO oph;


--
-- Name: yhteystiedot; Type: TABLE; Schema: public; Owner: oph
--

CREATE TABLE public.yhteystiedot (
    id bigint NOT NULL,
    version bigint NOT NULL,
    yhteystieto_tyyppi character varying(255),
    yhteystieto_arvo character varying(255),
    yhteystiedotryhma_id bigint NOT NULL
)
WITH (autovacuum_vacuum_scale_factor='0.0', autovacuum_vacuum_threshold='1000', autovacuum_analyze_scale_factor='0.0', autovacuum_analyze_threshold='1000');


ALTER TABLE public.yhteystiedot OWNER TO oph;

--
-- Name: yhteystiedotryhma; Type: TABLE; Schema: public; Owner: oph
--

CREATE TABLE public.yhteystiedotryhma (
    id bigint NOT NULL,
    version bigint NOT NULL,
    ryhmakuvaus character varying(255),
    henkilo_id bigint,
    ryhma_alkuperatieto character varying(255),
    read_only boolean DEFAULT false NOT NULL,
    yksilointitieto_id bigint
)
WITH (autovacuum_vacuum_scale_factor='0.0', autovacuum_vacuum_threshold='1000', autovacuum_analyze_scale_factor='0.0', autovacuum_analyze_threshold='1000');


ALTER TABLE public.yhteystiedotryhma OWNER TO oph;

--
-- Name: yksilointi_kansalaisuus; Type: TABLE; Schema: public; Owner: oph
--

CREATE TABLE public.yksilointi_kansalaisuus (
    yksilointitieto_id bigint NOT NULL,
    kansalaisuus_id bigint NOT NULL
);


ALTER TABLE public.yksilointi_kansalaisuus OWNER TO oph;

--
-- Name: yksilointi_update_data; Type: TABLE; Schema: public; Owner: oph
--

CREATE TABLE public.yksilointi_update_data (
    id bigint NOT NULL,
    version bigint NOT NULL,
    henkilo_id bigint NOT NULL,
    status integer NOT NULL
);


ALTER TABLE public.yksilointi_update_data OWNER TO oph;

--
-- Name: yksilointitieto; Type: TABLE; Schema: public; Owner: oph
--

CREATE TABLE public.yksilointitieto (
    id bigint NOT NULL,
    version bigint NOT NULL,
    henkiloid bigint NOT NULL,
    etunimet character varying(255),
    kutsumanimi character varying(255),
    sukunimi character varying(255),
    sukupuoli character varying(255),
    aidinkieli_id bigint,
    turvakielto boolean DEFAULT false NOT NULL,
    kotikunta character varying(255)
);


ALTER TABLE public.yksilointitieto OWNER TO oph;

--
-- Name: asiayhteys_hakemus_pkey; Type: CONSTRAINT; Schema: public; Owner: oph
--

ALTER TABLE ONLY public.asiayhteys_hakemus
    ADD CONSTRAINT asiayhteys_hakemus_pkey PRIMARY KEY (id);


--
-- Name: asiayhteys_kayttooikeus_pkey; Type: CONSTRAINT; Schema: public; Owner: oph
--

ALTER TABLE ONLY public.asiayhteys_kayttooikeus
    ADD CONSTRAINT asiayhteys_kayttooikeus_pkey PRIMARY KEY (id);


--
-- Name: externalid_pkey; Type: CONSTRAINT; Schema: public; Owner: oph
--

ALTER TABLE ONLY public.externalid
    ADD CONSTRAINT externalid_pkey PRIMARY KEY (id);


--
-- Name: henkilo_aud_pkey; Type: CONSTRAINT; Schema: public; Owner: oph
--

ALTER TABLE ONLY public.henkilo_aud
    ADD CONSTRAINT henkilo_aud_pkey PRIMARY KEY (id, rev);


--
-- Name: henkilo_hetu_key; Type: CONSTRAINT; Schema: public; Owner: oph
--

ALTER TABLE ONLY public.henkilo
    ADD CONSTRAINT henkilo_hetu_key UNIQUE (hetu);


--
-- Name: henkilo_kansalaisuus_aud_pkey; Type: CONSTRAINT; Schema: public; Owner: oph
--

ALTER TABLE ONLY public.henkilo_kansalaisuus_aud
    ADD CONSTRAINT henkilo_kansalaisuus_aud_pkey PRIMARY KEY (rev, henkilo_id, kansalaisuus_id);


--
-- Name: henkilo_kansalaisuus_pkey; Type: CONSTRAINT; Schema: public; Owner: oph
--

ALTER TABLE ONLY public.henkilo_kansalaisuus
    ADD CONSTRAINT henkilo_kansalaisuus_pkey PRIMARY KEY (henkilo_id, kansalaisuus_id);


--
-- Name: henkilo_kielisyys_aud_pkey; Type: CONSTRAINT; Schema: public; Owner: oph
--

ALTER TABLE ONLY public.henkilo_kielisyys_aud
    ADD CONSTRAINT henkilo_kielisyys_aud_pkey PRIMARY KEY (rev, henkilo_id, kielisyys_id);


--
-- Name: henkilo_kielisyys_pkey; Type: CONSTRAINT; Schema: public; Owner: oph
--

ALTER TABLE ONLY public.henkilo_kielisyys
    ADD CONSTRAINT henkilo_kielisyys_pkey PRIMARY KEY (henkilo_id, kielisyys_id);


--
-- Name: henkilo_oidhenkilo_key; Type: CONSTRAINT; Schema: public; Owner: oph
--

ALTER TABLE ONLY public.henkilo
    ADD CONSTRAINT henkilo_oidhenkilo_key UNIQUE (oidhenkilo);


--
-- Name: henkilo_organisaatio_aud_pkey; Type: CONSTRAINT; Schema: public; Owner: oph
--

ALTER TABLE ONLY public.henkilo_organisaatio_aud
    ADD CONSTRAINT henkilo_organisaatio_aud_pkey PRIMARY KEY (rev, henkilo_id, organisaatio_id);


--
-- Name: henkilo_organisaatio_pkey; Type: CONSTRAINT; Schema: public; Owner: oph
--

ALTER TABLE ONLY public.henkilo_organisaatio
    ADD CONSTRAINT henkilo_organisaatio_pkey PRIMARY KEY (henkilo_id, organisaatio_id);


--
-- Name: henkilo_passinumero_aud_pkey; Type: CONSTRAINT; Schema: public; Owner: oph
--

ALTER TABLE ONLY public.henkilo_passinumero_aud
    ADD CONSTRAINT henkilo_passinumero_aud_pkey PRIMARY KEY (rev, henkilo_id, passinumero);


--
-- Name: henkilo_passinumero_pkey; Type: CONSTRAINT; Schema: public; Owner: oph
--

ALTER TABLE ONLY public.henkilo_passinumero
    ADD CONSTRAINT henkilo_passinumero_pkey PRIMARY KEY (henkilo_id, passinumero);


--
-- Name: henkilo_pkey; Type: CONSTRAINT; Schema: public; Owner: oph
--

ALTER TABLE ONLY public.henkilo
    ADD CONSTRAINT henkilo_pkey PRIMARY KEY (id);


--
-- Name: identification_pkey; Type: CONSTRAINT; Schema: public; Owner: oph
--

ALTER TABLE ONLY public.identification
    ADD CONSTRAINT identification_pkey PRIMARY KEY (id);


--
-- Name: kansalaisuus_pkey; Type: CONSTRAINT; Schema: public; Owner: oph
--

ALTER TABLE ONLY public.kansalaisuus
    ADD CONSTRAINT kansalaisuus_pkey PRIMARY KEY (id);



--
-- Name: kielisyys_kielikoodi_key; Type: CONSTRAINT; Schema: public; Owner: oph
--

ALTER TABLE ONLY public.kielisyys
    ADD CONSTRAINT kielisyys_kielikoodi_key UNIQUE (kielikoodi);


--
-- Name: kielisyys_pkey; Type: CONSTRAINT; Schema: public; Owner: oph
--

ALTER TABLE ONLY public.kielisyys
    ADD CONSTRAINT kielisyys_pkey PRIMARY KEY (id);


--
-- Name: organisaatio_pkey; Type: CONSTRAINT; Schema: public; Owner: oph
--

ALTER TABLE ONLY public.organisaatio
    ADD CONSTRAINT organisaatio_pkey PRIMARY KEY (id);


--
-- Name: revinfo_pkey; Type: CONSTRAINT; Schema: public; Owner: oph
--

ALTER TABLE ONLY public.revinfo
    ADD CONSTRAINT revinfo_pkey PRIMARY KEY (rev);


--
-- Name: scheduled_tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: oph
--

ALTER TABLE ONLY public.scheduled_tasks
    ADD CONSTRAINT scheduled_tasks_pkey PRIMARY KEY (task_name, task_instance);


--
-- Name: spring_session_attributes_pk; Type: CONSTRAINT; Schema: public; Owner: oph
--

ALTER TABLE ONLY public.spring_session_attributes
    ADD CONSTRAINT spring_session_attributes_pk PRIMARY KEY (session_primary_id, attribute_name);


--
-- Name: spring_session_pk; Type: CONSTRAINT; Schema: public; Owner: oph
--

ALTER TABLE ONLY public.spring_session
    ADD CONSTRAINT spring_session_pk PRIMARY KEY (primary_id);


--
-- Name: tuonti_data_pkey; Type: CONSTRAINT; Schema: public; Owner: oph
--

ALTER TABLE ONLY public.tuonti_data
    ADD CONSTRAINT tuonti_data_pkey PRIMARY KEY (id);


--
-- Name: tuonti_pkey; Type: CONSTRAINT; Schema: public; Owner: oph
--

ALTER TABLE ONLY public.tuonti
    ADD CONSTRAINT tuonti_pkey PRIMARY KEY (id);


--
-- Name: tuonti_rivi_pkey; Type: CONSTRAINT; Schema: public; Owner: oph
--

ALTER TABLE ONLY public.tuonti_rivi
    ADD CONSTRAINT tuonti_rivi_pkey PRIMARY KEY (id);


--
-- Name: uk_henkilo; Type: CONSTRAINT; Schema: public; Owner: oph
--

ALTER TABLE ONLY public.asiayhteys_kayttooikeus
    ADD CONSTRAINT uk_henkilo UNIQUE (henkilo_id);


--
-- Name: uk_henkilo_hakemus; Type: CONSTRAINT; Schema: public; Owner: oph
--

ALTER TABLE ONLY public.asiayhteys_hakemus
    ADD CONSTRAINT uk_henkilo_hakemus UNIQUE (henkilo_id, hakemus_oid);


--
-- Name: uk_henkilo_palvelutunniste; Type: CONSTRAINT; Schema: public; Owner: oph
--

ALTER TABLE ONLY public.asiayhteys_palvelu
    ADD CONSTRAINT uk_henkilo_palvelutunniste UNIQUE (henkilo_id, palvelutunniste);


--
-- Name: uk_organisaatio_01; Type: CONSTRAINT; Schema: public; Owner: oph
--

ALTER TABLE ONLY public.organisaatio
    ADD CONSTRAINT uk_organisaatio_01 UNIQUE (oid);


--
-- Name: uk_passinumero_01; Type: CONSTRAINT; Schema: public; Owner: oph
--

ALTER TABLE ONLY public.henkilo_passinumero
    ADD CONSTRAINT uk_passinumero_01 UNIQUE (passinumero);


--
-- Name: uk_tuonti_rivi_01; Type: CONSTRAINT; Schema: public; Owner: oph
--

ALTER TABLE ONLY public.tuonti_rivi
    ADD CONSTRAINT uk_tuonti_rivi_01 UNIQUE (tuonti_id, henkilo_id);


--
-- Name: yhteystiedot_pkey; Type: CONSTRAINT; Schema: public; Owner: oph
--

ALTER TABLE ONLY public.yhteystiedot
    ADD CONSTRAINT yhteystiedot_pkey PRIMARY KEY (id);


--
-- Name: yhteystiedotryhma_pkey; Type: CONSTRAINT; Schema: public; Owner: oph
--

ALTER TABLE ONLY public.yhteystiedotryhma
    ADD CONSTRAINT yhteystiedotryhma_pkey PRIMARY KEY (id);


--
-- Name: yksilointi_synkronointi_pkey; Type: CONSTRAINT; Schema: public; Owner: oph
--

ALTER TABLE ONLY public.asiayhteys_palvelu
    ADD CONSTRAINT yksilointi_synkronointi_pkey PRIMARY KEY (id);


--
-- Name: yksilointi_tiedot_henkiloid_key; Type: CONSTRAINT; Schema: public; Owner: oph
--

ALTER TABLE ONLY public.yksilointitieto
    ADD CONSTRAINT yksilointi_tiedot_henkiloid_key UNIQUE (henkiloid);


--
-- Name: yksilointi_tiedot_pkey; Type: CONSTRAINT; Schema: public; Owner: oph
--

ALTER TABLE ONLY public.yksilointitieto
    ADD CONSTRAINT yksilointi_tiedot_pkey PRIMARY KEY (id);


--
-- Name: yksilointi_update_data_pkey; Type: CONSTRAINT; Schema: public; Owner: oph
--

ALTER TABLE ONLY public.yksilointi_update_data
    ADD CONSTRAINT yksilointi_update_data_pkey PRIMARY KEY (id);


--
-- Name: externalid_externalid_idx; Type: INDEX; Schema: public; Owner: oph
--

CREATE UNIQUE INDEX externalid_externalid_idx ON public.externalid USING btree (externalid);



--
-- Name: henkilo_etunimet_idx; Type: INDEX; Schema: public; Owner: oph
--

CREATE INDEX henkilo_etunimet_idx ON public.henkilo USING btree (etunimet);


--
-- Name: henkilo_kutsumanimi_idx; Type: INDEX; Schema: public; Owner: oph
--

CREATE INDEX henkilo_kutsumanimi_idx ON public.henkilo USING btree (kutsumanimi);


--
-- Name: henkilo_modified_idx; Type: INDEX; Schema: public; Owner: oph
--

CREATE INDEX henkilo_modified_idx ON public.henkilo USING btree (modified);


--
-- Name: henkilo_name_similarity; Type: INDEX; Schema: public; Owner: oph
--

CREATE INDEX henkilo_name_similarity ON public.henkilo USING gist (((((((etunimet)::text || ' '::text) || (kutsumanimi)::text) || ' '::text) || (sukunimi)::text)) public.gist_trgm_ops);


--
-- Name: henkilo_oid_idx; Type: INDEX; Schema: public; Owner: oph
--

CREATE INDEX henkilo_oid_idx ON public.henkilo USING btree (oidhenkilo);


--
-- Name: henkilo_pass_idx; Type: INDEX; Schema: public; Owner: oph
--

CREATE INDEX henkilo_pass_idx ON public.henkilo USING btree (passivoitu);


--
-- Name: henkilo_sukunimi_idx; Type: INDEX; Schema: public; Owner: oph
--

CREATE INDEX henkilo_sukunimi_idx ON public.henkilo USING btree (sukunimi);


--
-- Name: henkilo_yksiloityvtj_hetu_idx; Type: INDEX; Schema: public; Owner: oph
--

CREATE INDEX henkilo_yksiloityvtj_hetu_idx ON public.henkilo USING btree (yksiloityvtj, hetu);


--
-- Name: henkiloviite_master_oid_idx; Type: INDEX; Schema: public; Owner: oph
--

CREATE INDEX henkiloviite_master_oid_idx ON public.henkiloviite USING btree (master_oid);


--
-- Name: henkiloviite_slave_oid_idx; Type: INDEX; Schema: public; Owner: oph
--

CREATE INDEX henkiloviite_slave_oid_idx ON public.henkiloviite USING btree (slave_oid);


--
-- Name: hetu_idx; Type: INDEX; Schema: public; Owner: oph
--

CREATE INDEX hetu_idx ON public.henkilo USING btree (hetu);


--
-- Name: identification_henkilo_id_idx; Type: INDEX; Schema: public; Owner: oph
--

CREATE INDEX identification_henkilo_id_idx ON public.identification USING btree (henkilo_id);


--
-- Name: identifier_idx; Type: INDEX; Schema: public; Owner: oph
--

CREATE INDEX identifier_idx ON public.identification USING btree (identifier);


--
-- Name: spring_session_attributes_ix1; Type: INDEX; Schema: public; Owner: oph
--

CREATE INDEX spring_session_attributes_ix1 ON public.spring_session_attributes USING btree (session_primary_id);


--
-- Name: spring_session_ix1; Type: INDEX; Schema: public; Owner: oph
--

CREATE UNIQUE INDEX spring_session_ix1 ON public.spring_session USING btree (session_id);


--
-- Name: spring_session_ix2; Type: INDEX; Schema: public; Owner: oph
--

CREATE INDEX spring_session_ix2 ON public.spring_session USING btree (expiry_time);


--
-- Name: spring_session_ix3; Type: INDEX; Schema: public; Owner: oph
--

CREATE INDEX spring_session_ix3 ON public.spring_session USING btree (principal_name);


--
-- Name: yhteystiedot_yhteystiedotryhma_id_idx; Type: INDEX; Schema: public; Owner: oph
--

CREATE INDEX yhteystiedot_yhteystiedotryhma_id_idx ON public.yhteystiedot USING btree (yhteystiedotryhma_id);


--
-- Name: yhteystiedot_yhteystieto_arvo_idx; Type: INDEX; Schema: public; Owner: oph
--

CREATE INDEX yhteystiedot_yhteystieto_arvo_idx ON public.yhteystiedot USING btree (yhteystieto_arvo);


--
-- Name: yhteystiedotryhma_henkilo_id_idx; Type: INDEX; Schema: public; Owner: oph
--

CREATE INDEX yhteystiedotryhma_henkilo_id_idx ON public.yhteystiedotryhma USING btree (henkilo_id);


--
-- Name: yksilointi_update_data_henkilo_idx; Type: INDEX; Schema: public; Owner: oph
--

CREATE INDEX yksilointi_update_data_henkilo_idx ON public.yksilointi_update_data USING btree (henkilo_id);


--
-- Name: fk15eutxmeqyb0v9v43yye2blxj; Type: FK CONSTRAINT; Schema: public; Owner: oph
--

ALTER TABLE ONLY public.henkilo_passinumero_aud
    ADD CONSTRAINT fk15eutxmeqyb0v9v43yye2blxj FOREIGN KEY (rev) REFERENCES public.revinfo(rev);


--
-- Name: fk187d426e620670b2; Type: FK CONSTRAINT; Schema: public; Owner: oph
--

ALTER TABLE ONLY public.identification
    ADD CONSTRAINT fk187d426e620670b2 FOREIGN KEY (henkilo_id) REFERENCES public.henkilo(id);


--
-- Name: fk1lnfibi79dla4p3yr6nqr2uu1; Type: FK CONSTRAINT; Schema: public; Owner: oph
--

ALTER TABLE ONLY public.henkilo_organisaatio_aud
    ADD CONSTRAINT fk1lnfibi79dla4p3yr6nqr2uu1 FOREIGN KEY (rev) REFERENCES public.revinfo(rev);


--
-- Name: fk24c7f3776ba553a1; Type: FK CONSTRAINT; Schema: public; Owner: oph
--

ALTER TABLE ONLY public.henkilo
    ADD CONSTRAINT fk24c7f3776ba553a1 FOREIGN KEY (aidinkieli_id) REFERENCES public.kielisyys(id);


--
-- Name: fk3021ddf2565e98a4; Type: FK CONSTRAINT; Schema: public; Owner: oph
--

ALTER TABLE ONLY public.henkilo
    ADD CONSTRAINT fk3021ddf2565e98a4 FOREIGN KEY (asiointikieli_id) REFERENCES public.kielisyys(id);


--
-- Name: fk31a7f27569a56372; Type: FK CONSTRAINT; Schema: public; Owner: oph
--

ALTER TABLE ONLY public.yksilointi_kansalaisuus
    ADD CONSTRAINT fk31a7f27569a56372 FOREIGN KEY (kansalaisuus_id) REFERENCES public.kansalaisuus(id);


--
-- Name: fk36b34d7566a263b2; Type: FK CONSTRAINT; Schema: public; Owner: oph
--

ALTER TABLE ONLY public.yksilointitieto
    ADD CONSTRAINT fk36b34d7566a263b2 FOREIGN KEY (aidinkieli_id) REFERENCES public.kielisyys(id);


--
-- Name: fk41b7e277620670b2; Type: FK CONSTRAINT; Schema: public; Owner: oph
--

ALTER TABLE ONLY public.henkilo_kielisyys
    ADD CONSTRAINT fk41b7e277620670b2 FOREIGN KEY (henkilo_id) REFERENCES public.henkilo(id);


--
-- Name: fk41b7e27769456172; Type: FK CONSTRAINT; Schema: public; Owner: oph
--

ALTER TABLE ONLY public.henkilo_kielisyys
    ADD CONSTRAINT fk41b7e27769456172 FOREIGN KEY (kielisyys_id) REFERENCES public.kielisyys(id);


--
-- Name: fk41c7a27769456177; Type: FK CONSTRAINT; Schema: public; Owner: oph
--

ALTER TABLE ONLY public.yksilointi_kansalaisuus
    ADD CONSTRAINT fk41c7a27769456177 FOREIGN KEY (yksilointitieto_id) REFERENCES public.yksilointitieto(id);


--
-- Name: fk51lq458r1exfr6c6tswgk8n3e; Type: FK CONSTRAINT; Schema: public; Owner: oph
--

ALTER TABLE ONLY public.henkilo_aud
    ADD CONSTRAINT fk51lq458r1exfr6c6tswgk8n3e FOREIGN KEY (rev) REFERENCES public.revinfo(rev);


--
-- Name: fk_asiayhteys_hakemus_henkilo; Type: FK CONSTRAINT; Schema: public; Owner: oph
--

ALTER TABLE ONLY public.asiayhteys_hakemus
    ADD CONSTRAINT fk_asiayhteys_hakemus_henkilo FOREIGN KEY (henkilo_id) REFERENCES public.henkilo(id);


--
-- Name: fk_asiayhteys_kayttooikeus_henkilo; Type: FK CONSTRAINT; Schema: public; Owner: oph
--

ALTER TABLE ONLY public.asiayhteys_kayttooikeus
    ADD CONSTRAINT fk_asiayhteys_kayttooikeus_henkilo FOREIGN KEY (henkilo_id) REFERENCES public.henkilo(id);


--
-- Name: fk_asiayhteys_palvelu_henkilo; Type: FK CONSTRAINT; Schema: public; Owner: oph
--

ALTER TABLE ONLY public.asiayhteys_palvelu
    ADD CONSTRAINT fk_asiayhteys_palvelu_henkilo FOREIGN KEY (henkilo_id) REFERENCES public.henkilo(id);


--
-- Name: fk_externalid_henkilo; Type: FK CONSTRAINT; Schema: public; Owner: oph
--

ALTER TABLE ONLY public.externalid
    ADD CONSTRAINT fk_externalid_henkilo FOREIGN KEY (henkilo_id) REFERENCES public.henkilo(id);


--
-- Name: fk_henkilo_organisaatio_henkilo; Type: FK CONSTRAINT; Schema: public; Owner: oph
--

ALTER TABLE ONLY public.henkilo_organisaatio
    ADD CONSTRAINT fk_henkilo_organisaatio_henkilo FOREIGN KEY (henkilo_id) REFERENCES public.henkilo(id);


--
-- Name: fk_henkilo_organisaatio_organisaatio; Type: FK CONSTRAINT; Schema: public; Owner: oph
--

ALTER TABLE ONLY public.henkilo_organisaatio
    ADD CONSTRAINT fk_henkilo_organisaatio_organisaatio FOREIGN KEY (organisaatio_id) REFERENCES public.organisaatio(id);


--
-- Name: fk_henkilo_passinumero; Type: FK CONSTRAINT; Schema: public; Owner: oph
--

ALTER TABLE ONLY public.henkilo_passinumero
    ADD CONSTRAINT fk_henkilo_passinumero FOREIGN KEY (henkilo_id) REFERENCES public.henkilo(id);


--
-- Name: fk_tuonti_rivi_henkilo; Type: FK CONSTRAINT; Schema: public; Owner: oph
--

ALTER TABLE ONLY public.tuonti_rivi
    ADD CONSTRAINT fk_tuonti_rivi_henkilo FOREIGN KEY (henkilo_id) REFERENCES public.henkilo(id);


--
-- Name: fk_tuonti_rivi_tuonti; Type: FK CONSTRAINT; Schema: public; Owner: oph
--

ALTER TABLE ONLY public.tuonti_rivi
    ADD CONSTRAINT fk_tuonti_rivi_tuonti FOREIGN KEY (tuonti_id) REFERENCES public.tuonti(id);


--
-- Name: fk_tuonti_tuonti_data; Type: FK CONSTRAINT; Schema: public; Owner: oph
--

ALTER TABLE ONLY public.tuonti
    ADD CONSTRAINT fk_tuonti_tuonti_data FOREIGN KEY (data_id) REFERENCES public.tuonti_data(id);


--
-- Name: fka02a62f3dc0430b7; Type: FK CONSTRAINT; Schema: public; Owner: oph
--

ALTER TABLE ONLY public.yksilointitieto
    ADD CONSTRAINT fka02a62f3dc0430b7 FOREIGN KEY (henkiloid) REFERENCES public.henkilo(id);


--
-- Name: fkcs5n1hfw2kq9dru; Type: FK CONSTRAINT; Schema: public; Owner: oph
--

ALTER TABLE ONLY public.henkilo
    ADD CONSTRAINT fkcs5n1hfw2kq9dru FOREIGN KEY (huoltaja_id) REFERENCES public.henkilo(id);


--
-- Name: fkd2b4a4cf620670b2; Type: FK CONSTRAINT; Schema: public; Owner: oph
--

ALTER TABLE ONLY public.yhteystiedotryhma
    ADD CONSTRAINT fkd2b4a4cf620670b2 FOREIGN KEY (henkilo_id) REFERENCES public.henkilo(id);


--
-- Name: fkd2b4b4cf46057a12; Type: FK CONSTRAINT; Schema: public; Owner: oph
--

ALTER TABLE ONLY public.yhteystiedotryhma
    ADD CONSTRAINT fkd2b4b4cf46057a12 FOREIGN KEY (yksilointitieto_id) REFERENCES public.yksilointitieto(id);


--
-- Name: fkd2b8f4cf620670b2; Type: FK CONSTRAINT; Schema: public; Owner: oph
--

ALTER TABLE ONLY public.yhteystiedot
    ADD CONSTRAINT fkd2b8f4cf620670b2 FOREIGN KEY (yhteystiedotryhma_id) REFERENCES public.yhteystiedotryhma(id);


--
-- Name: fkd8005c5b620670b2; Type: FK CONSTRAINT; Schema: public; Owner: oph
--

ALTER TABLE ONLY public.henkilo_kansalaisuus
    ADD CONSTRAINT fkd8005c5b620670b2 FOREIGN KEY (henkilo_id) REFERENCES public.henkilo(id);


--
-- Name: fkd8005c5b992bc1c2; Type: FK CONSTRAINT; Schema: public; Owner: oph
--

ALTER TABLE ONLY public.henkilo_kansalaisuus
    ADD CONSTRAINT fkd8005c5b992bc1c2 FOREIGN KEY (kansalaisuus_id) REFERENCES public.kansalaisuus(id);


--
-- Name: fkdv42xjyagek2570e9ftgfx1wp; Type: FK CONSTRAINT; Schema: public; Owner: oph
--

ALTER TABLE ONLY public.henkilo_kielisyys_aud
    ADD CONSTRAINT fkdv42xjyagek2570e9ftgfx1wp FOREIGN KEY (rev) REFERENCES public.revinfo(rev);


--
-- Name: fkqxc9bei86pmc2oduhmsfn1h4t; Type: FK CONSTRAINT; Schema: public; Owner: oph
--

ALTER TABLE ONLY public.henkilo_kansalaisuus_aud
    ADD CONSTRAINT fkqxc9bei86pmc2oduhmsfn1h4t FOREIGN KEY (rev) REFERENCES public.revinfo(rev);


--
-- Name: spring_session_attributes_fk; Type: FK CONSTRAINT; Schema: public; Owner: oph
--

ALTER TABLE ONLY public.spring_session_attributes
    ADD CONSTRAINT spring_session_attributes_fk FOREIGN KEY (session_primary_id) REFERENCES public.spring_session(primary_id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

