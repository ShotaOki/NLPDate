cd /d %~dp0
pushd ..\..
docker-compose build
docker-compose run --entrypoint "docker-entrypoint.sh %*" main
popd
