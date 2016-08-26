# Book Viewer:
About 3 years ago I needed to display a PDF file in an Android app, However the PDF had somecrazy layout and Arabic Text.
I couldn't get the PDF to display properly using free PDF display libraries back then. We also needed the user to draw ontop of the pages and drag and drop note baloons as well.

So I ended up writing my own custom solution for this use case. I split the pdf into multiple images and I managed loading and drawing the Images manually (while keeping the app memoery efficent).
I also created the Pan/Pinch functionality by hand.

This repository is a rewrite of that old code into JS. I'm using WEBGL canvas to manage the display of pages as well as navigation functionality (pan,pinch). 
It supports mobile well. I managed to get around 40 fps on Samsung Galaxy S3 and 60 on LG Nexus 5 (2014). I even embeded the code in an Ionic2 app and it worked as well.


## Live Demo:
you can see the book-viewer live in action [over here](https://dl.dropboxusercontent.com/u/37393408/book-viewer/index.html).

## How To Run The Included Demo:
1. Install dependencies
`npm install`
2. Build source
`npm run build`
3. Add your book pages  to the directory "demo/media/pages"
4. Edit Image Paths in "demo/app.js"
4. access "demo/index.html" through a web server of your choice


## Engine
The "engine" directory contains a  simple fast wrapper around WEBGL. It can be used for other projects and simple 2d games.
Currently it provides the following features

* Shaders: SimpleColorShader, SimpleTextureShader.
* Sprites: SolidColorSprite, TexturedSprite, AnimatedSprite.
* Camera
* BaseGame: You can extend this class and provide an Update and Draw method and it will handle the gameloop for you. 
* AssetsManager: manages loading/disposing of game assets, It currently supports loading Text,JSON,XML, and Images.


## Book Viewer
The source can be found in "book-viewer" directory. it provides the following features:
* loading and unloading of pages. pages which are no longer on screen are unloaded to free memory
* Touch (Pinch,Fling, and Pan) as well as Mouse navigation(Pan and MouseWheel)  
* Fling animation as well as scale animation using mouse wheel.
* responds to screen window resize and adjusts accordingly.


### How To Use:
1. Install dependencies
`npm install`
2. Build source
`npm run build`
3. Include the compiled file  in "./dist/bundle.js" in your webpage 
4. Add the book pages to some directory (for example './pages'). note that all pages should have a uniform size
5. Add a loading page sprite sheet and into  some directory (for example './imgs'). use the one included in "demo/media/loading" as an example.
The sprite sheet should be acompined with a JSON file containing the coords of each individual sprite in the sprite sheet (it should have a similar format to the included in the demo)  
6. Create a Div which will hold the BookViewer Canvas and give it an Id. make sure it fills its container (width:100%;height:100%) or has a fixed size.
```html
<html>
        <style>
            body{
                margin:0px;
            }
            #book-viewer-container:{
                width:100%;
                height:100%;
            }
        </style>
        <body>
            <div id="book-viewer-container">
            </div>
        </body>
    </html>
``` 

7. Once the DOM is loaded create a BookViewerApp object and pass the proper parameters
```js
var bookViewerApp;
    $(function(){
     //create a pages array containing an Id and the imagePath 
     var pages = [
        { id: 1, imagePath: "./pages/1.jpg" },
        { id: 2, imagePath: "./pages/2.jpg" },
        { id: 3, imagePath: "./pages/3.jpg" },
        { id: 4, imagePath: "./pages/4.jpg" },
        { id: 5, imagePath: "./pages/5.jpg" },
    ];


    bookViewerApp = new BookViewer.BookViewerApp(
        {
            //should match the same id of the div we created above 
            containerId:'book-viewer-container',
            //the width of page image
            pageBitmapWidth: 1200,
            //the height of page image
            pageBitmapHeight: 1650,
            //the url to the loading page sprite sheet data
            loadingSpriteAtlasData: "./media/loading/loading.json",
            //the url to the loading page sprite image
            loadingSpriteImage: "./media/loading/loading.png",
            pages: pages
        });
    });
```
*note*: To Destory the book-viewer don't forget to call dispose() method as such
```js
    bookViewerApp.dispose();
```
