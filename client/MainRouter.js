import React, {Component, Fragment} from 'react'
import {Switch, Route} from 'react-router-dom'

import Home from './components/Home'


class MainRouter extends Component{
	  render(){
	  	  return(
             <Fragment>
               <Switch>
               	   <Route exact path="/" component={Home}/>
               </Switch>
             </Fragment>
	  	  )
	  }
}

export default MainRouter;