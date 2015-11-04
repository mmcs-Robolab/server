define GET_NAMES
$(subst .sql, , $(wildcard $1/*.sql))
endef

CONFIG_PATH = ../config/db.makefile
include $(CONFIG_PATH)


ifeq ($(LOGIN),)
	LOGIN := $(shell bash -c 'read -p "Username: " login; echo $$login')
endif
ifeq ($(PASS),)
	PASS := $(shell bash -c 'read -s -p "Password: " pwd; echo $$pwd')
endif
ifeq ($(DB),)
	DB := $(shell bash -c 'read -p "database: " db; echo $$db')
endif


FLAGS := -u $(LOGIN)
ifneq ($(PASS),)
	ifneq ($(PASS),"")
		FLAGS += --password=$(PASS)
	endif
endif
ifneq ($(PORT),)
	FLAGS += --port=$(PORT)
endif
ifneq ($(HOST),)
	FLAGS += --host=$(HOST)
endif



install: \
clear \
schema \
deploy
	@


deploy: functions
	@

clean:
clear:
	yes | mysqladmin $(FLAGS) drop $(DB);
	mysqladmin $(FLAGS) create $(DB)

%:
	mysql $(FLAGS) $(DB) < $@.sql