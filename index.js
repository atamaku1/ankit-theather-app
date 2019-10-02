const aws = require("aws-sdk");
const S3 = new aws.S3();
const fs = require('fs');
var ptn = require('parse-torrent-name');
const axios = require('axios');


const test = async ()=> {
    try{
        const bucketFiles = await S3.listObjects({Bucket: "atamakuwala.com"}).promise();
        const movieFiles = bucketFiles.Contents.filter((file)=>{
            return (/\.(mp4|avi)$/i).test(file.Key)
        });
        const movieDetails = await getMovieDetails(movieFiles);
        //console.log(test);
        fs.writeFileSync("metadata.json", JSON.stringify(movieDetails));
    }
    catch(err){
        console.log(err);
    }
}

const getMovieDetails = async (movieFiles)=> {
    return await Promise.all(
        movieFiles.map( async (movie, index) => {
            const title = ptn(movie.Key).title;
            const year = ptn(movie.Key).year
            movie.title = title;
            movie.year = year;
            const res = await axios.get(`https://api.themoviedb.org/3/search/movie?api_key=fe011c64d28d70016c2635c0c27da375&language=en-US&query=${title}&page=1&include_adult=true&year=${year}`);
            const moviedbDetails = res.data;
            movie.image = `https://image.tmdb.org/t/p/w500/${moviedbDetails.results[0].poster_path}`;
            //console.log(moviedbDetails.results[0]);
            return movie;
        })
    )
};
test();