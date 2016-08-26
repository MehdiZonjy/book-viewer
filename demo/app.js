var bookViewerApp;
function onLoaded() {
    var pages = [
        { id: 20, imagePath: "./media/pages/020.jpg" },
        { id: 21, imagePath: "./media/pages/021.jpg" },
        { id: 22, imagePath: "./media/pages/022.jpg" },
        { id: 23, imagePath: "./media/pages/023.jpg" },
        { id: 24, imagePath: "./media/pages/024.jpg" },
        { id: 25, imagePath: "./media/pages/025.jpg" },
        { id: 26, imagePath: "./media/pages/026.jpg" },
        { id: 27, imagePath: "./media/pages/027.jpg" },
        { id: 28, imagePath: "./media/pages/028.jpg" },
        { id: 29, imagePath: "./media/pages/029.jpg" },
        { id: 30, imagePath: "./media/pages/030.jpg" },
    ]
    bookViewerApp = new BookViewer.BookViewerApp(
        {
            containerId:'game-container',
            pageBitmapWidth: 1200,
            pageBitmapHeight: 1650,
            loadingSpriteAtlasData: "./media/loading/loading.json",
            loadingSpriteImage: "./media/loading/loading.png",
            pages: pages
        });
}


function dispose() {
    bookViewerApp.dispose();
}