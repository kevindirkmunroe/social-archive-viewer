import './App.css';
import axios from 'axios';
import {useEffect, useState, useCallback} from "react";
import Gallery from "react-photo-gallery";
import Carousel, { Modal, ModalGateway } from "react-images";


function App() {

    const queryParameters = new URLSearchParams(window.location.search)
    const username = queryParameters.get("user");
    const userId = queryParameters.get("userId");

    const singularOrPlural = (resultSize) => {
        return resultSize === 1? 'Hashtag' : 'Hashtags'
    }

    const [postsData, setPostsData] = useState([]);
    useEffect(() => {
        setPostsData(postsData);
    }, [postsData])

    const [selectedHashtag, setSelectedHashtag] = useState('');
    useEffect(() => {
        setSelectedHashtag(selectedHashtag);
    }, [selectedHashtag])

    const [viewerIsOpen, setViewerIsOpen] = useState(false);
    const [currentImage, setCurrentImage] = useState(0);

    const [hashtags, setHashtags] = useState([]);

    const closeLightbox = () => {
        setCurrentImage(0);
        setViewerIsOpen(false);
    };

    function showFacebookData(item){
        const hashtag = item.target.innerHTML.substring(1);
        setSelectedHashtag(hashtag);

        console.log(`[SocialArchiveViewer] showing ${hashtag}`);
        const newPostsData = [];
        try {
            axios.get(`http://localhost:3001/social-archive/facebook/posts?userId=${userId}&hashtag=${hashtag}`
            )
                .then(res => {
                    res.data.forEach((doc) => {
                        const imageId = doc.id;
                        newPostsData.push({image: `https://s3.us-west-1.amazonaws.com/bronze-giant-social-archive/${imageId}.jpg`, caption: doc.message});
                    });
                    setPostsData(newPostsData);
                    console.log(`setting postsdata ${newPostsData}`);
                })
                .catch((error) => {
                    console.log(`ARCHIVE ERROR: ${JSON.stringify(error)}`);
                });
        }catch(error){
            console.log(`fetch ERROR: ${JSON.stringify(error)}`);
        }
    }

    function shareHashtag(){
        window.open(`mailto:myfriend@example.com?subject=Check out these awesome pics from ${username}'s My Social Archive Gallery!&body=http://localhost:3002`);
    }

  if(hashtags.length === 0) {
      try {
          axios.get(`http://localhost:3001/social-archive/facebook/hashtags`
          ).then(res => {
              console.log(`[SocialArchiveViewer] set hashtags: ${res.data}`);
              setHashtags(res.data);
          });
      } catch (err) {
          console.log(`[SocialArchiveViewer] error retrieving hashtags: ${err}`);
      }
  }

    const photos = [
    ];
    postsData.forEach(post => {
        console.log(`caption: ${post.caption}`);
       photos.push({src: post.image, width: 100, height: 100, caption: post.caption})
    });

    const openLightbox = useCallback((event, { photo, index }) => {
        setCurrentImage(index);
        setViewerIsOpen(true);
    }, []);


  return (
    <div className="App">
        <div style={{margin : 10, fontStyle: 'bold', color: 'green', float: 'left'}}>
        <table><tbody><tr><td><img src={'./storage_black_24dp.svg'}/></td><td><h4>My Social Archive Gallery</h4></td></tr></tbody></table>
      </div>
        <hr width="98%" color="green" size="1px" />
        <div className="table-container">
            <table className="table table-hover" style={{tableLayout: 'fixed', textAlign: 'left', width: '12%', height: '20px', borderRight: 'none', borderLeft: 'none', borderCollapse: 'collapse', marginBottom: '20px', overflow: 'hidden' }}>
                <tbody>
                <tr>
                    <td colSpan={4}>
                        <div style={{textAlign: 'left', height: '20px', fontSize: '22px', marginBottom: '10px'}}>{username}</div>
                    </td>
                </tr>
                <tr>
                    <td colSpan={5}>
                        <div style={{textAlign: 'left'}}>{hashtags.length} Archived {singularOrPlural(hashtags.length)}  <img onClick={(item) => shareHashtag()} alt="Share" src="./export-share-icon.png" width="16" height="16" style={{marginLeft: '5px'}} /></div>
                    </td>
                </tr>
                <tr><td colSpan={4}><hr/></td></tr>
                {hashtags ? hashtags.length > 0 && hashtags.map((item) => <tr onClick={(item) => showFacebookData(item)}><td style={{textAlign: 'left', width: '25px', height: '25px'}} key={item}><img alt="Facebook" src="./facebook-16x16-icon.png" width="16" height="16" style={{marginRight: '10px'}} /></td><td>#{item}</td></tr>) : <tr><td>No Data</td></tr>}
                </tbody>
            </table>
            <table className="table" style={{width: '90%', marginLeft: '20px', backgroundColor: '#ECECEC', borderRadius: '10px'}}>
                <div style={{textAlign: 'left', marginLeft: '20px', marginTop: '20px', height: '40px'}}>{username} > #{selectedHashtag}</div>
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
        </div>

    </div>
  );
}

export default App;
