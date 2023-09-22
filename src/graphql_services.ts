import axios from "axios";
import { sessionVariableFormat, hasuraDataFormat, wordDescriptionFormat } from "./interface"


function createGqlClient(session : sessionVariableFormat) {
    const headers = Object.assign(session, {
      'X-Hasura-Admin-Secret': process.env.WEBADMIN_GRAPHQL_ADMIN_SECRET,
      'Content-Type': 'application/json'
    })
    const gqlClient = axios.create({
      baseURL: process.env.WEBADMIN_GRAPHQL_ENDPOINT,
      headers
    })
    return gqlClient;
  }

  async function getDictionary(name:string, session: sessionVariableFormat): Promise<any> {
    let body = {
        query: `query getUserDictionary($name:String!) {
          data_dictionary(where: {name: {_eq: $name}}) {access_mode
            name
            access_mode
            target
            source
            organization_id
          }
        }              
        `,
        variables: {
          name
        }
      }
      
    let data = await createGqlClient(session).post('', body);

    return data;
  };

  async function addDictionary(variables: hasuraDataFormat, session: sessionVariableFormat): Promise<any> {
    let body = {
        query: `mutation addDictionaryAPI($organization_id: uuid!, $name: String!, $source : data_language_enum!, $target: data_language_enum $access_mode: data_access_mode_enum!) {
          insert_data_dictionary(objects: {name: $name, organization_id: $organization_id, access_mode: $access_mode, source: $source, target: $target}) {
            returning {
              id
            }
          }
        }
               
        `,
        variables
      }
      
    let data = await createGqlClient(session).post('', body);
    return data;
  };

  // GraphQL query to add word and Descriptions 
  // async function addWordDescriptions (variables: wordDescriptionFormat, session: sessionVariableFormat): Promise<any>{

  //   let body = {
  //       query: `mutation wordDescription($word: String!, $description: String!, $dictionary_id: uuid!, $last_updated_by: uuid!, $word_language : data_language_enum!, $des_language : data_language_enum!) {
  //         insert_data_words_one(object: {word: $word, language: $word_language, descriptions: {data: {description: $description, dictionary_id: $dictionary_id, last_updated_by: $last_updated_by, language: $des_language}}}) {
  //           id
  //         }
  //       }        
  //       `,
  //       variables
  //     }
      
  //   const data = await createGqlClient(session).post('', body);
  //   return data;
  // };

  export {
    getDictionary,
    addDictionary
  }