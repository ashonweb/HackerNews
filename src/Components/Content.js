import React from 'react';
import '../App.css';
import arrow from '../arrow1.png';
import { withRouter } from 'react-router-dom';
import Divider from '@material-ui/core/Divider';
import { LineChart, ResponsiveContainer, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, } from 'recharts';

class Content extends React.Component {
    constructor(props) {
        super(props);
        var href = window.location.href;
        let lastpath = (href.match(/([^\/]*)\/*$/)[1]);

       const storyUpdates = JSON.parse(localStorage.getItem('storyUpdates')) || {};
       this.state = {
            search_by_date_front: [],
            page: 0,
            upvote: 0,
            storyUpdates,
        }
    }
    async componentDidMount() {        
        var href = window.location.href;
        let lastpath = (href.match(/([^\/]*)\/*$/)[1]);
        console.log("component did mount else coditon")
        await fetch('http://hn.algolia.com/api/v1/search_by_date?tags=story&numericFilters=num_comments>2&page=' + lastpath)
            .then(data => data.json())
            .then(data => {
                const { hits } = data
                this.setState({
                    search_by_date_front: hits
                })
            })
            .catch((err) => {
                console.log(err);
                alert("something went wrong please try later")

            })
       
    }
    onNextPage = () => {
        var href = window.location.href;
        let lastpath = (href.match(/([^\/]*)\/*$/)[1]);
        const { page } = this.state
        console.log(lastpath)
        if (lastpath === '#') {
            localStorage.setItem('pageno', JSON.stringify(
                0
            ))
        }
        let pagenumberfromlocalstorae = JSON.parse(localStorage.getItem('pageno'))
        console.log(pagenumberfromlocalstorae)
        this.setState({
            page: pagenumberfromlocalstorae + 1,
        }, () => {
            console.log(this.state.page)
            this.props.history.push('/Next/page/' + this.state.page)
            this.api()
            localStorage.setItem('pageno', JSON.stringify(
                this.state.page
            ))
        })
    }
    onPrevPage = () => {
        const { page } = this.state
        console.log(page)
        let pagenumberfromlocalstorae = JSON.parse(localStorage.getItem('pageno'))
        console.log(pagenumberfromlocalstorae)
        if (pagenumberfromlocalstorae === 0) {
            this.props.history.push('/')
            alert("Can't go previous as this is the home page")

        }
        else {
            this.setState({
                page: pagenumberfromlocalstorae - 1,
            }, () => {
                console.log(page)
                this.props.history.push('/Previous/page/' + this.state.page)
                this.api();
                localStorage.setItem('pageno', JSON.stringify(
                    this.state.page
                ))

            })
        }

    }
    api = () => {
        var href = window.location.href;
        let lastpath = (href.match(/([^\/]*)\/*$/)[1]);
        var savedata_lastpath = localStorage.getItem('saveddata' + lastpath) ? JSON.parse(localStorage.getItem(`saveddata` + lastpath)) : [];
        fetch('http://hn.algolia.com/api/v1/search_by_date?tags=story&numericFilters=num_comments>2&page=' + lastpath)
            .then(data => data.json())
            .then(data => {
                console.log(data)
                const { hits } = data
                console.log(hits, 'apifunction');
                this.setState({
                    search_by_date_front: hits
                }, () => {
                    localStorage.setItem('saveddata' + lastpath, JSON.stringify(
                        this.state.search_by_date_front
                    ))
                })
            })
            .catch((err) => {
                console.log(err);
                alert("something went wrong please try again")

            })
    }
    timeSince = (date) => {
        var seconds = Math.floor((new Date() - date) / 1000);
        var interval = Math.floor(seconds / 31536000);
        if (interval > 1) {
            return interval + " years";
        }
        interval = Math.floor(seconds / 2592000);
        if (interval > 1) {
            return interval + " months";
        }
        interval = Math.floor(seconds / 86400);
        if (interval > 1) {
            return interval + " days";
        }
        interval = Math.floor(seconds / 3600);
        if (interval > 1) {
            return interval + " hours";
        }
        interval = Math.floor(seconds / 60);
        if (interval > 1) {
            return interval + " minutes";
        }
        return Math.floor(seconds) + " seconds";
    }

    hideshow = (objectid) => {

        const search_by_date_front_slice = this.state.search_by_date_front.slice();
        const search_by_date_front_slice_now = search_by_date_front_slice.find((q) => q.objectID === objectid);
        
        const { storyUpdates } = this.state;
        if (storyUpdates[objectid]) {
            storyUpdates[objectid].hidden = true;
        } else {
            storyUpdates[objectid] = {
                ...search_by_date_front_slice_now,
                hidden: true,
            }
        }
        this.setState({
            storyUpdates: {...storyUpdates},
        });
        localStorage.setItem('storyUpdates', JSON.stringify(storyUpdates));


    }
    handleupVote = (id) => {
        const search_by_date_front_slice = this.state.search_by_date_front.slice();
        const search_by_date_front_slice_now = search_by_date_front_slice.find((q) => q.objectID === id);

        const { storyUpdates } = this.state;
        if (storyUpdates[id]) {
            storyUpdates[id].points = storyUpdates[id].points + 1;
        } else {
            storyUpdates[id] = {
                ...search_by_date_front_slice_now,
                points: search_by_date_front_slice_now.points + 1,
            }
        }
        this.setState({
            storyUpdates: {...storyUpdates},
        });
        localStorage.setItem('storyUpdates', JSON.stringify(storyUpdates));

    }


    render() {
        
        const { search_by_date_front, storyUpdates } = this.state
        let b = ((this.state.search_by_date_front).length !== 0);
        // var aDay = 24 * 60 * 60 * 1000;
        //   console.log(this.timeSince(new Date(Date.now()-aDay)));
        //   console.log(this.timeSince(new Date(Date.now()-aDay*2)));
        var href = window.location.href;
        let lastpath = (href.match(/([^\/]*)\/*$/)[1]);
        let processedStories = search_by_date_front.slice();
        processedStories = processedStories.map((story) => {
            if(storyUpdates[story.objectID]) {
                return storyUpdates[story.objectID];
            }
            return story;
        });

        const graphData = processedStories.filter((story) => !story.hidden);
       
        return (
            <>
                {b ? <div style={{overflowX:"auto"}}>
                    <table aria-label="simple table">
                        <tr style={{ background: "#f76600", color: "white", fontSize: 'x-small' }}>
                            <th>comments</th>
                            <th >vote Count</th>
                            <th >upvote</th>
                            <th >New Details</th>
                        </tr>
                        {processedStories.map((value, i) => {
                            if (value.hidden) {
                                return null;
                            }
                            return (
                            <>
                                <tr key={i}>

                                    <td  >
                                        {(value.num_comments)}
                                    </td>
                                    <td className={"value" + ((value.points >= 50 && value.points < 80 ? "show" : "") || ((value.points >= 60 && value.points < 100 ? "more" : "")) || ((value.points >= 100 ? "evenmore" : "")))}>
                                        {value.points}
                                    </td>
                                    <td style={{ color: "grey", fontSize: "10px" }} >
                                        <img style={{ width: "20px", height: "20px", cursor: "pointer" }} onClick={() => this.handleupVote(value.objectID)} src={arrow} alt="no arrow" />
                                    </td>
                                    <td className="title_url_author"  >
                                        {value.title} <span><a style={{ color: "grey", fontSize: "10px" }} href={value.url}>{value.url}</a></span> <span style={{ color: "grey", fontSize: "10px" }}>by</span> <span style={{ color: "black", fontSize: "10px" }}>{value.author}</span> <span style={{ color: "grey", fontSize: "10px" }}>{this.timeSince(Date.parse(value.created_at))} ago </span> <span onClick={() => this.hideshow(value.objectID)} style={{ cursor: "pointer", color: "black", fontSize: "10px" }}>[hide]</span>
                                    </td>

                                </tr>
                            </>
                        )})
                        }
                    </table>
                </div> :  <div style={{height:"150%"}}>  LOADING...... </div>
                }
                <div className="buttons">
                    <button onClick={this.onPrevPage} className="next"><strong style={{ fontSize: "smaller" }}>Previous</strong>

                    </button>
                    <Divider orientation="vertical" flexItem />
                    <button onClick={this.onNextPage} className="prev"><strong style={{ fontSize: "smaller" }}>Next</strong>

                    </button>
                </div>
                <Divider style={{ background: "#ff7412", height: "2px" }} />
                <>
                    {/* <ResponsiveContainer width="99%">
                        <LineChart width={1000} height={250} data={this.state.search_by_date_front}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="objectID" label={{ angle: 0, value: 'News ID', position: 'insideBottom', textAnchor: 'middle' }}>
                            </XAxis>
                            <YAxis dataKey="points" label={{ value: 'upVotes', angle: -90, position: 'insideLeft', textAnchor: 'middle' }} />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="points" stroke="#8884d8" />
                            <Line type="monotone" dataKey="objectID" stroke="#82ca9d" />
                        </LineChart>


                    </ResponsiveContainer> */}
                    <ResponsiveContainer className="graph" width="100%" height={300}>

                        <LineChart data={graphData}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="objectID" />
                            <YAxis dataKey="points" label={{ value: 'upVotes === points', angle: -90, position: 'insideBottomLeft', textAnchor: 'middle' }} />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="points" stroke="#8884d8" />
                            <Line type="monotone" dataKey="objectID" stroke="#82ca9d" />
                        </LineChart>
                    </ResponsiveContainer>
                    <Divider style={{ background: "#ff7412", height: "3px" }} />
                </>

            </>
        )
    }
}

export default withRouter(Content)