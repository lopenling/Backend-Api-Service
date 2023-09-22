import { getDictionary, addDictionary } from "./graphql_services";
import { addWordDescriptions } from "./postgres_services"
import {  sessionVariableFormat, hasuraDataFormat, dictionaryContentFormat, wordDescriptionFormat  } from "./interface";
  
// checks if dictionary is already exist
  export async function dictionaryList(name: string, session: sessionVariableFormat) {
    const { data } = await getDictionary(name, session);
    //on success
    if(data) {
      // on dictionary available
      if(data.data.data_dictionary.length > 0) {
        console.log("Dictionary is already in database")
        return true;
      } else {
        return false;
      }
    } 
  }

  export async function createDictionary(dictionary_info:hasuraDataFormat, dictionary_data: dictionaryContentFormat[], session: sessionVariableFormat) {
    let dictionary_id:string | number = "";  
    let wordArray:(string | number)[][] = [];
    //create dictionary 
    const { data } = await addDictionary(dictionary_info, session);
    dictionary_id = data.data.insert_data_dictionary.returning[0].id;
       //insert words and descriptions
      if(dictionary_id !== "") {
        dictionary_data.forEach( async(o) => {
          wordArray.push([
            o.Tibetan,
            dictionary_info.source,
            o.Description,
            dictionary_id,
            session['x-hasura-user-id'],
            dictionary_info.target
          ])
        });
        const  data  = await addWordDescriptions( wordArray, session);
        console.log("affected rows: ", data)
      }
      return dictionary_id

  }
