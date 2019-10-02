var getJSON = function(options) {

    var resourceXHR = new XMLHttpRequest();
    resourceXHR.responseType = "json";
    resourceXHR.addEventListener("load", (function () {
        options.success(resourceXHR.response);
    }));
    resourceXHR.addEventListener("error", (function () {
        options.error({status: resourceXHR.status, statusText: resourceXHR.statusText});
    }));
    resourceXHR.open("GET", options.resourcePath, true);
    resourceXHR.send();
}

App.onLaunch = function (options) {
    getJSON({
        resourcePath: "https://s3.us-east-2.amazonaws.com/atamakuwala.com/metadata.json",
        success: function(movies){
            console.log(movies);
            var alert = moviesPage(movies)
            navigationDocument.pushDocument(alert);
        }
    })
}


App.onWillResignActive = function () {

}

App.onDidEnterBackground = function () {

}

App.onWillEnterForeground = function () {

}

App.onDidBecomeActive = function () {

}

App.onWillTerminate = function () {

}

var playMedia = function (extension, mediaType) {
    var mediaURL = extension;
    var singleMediaItem = new MediaItem(mediaType, mediaURL);
    var mediaList = new Playlist();
    
    mediaList.push(singleMediaItem);
    var myPlayer = new Player();
    myPlayer.playlist = mediaList;
    myPlayer.play();
}


/**
 * This convenience funnction returns an alert template, which can be used to present errors to the user.
 */
var moviesPage = function (movies) {
    var moviesMarkup;
    movies.map((movie)=>{
        var movieUrl = encodeURI(`https://s3.us-east-2.amazonaws.com/atamakuwala.com/${movie.Key}`);
        moviesMarkup += `
            <lockup onselect="playMedia('${movieUrl}', 'video')">
                <img src="${movie.image}" width="250" height="376" />
                <title>${movie.title}</title>
            </lockup>
        `
    });
    var alertString = `
<document>
    <catalogTemplate>
       <banner>
          <title>Ankit's Theater</title>
       </banner>
       <list>
          <section>
            <grid>
                <section>
                    ${moviesMarkup}
                </section>
            </grid>
          </section>
       </list>
    </catalogTemplate>
 </document>`

    var parser = new DOMParser();

    var alertDoc = parser.parseFromString(alertString, "application/xml");

    return alertDoc
}
