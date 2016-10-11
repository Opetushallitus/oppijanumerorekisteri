-- Just a placeholder so flyway can get started. Authentication-service (henkilopalvelu) has the important scripts.
-- Make sure henkilo table exists (if not create one)
CREATE TABLE IF NOT EXISTS public.henkilo
(
  id int8 not null,
	henkilotyyppi varchar(255) not null,
	hetu varchar(255),
	oidhenkilo varchar(255) not null,
	passivoitu boolean not null,
	primary key (id)
)
