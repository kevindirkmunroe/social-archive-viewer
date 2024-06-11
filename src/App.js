import axios from 'axios';
import {useEffect, useState} from "react";
import ImageGallery from "react-image-gallery";
import { RotatingLines } from 'react-loader-spinner';
import Modal from 'react-modal';

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

    const [modalIsOpen, setIsOpen] = useState(false);
    function openModal() {
        setIsOpen(true);
    }
    function closeModal() {
        setIsOpen(false);
    }

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
                    newPostsData.reverse().shift(); // remove pesky blank first pic
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

    const photos = [
    ];
    postsData.forEach(post => {
        photos.push({original: post.image, thumbnail: post.image, description: post.caption});
    });

    const customStyles = {
        content: {
            top: '30%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            marginRight: '-50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 10,
        },
    };

  return (
      <div className="App">
          <div style={{float: 'left', margin: '10px', fontWeight: 900}}><img alt='.' src={'./black-cat.png'} width={'20px'} height={'20px'}/>&nbsp;My Social Archivr</div>
          <hr width="98%" color="green" size="1px"/>
          <div className="parent">
              <header style={{border: 0}}>
                  <div style={{
                      alignContent: 'space-evenly',
                      border: '0px',
                      textAlign: 'left',
                      marginLeft: '0px',
                      marginTop: '3px',
                      height: '60px',
                      fontWeight: 900
                  }}>
                      <div style={{fontSize: 50, display: 'inline-block', marginTop: '2px', fontFamily: 'Snell Roundhand'}}>{viewHashtag}</div>
                      <div style={{height: '100px', display: 'inline-block', textAlign: 'center', marginLeft: '20px', fontSize: '12px'}}>
                      <img alt="Facebook"
                           src="./facebook-black.png"
                           width="10"
                           height="10"/> {username}
                      </div>
                  </div>
              </header>
              <section className="left-sidebar"></section>
              <main style={{alignItems: 'center'}}>
                  <div style={{width: '70%', height: '70%', margin: 'auto'}}>
                      {isDataLoading ? <Loader/> :
                           <ImageGallery items={photos} thumbnailPosition={'left'} originalHeight={'100px'} />}
                  </div>
              </main>
              <div className="right-sidebar">
                  <img onClick={() => openModal()} alt="Info" src="./icons8-info-50.png" style={{width: '24px', height: '24px'}}/><p/>
                  {/* <img onClick={() => shareHashtag()} alt="Share" src="./export-share-icon.png" width="24" height-="24"
                       style={{marginLeft: '5px'}}/>
                  */}
                  <Modal
                      isOpen={modalIsOpen}
                      style={customStyles}
                      contentLabel="About My Social Archivr"
                  >
                      <div style={{fontWeight: 900, fontSize:'20px', textAlign: 'center', marginBottom: '20px'}}><img alt='.' src={'./black-cat.png'} width={'20px'} height={'20px'}/>&nbsp;My Social Archivr</div>
                      <div>A viewer for archived Social Media</div>
                      <div style={{textAlign: 'center', marginTop: '5px'}}>© Bronze Giant LLC 2024</div>
                      <div style={{marginTop: '30px', display: 'flex', alignItems:'center', justifyContent: 'center'}}><button onClick={closeModal}>Close</button></div>
                  </Modal>
              </div>
              <footer style={{textAlign: 'right'}}>© 2024, Bronze Giant LLC</footer>
          </div>
      </div>
  );
}

export default App;
