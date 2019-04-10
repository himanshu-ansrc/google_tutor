import React, {Component, Fragment} from 'react';
import axios from 'axios'

class Home extends Component{
	  keyCount = 0;
	  quesCount = 1;
	  state = {
	  	  variableBox: [],
	  	  value: 'int',
	  	  questionTypes : {
	  	  	  
	  	  },
	  	  sheetsList : [],
	  	  is_new: true
	  }
	  handleChange = (e)=>{
	  	 if(e.target.name=='work_tmp_name' &&e.target.value==''){
            this.setState({is_new: true})
	  	 }else{
	  	 	this.setState({is_new: false})
	  	 }
	  	 this.setState({value: e.target.value});
      }
      async componentDidMount(){
      	 const result = await axios.get('/list-wrksheets');
      	 let a = [];
      	 for(let x in result.data){
             a.push(<option value={x}>{x}</option>)
      	 }
      	 this.setState({sheetsList: a})
      }
	  newVariable = ()=>{
	  	 ++this.keyCount;
	  	 return (
              <Fragment key={this.keyCount}>
               <tr>
		        <td className="padding-lft-20">Name</td>
		        <td><input className="input-box" type="text" name={`paramskey_${this.keyCount}`}/></td> 
		      </tr>
		      <tr>
		        <td className="padding-lft-20">Value</td>
		        <td><input className="input-box" type="text" name={`paramsval_${this.keyCount}`}/></td>
		      </tr>
		      <tr>
		        <td className="padding-lft-20">Type</td>
		        <td>
	        	  <select className="input-box" name={`paramstyp_${this.keyCount}`} onChange={this.handleChange}>
		            <option value="int">int</option>
		            <option value="element">element</option>
		          </select>
		        </td>
		      </tr>
             </Fragment>
	     )
	  }
	  addVariable = async (e)=>{
	     e.preventDefault();
	  	 this.state['variableBox'].push(this.newVariable())
	  	 this.setState({
             variableBox : this.state['variableBox']
	  	 })
	  }
	  refreshQuestion = (e)=>{
	  	   e.preventDefault();
           let f = document.getElementById('main_form');
           for(let x in f.elements){
           	       console.log(f.elements[x].type)
           	       if(f.elements[x].type != "select-one"){
                      f.elements[x].value = "";
           	       }
           }
           this.setState({variableBox: []})
	  }
	  dataSubmit = async (e)=>{
         e.preventDefault();
         let paramsArr = [];
         if(e.target.elements.paramsval_1){
             for(let x=1; x<=this.keyCount; x++){
                 let p = {
                     key : e.target.elements['paramskey_'+x].value,
             	 	 value : e.target.elements['paramsval_'+x].value,
    		         type : e.target.elements['paramstyp_'+x].value
                 }
                 paramsArr.push(p)
             }
         }
         const ques_txt = e.target.elements.ques_txt.value,
               prob_tmp_name = e.target.elements.prob_tmp_name.value,
               work_tmp_name = e.target.elements.work_tmp_name.value,
               new_work_tmp_name = e.target.elements.new_work_tmp_name ? e.target.elements.new_work_tmp_name.value: '',
               ques_type = e.target.elements.ques_type.value;
         const {data} = await axios.post('/', {ques_txt, prob_tmp_name, work_tmp_name, new_work_tmp_name, ques_type, paramsArr});
         document.getElementById('show_xml').value = data;
	  	 return false;
	  }
      render(){
      	 return(
           <Fragment>
	           <main className="main-content-box">
	        	 <div className="flex main-content-wrapper">
		        	 <div className="flex space-bw main-content">
		        	          <div className="ques-table">
									<form method="post" onSubmit={this.dataSubmit} id="main_form">
									   <table className="padding-botm-8">
								        <tbody>
								          <tr className="margin-top-5">
										    <td><label>Worksheet list</label></td>
										    <td>
										       	  <select className="input-box" name="work_tmp_name" onChange={this.handleChange}>
										       	   <option value="">Select</option>
										           {this.state.sheetsList.length>0 && this.state.sheetsList.map(x=>x)}
										          </select>
										    </td> 
										  </tr>
                                           {this.state.is_new 
                                              && <tr className="margin-top-5">
										            <td><label>New worksheet</label></td>
										            <td><input className="input-box" type="text" name="new_work_tmp_name" /></td> 
										         </tr>
										   }
									    </tbody>	  
									   </table>
										<table className="prob-table">
										   <tbody>
										      <tr className="margin-top-5">
											    <td><label>Problem name</label></td>
											    <td><input className="input-box" type="text" name="prob_tmp_name" /></td> 
											  </tr>
										      <tr className="margin-top-5">
											    <td><label>Problem type</label></td>
											    <td>
									        	  <select className="input-box" name="ques_type" onChange={this.handleChange}>
										            <option value="normal">Normal</option>
										            <option value="mcq">MCQ</option>
										          </select>
											    </td> 
											  </tr>
											  <tr className="margin-top-5">
											    <td><label>Question</label></td>
											    <td><textarea className="input-box" name="ques_txt" rows="5" cols="30"></textarea></td> 
											  </tr>
											  {this.state.variableBox && this.state.variableBox.map(x=>x)}
											  <tr className="margin-top-5">
											    <td><label>Add variables</label></td>
											    <td><button className="btn-default" onClick={this.addVariable}>Add +</button></td> 
											  </tr>
										  	  <tr className="margin-top-5">
										        <td><button  className="btn-default margin-top-20" onClick={this.refreshQuestion}>Refresh Question</button></td>
											    <td><button  className="btn-default margin-top-20">Generate</button></td> 
											  </tr>
										   </tbody>
										</table>									
									</form>
			        	 	  </div>
	                          <div>
	                          	<textarea id="show_xml" rows="30" cols="50" placeholder="Output as XML"></textarea>
	                          </div>
			        	 	  
		        	 </div>
		        </div>
	           </main>
           </Fragment>
      	 )
      }
}

export default Home;