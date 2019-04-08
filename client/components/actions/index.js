import {AUTH_USER, ADD_USER, LOGIN_USER, LOGOUT_USER} from './types'
import CONFIG from '../../../config'
import axios from 'axios'

export const authUser = ()=>{
          return async (dispatch)=>{
                 const token = localStorage.getItem(CONFIG.ACCESS_TOKEN);
                 let err = null, result = null;
                 if(token){
                     try{
                        let {data} = await axios.post(`${CONFIG.API_URL}/api/validate`, {}, {
                            headers:{
                                [CONFIG.ACCESS_TOKEN] : token
                            }
                        });
                        result = data;
                     }catch(e){
                         err = e.response.data.error
                     }
                 }
                 dispatch({
                     type: AUTH_USER,
                     payload: result
                 })
          }    
} 

export const loginUser = ({email, password}, cb)=>{
          return async (dispatch)=>{
                 let err = null, result = null;
                 try{
                     let {data} = await axios.post(`${CONFIG.API_URL}/api/login`, {email, password});
                         result = {user : data.data, token: data.token}; 
                 }catch(e){
                     err = e.response.data.error;
                 }
                 dispatch({
                     type: LOGIN_USER,
                     payload: result
                 })
                 cb(err)
          }
}


export const addUser = ({usrname, email, password}, cb)=>{
        return async (dispatch)=>{
                 let err = null, result = null;
                 try{
                     let {data} = await axios.post(`${CONFIG.API_URL}/api/users`, {name: usrname, email, password});
                         result = {user : data.data, token: data.token}; 
                 }catch(e){
                     err = e.response.data.error;
                 }
                 dispatch({
                     type: ADD_USER,
                     payload: result
                 })
                 cb(err);
        }
} 

export const logoutUser = ()=>{
          return (dispatch)=>{
                 localStorage.removeItem(CONFIG.ACCESS_TOKEN);
                 dispatch({
                     type: LOGOUT_USER,
                     payload: null
                 })
          }
}



