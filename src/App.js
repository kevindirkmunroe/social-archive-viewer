import StorageIcon from '@mui/icons-material/Storage';
import './App.css';
import axios from 'axios';
import {useEffect, useState} from "react";


function App() {

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

    const [hashtags, setHashtags] = useState([]);

    function showFacebookData(item){
        const hashtag = item.target.innerHTML.substring(1);
        setSelectedHashtag(hashtag);

        console.log(`[SocialArchiveViewer] showing ${hashtag}`);
        const newPostsData = [];
        const userId = '10160143112298789';
        try {
            axios.get(`http://localhost:3001/social-archive/facebook/posts?userId=${userId}&hashtag=${hashtag}`
            )
                .then(res => {
                    res.data.forEach((doc) => {
                        const imageId = doc.id;
                        newPostsData.push(`https://s3.us-west-1.amazonaws.com/bronze-giant-social-archive/${imageId}.jpg`);
                    });
                    setPostsData(newPostsData);
                })
                .catch((error) => {
                    console.log(`ARCHIVE ERROR: ${JSON.stringify(error)}`);
                });
        }catch(error){
            console.log(`fetch ERROR: ${JSON.stringify(error)}`);
        }
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

  return (
    <div className="App">
        <div style={{margin : 10, fontStyle: 'bold', color: 'green', float: 'left'}}>
        <table><tbody><tr><td><StorageIcon/></td><td><h4>My Social Archive</h4></td></tr></tbody></table>
      </div>
        <hr width="98%" color="green" size="1px" />
        <h4 style={{marginLeft: '20px', textAlign: 'left'}}>{hashtags.length} Archived {singularOrPlural(hashtags.length)}</h4>
        <table className="table table-hover" style={{marginLeft: '25px', textAlign: 'left', width: '95%', border: '1px solid black', borderLeft: 'none', borderRight: 'none', borderCollapse: 'collapse', marginBottom: '20px' }}>
            <tbody>
            {hashtags ? hashtags.length > 0 && hashtags.map((item) => <tr onClick={(item) => showFacebookData(item)}><td style={{textAlign: 'left', width: '25px', height: '25px'}} key={item}><img alt="Facebook" src="./facebook-16x16-icon.png" width="16" height="16" style={{marginRight: '10px'}} /></td><td>#{item}</td></tr>) : <tr><td>No Data</td></tr>}
            </tbody>
        </table>
        <h4 style={{textAlign: 'left', marginLeft: '20px', color: 'green'}}>"#{selectedHashtag}"</h4>
        {
            JSON.stringify(postsData)
        }
    </div>
  );
}

export default App;
