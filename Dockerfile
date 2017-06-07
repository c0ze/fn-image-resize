FROM mhart/alpine-node

COPY ./ /func
WORKDIR /func

RUN npm i
