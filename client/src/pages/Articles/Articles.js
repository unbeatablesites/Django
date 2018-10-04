import React, { Component } from "react";
import API from "../../utils/API";
import { Article } from '../../components/Article'
import Jumbotron from "../../components/Jumbotron";
import { H1, H3, H4 } from '../../components/Headings';
import { Container, Row, Col } from "../../components/Grid";
import { Panel, PanelHeading, PanelBody } from '../../components/Panel';
import { Form, Input, FormBtn, FormGroup, Label } from "../../components/Form";


export default class Articles extends Component {
  state = {
    topic: '',//main search term
    sYear: '',//start year for search
    eYear: '',//end year for search
    page: '0',//page of search results
    results: [],//array of results returned from api
    previousSearch: {},//previous search term saved after search completed
    noResults: false,//boolean used as flag for conditional rendering
  };


  //function to save an article
  saveArticle = (article) => {
    //creating new article object
    let newArticle = {
      date: article.pub_date,
      title: article.headline.main,
      url: article.web_url,
      summary: article.snippet
    }

    //calling the API
    API
      .saveArticle(newArticle)
      .then(results => {
        //removing the saved article from the results in state
        let unsavedArticles = this.state.results.filter(article => article.headline.main !== newArticle.title)
        this.setState({results: unsavedArticles})
      })
      .catch(err => console.log(err));
  }

  //capturing state of inputs on change
  handleInputChange = event => {
    let { name, value } = event.target;
    this.setState({[name] : value})
  };

  //generating the query for the search from store state
  handleFormSubmit = event => {
    event.preventDefault();
    let { topic, sYear, eYear } = this.state;
    let query = { topic, sYear, eYear }
    this.getArticles(query)

  };

  //function that queries the NYT API
  getArticles = query => {
    //clearing the results array if the user changes search terms
    if (query.topic !== this.state.previousSearch.topic ||
        query.eYear !==this.state.previousSearch.eYear ||
        query.sYear !==this.state.previousSearch.sYear) {
      this.setState({results: []})
    }
    let { topic, sYear, eYear } = query

    let queryUrl = `https://api.nytimes.com/svc/search/v2/articlesearch.json?sort=newest&page=${this.state.page}`
    let key = `&api-key=a9257b04f6e84033a42b8bdedbdd3b2a`

    //removing spaces and building the query url conditionally
    //based on presence of optional search terms
    if(topic.indexOf(' ')>=0){
      topic = topic.replace(/\s/g, '+');
    }
    if (topic){
      queryUrl+= `&fq=${topic}`
    }
    if(sYear){
      queryUrl+= `&begin_date=${sYear}`
    }
    if(eYear){
      queryUrl+= `&end_date=${eYear}`
    }
    queryUrl+=key;

    //calling the API
    API
      .queryNYT(queryUrl)
      .then(results => {
          //concatenating new results to the current state of results.  If empty will just show results,
          //but if search was done to get more, it shows all results.  Also stores current search terms
          //for conditional above, and sets the noResults flag for conditional rendering of components below
          this.setState({
            results: [...this.state.results, ...results.data.response.docs],
            previousSearch: query,
            topic: '',
            sYear: '',
            eYear: ''
          }, function (){
            this.state.results.length === 0 ? this.setState({noResults: true}) : this.setState({noResults: false})
          });
      })
      .catch(err=> console.log(err))
  }

  //function that is called when user clicks the get more results button
  getMoreResults = () => {
    let { topic, eYear, sYear} = this.state.previousSearch;
    let query = { topic, eYear, sYear }
    //increments page number for search and then runs query
    let page = this.state.page;
    page++
    this.setState({page: page}, function (){
      this.getArticles(query)
    });
  }

  render() {
    return (
      <Container fluid>
        <Row>
          <Col size="sm-10" offset='sm-1'>
            <Jumbotron>
              <H1 className='page-header text-center'>Search for NYT Articles</H1>
              <H4 className='text-center'>Save articles you find interesting</H4>
            </Jumbotron>
            <Panel>
              <PanelHeading>
                <H3>Search</H3>
              </PanelHeading>
              <PanelBody>
                <Form style={{marginBottom: '30px'}}>
                  <FormGroup>
                    <Label htmlFor="topic">Enter a topic to search for:</Label>
                    <Input
                      onChange={this.handleInputChange}
                      name='topic'
                      value={this.state.topic}
                      placeholder='Topic'
                    />
                  </FormGroup>
                  <FormGroup >
                    <Label htmlFor="sYear">Enter a beginning date to search htmlFor (optional):</Label>
                    <Input
                      onChange={this.handleInputChange}
                      type='date'
                      name='sYear'
                      value={this.state.sYear}
                      placeholder='Start Year'
                    />
                  </FormGroup>
                  <FormGroup >
                    <Label htmlFor="eYear">Enter an end date to search for (optional):</Label>
                    <Input
                      onChange={this.handleInputChange}
                      type='date'
                      name='eYear'
                      value={this.state.eYear}
                      placeholder='End Year'
                    />
                  </FormGroup>
                  <FormBtn
                    disabled={!(this.state.topic)}
                    onClick={this.handleFormSubmit}
                    type='info'
                    >Submit
                  </FormBtn>
                </Form>
              </PanelBody>
            </Panel>
            { this.state.noResults ?
              (<H1>No results Found.  Please try again</H1>) :
              this.state.results.length>0 ? (
                <Panel>
                  <PanelHeading>
                    <H3>Results</H3>
                  </PanelHeading>
                  <PanelBody>
                    {
                      this.state.results.map((article, i) => (
                          <Article
                            key={i}
                            title={article.headline.main}
                            url={article.web_url}
                            summary={article.snippet}
                            date={article.pub_date}
                            type='Save'
                            onClick={() => this.saveArticle(article)}
                          />
                        )
                      )
                    }
                      <FormBtn type='warning' additional='btn-block' onClick={this.getMoreResults}>Get more results</FormBtn>
                  </PanelBody>
                </Panel>
              ) : ''
            }
          </Col>
        </Row>
      </Container>
    );
  }
}
