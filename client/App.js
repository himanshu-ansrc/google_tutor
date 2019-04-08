import React, {Component} from 'react'
import {BrowserRouter} from 'react-router-dom'
import reduxThunk from 'redux-thunk'
import {Provider} from 'react-redux'
import {createStore, applyMiddleware} from 'redux'
import MainRouter from './MainRouter'

import reducers from './components/reducers'
import './assets/main.css'

class App extends Component{
      render(){
      	 return(
      	 	<BrowserRouter>
            <Provider store={applyMiddleware(reduxThunk)(createStore)(reducers)}>
                 <MainRouter/>
            </Provider>
            </BrowserRouter>
      	 )
      }
}

export default App;