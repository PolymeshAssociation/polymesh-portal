################################################################
################################################################
################################################################

ARG DEBIAN_VERSION=bookworm

################################################################

ARG NODE_VERSION=hydrogen
ARG NODE_CONTAINER_TAG=${NODE_VERSION}-${DEBIAN_VERSION}-slim

################################################################
################################################################
################################################################

FROM node:${NODE_CONTAINER_TAG} as builder

################################################################

USER root
RUN npm i -g npm && \
    npm i -g yarn --force && \
    npm i -g node-gyp

################################################################

# npm package dependencies:

RUN apt-get update && \
    apt-get install -y python3 python-is-python3 make g++

################################################################

WORKDIR /srv

################################################################

RUN chown -R node:node /srv/ && \
    chmod 0750 /srv/

COPY --chown=node:node package.json yarn.lock /srv/
RUN chmod 0640 /srv/package.json /srv/yarn.lock

################################################################

USER node
RUN yarn install --frozen-lockfile

################################################################

COPY --chown=node:node . /srv
RUN sed -n 's/^\(.*\)=.*$/\1=__\1__/p' .env.development > .env.production && \
    bash -ac "source .env.production && yarn build"

RUN cat /srv/.env.production | \
    xargs -I{} bash -c "echo '{}' | sed 's/^\\(.*\\)=.*$/\\1/' >> /srv/env.var.list"

################################################################
################################################################
################################################################

FROM nginx:stable-bullseye

################################################################

COPY --chown=root:root --from=builder /srv/dist /usr/share/nginx/html

################################################################

COPY --from=builder /srv/env.var.list /srv/env.var.list
COPY --chown=root:root replace-env-var-placeholders.sh /usr/local/bin/replace-env-var-placeholders.sh
COPY --chown=root:root nginx.conf /etc/nginx/conf.d/default.conf

################################################################

ENV VITE_NODE_URL=VITE_NODE_URL_NOT_SET
ENV VITE_SUBSCAN_URL=VITE_SUBSCAN_URL_NOT_SET
ENV VITE_SUBQUERY_MIDDLEWARE_URL=VITE_SUBQUERY_MIDDLEWARE_URL_NOT_SET
ENV VITE_SUBQUERY_MIDDLEWARE_KEY=VITE_SUBQUERY_MIDDLEWARE_KEY_NOT_SET
ENV VITE_PRIVACY_POLICY_URL=VITE_PRIVACY_POLICY_URL_NOT_SET
ENV VITE_TERMS_OF_SERVICE_URL=VITE_TERMS_OF_SERVICE_URL_NOT_SET
ENV VITE_DEVELOPER_APP_URL=VITE_DEVELOPER_APP_URL_NOT_SET
ENV VITE_POLKASSEMBLY_URL=VITE_POLKASSEMBLY_URL_NOT_SET
ENV VITE_ONBOARDING_URL=VITE_ONBOARDING_URL_NOT_SET
ENV VITE_ASSIGN_KEY_URL=VITE_ASSIGN_KEY_URL_NOT_SET
ENV VITE_TOKENSTUDIO_URL=VITE_TOKENSTUDIO_URL_NOT_SET

################################################################

EXPOSE 80/tcp

################################################################

CMD replace-env-var-placeholders.sh && \
    nginx -g 'daemon off;'

################################################################
################################################################
################################################################
