import express from 'express'
import path from 'path'
import CONFIG from './../config'
import bodyParser from 'body-parser'
import crypto from 'crypto'
import fs from 'fs'
import jsontoxml from 'jsontoxml'
import XMLFormatter from 'xml-formatter'
import Template from './../template.js'

const app = express();


app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())


const CURRENT_WORKING_DIR = process.cwd();

app.use(express.static(path.join(CURRENT_WORKING_DIR, 'public')));

//comment out before building for production
import devBundle from './devBundle'
//comment out before building for production
devBundle.compile(app)

app.use('/dist', express.static(path.join(CURRENT_WORKING_DIR, 'dist')))


app.get('/list-wrksheets', (req, res)=>{
       res.send(JSON.parse(fs.readFileSync('public/xmls/worksheets.json')));
})

app.get('*', (req, res)=>{
   res.send(Template());
})

function tutelageTempalte(references){
		 let params = [];
		 if(references.paramsArr.length>0){
		 	for(let x of references.paramsArr){
	            params.push({
	            	   name: 'param',
	            	   attrs: {
	            	   	  name: x.key,
	            	   	  type: x.type
	            	   }
	            })
		 	}
		 }
	     return {
	     	  name : 'tutelage_tmpl',
	     	  attrs: {
	     	  	   'name': references.work_tmp_name
	     	  },
              children:[
                    {
                    	name:'params',children : params,
                    }
              ]
	     }
}

function worksheetTempalte(references){
	     let prob_refs = [];        
	     if(references.paramsArr.length>0){
		 	for(let x of references.paramsArr){
	            prob_refs.push({
	            	   name: 'bind',
	            	   attrs: {
	            	   	  name: x.key,
	            	   	  val: x.value
	            	   }
	            })
		 	}
	     }
	     return {
	     	  name : 'worksheet_tmpl',
	     	  attrs: {
	     	  	   'name': references.work_tmp_name
	     	  },
	     	  children:[
                    {name:'problem_ref', 
                    attrs: {
                         'name': references.prob_tmp_name
                    },
                    children : prob_refs}
              ]
	     }
}


function problemRefTemplate(references){
	     let prob_refs = [];        
	     if(references.paramsArr.length>0){
		 	for(let x of references.paramsArr){
	            prob_refs.push({
	            	   name: 'bind',
	            	   attrs: {
	            	   	  name: x.key,
	            	   	  val: x.value
	            	   }
	            })
		 	}
	     }
	     return {
                      name:'problem_ref', 
                      attrs: {
                         'name': references.prob_tmp_name
                      },
                      children : prob_refs
                }
}


function solutionTemplate(references){
	     if(references.ques_type==="normal"){
               return normalSolutionTemplate();
	     }else if(references.ques_type==="mcq"){
               return multipleChoiseSolutionTemplate(references);
	     }else if(references.ques_type==="fib"){
	     	   return fibSolutionTemplate(references);
	     }
	                   
}

function problemTemplate(references){
	 let params = [];
	 let multiQuesText = '';
	 if(references.paramsArr.length>0){
	 	for(let x of references.paramsArr){
            params.push({
            	   name: 'param',
            	   attrs: {
            	   	  name: x.key,
            	   	  type: x.type
            	   }
            })
	 	}
	 }
     let text = `<p>${references.ques_txt}</p>`;


     if(references.ques_type==="fib"){
	    let ques_txt = (references.ques_txt).replace('___', '<fib type="int" name="AA"/>');
		text = `<group><p>${ques_txt}</p>`;
      }



      if(references.ques_type==="mcq"){
	    let options = (references.ans_txt).split("\n");
		let optionsWrapper = '';
		let c = 0, sol='';
		for(let x=0; x<options.length; x++){
			let k = options[x].split('##');
			let opt = k[1]==1? "AA" : "c"+c
			optionsWrapper += '<choise name="'+opt+'">'+k[0]+'</choise>';
			++c;
		}
		text = `<group><p>${references.ques_txt}</p>${optionsWrapper}`;
      }
    
	 return {
              name : `problem_tmpl`,
              attrs: {
                     'name': references.prob_tmp_name,
                      width: '400'
                 },
              text: text,
              children:[
                    {
                    	name:'params',children : params
                    },
                    {
                    	name:'solutions',
                    	text: solutionTemplate(references)
                    }
              ]
        }
}


function multipleChoiseSolutionTemplate(references){
	let options = (references.ans_txt).split("\n");
	let optionsWrapper = '';
	let c = 0, sol='';
	for(let x=0; x<options.length; x++){
		let k = options[x].split('##');
		let opt = k[1]==1? "AA" : "c"+c
		optionsWrapper += '<cond><choice_ref name="'+opt+'"/>== '+k[1]+'</cond>';
		++c;
	}
	return `<solution><grid columns="150px" gap="5px">${optionsWrapper}</grid></solution></group>`;
}


function fibSolutionTemplate(references){
	let ans_txt = references.ans_txt;
	return `<solution><cond><fib_ref name="AA"/>==${ans_txt}</cond></solution></group>`;
}



function normalSolutionTemplate(){
	return `<solution></solution>`;
}

function worksheetRefTempalte(references){
	 	 return {
	     	  name : 'worksheet_ref',
	     	  attrs: {
	     	  	   'name': references.work_tmp_name
	     	  }
	     }
}



app.post('/', (req, res)=>{
	    const wrksheetName = (req.body.work_tmp_name).trim();
	    const newwrksheetName = req.body.new_work_tmp_name ? (req.body.new_work_tmp_name).trim() : '';
        if(newwrksheetName.length>0){
        	req.body.work_tmp_name = newwrksheetName;
        }
	    const workSheets = JSON.parse(fs.readFileSync('public/xmls/worksheets.json'));
	    if(workSheets[wrksheetName]){
           let problemTemp = problemTemplate(req.body),
               preWrkTemplate = JSON.parse(fs.readFileSync('public/xmls/'+wrksheetName+'.txt'));

               //ADD PROBLEM TO TEMPLATE 
               preWrkTemplate.unshift(problemTemp);

               //ADD PROBLEM REF TO TEMPLATE
               for(let x=0; x<preWrkTemplate.length; x++){
               	   if(preWrkTemplate[x]['name']=='worksheet_tmpl'){
               	   	  preWrkTemplate[x]['children'].unshift(problemRefTemplate(req.body))
               	   }
               }
               //STORE NEW TEMPALTE 
               fs.writeFileSync('public/xmls/'+wrksheetName+'.txt', JSON.stringify(preWrkTemplate))               
               let d = jsontoxml(
                   preWrkTemplate
               )
               res.send(XMLFormatter(`<xml>${d}</xml>`))
	    }else{
             let data = [
		    	 tutelageTempalte(req.body),
		         problemTemplate(req.body),
		         worksheetTempalte(req.body),
		         worksheetRefTempalte(req.body)
		    ]
	        let xml = jsontoxml(data);
	        workSheets[newwrksheetName] = newwrksheetName;
	        fs.writeFileSync('public/xmls/worksheets.json', JSON.stringify(workSheets))
	        fs.writeFileSync('public/xmls/'+newwrksheetName+'.txt', JSON.stringify(data))
	        res.send(XMLFormatter(`<xml>${xml}</xml>`))

	    }
	    
        
});


app.listen(CONFIG.port, (err)=>{
  if (err) {
    console.log(err)
  }
  console.info('Server started on port %s.', CONFIG.port)
})
