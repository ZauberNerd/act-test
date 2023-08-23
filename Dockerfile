FROM debian:testing

RUN apt-get update -qq && apt-get install -yqq curl

CMD curl -v http://nginx:80
