import React from 'react';
import '../App.css';
import arrow from '../arrow1.png'
import Divider from '@material-ui/core/Divider';
import { LineChart, ReferenceLine, Line, CartesianGrid, XAxis, YAxis, Tooltip, Bar, BarChart, Legend, Label, Area, AreaChart, } from 'recharts';
const data = [
    {
        "name": "Page A",
        "uv": 4000,
        "pv": 2400,
        "amt": 2400
    },
    {
        "name": "Page B",
        "uv": 3000,
        "pv": 1398,
        "amt": 2210
    },
    {
        "name": "Page C",
        "uv": 2000,
        "pv": 9800,
        "amt": 2290
    },
    {
        "name": "Page D",
        "uv": 2780,
        "pv": 3908,
        "amt": 2000
    },
    {
        "name": "Page E",
        "uv": 1890,
        "pv": 4800,
        "amt": 2181
    },
    {
        "name": "Page F",
        "uv": 2390,
        "pv": 3800,
        "amt": 2500
    },
    {
        "name": "Page G",
        "uv": 3490,
        "pv": 4300,
        "amt": 2100
    }
]


class Content extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            search_by_date_front: [],
            page: undefined,
            startindex: 0,
            endindex: 20,
            search_by_date_story:[],
        }
    }
    async componentDidMount() {
        await fetch('http://hn.algolia.com/api/v1/search_by_date?tags=front_page&numericFilters=num_comments>2')
        // await fetch('http://hn.algolia.com/api/v1/search_by_date?tags=front_page&numericFilters=num_comments>2&page=' + this.state.page)


            // fetch('http://hn.algolia.com/api/v1/search_by_date?tags=story&numericFilters=num_comments>2')
            //  fetch('http://hn.algolia.com/api/v1/items/1',{

            // })
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
            console.log("Can’t access " + " response. Blocked by browser?", err);
            
        })
    }
    onNextPage = () =>{
        const{page} = this.state
        if(page === undefined){
        this.setState({
            page:0,
        },()=>{
            this.api()
            console.log(this.state.page,"ppoopo")
        })
        }
        else{
            this.setState(prevState => {
                return {
                  page: prevState.page + 1
                }
              },()=>{
                this.api()

                  console.log(this.state.page,"else")
              })
        }
    //     if(this.state.page === 0){
            
    //              this.api()
    //             this.setState({
    //                 page:page+1,
    //             },()=>{
    //                 console.log(this.state.page,"if")

    //             })
           
    //     }
    //     else{

    //         this.setState(prevState => {
    //             return {
    //               page: prevState.page + 1
    //             }
    //           },()=>{
    //             this.api()

    //               console.log(this.state.page,"else")
    //           })
    // }
}
    onPrevPage = ()=>{
        const{page} = this.state
        
        console.log(this.state.page,"drtyuikjhgf")
        this.setState(prevState => {
            return {
              page: prevState.page - 1
            }
          },()=>{
                 console.log(this.state.page,"prev")
                  this.api();


          })

        // if(this.state.page !== 0){
        //     this.setState({
        //         page:page-1,
        //     },()=>{
        //         console.log(this.state.page,"prev")
        //         this.api();
        //     })
          
       
    
    // else{
    //     this.setState({
    //         page:page+1,
    //     })
    //     console.log(this.state.page,"else condition")
    //     this.api();
       
    // }
    }
    api=()=>{
         fetch('http://hn.algolia.com/api/v1/search_by_date?tags=story&numericFilters=num_comments>2&page=' + this.state.page)

            // fetch('http://hn.algolia.com/api/v1/search_by_date?tags=story&numericFilters=num_comments>2')
            //  fetch('http://hn.algolia.com/api/v1/items/1',{

            // })
        .then(data => data.json())
        .then(data => {
            console.log(data)
            const { hits } = data
            console.log(hits);
            this.setState({
                search_by_date_story: hits
            })
        })
        .catch((err) => {
            console.log("Can’t access " + " response. Blocked by browser?", err);
            
        })
    }
    render() {
        const { search_by_date_story,search_by_date_front } = this.state
        let b = ((this.state.search_by_date_front).length !== 0);

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

                            <tr key={i}>

                                <td scomponent="th" scope="row">
                                    {(value.num_comments)}
                                </td>
                                <td style={{
                                    color: value.points <= 60 ? 'black' : 'blue'
                                }} component="th" scope="row">
                                    {value.points}
                                </td>
                                <td style={{ color: "grey", fontSize: "10px" }} component="th" scope="row">
                                   <img style={{width: "20px",height: "20px",cursor:"pointer"}}src ={arrow} />
                                </td>
                                <td className="title_url_author" component="th" scope="row">
                                    {value.title} <span><a style={{ color: "grey", fontSize: "10px" }} href={value.url}>{value.url}</a></span>  <span style={{ color: "black", fontSize: "10px" }}>{value.author}</span>
                                </td>

                            </tr>

                        ))
                        }


                    </table>
                </> : <> </>
                }
                <div className="buttons">
                <button onClick={this.onPrevPage} className="next"><strong  style={{fontSize:"smaller"}}>Previous</strong>

                </button>       
                <Divider orientation="vertical" flexItem />
                <button onClick={this.onNextPage} className="prev"><strong style={{fontSize:"smaller"}}>Next</strong>

                </button>
                </div>
                <>
                    <AreaChart width={730} height={250} data={data}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <XAxis dataKey="name" />
                        <YAxis />
                        <CartesianGrid strokeDasharray="3 3" />
                        <Tooltip />
                        <Area type="monotone" dataKey="pv" stroke="#82ca9d" fillOpacity={1} fill="url(#colorPv)" />
                    </AreaChart>
                </>
            </>
        )
    }
}

export default Content