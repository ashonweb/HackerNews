import React from 'react';
import '../App.css';
import arrow from '../arrow1.png';
import { withRouter } from 'react-router-dom';
import Divider from '@material-ui/core/Divider';
import { LineChart, ResponsiveContainer, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, } from 'recharts';

class Content extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            search_by_date_front: [],
            page: 0,
            upvote: 0,
            hide: false,

        }
    }
    async componentDidMount() {
        var href = window.location.href;
        // console.log(href, "href")
        // console.log(href.match(/([^\/]*)\/*$/)[1], "rtyupoxcvbnl");
        let lastpath = (href.match(/([^\/]*)\/*$/)[1]);
        //  console.log(('http://hn.algolia.com/api/v1/search_by_date?tags=front_page&numericFilters=num_comments>2&page=' + lastpath))
        var ios = localStorage.getItem('saveddata' + lastpath) ? JSON.parse(localStorage.getItem(`saveddata` + lastpath)) : [];
        if (ios.length !== 0) {
            console.log(ios)
            console.log("if constion")
            this.setState({
                search_by_date_front: ios
            }, () => {
                // console.log(this.state.search_by_date_front)
            })
        }
        else {
            console.log("component did mount else coditon")
            await fetch('http://hn.algolia.com/api/v1/search_by_date?tags=story&numericFilters=num_comments>2')
                .then(data => data.json())
                .then(data => {
                    console.log(data)
                    const { hits } = data
                    // console.log(hits);
                    this.setState({
                        search_by_date_front: hits
                    })
                })
                .catch((err) => {
                    console.log(err);
                    alert("something went wrong please try later")

                })
            localStorage.setItem('saveddata' + lastpath, JSON.stringify(
                this.state.search_by_date_front
            ))
        }
    }
    onNextPage = () => {
        const { page } = this.state
        if (page === 0) {
            this.setState({
                page: page + 1,
            }, () => {
                this.props.history.push('/Next/page/' + this.state.page)
                this.api()
                // console.log(this.state.page, "ppoopo")
            })
        }
        else {
            

            this.setState({
                page: page + 1,
            }, () => {
                this.props.history.push('/Next/page/' + this.state.page)
                this.api()
                // console.log(this.state.page, "ppoopo")
            })
        }
    }
    onPrevPage = () => {
        const { page } = this.state
        if (page === 0) {
            alert("no going further")
            this.props.history.push('/')
        }
        else {
            this.setState(prevState => {
                return {
                    page: prevState.page - 1
                }
            }, () => {
                // console.log(this.state.page, "prev")
               
                this.props.history.push('/Previous/page/' + this.state.page)
                this.api();

               
            })
        }
    }
    api = () => {
        var href = window.location.href;
        // console.log(href, "href")
        // console.log(href.match(/([^\/]*)\/*$/)[1], "rtyupoxcvbnl");
        let lastpath = (href.match(/([^\/]*)\/*$/)[1]);
        var savedata_lastpath = localStorage.getItem('saveddata' + lastpath) ? JSON.parse(localStorage.getItem(`saveddata` + lastpath)) : [];
        if (savedata_lastpath.length !== 0) {
            console.log(savedata_lastpath)
            this.setState({
                search_by_date_front: savedata_lastpath
            })
        }
        else {
            fetch('http://hn.algolia.com/api/v1/search_by_date?tags=story&numericFilters=num_comments>2&page=' + lastpath)
                .then(data => data.json())
                .then(data => {
                    // console.log(data)
                    const { hits } = data
                     console.log(hits);
                    this.setState({
                        search_by_date_front: hits
                    },()=>{
                        localStorage.setItem('saveddata' + lastpath, JSON.stringify(
                            this.state.search_by_date_front
                        ))
                    })
                })
                .catch((err) => {
                    console.log( err);
                    alert("something went wrong please try again")

                })
           
        }

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
        const search_by_date_front_slice_now = search_by_date_front_slice.filter((q) => q.objectID !== objectid);
        // console.log(currentQs,"cureentdd")
        // const charLeft = 2000 - commentslength;
        // currentQs.comments = comments;
        // currentQs.length = charLeft;
        this.setState({
            search_by_date_front: search_by_date_front_slice_now,
        }, () => {
            var href = window.location.href;
            let lastpath = (href.match(/([^\/]*)\/*$/)[1]);
            localStorage.setItem('saveddata' + lastpath, JSON.stringify(
                this.state.search_by_date_front
            ))
        })


    }
    handleupVote = (id) => {
        // console.log(id)
        //   const search_by_date_front_slice = this.state.search_by_date_front.slice();
        //   const search_by_date_front_slice_now = search_by_date_front_slice.find((q) => q.objectID === id);
        //   console.log(search_by_date_front_slice_now)
        // //   search_by_date_front_slice_now.points = search_by_date_front_slice_now.points + 1 ;
        //      search_by_date_front_slice_now.points = search_by_date_front_slice_now.points + 1 ;
        //      var href = window.location.href;
        //      let lastpath = (href.match(/([^\/]*)\/*$/)[1]);    
        //     let a = JSON.parse(localStorage.getItem('saveddata'+lastpath))
        //     console.log(a)
        //   this.setState({
        //       upvote : search_by_date_front_slice_now.points +1,
        //   },()=>{
        //   })
        // var upvote = localStorage.getItem('upvote'+id) ? JSON.parse(localStorage.getItem('upvote'+id)) : {};
        // localStorage.setItem('upvote'+id,JSON.stringify({
        // //    upvote: search_by_date_front_slice_now.points
        // upvote: search_by_date_front_slice_now.points

        // }))
        // console.log(localStorage.getItem('upvote'+id))
        var upvote_id = localStorage.getItem('upvote' + id) ? JSON.parse(localStorage.getItem('upvote' + id)) : {}

        // console.log(localStorage.getItem('upvote'+id))
        let abc = (JSON.parse(localStorage.getItem('upvote' + id)))
        // console.log(abc)
        const search_by_date_front_slice = this.state.search_by_date_front.slice();
        const search_by_date_front_slice_now = search_by_date_front_slice.find((q) => q.objectID === id);
        //   console.log(search_by_date_front_slice_now)
        search_by_date_front_slice_now.points = search_by_date_front_slice_now.points + 1;

        this.setState({
            upvote: search_by_date_front_slice_now.points,
            search_by_date_front: search_by_date_front_slice,
        }, () => {
            //    console.log(this.state.upvote)
            localStorage.setItem('upvote' + id, JSON.stringify(
                this.state.upvote
            ))
            // console.log(this.state.upvote, "ppppppp")
            var href = window.location.href;
            let lastpath = (href.match(/([^\/]*)\/*$/)[1]);
            localStorage.setItem('saveddata' + lastpath, JSON.stringify(
                this.state.search_by_date_front
            ))

        })

    }


    render() {
        const { search_by_date_front } = this.state
        let b = ((this.state.search_by_date_front).length !== 0);
        let a = new Date();
        // console.log(a.toISOString())
        // var aDay = 24 * 60 * 60 * 1000;

        //   console.log(this.timeSince(new Date(Date.now()-aDay)));
        //   console.log(this.timeSince(new Date(Date.now()-aDay*2)));
        return (
            <>
                {b ? <>
                    <table aria-label="simple table">

                        <tr style={{ background: "#f76600", color: "white", fontSize: 'x-small' }}>
                            <th>comments</th>
                            <th >vote Count</th>
                            <th >upvote</th>
                            <th >New Details</th>
                        </tr>


                        {search_by_date_front.map((value, i) => (
                            <>
                                {this.state.hide === i ? <p>{value.title}</p> : null}
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

                        ))
                        }


                    </table>
                </> : <> </>
                }

                <div className="buttons">
                    <button onClick={this.onPrevPage} className="next"><strong style={{ fontSize: "smaller" }}>Previous</strong>

                    </button>
                    <Divider orientation="vertical" flexItem />
                    <button onClick={this.onNextPage} className="prev"><strong style={{ fontSize: "smaller" }}>Next</strong>

                    </button>
                </div>
                <Divider style={{background:"#ff7412",height:"2px"}}/>
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

                            <LineChart  data={this.state.search_by_date_front}
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
                        <Divider style={{background:"#ff7412",height:"3px"}}/>
                </>

            </>
        )
    }
}

export default withRouter(Content)