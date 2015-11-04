delimiter //



-- ---------------------
--  label: users
-- ---------------------

drop function if exists User_create//
create function User_create(
    pLogin      text charset utf8,
    pPassword   text charset utf8,
    pName       text charset utf8,
    pEMail      text charset utf8
) returns int(11) no sql
begin
    declare exit handler for sqlexception return -1;

    insert into users (login, pass, name, email)
        values (pLogin, pPassword, pName, pEMail);

    return last_insert_id();
end//


-- search data by userID if it's not 0, otherwise by login
drop procedure if exists User_getInfo;
create procedure User_getInfo(
    in pUserID int(11),
    in pLoginOrMail text charset utf8
) no sql
begin
    select users.* -- id, login, pass, name, email
        from users
        where
            (pUserID = 0 or users.id = pUserID)
            and pLoginOrMail in (users.login, users.email)
        limit 1;
end//