FROM node:11.10.0-alpine

WORKDIR /app

COPY . .

RUN apk add --update \
  git \
  openssh \
  python \
  python-dev \
  py-pip \
  build-base \
  && pip install virtualenv \
  && rm -rf /var/cache/apk/*

RUN mkdir -p /root/.ssh
ADD .ssh/id_rsa /root/.ssh/id_rsa
RUN chmod 700 /root/.ssh/id_rsa
RUN ssh-keyscan -t rsa github.com > ~/.ssh/known_hosts

RUN npm install --production

EXPOSE 8080

CMD ["npm", "start"]

