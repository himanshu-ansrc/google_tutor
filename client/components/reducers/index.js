import {combineReducers} from 'redux'
import {authReducer, loginReducer} from './reducers'

export default combineReducers({
	  auth: loginReducer,
})