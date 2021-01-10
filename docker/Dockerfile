FROM node:15.3.0-alpine3.12

USER root
ENV TZ=Asia/Tokyo

ENV ROOT="/root/project"
ENV MAIN="/root/project/main"
RUN mkdir -p ${ROOT}
WORKDIR ${ROOT}

COPY docker-entrypoint.sh /usr/local/bin/
RUN ln -s /usr/local/bin/docker-entrypoint.sh /
ENTRYPOINT [ "docker-entrypoint.sh" ]
