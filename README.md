# Squoosh-Media-Server

[!["Buy Me A Coffee"](https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png)](https://www.buymeacoffee.com/sefirosweb)

Project based on [Squoosh](https://github.com/GoogleChromeLabs/squoosh) for serving a static files, these files can be resized and optimized by url request

The idea is to do something similar to image providers that compress and optimize images for you, It is a minimalist solution of these services,

To upload the image files you must provide it manually (via ftp or own development)

Example:

https://yourdomain.com/path/image.jpg?width=400&encode=webp

- In the case that you provide information in the url query with `?` the program will optimize the image according to the data sent and will automatically cache the image in the .cache folder, so the next request will not have to process it

- In the event that you do not provide data in the query, it will send the original size directly

![image](https://raw.githubusercontent.com/sefirosweb/Squoosh-Media-Server/master/docs/how_to.gif)

## Current valid parameters:

- encode `mozjpeg | avif | jxl | webp` default codec: `mozjpeg`
- width
- height `Is is not setted the image is preserve the original ratio`
- quality `only for mozjpeg`

## Deploy to production

I recomend you to use docker to avoid node version incompatibility, because it supports until Node 16.X

1º Clone the repository: `git clone https://github.com/sefirosweb/Squoosh-Media-Server.git`

2º Build the docker image: `docker-compose build`

4º Create and edit .env file, you need to set the port and app_url

5º Start docker compose: `docker-compose up -d`

## Develop

Its is not mandatory but you can execute node to develop:

```
docker run --rm -it --name MediaServer -v ~/.gitconfig:/etc/gitconfig -p 8080:8080 -p 9229:9229 -v $PWD:/home/app -w /home/app -u node node:16.13-bullseye /bin/bash
```

```
npm install
npm run dev
```

### TODOS

- Add batch to compress and cache the files
- Add search input to find the images or folder
- Improve to Vue instead EJS
