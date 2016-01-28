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

    insert into users_main (login, pass, name, email)
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
    select users_main.* -- id, login, pass, name, email
        from users_main
        where
            (pUserID = 0 or users_main.id = pUserID)
            and pLoginOrMail in (users_main.login, users_main.email)
        limit 1;
end//

# drop procedure if exists Articles_getInfo;
# create procedure User_getInfo() no sql
#     begin
#         select posts.* -- id, login, pass, name, email
#         from posts
#         limit 4;
#     end//