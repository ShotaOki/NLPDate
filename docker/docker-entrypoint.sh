#! /bin/ash

echo Start Docker Entrypoint

for i in $1 $2 $3 $4 $5 $6 $7 $8 $9
do
    if [ "$i" = 'setup' ]; then
        echo SETUP
        cd ${MAIN}
        npm install
    fi
done

for i in $1 $2 $3 $4 $5 $6 $7 $8 $9
do
    if [ "$i" = 'format' ]; then
        echo FORMAT
        cd ${MAIN}
        npm run format
    fi
done

for i in $1 $2 $3 $4 $5 $6 $7 $8 $9
do
    if [ "$i" = 'test' ]; then
        echo TEST
        cd ${MAIN}
        npm run test
    fi
done

for i in $1 $2 $3 $4 $5 $6 $7 $8 $9
do
    if [ "$i" = 'document' ]; then
        echo DOCUMENT
        cd ${MAIN}
        npm run document
    fi
done

for i in $1 $2 $3 $4 $5 $6 $7 $8 $9
do
    if [ "$i" = 'release' ]; then
        echo RELEASE
        cd ${MAIN}
        npm run release_build
        npm run release_build -- --env parser=babel
    fi
done

for i in $1 $2 $3 $4 $5 $6 $7 $8 $9
do
    if [ "$i" = 'build' ]; then
        echo BUILD
        cd ${MAIN}
        npm run build
        npm run build -- --env parser=babel
    fi
done

