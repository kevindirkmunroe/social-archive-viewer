import axios from 'axios';
import {useEffect, useState} from "react";
import ImageGallery from "react-image-gallery";
import { RotatingLines } from 'react-loader-spinner';

import './App.css';
function App() {

    const isLocal = process.env.NODE_ENV == 'development';
    const localProcessEnv = { REACT_APP_WEB_DOMAIN : 'localhost', REACT_APP_SERVICE_DOMAIN: 'localhost'};
    const BUILD_ENV = isLocal ? localProcessEnv : process.env;
    const PROTOCOL = isLocal? 'http' : 'https';

    console.log(`REACT_APP_WEB_DOMAIN = ${BUILD_ENV.REACT_APP_WEB_DOMAIN}`);

    const queryParameters = new URLSearchParams(window.location.search)
    const shareableId = queryParameters.get('id');

    const [username, setUsername] = useState('');
    useEffect(() => {
        setUsername(username);
    }, [username]);

    const [viewHashtag, setViewHashtag] = useState('');
    useEffect(() => {
        setViewHashtag(viewHashtag);
    }, [viewHashtag]);

    const [userId, setUserId] = useState('');
    useEffect(() => {
        setUserId(userId);
    }, [userId]);

    const [postsData, setPostsData] = useState([]);
    useEffect(() => {
        setPostsData(postsData);
    }, [postsData]);

    const [isDataLoading, setIsDataLoading] = useState(false);

    function Loader() {
        return (
            <RotatingLines
                strokeColor="green"
                strokeWidth="5"
                animationDuration="0.75"
                width="96"
                visible={true}
            />
        )
    }

    function toUserReadableDate(date){
        const res = new Date(date);
        return res.toDateString();
    }

    function showFacebookDataFromRequest(uid, vhashtag){
        console.log(`[SocialArchiveViewer] showing ${viewHashtag}`);
        setIsDataLoading(true);
        const newPostsData = [];
        try {
            console.log(`DEBUG: getting posts`)
            axios.get(`${PROTOCOL}://${BUILD_ENV.REACT_APP_SERVICE_DOMAIN}:3001/social-archive/facebook/posts?userId=${uid}&hashtag=${vhashtag}`
            )
                .then(res => {
                    res.data.forEach((doc) => {
                        const imageId = doc.id;
                        const caption = `${toUserReadableDate(doc.created_time)} - ${doc.message}`;
                        newPostsData.push({image: `${PROTOCOL}://s3.us-west-1.amazonaws.com/bronze-giant-social-archive/${imageId}.jpg`, caption: caption});
                    });
                    setPostsData(newPostsData);
                })
                .catch((error) => {
                    console.log(`[SocialArchiveViewer] ARCHIVE ERROR: ${JSON.stringify(error)}`);
                });
        }catch(error){
            console.log(`[SocialArchiveViewer] fetch ERROR: ${JSON.stringify(error)}`);
        }finally{
            setIsDataLoading(false);
        }
    }

    useEffect(() => {
        setIsDataLoading(true);
        try {
            axios.get(`${PROTOCOL}://${BUILD_ENV.REACT_APP_SERVICE_DOMAIN}:3001/social-archive/facebook/shareable-hashtag-details?id=${shareableId}`
            )
                .then(res => {
                    console.log(`[SocialArchiveViewer] got result for shareableId ${shareableId}: ${JSON.stringify(res.data)}`);

                    setUsername(res.data[0].sharedHashtag.userName);
                    setUserId(res.data[0].sharedHashtag.userId);
                    setViewHashtag(res.data[0].sharedHashtag.hashtag);

                    showFacebookDataFromRequest(res.data[0].sharedHashtag.userId, res.data[0].sharedHashtag.hashtag);
                })
                .catch((error) => {
                    console.log(`[SocialArchiveViewer] ARCHIVE ERROR: ${JSON.stringify(error)}`);
                });
        }catch(error){
            console.log(`[SocialArchiveViewer] fetch ERROR: ${JSON.stringify(error)}`);
        }finally{
            setIsDataLoading(false);
        }
    }, []);

    const encodeSpaces = (string) => {
        return string.replaceAll(' ', '%25%32%30');
    }

    function shareHashtag(){
        window.open(`mailto:?subject=Check out these awesome pics from ${username}'s My Social Archivr Gallery!&body=Enjoy!%0A%0A%2D%2DThe My Social Archive Team%0A%0AClick Here: ${PROTOCOL}://${BUILD_ENV.REACT_APP_WEB_DOMAIN}:3002?userId=${userId}%26user=${encodeSpaces(username)}%26hashtag=${encodeURIComponent(viewHashtag)}`);
    }

    const photos = [
    ];
    postsData.forEach(post => {
        photos.push({original: post.image, thumbnail: post.image, description: post.caption});
    });


  return (
      <div className="App">
          <div style={{float: 'left', margin: '10px', fontWeight: 900}}><img alt='.' src={'./black-cat.png'} width={'20px'} height={'20px'}/>&nbsp;My Social Archivr</div>
          <hr width="98%" color="green" size="1px"/>
          <div className="parent">
              <header>
                  <div style={{
                      alignContent: 'space-evenly',
                      border: '0px',
                      textAlign: 'left',
                      marginLeft: '20px',
                      marginTop: '3px',
                      height: '40px',
                      fontWeight: 900
                  }}>
                      <div style={{height: '100px', display: 'inline-block', textAlign: 'center'}}><img alt="Facebook"
                                                                                                        src="./facebook-black.png"
                                                                                                        width="18"
                                                                                                        height="18"/> {username} > &nbsp;
                      </div>
                      <div style={{fontSize: 30, marginTop: '10px', display: 'inline-block'}}>#{viewHashtag}</div>
                  </div>
              </header>
              <section className="left-sidebar"></section>
              <main style={{alignItems: 'center'}}>
                  <div style={{overflowY: 'auto', width: '70%', height: '70%', margin: 'auto'}}>
                      {isDataLoading ? <Loader/> :
                           <ImageGallery items={photos} thumbnailPosition={'left'} originalHeight={'100px'}/>}
                  </div>
              </main>
              <div className="right-sidebar">
                  <img alt="Info" src="./icons8-info-50.png" style={{width: '24px', height: '24px'}}/><p/>
                  <img onClick={() => shareHashtag()} alt="Share" src="./export-share-icon.png" width="24" height-="24"
                       style={{marginLeft: '5px'}}/>
              </div>
              <footer style={{textAlign: 'right'}}>© 2024, Bronze Giant LLC</footer>
          </div>
      </div>
  );
}

export default App;
