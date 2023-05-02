import Head from 'next/head'
import clientPromise from '../lib/mongodb'
import { InferGetServerSidePropsType } from 'next'
// import {recordStateChange, recordPlaybackQualityChange} from "../YoutubeEmbed";
import YouTube from "react-youtube";
import { useState, useRef } from 'react';

export async function getServerSideProps(context) {
  try {
    await clientPromise
    // `await clientPromise` will use the default database passed in the MONGODB_URI
    // However you can use another database (e.g. myDatabase) by replacing the `await clientPromise` with the following code:
    //
    // `const client = await clientPromise`
    // `const db = client.db("myDatabase")`
    //
    // Then you can execute queries against your database like so:
    // db.find({}) or any of the MongoDB Node Driver commands

    return {
      props: { isConnected: true },
    }
  } catch (e) {
    console.error(e)
    return {
      props: { isConnected: false },
    }
  }
}

export default function Home({
  isConnected,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {

  const numPlaybackQualityChanges = useRef(0);
  const numTimesBuffering = useRef(0);

  const totalTimeBuffering = useRef(0);
  const totalTimeBufferingToStartVideo = useRef(0);

  const videoPlayerLoadStart = useRef(0);
  const videoPlayerPlayingStart = useRef(0);

  const timeActiveBufferingInProgress = useRef(0);

  const videoBufferingToStart = useRef(false);
  const videoBufferingInProgress = useRef(false);

  const hd2160_playbackQualityTime = useRef(0);
  const hd1440_playbackQualityTime = useRef(0);
  const hd1080_playbackQualityTime = useRef(0);
  const hd720_playbackQualityTime = useRef(0);
  const large_playbackQualityTime = useRef(0);
  const medium_playbackQualityTime = useRef(0);
  const small_playbackQualityTime = useRef(0);
  const tiny_playbackQualityTime = useRef(0);
  const current_playbackQualityStartTime = useRef(0);

  const formerVideoQualityType = useRef("");
  const currentVideoQualityType = useRef("");

  const recordStateChange = (e) => {
    // const duration = e.target.getDuration();
    // const currentTime = e.target.getCurrentTime();

    // console.log("recording a state change with value: " + e.data);
    if (e.data == -1) // new video is about to start
    {
      console.log("recording a state change with value: " + e.data);
      // videoPlayerLoadStart = new Date();
      videoPlayerLoadStart.current = ( (new Date()).getTime() ); 
      // videoBufferingToStart = true;
      videoBufferingToStart.current = true;
      //console.log("new video is about to start");
    }
    else if (e.data == 1) // video is playing
    {
      console.log("recording a state change with value: " + e.data);
      if (videoBufferingToStart.current)
      {
        // videoPlayerPlayingStart = new Date();
        videoPlayerPlayingStart.current = ( (new Date()).getTime() );
        const timeBuffering = videoPlayerPlayingStart.current - videoPlayerLoadStart.current;
        
        console.log("time buffering to start video is: " + timeBuffering);
        totalTimeBufferingToStartVideo.current = (timeBuffering);
        // videoBufferingToStart = false;
        videoBufferingToStart.current = (false);
      }
      else if (videoBufferingInProgress.current)
      {
        // console.log("time active buffering when video playing is: " + timeActiveBufferingInProgress); 
        const timeBuffering = (new Date()).getTime() - timeActiveBufferingInProgress.current;
        totalTimeBuffering.current = (totalTimeBuffering.current + timeBuffering);
        videoBufferingInProgress.current = true;
      }
    }
    else if (e.data == 3) // video is buffering
    {
      console.log("recording a state change with value: " + e.data);
      numTimesBuffering.current = (numTimesBuffering.current + 1);
      
      // timeActiveBufferingInProgress = new Date();
      timeActiveBufferingInProgress.current = ((new Date()).getTime());
      console.log("epoch time when active buffering starts: " + timeActiveBufferingInProgress.current);
      videoBufferingInProgress.current = (true);
    }
    // else if (e.data == 5) // video is cued
    // {
    //   console.log("video is cued. This actually played??? Usually it doesn't.");
    // }
    else if (e.data == 0)// video has ended (this one only plays when the entire player ends and not before the next video starts for a playlist)
    {
      // console.log("720 time show is : " + hd720_playbackQualityTime.current);
      // uploadHandler(
      //   {
      //     networkProtocol: "QUIC",
      //     networkSpeed: "3G",
      //     numTimesBuffering: numTimesBuffering.current,
      //     totalTimeBuffering: totalTimeBuffering.current,
      //     totalTimeBufferingToStartVideo: totalTimeBufferingToStartVideo.current,
      //     numPlaybackQualityChanges: numPlaybackQualityChanges.current,
      //     hd2160PlaybackQualityTime: hd2160_playbackQualityTime.current,
      //     hd1440PlaybackQualityTime: hd1440_playbackQualityTime.current,
      //     hd1080PlaybackQualityTime: hd1080_playbackQualityTime.current,
      //     hd720PlaybackQualityTime: hd720_playbackQualityTime.current,
      //     largePlaybackQualityTime: large_playbackQualityTime.current,
      //     mediumPlaybackQualityTime: medium_playbackQualityTime.current,
      //     smallPlaybackQualityTime: small_playbackQualityTime.current,
      //     tinyPlaybackQualityTime: tiny_playbackQualityTime.current,
      //   });
    }
  };

  const videoQualityTypes = {
    hd2160: "hd2160",
    hd1440: "hd1440",
    hd1080: "hd1080",
    hd720: "hd720",
    large: "large",
    medium: "medium",
    small: "small",
    tiny: "tiny",
  }

  const recordPlaybackQualityChange = (e) => {
    console.log("recording a playback quality change with value: " + e.data);
    numPlaybackQualityChanges.current = (numPlaybackQualityChanges.current + 1);

    // switch to close timer for previous video quality
    switch (formerVideoQualityType.current) {
      case videoQualityTypes.hd2160:
        // console.log("video quality is 2160p / close timer");
        hd2160_playbackQualityTime.current = (hd2160_playbackQualityTime.current + ( (new Date()).getTime() - current_playbackQualityStartTime.current));
        break;
      case videoQualityTypes.hd1440:
        // console.log("video quality is 1440p / close timer");
        hd1440_playbackQualityTime.current = (hd1440_playbackQualityTime.current + ( (new Date()).getTime() - current_playbackQualityStartTime.current));
        break;
      case videoQualityTypes.hd1080:
        // console.log("video quality is 1080p / close timer");
        hd1080_playbackQualityTime.current = (hd1080_playbackQualityTime.current + ( (new Date()).getTime() - current_playbackQualityStartTime.current));
        break;
      case videoQualityTypes.hd720:
        // console.log("video quality is 720p / close timer");
        hd720_playbackQualityTime.current = (hd720_playbackQualityTime.current + ( (new Date()).getTime() - current_playbackQualityStartTime.current));
        break;
      case videoQualityTypes.large:
        // console.log("video quality is large / close timer");
        large_playbackQualityTime.current = (large_playbackQualityTime.current + ( (new Date()).getTime() - current_playbackQualityStartTime.current));
        break;
      case videoQualityTypes.medium:
        // console.log("video quality is medium / close timer");
        medium_playbackQualityTime.current = (medium_playbackQualityTime.current + ( (new Date()).getTime() - current_playbackQualityStartTime.current));
        break;
      case videoQualityTypes.small:
        // console.log("video quality is small / close timer");
        small_playbackQualityTime.current = (small_playbackQualityTime.current + ( (new Date()).getTime() - current_playbackQualityStartTime.current));
        break;
      case videoQualityTypes.tiny:
        // console.log("video quality is tiny / close timer");
        tiny_playbackQualityTime.current = (tiny_playbackQualityTime.current + ( (new Date()).getTime() - current_playbackQualityStartTime.current));
        break;

      default:
        console.log("no video quality timer to close");
        break;
    }


    // switch to start timer for new video quality
    currentVideoQualityType.current = e.data;
    current_playbackQualityStartTime.current = ( (new Date()).getTime() );
    switch (currentVideoQualityType.current) {
      case videoQualityTypes.hd2160:
        // console.log("video quality is 2160p / start timer");      
        formerVideoQualityType.current = videoQualityTypes.hd2160;
        break;
      case videoQualityTypes.hd1440:
        // console.log("video quality is 1440p / start timer");
        formerVideoQualityType.current = videoQualityTypes.hd1440;
        break;
      case videoQualityTypes.hd1080:
        // console.log("video quality is 1080p / start timer");
        formerVideoQualityType.current = videoQualityTypes.hd1080;
        break;
      case videoQualityTypes.hd720:
        console.log("video quality is 720p / start timer");
        formerVideoQualityType.current = videoQualityTypes.hd720;
        break;
      case videoQualityTypes.large:
        // console.log("video quality is large / start timer");
        formerVideoQualityType.current = videoQualityTypes.large;
        break;
      case videoQualityTypes.medium:
        // console.log("video quality is medium / start timer");
        formerVideoQualityType.current = videoQualityTypes.medium;
        break;
      case videoQualityTypes.small:
        // console.log("video quality is small / start timer");
        formerVideoQualityType.current = videoQualityTypes.small;
        break;
      case videoQualityTypes.tiny:
        // console.log("video quality is tiny / start timer");
        formerVideoQualityType.current = videoQualityTypes.tiny;
        break;

      default:
        console.log("video quality doesn't exist / cannot start timer");
        break;
    }

  };

  async function uploadHandler(enteredData) {
    const response = await 
    fetch("/api/api_route_post_metric", {
      method: "POST",
      body: JSON.stringify(enteredData),
      headers: 
      {
        "Content-Type": 
        "application/json",
      },
    });
    const data = await response.json();
    console.log(data);
   }

  const opts = {
    playerVars: {
      // https://developers.google.com/youtube/player_parameters
      // autoplay: 1,
      listType: "playlist",
      // need to grab list of videos from the database
      // grab url from input field and strip the playlist id
      list: "PLaq__SX2OUyly39JBsClsKzjz451ckwW_",
      mute:1 // enabling this makes the state -1 not appear at the beginning
    },
  };


  function handleVideoEnd(e) {
    // make api endpoint call to upload and package the database to the db
    console.log("video just ended.");

    // close timer for previous video quality
    let endTime = (new Date()).getTime();
    switch (formerVideoQualityType.current) {
      case videoQualityTypes.hd2160:
        // console.log("video quality is 2160p / close timer");
        hd2160_playbackQualityTime.current = (hd2160_playbackQualityTime.current + ( endTime - current_playbackQualityStartTime.current));
        break;
      case videoQualityTypes.hd1440:
        // console.log("video quality is 1440p / close timer");
        hd1440_playbackQualityTime.current = (hd1440_playbackQualityTime.current + ( endTime - current_playbackQualityStartTime.current));
        break;
      case videoQualityTypes.hd1080:
        // console.log("video quality is 1080p / close timer");
        hd1080_playbackQualityTime.current = (hd1080_playbackQualityTime.current + ( endTime - current_playbackQualityStartTime.current));
        break;
      case videoQualityTypes.hd720:
        // console.log("start time is : " + current_playbackQualityStartTime.current);
        hd720_playbackQualityTime.current = (hd720_playbackQualityTime.current + ( endTime - current_playbackQualityStartTime.current));
        break;
      case videoQualityTypes.large:
        // console.log("video quality is large / close timer");
        large_playbackQualityTime.current = (large_playbackQualityTime.current + ( endTime - current_playbackQualityStartTime.current));
        break;
      case videoQualityTypes.medium:
        // console.log("video quality is medium / close timer");
        medium_playbackQualityTime.current = (medium_playbackQualityTime.current + ( endTime - current_playbackQualityStartTime.current));
        break;
      case videoQualityTypes.small:
        // console.log("video quality is small / close timer");
        small_playbackQualityTime.current = (small_playbackQualityTime.current + ( endTime - current_playbackQualityStartTime.current));
        break;
      case videoQualityTypes.tiny:
        // console.log("video quality is tiny / close timer");
        tiny_playbackQualityTime.current = (tiny_playbackQualityTime.current + ( endTime - current_playbackQualityStartTime.current));
        break;

      default:
        console.log("no video quality timer to close");
        break;
    }

    uploadHandler(
      {
        networkProtocol: "TCP",
        networkSpeed: "Variable Network",
        numTimesBuffering: numTimesBuffering.current,
        totalTimeBuffering: totalTimeBuffering.current,
        totalTimeBufferingToStartVideo: totalTimeBufferingToStartVideo.current,
        numPlaybackQualityChanges: (numPlaybackQualityChanges.current - 1), // you don't include the first playback quality since it is the starting quality
        hd2160PlaybackQualityTime: hd2160_playbackQualityTime.current,
        hd1440PlaybackQualityTime: hd1440_playbackQualityTime.current,
        hd1080PlaybackQualityTime: hd1080_playbackQualityTime.current,
        hd720PlaybackQualityTime: hd720_playbackQualityTime.current,
        largePlaybackQualityTime: large_playbackQualityTime.current,
        mediumPlaybackQualityTime: medium_playbackQualityTime.current,
        smallPlaybackQualityTime: small_playbackQualityTime.current,
        tinyPlaybackQualityTime: tiny_playbackQualityTime.current,
      });

    // numPlaybackQualityChanges.current = 0;
    // numTimesBuffering.current = 0;

    // totalTimeBuffering.current = 0;
    // totalTimeBufferingToStartVideo.current = 0;

    // videoPlayerLoadStart.current = 0;
    // videoPlayerPlayingStart.current = 0;

    // timeActiveBufferingInProgress.current = 0;

    // videoBufferingToStart.current = false;
    // videoBufferingInProgress.current = false;

    // hd2160_playbackQualityTime.current = 0;
    // hd1440_playbackQualityTime.current = 0;
    // hd1080_playbackQualityTime.current = 0;
    // hd720_playbackQualityTime.current = 0;
    // large_playbackQualityTime.current = 0;
    // medium_playbackQualityTime.current = 0;
    // small_playbackQualityTime.current = 0;
    // tiny_playbackQualityTime.current = 0;

    // formerVideoQualityType.current = "";
  }

  return (
    <div className="container">
      <Head>
        <title>Create Next App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1 className="title">
          Welcome to Quality of Experience Media Player Tool
          {/* Welcome to <a href="https://nextjs.org">Next.js with MongoDB!</a> */}
        </h1>

        <h1>Youtube Embed</h1>
        {/* Eventually an id will be passed such that the client automatically cycles through all the videos in a playlist*/}
        <YouTube 
          // videoId="rokGy0huYEA"
          onStateChange={ (e) => recordStateChange(e)}
          onPlaybackQualityChange={ (e) => recordPlaybackQualityChange(e)}
          onEnd= {(e) => handleVideoEnd(e)}
          opts={opts}
        />
       
        {isConnected ? (
          <h2 className="subtitle">You are connected to MongoDB</h2>
        ) : (
          <h2 className="subtitle">
            You are NOT connected to MongoDB. Check the <code>README.md</code>{' '}
            for instructions.
          </h2>
        )}

        <p className="description">
          Get started by editing <code>pages/index.js</code>
        </p>

        <div className="grid">
          <a href="https://nextjs.org/docs" className="card">
            <h3>Documentation &rarr;</h3>
            <p>Find in-depth information about Next.js features and API.</p>
          </a>

          <a href="https://nextjs.org/learn" className="card">
            <h3>Learn &rarr;</h3>
            <p>Learn about Next.js in an interactive course with quizzes!</p>
          </a>

          <a
            href="https://github.com/vercel/next.js/tree/canary/examples"
            className="card"
          >
            <h3>Examples &rarr;</h3>
            <p>Discover and deploy boilerplate example Next.js projects.</p>
          </a>

          <a
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
            className="card"
          >
            <h3>Deploy &rarr;</h3>
            <p>
              Instantly deploy your Next.js site to a public URL with Vercel.
            </p>
          </a>
        </div>
      </main>

      <footer>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{' '}
          <img src="/vercel.svg" alt="Vercel Logo" className="logo" />
        </a>
      </footer>

      <style jsx>{`
        .container {
          min-height: 100vh;
          padding: 0 0.5rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }

        main {
          padding: 5rem 0;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }

        footer {
          width: 100%;
          height: 100px;
          border-top: 1px solid #eaeaea;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        footer img {
          margin-left: 0.5rem;
        }

        footer a {
          display: flex;
          justify-content: center;
          align-items: center;
        }

        a {
          color: inherit;
          text-decoration: none;
        }

        .title a {
          color: #0070f3;
          text-decoration: none;
        }

        .title a:hover,
        .title a:focus,
        .title a:active {
          text-decoration: underline;
        }

        .title {
          margin: 0;
          line-height: 1.15;
          font-size: 4rem;
        }

        .title,
        .description {
          text-align: center;
        }

        .subtitle {
          font-size: 2rem;
        }

        .description {
          line-height: 1.5;
          font-size: 1.5rem;
        }

        code {
          background: #fafafa;
          border-radius: 5px;
          padding: 0.75rem;
          font-size: 1.1rem;
          font-family: Menlo, Monaco, Lucida Console, Liberation Mono,
            DejaVu Sans Mono, Bitstream Vera Sans Mono, Courier New, monospace;
        }

        .grid {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;

          max-width: 800px;
          margin-top: 3rem;
        }

        .card {
          margin: 1rem;
          flex-basis: 45%;
          padding: 1.5rem;
          text-align: left;
          color: inherit;
          text-decoration: none;
          border: 1px solid #eaeaea;
          border-radius: 10px;
          transition: color 0.15s ease, border-color 0.15s ease;
        }

        .card:hover,
        .card:focus,
        .card:active {
          color: #0070f3;
          border-color: #0070f3;
        }

        .card h3 {
          margin: 0 0 1rem 0;
          font-size: 1.5rem;
        }

        .card p {
          margin: 0;
          font-size: 1.25rem;
          line-height: 1.5;
        }

        .logo {
          height: 1em;
        }

        @media (max-width: 600px) {
          .grid {
            width: 100%;
            flex-direction: column;
          }
        }
      `}</style>

      <style jsx global>{`
        html,
        body {
          padding: 0;
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto,
            Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue,
            sans-serif;
        }

        * {
          box-sizing: border-box;
        }
      `}</style>
    </div>
  )
}
