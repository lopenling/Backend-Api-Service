import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import fs from "fs"
import ReadDictionary from "./dictionary_services";
import * as danfo from "danfojs-node"
import { dictionaryContentFormat, hasuraDataFormat, sessionVariableFormat } from "./interface";
import {dictionaryList, createDictionary} from "./dictionary_upload_services"

dotenv.config();
const app = express();

app.use(bodyParser.urlencoded({limit: '200mb', extended: true}));
app.use(bodyParser.json({limit: '200mb'}));

const port = process.env.PORT || 3000;

app.get('/', async (req, res) => {
  res.send('Padma api server :-)');
});

app.post("/addDictionaryAPI", async (req, res) => {
    
  //input from hasura 
  const { dictionary } = req.body.input;
  const session: sessionVariableFormat  = req.body.session_variables;
  let hasura_input_data: hasuraDataFormat = dictionary;

  try {
    const d = new ReadDictionary(hasura_input_data)
    let {dictionary_data, isError} = await d.getDictionaryList();
    //on failure
    if(isError) {
      return res.status(400).json({
        message: dictionary_data.message
      })
    }
    //check if dictionary is already available in database
    let isDictionaryExist = await dictionaryList(dictionary.name,session)
    if(isDictionaryExist === true) {
      return res.status(400).json({
        message: ` Dictionary is already exist`
      })
    }

    if (dictionary_data !== undefined && isDictionaryExist === false ) {
      //create dictionary 
     const dictionary_id:String | Number = await createDictionary(hasura_input_data, dictionary_data[dictionary.name], session);
     return res.json({
      result: {dictionary_id}
    })
    } else {
      return res.status(400).json({
        message: ` Dictionary '${hasura_input_data.name}' not found`
      })
    }
    
  } catch (e: any) {
    return res.status(400).json({
      message: e.message
    })
  }
})

//endpoint to upload dictionary content from a csv file;
app.post("/addDictionaryFile", async(req, res) => {
  const { file } = req.body.input;
  const session: sessionVariableFormat  = req.body.session_variables;
  const dictionary_info: hasuraDataFormat = {
    name: file.name.substr(0, file.name.lastIndexOf(".")),
    target: file.source,
    source: file.target,
    access_mode: file.access_mode,
    organization_id: file.organization_id
  };

  const options: object = {
    delimiter: '\t'
  }
  let df_to_json:object;
  let dictionary:dictionaryContentFormat[];
  let dictionary_id:String | Number;

  //read dictionary file
  const buffer = Buffer.from(file.base64str, "base64")
  fs.writeFileSync(`./public/files/dictionary.csv`, buffer, "base64")

  try {
    //read csv file and convert it to Json format:
    const df = await danfo.readCSV(`./public/files/dictionary.csv`, options)
    df_to_json = {...danfo.toJSON(df)}
    dictionary = Object.values(df_to_json)

    // check if dictionary is already available in database
    let isDictionaryExist = await dictionaryList(dictionary_info.name,session)

    if(isDictionaryExist === true) {
      fs.writeFileSync("./public/files/dictionary.csv","")
      return res.status(400).json({
        message: ` Dictionary is already exist`
      })
    }

    if (file !== undefined && isDictionaryExist === false ) {
      //create dictionary 
      dictionary_id = await createDictionary(dictionary_info, dictionary, session);

      if(dictionary_id) {
      }
    } else {
      fs.writeFileSync("./public/files/dictionary.csv","")
      return res.status(400).json({
        message: ` Dictionary '${dictionary_info.name}' not found`
      })
    }
    fs.writeFileSync("./public/files/dictionary.csv","")
    return res.json({
      result: {dictionary_id}
    })

  } catch(e:any) {
    fs.writeFileSync("./public/files/dictionary.csv","")
    return res.status(400).json({
      message: e.message
    })
  }
})

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});