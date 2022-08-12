# Anki Phonedeck

## About

Allows anki decks on a computer to be accessed via a web page provided accessing device has access to the local network.

## Prerequisites

1. Initial setup and test only verified on Ubuntu
1. Apache2

## Setup

1. Install apache with `sudo apt install apache2`
1. Change "/var/www" of apache in sites-available/\* files to this git directory path.
1. Change "/var/www" in apache2.conf as well to this git directory path.
1. Restart apache with `sudo systemctl restart apache2`
