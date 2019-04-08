import React, {Component, Fragment} from 'react';
import axios from 'axios'

class Home extends Component{
	  keyCount = 0;
	  quesCount = 1;
	  state = {
	  	  questionsBox : [],
	  	  value: 'int',
	  	  questionTypes : {
	  	  	  
	  	  }
	  }
	  handleChange = (e)=>{
	  	console.log(e.target.value)
        this.setState({value: e.target.value});
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
	  newQuestion = ()=>{
	  	 ++this.quesCount;
	  	 return (
				<table className="prob-table" key={this.quesCount}>
				   <tbody>
				      <tr className="margin-top-5">
					    <td><label>Problem name</label></td>
					    <td><input className="input-box" type="text" name={`prob_tmp_name_${this.quesCount}`} /></td> 
					  </tr>
				      <tr className="margin-top-5">
					    <td><label>Problem type</label></td>
					    <td>
			        	   <select className="input-box" name={`ques_type_${this.quesCount}`} onChange={this.handleChange}>
				              <option value="normal">Nomal</option>
				              <option value="mcq">MCQ</option>
				           </select>
					    </td> 
					  </tr>
					  <tr className="margin-top-5">
					    <td><label>Question</label></td>
					    <td><textarea className="input-box" name={`ques_txt_${this.quesCount}`}rows="5" cols="30"></textarea></td> 
					  </tr>
					  <tr className="margin-top-5">
					    <td><label>Solution</label></td>
					    <td><textarea className="input-box" name={`ans_txt_${this.quesCount}`} rows="2" cols="30"></textarea></td> 
					  </tr>
					  {this.state['variableBox_'+this.quesCount] && this.state['variableBox_'+this.quesCount].map(x=>x)}
					  <tr className="margin-top-5">
					    <td><label>Add variables</label></td>
					    <td><button className="btn-default" onClick={this.addVariable}>Add +</button></td> 
					  </tr>
				   </tbody>
				</table>
	     )
	  }
	  addVariable = async (e)=>{
	     e.preventDefault();
	     console.log(this.quesCount)
	  	 let k = 'variableBox_' + (this.quesCount);
	  	 console.log(this.state['variableBox_'+this.quesCount])
	  	 if(!this.state['variableBox_'+this.quesCount]){
	  	     await this.setState({ [k] : []})
	  	 }
	  	 this.state['variableBox_'+this.quesCount].push(this.newVariable())
	  	 console.log(this.state['variableBox_'+this.quesCount])
	  	 this.setState({
             [k] : this.state['variableBox_'+this.quesCount]
	  	 })
	  }
	  addQuestions = (e)=>{
	  	 e.preventDefault()
	  	 let a = this.state.questionsBox;
	  	     a.push(this.newQuestion())
	  	 this.setState({
             questionsBox : a
	  	 })
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
               ques_type = e.target.elements.ques_type.value;
         const {data} = await axios.post('/', {ques_txt, prob_tmp_name, work_tmp_name, ques_type, paramsArr});
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
									<form method="post" onSubmit={this.dataSubmit}>
									   <table className="padding-botm-8">
								        <tbody>
									      <tr className="margin-top-5">
										    <td><label>Worksheet name</label></td>
										    <td><input className="input-box" type="text" name="work_tmp_name" /></td> 
										  </tr>
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
										            <option value="normal">Nomal</option>
										            <option value="mcq">MCQ</option>
										          </select>
											    </td> 
											  </tr>
											  <tr className="margin-top-5">
											    <td><label>Question</label></td>
											    <td><textarea className="input-box" name="ques_txt" rows="5" cols="30"></textarea></td> 
											  </tr>
											  {this.state.variableBox_1 && this.state.variableBox_1.map(x=>x)}
											  <tr className="margin-top-5">
											    <td><label>Add variables</label></td>
											    <td><button className="btn-default" onClick={this.addVariable}>Add +</button></td> 
											  </tr>
										   </tbody>
										</table>
										{this.state.questionsBox.length>0 && this.state.questionsBox.map(x=>x)}
										   <table className="prob-table">
											   <tbody>
											      <tr className="margin-top-5">
												    <td><button  className="btn-default margin-top-20" onClick={this.addQuestions}>Add New Question</button></td>
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