-- ----------------------
--  label: profile
-- ----------------------

create table if not exists `users_main` (
    `id`        int(11)                     not null auto_increment,
    `login`     varchar(50) charset utf8    not null,
    `pass`      char(50) charset utf8       not null,
    `name`      varchar(200) charset utf8   not null,
    `email`     varchar(100) charset utf8   not null,

    primary key (`id`),
    unique key (`login`),
    unique key (`email`)

) engine=InnoDB default charset=utf8;

