const aws = require("aws-sdk");
const fs = require('fs');
var ptn = require('parse-torrent-name');
const axios = require('axios');

const S3 = new aws.S3();

const getMovieDetails = async (movieFiles)=> {
    return await Promise.all(
        movieFiles.map( async (movie, index) => {
            const title = ptn(movie.Key).title;
            const year = ptn(movie.Key).year
            movie.title = title;
            movie.year = year;
            const res = await axios.get(`https://api.themoviedb.org/3/search/movie?api_key=fe011c64d28d70016c2635c0c27da375&language=en-US&query=${title}&page=1&include_adult=true&year=${year}`);
            const moviedbDetails = res.data;
            if(moviedbDetails.results.length){
                movie.image = `https://image.tmdb.org/t/p/w500/${moviedbDetails.results[0].poster_path}`;
            }
            else{
                movie.image = `https://s3.us-east-2.amazonaws.com/atamakuwala.com/image404.png`;
            }
            return movie;
        })
    )
};

const test = async ()=> {
    try{
        const bucketFiles = await S3.listObjects({Bucket: "atamakuwala.com"}).promise();
        const movieFiles = bucketFiles.Contents.filter((file)=>{
            return (/\.(mp4|avi)$/i).test(file.Key)
        });
        const movieDetails = await getMovieDetails(movieFiles);
        S3.putObject({Bucket: 'atamakuwala.com', Key: 'metadata.json', Body: JSON.stringify(movieDetails), ACL: "public-read"}, (err, data)=>{
            if(err){
                console.error(err);
                process.exit(1);
            }
            else{
                console.log("metadata uploaded successfully", data);
            }
        });
        S3.upload({Bucket: 'atamakuwala.com', Key: 'application.js', Body: fs.createReadStream("./application.js"), ACL: "public-read"}, (err, data)=>{
            if(err){
                console.error(err);
                process.exit(1);
            }
            else{
                console.log("application file uploaded successfully", data);
            }
        });
        return "success";
    }
    catch(err){
        console.error(err);
        process.exit(1);
        return "failed"
    }
}

test();