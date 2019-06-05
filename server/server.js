import express from 'express'
import XLSX from 'xlsx';
import path from 'path'
import CONFIG from './../config'
import bodyParser from 'body-parser'
import crypto from 'crypto'
import fs from 'fs'
import jsontoxml from 'jsontoxml'
import XMLFormatter from 'xml-formatter'
import Template from './../template.js'

import querystring from 'querystring'
import formidable from 'formidable';
import uuidv4 from 'uuid/v4';


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

app.get('/test-xlsx', (req, res)=>{
	var workbook = XLSX.readFile('public/xmls/zzzz.xlsx');
    


	var sheet_name_list = workbook.SheetNames;

	let xlsxJSON = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]], {defVal:""});
	let variableChecker = 0;

    
	var questionObj = {};
	var arrayOfTemplateIdsCols = [];
    questionObj['paramsArr'] = [];
    
    questionObj['prob_tmp_name'] = 'zzzzzz';
	for(let arrEle of xlsxJSON){
		 if(arrEle.col1=='Tutor ID'){
		 	questionObj['work_tmp_name'] = arrEle.col2;
            variableChecker = 1;
		 }else if(arrEle.col1=='Conditions'){
            variableChecker = 0;
		 }
		 if(arrEle.col1=='QUESTION'){
		 	questionObj['ques_txt'] += arrEle.col2;
		 }
		 if(arrEle.col1=='QuesType'){
            questionObj['ques_type'] = arrEle.col2;
		 }
		 if(arrEle.col1=='Answer stem'){
		 	questionObj['ans_txt'] += arrEle.col2;
		 }
		 if(variableChecker==1 && arrEle.col1!='Tutor ID'){
		 	questionObj['paramsArr'].push({
                key : arrEle.col1,
         	 	value : arrEle.col2,
		        type : arrEle.col3
            })
		 } 
	}
    
        let data = [
		    	 tutelageTempalte(questionObj),
		         problemTemplate(questionObj),
		         tutelageRefTempalte(),
		         worksheetTempalte(questionObj),
		         worksheetRefTempalte(questionObj)
		    ]
	     let xml = jsontoxml(data);

		res.send({
			 test : xml
		})
	    // sheet_name_list.forEach((y)=>{
     //       var worksheet = workbook.Sheets[y];
     //       var headers = {};
     //       var data = [];
     //       for(let z in worksheet){
     //       	   if(z[0] === '!') continue;
     //       	   var tt = 0;
     //       	   for (var i = 0; i < z.length; i++){
		   //          if (!isNaN(z[i])){
		   //              tt = i;
		   //              break;
		   //          }
		   //     };
		   //     var col = z.substring(0,tt);
     //           var row = parseInt(z.substring(tt));
     //           var value = worksheet[z].v;
     //          // console.log(value)
     //           if(value && value=='Template ID' && arrayOfTemplateIdsCols.indexOf(col)<0){
     //           	  arrayOfTemplateIdsCols.push(col);
     //           	  arrayOfTemplateIds[col] = value;
     //           }
     //       	   //console.log(z)
     //       }
     //       // console.log(arrayOfTemplateIds)
     //       // console.log(arrayOfTemplateIdsCols)
	    // })
	// const result = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
	// console.log(XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]], {defVal:""}))
	
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
	     console.log(references.paramsArr);
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
	     text = `<p>${ques_txt}</p><group>`;
     }
     if(references.ques_type==="mcq"){
	    let options = (references.ans_txt).split("\n");
		let optionsWrapper = '';
		let c = 0, sol='';
		for(let x=0; x<options.length; x++){
			let k = options[x].split('##');
			let opt = k[1]==1? "AA" : "c"+c
			optionsWrapper += '<choice name="'+opt+'">'+k[0]+'</choice>';
			++c;
		}
		// if(references.ques_img!==''){
  //        let imgData = (references.ques_img).split("##");
  //        let src = (imgData[0]).trim(),
  //            width = (imgData[1]).trim(),
  //            height = (imgData[2]).trim(),
  //            alt = (imgData[3]).trim();
  //            imgData = `<img src=${src} width=${width} height=${height} alt=${alt}/>`;
  //            text = `<group><p>${references.ques_txt}</p><p>${imgData}</p>${optionsWrapper}`;
  //       }else
	 //    	 text = `<group><p>${references.ques_txt}</p>${optionsWrapper}`;
      }


      // if(references.ques_img!=='' && references.ques_type!=="mcq"){
      //    let imgData = (references.ques_img).split("##");
      //       console.log(imgData)
      //    let src = (imgData[0]).replace("\n", "").trim(),
      //        width = (imgData[1]).replace("\n", "").trim(),
      //        height = (imgData[2]).replace("\n", "").trim();
      //       imgData = `<img src=${src} width=${width} height=${height} />`;
      //       text += imgData;
      // }
    
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

function tutelageRefTempalte(references){
	 	 return `<tutelage_ref name="T1"><bind name="A"  val="A"/><bind name="B"  val="B"/><bind name="AA" ><fib_ref name="fib1"/></bind></tutelage_ref>`;
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
		         tutelageRefTempalte(),
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


app.post('/upload-xlsx', (req, res)=>{
	new formidable.IncomingForm().parse(req)
	    .on('file', function(name, file) {
	        const tempPptFileName = uuidv4();
	        console.log(tempPptFileName);
            fs.writeFileSync(`public/xmls/${tempPptFileName}.xlsx`, `${file.path}`);
            
	        // fs.createReadStream(`${file.path}`)
	        //   .pipe(unzip.Extract({ path: `./temp/${tempPptFileName}` }))
	        //   .on("close", ()=>{
	        //        readSilesAsJSON(tempPptFileName)
	        //   })
	        // yauzl.open(`${file.path}`, {lazyEntries: true}, function(err, zipfile) {
	        //   if (err) throw err;
	        //   console.log(zipfile);
	        //    zipfile.on("entry", function(entry) {
	        //         console.log("entry");
	        //         // zipfile.openReadStream(entry, function(err, readStream) {
	        //         //   if (err) throw err;
	        //         //   readStream.on("end", function() {
	        //         //     zipfile.readEntry();
	        //         //   });
	        //         //   readStream.pipe(`./temp2/${tempPptFileName}`);
	        //         // });
	        //   });
	        // })
	    })
	    .on('field', function(name, field) {
	        console.log('Got a field:', field);
	    })
	    .on('error', function(err) {
	        next(err);
	    })
	    .on('end', function() {
	        res.end();
	    });
})


app.listen(CONFIG.port, (err)=>{
  if (err) {
    console.log(err)
  }
  console.info('Server started on port %s.', CONFIG.port)
})
