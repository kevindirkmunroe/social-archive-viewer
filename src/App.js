import axios from 'axios';
import 'dotenv/config.js';
import {useEffect, useState} from "react";
import ImageGallery from "react-image-gallery";

import './App.css';
function App() {

    const isLocal = window.location.hostname === 'localhost';
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


    function showFacebookDataFromRequest(uid, vhashtag){
        console.log(`[SocialArchiveViewer] showing ${viewHashtag}`);
        const newPostsData = [];
        try {
            console.log(`DEBUG: getting posts`)
            axios.get(`${PROTOCOL}://${BUILD_ENV.REACT_APP_SERVICE_DOMAIN}:3001/social-archive/facebook/posts?userId=${uid}&hashtag=${vhashtag}`
            )
                .then(res => {
                    res.data.forEach((doc) => {
                        const imageId = doc.id;
                        newPostsData.push({image: `${PROTOCOL}://s3.us-west-1.amazonaws.com/bronze-giant-social-archive/${imageId}.jpg`, caption: doc.message});
                    });
                    setPostsData(newPostsData);
                    console.log(`[SocialArchiveViewer] setting postsdata ${newPostsData}`);
                })
                .catch((error) => {
                    console.log(`[SocialArchiveViewer] ARCHIVE ERROR: ${JSON.stringify(error)}`);
                });
        }catch(error){
            console.log(`[SocialArchiveViewer] fetch ERROR: ${JSON.stringify(error)}`);
        }
    }

    useEffect(() => {
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
        }
    }, []);

    const encodeSpaces = (string) => {
        return string.replaceAll(' ', '%25%32%30');
    }

    function shareHashtag(){
        window.open(`mailto:myfriend@example.com?subject=Check out these awesome pics from ${username}'s My Social Archivr Gallery!&body=Enjoy!%0A%0A%2D%2DThe My Social Archive Team%0A%0AClick Here: ${PROTOCOL}://${BUILD_ENV.REACT_APP_WEB_DOMAIN}:3002?userId=${userId}%26user=${encodeSpaces(username)}%26hashtag=${encodeURIComponent(viewHashtag)}`);
    }

    const photos = [
    ];
    postsData.forEach(post => {
        photos.push({original: post.image, thumbnail: post.image, description: post.caption});
    });

  return (
    <div className="App">
        <div style={{margin : 10, fontStyle: 'bold', color: 'green', float: 'left'}}>
        <table><tbody><tr><td><img src={'./black-cat.png'} width={'20px'} height={'20px'}/></td><td><h4>&nbsp;My Social Archivr</h4></td></tr></tbody></table>
        </div>
        <hr width="98%" color="green" size="1px" />
        <div className="parent">
            <header>
                <div style={{textAlign: 'left', marginLeft: '20px', marginTop: '3px', height: '40px', fontWeight: 900}}>{username} > <img alt="Facebook" src="./facebook-black.png" width="18" height="18" />&nbsp;#{viewHashtag}</div>
            </header>
            <section className="left-sidebar"></section>
            <main>
                    <ImageGallery items={photos} thumbnailPosition={'left'} originalHeight={'100px'}/>
            </main>
            <div className="right-sidebar">
                <img alt="Info" src="./icons8-info-50.png" style={{width: '24px', height: '24px'}} /><p/>
                <img onClick={() => shareHashtag()} alt="Share" src="./export-share-icon.png" width="24" height-="24" style={{marginLeft: '5px'}} />
            </div>
            <footer style={{textAlign: 'right'}}>© 2024, Bronze Giant LLC</footer>
        </div>
    </div>
  );
}

export default App;
