FROM browserless/base:1.6.0

ENV APP_DIR=/usr/src/app

RUN mkdir -p $APP_DIR

WORKDIR $APP_DIR

# Install Chrome Stable when specified
RUN cd /tmp &&\
    wget -q https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb &&\
    dpkg -i google-chrome-stable_current_amd64.deb;

CMD ["/usr/bin/node", "/usr/src/app/app.js"]
