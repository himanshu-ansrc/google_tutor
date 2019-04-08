import {AUTH_USER, ADD_USER, LOGIN_USER, LOGOUT_USER} from '../actions/types'

// export const authReducer = (state=false, action)=>{
// 	   switch(action.type){
// 	   	 case AUTH_USER:
// 	   	  return action.payload;
//          break;
// 	   	 default: 
// 	   	  return state;
// 	   }
// } 

export const loginReducer = (state=null, action)=>{
		switch(action.type){
	   	   case LOGIN_USER:
	   	     return action.payload;
	   	   case AUTH_USER:
	   	     return action.payload;
            break;
           case LOGOUT_USER:
	   	     return action.payload;
           case ADD_USER:
	   	     return action.payload;
            break;
	   	   default: 
	   	    return state;
	    }
} 
