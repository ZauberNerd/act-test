FROM debian:testing

RUN apt-get update -qq && apt-get install -yqq curl

CMD curl -s http://nginx:80 > /dev/null
