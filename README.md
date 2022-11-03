# Squoosh-Media-Server

[!["Buy Me A Coffee"](https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png)](https://www.buymeacoffee.com/sefirosweb)

Project based on [Squoosh](https://github.com/GoogleChromeLabs/squoosh) for serving a static files, these files can be resized and optimized by url request

The idea is to do something similar to image providers that compress and optimize images for you, It is a minimalist solution of these services,

To upload the image files you must provide it manually (via ftp or own development)

Exampe:

https://yourdomain.com/path/image.jpg?width=500

- In the case that you provide information in the url query with ? the program will optimize the image according to the data sent and will automatically cache the image in the .cache folder, so that the next request will not have to recreate it

- In the event that you do not provide data in the query, it will send the original size directly

![image](https://raw.githubusercontent.com/sefirosweb/Squoosh-Media-Server/master/docs/how_to.gif)
