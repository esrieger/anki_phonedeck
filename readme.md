# Anki Phonedeck

## About

Allows anki decks on a computer to be accessed via a web page provided the accessing device has access to the local network (e.g. via VPN). This allows the Anki where decks are stored to be accessed without registering an account or dealing with synchronization issues.

## Prerequisites

1. Initial setup and test only verified on Ubuntu
1. Apache2
1. Anki installation
1. [AnkiConnect](https://github.com/FooSoft/anki-connect)

## Setup

1. Install apache with `sudo apt install apache2`
1. Change "/var/www" of apache in sites-available/\* files to this git directory path.
1. Change "/var/www" in apache2.conf as well to this git directory path.
1. Restart apache with `sudo systemctl restart apache2`
1. Git LFS may be needed to download the repository.
1. For AnkiConnect, configure the following:
  1. Set the `webBindAddress` to `"0.0.0.0"`
  1. Set the `webBindPort` to `8765`
  1. Set the `webCorsOriginList` to `"*"`
1. For setup of the web page, update `anki_url` in _form\_handler.js_ to the IP address of the device hosting the web page.

## Disclaimer

I am an embedded C/C++ engineer and JS and web development is a foreign world to me. There's probably a better way to do this but it works for what I want it to do.
