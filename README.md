# daily-audit

A scraper, api layer, and client I built to automate part of a friend's job.

daily-audit contains three services:

1. A scraper, built using puppeteer. It checks the top 5 headlines of a major news site and updates a shared `json` file if any of the headlines have changed. Tested with Jest.
2. A client, built with React, Vite, and Vanilla Extract. Fetches the headlines to display from ...
3. An api, built with Express. Includes routes to fetch the headlines, along with a some basic authentication. Implemented authentication myself using http-only cookies and a primitive `json` database. Tested with Jest.

This project was originally hosted on a digital ocean node where I used `nginx` to expose the client to the public, and `systemd` to daemonize the scraper and api.

I've since taken down the node and duplicated/sanitized the repo.
