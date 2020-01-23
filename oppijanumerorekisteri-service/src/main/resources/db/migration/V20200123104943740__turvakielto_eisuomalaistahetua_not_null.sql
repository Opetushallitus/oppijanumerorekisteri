alter table henkilo alter column turvakielto set default false;
update henkilo set turvakielto = false where turvakielto is null;
alter table henkilo alter column turvakielto set not null;

alter table henkilo alter column eisuomalaistahetua set default false;
update henkilo set eisuomalaistahetua = false where eisuomalaistahetua is null;
alter table henkilo alter column eisuomalaistahetua set not null;
