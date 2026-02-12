# Scheduler

A reminder app where you can make a schedule with a subject, message, and date. The current date will be shown on the calendar with a light green color, and scheduled dates will be shown with a yellow/orange color. If the schedule is scheduled for today, that schedule will have in the bottom left corner the text "Today's obligation". The schedule can be added, updated, and deleted.

## Technologies

- JavaScript

- PHP Laravel 9

- SQLite database

## Tests

- PHPUnit

- Vitest + jsdom

## Run the app

In the VS Code terminal, run:

1. cd server
2. composer install
3. php artisan key:generate
4. php artisan migrate
5. php artisan serve
6. cd client
7. npm install

In the frontend, open index.html, if you are using a live server, disable auto-commit changes or the web page will reload over and over.

## Run the tests

1. cd server
2. php artisan test
3. cd client
4. npm test

![Screenshot_1](https://github.com/user-attachments/assets/6f8ca02f-a4e2-42a8-b81d-fed45a38202a)
