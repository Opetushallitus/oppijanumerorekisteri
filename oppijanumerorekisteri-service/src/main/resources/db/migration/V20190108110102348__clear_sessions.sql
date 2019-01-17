-- Jokin muuttui binäärissä spring bootin version noustessa jolloin vanhat sessiot eivät ole enää valideja
delete from spring_session_attributes ;
delete from spring_session;
