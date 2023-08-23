FROM debian:testing

RUN apt-get update -qq && apt-get install -yqq curl

ENTRYPOINT [ "curl", "-v" "http://nginx:80" ]
