install: \
update \
	@

update:
	git pull origin master
	@$(MAKE) deploy -C ./db
	_uid="$(id -u)"; pkill --uid $_uid node
	nohup npm start &

%:
	mysql $(FLAGS) $(DB) < $@.sql