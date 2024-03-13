import './App.css';
import axios from 'axios';
import {useEffect, useState, useCallback} from "react";
import Gallery from "react-photo-gallery";
import Carousel, { Modal, ModalGateway } from "react-images";
function App() {

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

    try {
        axios.get(`http://localhost:3001/social-archive/facebook/shareable-hashtag-details?id=${shareableId}`
        )
            .then(res => {
                console.log(`[SocialArchiveViewer] got result for shareableId ${shareableId}: ${JSON.stringify(res.data)}`);

                setUsername(res.data[0].sharedHashtag.userName);
                setUserId(res.data[0].sharedHashtag.userId);
                setViewHashtag(res.data[0].sharedHashtag.hashtag);

                showFacebookDataFromRequest();
            })
            .catch((error) => {
                console.log(`[SocialArchiveViewer] ARCHIVE ERROR: ${JSON.stringify(error)}`);
            });
    }catch(error){
        console.log(`[SocialArchiveViewer] fetch ERROR: ${JSON.stringify(error)}`);
    }

    const [postsData, setPostsData] = useState([]);
    useEffect(() => {
        setPostsData(postsData);
    }, [postsData])

    const [viewerIsOpen, setViewerIsOpen] = useState(false);
    const [currentImage, setCurrentImage] = useState(0);

    const closeLightbox = () => {
        setCurrentImage(0);
        setViewerIsOpen(false);
    };

    function showFacebookDataFromRequest(){
        console.log(`[SocialArchiveViewer] showing ${viewHashtag}`);
        const newPostsData = [];
        try {
            axios.get(`http://localhost:3001/social-archive/facebook/posts?userId=${userId}&hashtag=${viewHashtag}`
            )
                .then(res => {
                    res.data.forEach((doc) => {
                        const imageId = doc.id;
                        newPostsData.push({image: `https://s3.us-west-1.amazonaws.com/bronze-giant-social-archive/${imageId}.jpg`, caption: doc.message});
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

    // Load only once, as dictated by the empty array
    useEffect(() => {
        showFacebookDataFromRequest();
    }, []);

    const encodeSpaces = (string) => {
        return string.replaceAll(' ', '%25%32%30');
    }

    function shareHashtag(){
        window.open(`mailto:myfriend@example.com?subject=Check out these awesome pics from ${username}'s My Social Archivr Gallery!&body=Enjoy!%0A%0A%2D%2DThe My Social Archive Team%0A%0AClick Here: http://localhost:3002?userId=${userId}%26user=${encodeSpaces(username)}%26hashtag=${encodeURIComponent(viewHashtag)}`);
    }

    const photos = [
    ];
    postsData.forEach(post => {
        console.log(`caption: ${post.caption}`);
       photos.push({src: post.image, width: 4, height: 3, caption: post.caption})
    });

    const openLightbox = useCallback((event, { photo, index }) => {
        setCurrentImage(index);
        setViewerIsOpen(true);
    }, []);

  return (
    <div className="App">
        <div style={{margin : 10, fontStyle: 'bold', color: 'green', float: 'left'}}>
        <table><tbody><tr><td><img src={'./black-cat.png'} width={'20px'} height={'20px'}/></td><td><h4>&nbsp;My Social Archivr</h4></td></tr></tbody></table>
      </div>
        <hr width="98%" color="green" size="1px" />
        <div className="parent">
            <header>
                <div style={{textAlign: 'left', marginLeft: '20px', marginTop: '3px', height: '40px', fontWeight: 900}}>{username} > #{viewHashtag}</div>
            </header>
            <section className="left-sidebar"></section>
            <main>
                <table className="table" style={{width: '90%', marginLeft: '20px', backgroundColor: '#ECECEC', borderRadius: '10px'}}>

                    <Gallery photos={photos} onClick={openLightbox} />
                    <ModalGateway>
                        {viewerIsOpen ? (
                            <Modal onClose={closeLightbox}>
                                <Carousel
                                    currentIndex={currentImage}
                                    views={photos.map(x => ({
                                        ...x,
                                        srcset: x.srcSet,
                                        caption: x.caption,
                                    }))}
                                />
                            </Modal>
                        ) : null}
                    </ModalGateway>
                </table>
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
